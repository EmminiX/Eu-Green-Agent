import asyncio
import logging
from typing import List, Dict, Any, Optional
import httpx
from core.config import settings

logger = logging.getLogger(__name__)


class WebService:
    """
    Web search service using Tavily for real-time information verification
    """
    
    def __init__(self):
        self.api_key = settings.TAVILY_API_KEY
        self.base_url = "https://api.tavily.com/search"
        self.max_results = settings.TAVILY_MAX_RESULTS
        
        # HTTP client settings - we create fresh clients per request to avoid reuse issues
    
    async def search_for_verification(self, query: str) -> List[Dict[str, Any]]:
        """
        Search web for information to verify RAG results
        
        Args:
            query: Search query
            
        Returns:
            List of web search results
        """
        try:
            if not self.api_key:
                logger.warning("Tavily API key not configured, skipping web search")
                return []
            
            # Create focused but not overly restrictive query
            enhanced_query = f"{query} EU European Union"
            
            payload = {
                "api_key": self.api_key,
                "query": enhanced_query,
                "search_depth": "basic",
                "include_answer": True,
                "include_raw_content": False,
                "max_results": self.max_results,
                "include_domains": [
                    "europa.eu",
                    "ec.europa.eu",
                    "consilium.europa.eu", 
                    "europarl.europa.eu",
                    "eur-lex.europa.eu"  # Add EU law database
                ]
            }
            
            logger.info(f"Searching web for verification: {enhanced_query[:100]}...")
            
            # Use a fresh client for each request to avoid "client closed" errors
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.base_url, json=payload)
                response.raise_for_status()
                
                data = response.json()
                
                # Parse Tavily response
                results = []
                tavily_results = data.get("results", [])
                logger.info(f"Tavily verification search returned {len(tavily_results)} results")
                
                for i, result in enumerate(tavily_results):
                    title = result.get("title", "")
                    url = result.get("url", "")
                    logger.info(f"Verification result {i}: {title[:50]}... - URL present: {bool(url)}")
                    
                    results.append({
                        "title": title,
                        "url": url,
                        "content": result.get("content", ""),
                        "score": result.get("score", 0.0),
                        "published_date": result.get("published_date", ""),
                        "source": "web_search"
                    })
                
                # Store overall answer separately (don't treat as a source)
                # The overall answer will be used by the agent for context but not as a source
                
                logger.info(f"Processed {len(results)} web verification results")
                return results
                
        except httpx.HTTPError as e:
            logger.error(f"Tavily API error: {str(e)}")
            return []
        except Exception as e:
            logger.error(f"Error in web search: {str(e)}")
            return []
    
    async def search_current_news(self, query: str) -> List[Dict[str, Any]]:
        """
        Search for broader EU policy information and recent updates
        
        Args:
            query: Search query
            
        Returns:
            List of EU policy articles and updates
        """
        try:
            if not self.api_key:
                logger.warning("Tavily API key not configured")
                return []
            
            # Broader search without domain restrictions for comprehensive coverage
            broad_query = f"{query} European Union EU policy strategy"
            
            payload = {
                "api_key": self.api_key,
                "query": broad_query,
                "search_depth": "basic",
                "include_answer": True,
                "include_raw_content": False,
                "max_results": 5,
                # No domain restrictions for broader coverage - this allows all sources
            }
            
            logger.info(f"Searching for broader EU policy info: {broad_query[:100]}...")
            
            # Use a fresh client for each request to avoid "client closed" errors  
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.base_url, json=payload)
                response.raise_for_status()
                
                data = response.json()
                
                # Parse broader search results
                results = []
                tavily_results = data.get("results", [])
                logger.info(f"Tavily broader search returned {len(tavily_results)} results")
                
                for i, result in enumerate(tavily_results):
                    title = result.get("title", "")
                    url = result.get("url", "")
                    logger.info(f"Broader result {i}: {title[:50]}... - URL present: {bool(url)}")
                    
                    results.append({
                        "title": title,
                        "url": url,
                        "content": result.get("content", ""),
                        "score": result.get("score", 0.0),
                        "published_date": result.get("published_date", ""),
                        "source": "broad_search"
                    })
                
                logger.info(f"Processed {len(results)} broader EU policy results")
                return results
                
        except Exception as e:
            logger.error(f"Error in news search: {str(e)}")
            return []
    
    async def check_policy_updates(self, policy_name: str) -> List[Dict[str, Any]]:
        """
        Check for recent updates to specific EU policies
        
        Args:
            policy_name: Name of the policy to check
            
        Returns:
            List of policy updates
        """
        try:
            if not self.api_key:
                return []
            
            update_query = f"{policy_name} EU policy updates changes 2024 2025"
            
            payload = {
                "api_key": self.api_key,
                "query": update_query,
                "search_depth": "advanced",
                "include_answer": True,
                "include_raw_content": False,
                "max_results": 3,
                "include_domains": [
                    "europa.eu",
                    "ec.europa.eu",
                    "consilium.europa.eu"
                ]
            }
            
            logger.info(f"Checking policy updates for: {policy_name}")
            
            # Use a fresh client for each request to avoid "client closed" errors
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.base_url, json=payload)
                response.raise_for_status()
                
                data = response.json()
                
                results = []
                for result in data.get("results", []):
                    results.append({
                        "title": result.get("title", ""),
                        "url": result.get("url", ""),
                        "content": result.get("content", ""),
                        "score": result.get("score", 0.0),
                        "published_date": result.get("published_date", ""),
                        "source": "policy_update"
                    })
                
                return results
                
        except Exception as e:
            logger.error(f"Error checking policy updates: {str(e)}")
            return []
    
    async def health_check(self) -> bool:
        """
        Check if Tavily service is healthy
        
        Returns:
            Health status
        """
        try:
            if not self.api_key:
                return False
            
            # Simple test search
            test_payload = {
                "api_key": self.api_key,
                "query": "EU Green Deal",
                "max_results": 1
            }
            
            # Use a fresh client for each request to avoid "client closed" errors
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.base_url, json=test_payload)
                return response.status_code == 200
                
        except Exception as e:
            logger.error(f"Tavily health check failed: {str(e)}")
            return False
    
