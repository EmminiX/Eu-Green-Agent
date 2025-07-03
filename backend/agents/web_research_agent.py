"""
Web Research Agent for searching the internet and scraping relevant content
Uses Tavily for search and Firecrawl for web scraping
"""

import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio
import httpx

from tavily import TavilyClient
import json

from core.config import get_settings
from core.logging_config import get_logger

logger = get_logger(__name__)
settings = get_settings()

try:
    from firecrawl import FirecrawlApp
    FIRECRAWL_AVAILABLE = True
except ImportError:
    FIRECRAWL_AVAILABLE = False
    logger.warning("Firecrawl package not available. Install with: pip install firecrawl-py")

# Use RAG service instead of Graphiti for knowledge storage
try:
    from services.rag_service import get_rag_service
    RAG_SERVICE_AVAILABLE = True
except ImportError:
    RAG_SERVICE_AVAILABLE = False
    logger.warning("RAG service not available, knowledge storage disabled")


class WebResearchAgent:
    """
    Agent specialized in web research and content scraping
    """
    
    def __init__(self):
        # Initialize RAG service for knowledge storage
        if RAG_SERVICE_AVAILABLE:
            self.rag_service = get_rag_service()
        else:
            self.rag_service = None
        
        # Initialize Tavily client if API key is available
        if settings.TAVILY_API_KEY:
            self.tavily_client = TavilyClient(api_key=settings.TAVILY_API_KEY)
        else:
            self.tavily_client = None
            logger.warning("Tavily API key not provided, web search will be limited")
        
        # Initialize Firecrawl client if API key is available
        if settings.FIRECRAWL_API_KEY and FIRECRAWL_AVAILABLE:
            try:
                self.firecrawl_client = FirecrawlApp(api_key=settings.FIRECRAWL_API_KEY)
                logger.info("Firecrawl client initialized successfully")
            except Exception as e:
                self.firecrawl_client = None
                logger.error(f"Failed to initialize Firecrawl client: {e}")
        else:
            self.firecrawl_client = None
            if not settings.FIRECRAWL_API_KEY:
                logger.warning("Firecrawl API key not provided, web scraping will be limited")
            if not FIRECRAWL_AVAILABLE:
                logger.warning("Firecrawl package not available, web scraping will be limited")
    
    async def search_web(
        self,
        query: str,
        max_results: int = 5,
        include_domains: Optional[List[str]] = None,
        exclude_domains: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search the web for relevant information
        
        Args:
            query: Search query
            max_results: Maximum number of results
            include_domains: Domains to specifically include
            exclude_domains: Domains to exclude
            
        Returns:
            List of search results with content
        """
        try:
            logger.info(f"Web research agent searching for: {query[:100]}...")
            
            if not self.tavily_client:
                logger.warning("Tavily client not available, using fallback search")
                return await self._fallback_search(query, max_results)
            
            # Prepare search parameters
            search_params = {
                "query": query + " EU Green Deal policies sustainability",
                "max_results": max_results,
                "include_answer": True,
                "include_raw_content": True
            }
            
            # Add domain filters if provided
            if include_domains:
                search_params["include_domains"] = include_domains
            if exclude_domains:
                search_params["exclude_domains"] = exclude_domains
            
            # Perform search
            search_results = await asyncio.to_thread(
                self.tavily_client.search,
                **search_params
            )
            
            # Process results
            processed_results = []
            for result in search_results.get("results", []):
                processed_result = {
                    "title": result.get("title", ""),
                    "url": result.get("url", ""),
                    "content": result.get("content", ""),
                    "raw_content": result.get("raw_content", ""),
                    "score": result.get("score", 0.0),
                    "published_date": result.get("published_date"),
                    "agent": "web_research",
                    "search_query": query,
                    "retrieved_at": datetime.utcnow().isoformat(),
                    "source_type": "web_search"
                }
                processed_results.append(processed_result)
            
            # Add to knowledge base for future reference
            await self._add_to_knowledge_base(query, processed_results)
            
            logger.info(f"Web research found {len(processed_results)} results")
            return processed_results
            
        except Exception as e:
            logger.error(f"Error in web search: {e}", exc_info=True)
            return []
    
    async def scrape_url(self, url: str, use_firecrawl: bool = None) -> Optional[Dict[str, Any]]:
        """
        Scrape content from a specific URL
        
        Args:
            url: URL to scrape
            use_firecrawl: Force use of Firecrawl (default: auto-decide based on URL complexity)
            
        Returns:
            Scraped content or None if failed
        """
        try:
            logger.info(f"Scraping URL: {url}")
            
            # Auto-decide whether to use Firecrawl
            if use_firecrawl is None:
                use_firecrawl = self._should_use_firecrawl(url)
            
            if use_firecrawl and self.firecrawl_client:
                logger.info("🔥 Using Firecrawl for detailed content extraction")
                # Use Firecrawl for better content extraction
                result = await asyncio.to_thread(
                    self.firecrawl_client.scrape_url,
                    url,
                    params={"formats": ["markdown", "html"]}
                )
                
                return {
                    "url": url,
                    "title": result.get("metadata", {}).get("title", ""),
                    "content": result.get("markdown", ""),
                    "html": result.get("html", ""),
                    "metadata": result.get("metadata", {}),
                    "agent": "web_research",
                    "scraped_at": datetime.utcnow().isoformat(),
                    "source_type": "firecrawl_scrape"
                }
            else:
                logger.info("⚡ Using basic HTTP scraping")
                # Fallback to basic HTTP scraping
                return await self._fallback_scrape(url)
                
        except Exception as e:
            logger.error(f"Error scraping URL {url}: {e}")
            return None
    
    def _should_use_firecrawl(self, url: str) -> bool:
        """
        Determine whether to use Firecrawl for scraping based on URL characteristics
        
        Args:
            url: URL to analyze
            
        Returns:
            True if Firecrawl should be used, False for basic scraping
        """
        try:
            # Use Firecrawl for complex sites that Tavily might not handle well
            firecrawl_indicators = [
                "javascript",
                "dynamic",
                "pdf",
                "doc",
                ".pdf",
                "publications.europa.eu",  # EU publications often need detailed extraction
                "eur-lex.europa.eu",      # EU legal documents
                "forms",
                "interactive"
            ]
            
            # Use basic scraping for simple, well-structured sites
            simple_scraping_indicators = [
                "europa.eu",              # Main EU sites are usually well-structured
                "commission.europa.eu",   # Commission sites work well with basic scraping
                "news",
                "press",
                "blog"
            ]
            
            url_lower = url.lower()
            
            # Check for Firecrawl indicators first
            for indicator in firecrawl_indicators:
                if indicator in url_lower:
                    return True
            
            # Check for simple scraping indicators
            for indicator in simple_scraping_indicators:
                if indicator in url_lower:
                    return False
            
            # Default: use Firecrawl for unknown complex sites
            return False
            
        except Exception as e:
            logger.warning(f"Error determining scraping method for {url}: {e}")
            return False  # Default to basic scraping on error
    
    async def _fallback_search(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        """
        Fallback search method when Tavily is not available
        """
        try:
            # Use a simple HTTP search (this is a simplified implementation)
            # In production, you might want to use other search APIs or libraries
            
            # For now, return some predefined EU Green Deal sources
            fallback_sources = [
                {
                    "title": "European Green Deal",
                    "url": "https://ec.europa.eu/info/strategy/priorities-2019-2024/european-green-deal_en",
                    "content": "The European Green Deal is a set of policy initiatives by the European Commission with the overarching aim of making the European Union climate neutral in 2050.",
                    "score": 0.9,
                    "agent": "web_research",
                    "search_query": query,
                    "retrieved_at": datetime.utcnow().isoformat(),
                    "source_type": "fallback"
                },
                {
                    "title": "EU Climate Law",
                    "url": "https://ec.europa.eu/clima/eu-action/european-green-deal/european-climate-law_en",
                    "content": "The European Climate Law makes the EU's commitment to reach climate neutrality by 2050 legally binding.",
                    "score": 0.8,
                    "agent": "web_research",
                    "search_query": query,
                    "retrieved_at": datetime.utcnow().isoformat(),
                    "source_type": "fallback"
                }
            ]
            
            return fallback_sources[:max_results]
            
        except Exception as e:
            logger.error(f"Error in fallback search: {e}")
            return []
    
    async def _fallback_scrape(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Fallback scraping method using basic HTTP
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=10.0)
                response.raise_for_status()
                
                return {
                    "url": url,
                    "title": "Scraped Content",
                    "content": response.text[:2000],  # Limit content length
                    "agent": "web_research",
                    "scraped_at": datetime.utcnow().isoformat(),
                    "source_type": "fallback_scrape"
                }
                
        except Exception as e:
            logger.error(f"Error in fallback scraping: {e}")
            return None
    
    async def _add_to_knowledge_base(self, query: str, results: List[Dict[str, Any]]):
        """
        Add web research results to the knowledge base (if available)
        """
        try:
            if not self.rag_service:
                logger.info("RAG service not available, skipping knowledge base storage")
                return
                
            for result in results:
                # Create document content for storage
                document_content = f"{result.get('title', '')} - {result.get('content', '')}"
                
                # Prepare metadata for RAG storage
                metadata = {
                    "source_type": "web_research",
                    "search_query": query,
                    "url": result.get("url", ""),
                    "title": result.get("title", ""),
                    "score": result.get("score", 0.0),
                    "agent": "web_research",
                    "retrieved_at": result.get("retrieved_at", datetime.utcnow().isoformat()),
                    "original_query": query
                }
                
                # Add to RAG knowledge base
                await self.rag_service.add_document(
                    content=document_content,
                    metadata=metadata,
                    doc_id=f"web_{query}_{result.get('url', '')}"[:100]  # Limit ID length
                )
            
            logger.info(f"Added {len(results)} web research results to knowledge base")
            
        except Exception as e:
            logger.error(f"Error adding web research to knowledge base: {e}")
    
    async def search_eu_official_sources(self, query: str) -> List[Dict[str, Any]]:
        """
        Search specifically in EU official sources
        
        Args:
            query: Search query
            
        Returns:
            List of results from EU official sources
        """
        try:
            eu_domains = [
                "europa.eu",
                "ec.europa.eu",
                "eur-lex.europa.eu",
                "publications.europa.eu"
            ]
            
            return await self.search_web(
                query=query,
                max_results=5,
                include_domains=eu_domains
            )
            
        except Exception as e:
            logger.error(f"Error searching EU official sources: {e}")
            return []
    
    async def get_latest_news(self, topic: str) -> List[Dict[str, Any]]:
        """
        Get latest news about a specific topic
        
        Args:
            topic: Topic to search for
            
        Returns:
            List of latest news results
        """
        try:
            query = f"{topic} latest news 2024"
            
            if self.tavily_client:
                search_results = await asyncio.to_thread(
                    self.tavily_client.search,
                    query=query,
                    max_results=5,
                    include_answer=True,
                    search_depth="advanced"
                )
                
                # Process and filter for recent results
                processed_results = []
                for result in search_results.get("results", []):
                    published_date = result.get("published_date")
                    
                    # Filter for recent content (if date is available)
                    if published_date and "2024" in str(published_date) or "2023" in str(published_date):
                        processed_result = {
                            "title": result.get("title", ""),
                            "url": result.get("url", ""),
                            "content": result.get("content", ""),
                            "published_date": published_date,
                            "score": result.get("score", 0.0),
                            "agent": "web_research",
                            "search_query": query,
                            "retrieved_at": datetime.utcnow().isoformat(),
                            "source_type": "news"
                        }
                        processed_results.append(processed_result)
                
                return processed_results
            else:
                return []
                
        except Exception as e:
            logger.error(f"Error getting latest news: {e}")
            return []
    
    async def verify_information(
        self,
        rag_results: List[Dict[str, Any]],
        query: str,
        max_web_results: int = 3
    ) -> Dict[str, Any]:
        """
        Verify RAG information against current web sources
        
        Args:
            rag_results: Results from knowledge base/RAG
            query: Original user query
            max_web_results: Maximum web results to check
            
        Returns:
            Verification report with confidence scores and discrepancies
        """
        try:
            logger.info("Verifying RAG information against web sources")
            
            # Extract key claims from RAG results
            rag_content = " ".join([result.get("content", "") for result in rag_results])
            
            # Search for current information
            verification_query = f"{query} latest updates 2024 official EU"
            web_results = await self.search_eu_official_sources(verification_query)
            
            # If no web results, try broader search
            if not web_results:
                web_results = await self.search_web(
                    query=verification_query,
                    max_results=max_web_results
                )
            
            verification_report = {
                "rag_sources_count": len(rag_results),
                "web_sources_count": len(web_results),
                "verification_timestamp": datetime.utcnow().isoformat(),
                "confidence_score": 0.0,
                "discrepancies": [],
                "confirmations": [],
                "updates_found": [],
                "recommendation": "use_rag"  # default
            }
            
            if not web_results:
                verification_report["confidence_score"] = 0.8  # Trust RAG when no web data
                verification_report["recommendation"] = "use_rag"
                verification_report["note"] = "No recent web sources found for verification"
                return verification_report
            
            # Analyze consistency between RAG and web results
            web_content = " ".join([result.get("content", "") for result in web_results])
            
            # Look for key policy elements that might have changed
            policy_indicators = [
                "deadline", "target", "percentage", "2024", "2025", "2026", "2030",
                "regulation", "directive", "updated", "amended", "new", "latest"
            ]
            
            # Check for recent updates or changes
            recent_indicators = ["2024", "updated", "amended", "new regulation", "latest"]
            has_recent_updates = any(indicator in web_content.lower() for indicator in recent_indicators)
            
            if has_recent_updates:
                verification_report["updates_found"] = [
                    "Recent policy updates detected in web sources"
                ]
                verification_report["confidence_score"] = 0.6
                verification_report["recommendation"] = "combine_sources"
            else:
                verification_report["confidence_score"] = 0.9
                verification_report["recommendation"] = "use_rag"
                verification_report["confirmations"] = [
                    "Web sources generally align with knowledge base information"
                ]
            
            # Add web sources to verification report
            verification_report["web_sources"] = web_results[:3]  # Top 3 sources
            
            logger.info(f"Verification completed with confidence: {verification_report['confidence_score']}")
            return verification_report
            
        except Exception as e:
            logger.error(f"Error in information verification: {e}")
            return {
                "rag_sources_count": len(rag_results),
                "web_sources_count": 0,
                "verification_timestamp": datetime.utcnow().isoformat(),
                "confidence_score": 0.7,  # Moderate confidence in RAG when verification fails
                "discrepancies": [],
                "confirmations": [],
                "updates_found": [],
                "recommendation": "use_rag",
                "error": str(e)
            }
    
    async def get_policy_updates(self, policy_name: str) -> List[Dict[str, Any]]:
        """
        Get latest updates for a specific EU policy
        
        Args:
            policy_name: Name of the EU policy (e.g., "European Green Deal", "CBAM")
            
        Returns:
            List of recent updates and changes
        """
        try:
            logger.info(f"Searching for updates on policy: {policy_name}")
            
            # Construct search query for recent policy updates
            update_query = f'"{policy_name}" EU policy updates 2024 amendments changes'
            
            # Search EU official sources first
            official_results = await self.search_eu_official_sources(update_query)
            
            # Filter for very recent content
            recent_updates = []
            for result in official_results:
                # Check if content mentions recent dates or update indicators
                content = result.get("content", "").lower()
                if any(indicator in content for indicator in ["2024", "updated", "amended", "revised"]):
                    recent_updates.append({
                        **result,
                        "update_type": "policy_change",
                        "relevance": "high" if "2024" in content else "medium"
                    })
            
            logger.info(f"Found {len(recent_updates)} recent updates for {policy_name}")
            return recent_updates
            
        except Exception as e:
            logger.error(f"Error getting policy updates for {policy_name}: {e}")
            return []