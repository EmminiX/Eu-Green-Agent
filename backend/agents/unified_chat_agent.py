"""
Unified Chat Agent for EU Green Policies
Combines RAG and web search capabilities in a single, coherent agent
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from openai import OpenAI

from core.config import get_settings
from core.logging_config import get_logger

logger = get_logger(__name__)
settings = get_settings()

# Import Web Research Agent for web capabilities
try:
    from agents.web_research_agent import WebResearchAgent
    WEB_RESEARCH_AVAILABLE = True
except ImportError:
    WEB_RESEARCH_AVAILABLE = False
    logger.warning("Web Research Agent not available")


class UnifiedChatAgent:
    """
    Unified chat agent that handles EU Green Policy queries with integrated RAG and web search
    """
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.temperature = settings.OPENAI_TEMPERATURE
        
        # Initialize Web Research capabilities
        if WEB_RESEARCH_AVAILABLE:
            self.web_research_agent = WebResearchAgent()
        else:
            self.web_research_agent = None
    
    async def process_query(
        self,
        query: str,
        language: str = "en",
        history: List[Dict] = None,
        rag_context: str = "",
        rag_sources: List[Dict] = None
    ) -> Dict[str, Any]:
        """
        Process a user query with integrated RAG and web search capabilities
        
        Args:
            query: User query
            language: Language code
            history: Chat history
            rag_context: RAG context from knowledge base
            rag_sources: RAG sources from knowledge base
            
        Returns:
            Response with sources and metadata
        """
        try:
            logger.info(f"Unified agent processing query: {query[:100]}...")
            
            # Initialize variables
            if rag_sources is None:
                rag_sources = []
            if history is None:
                history = []
            
            # Step 1: Determine query type and conversation context
            is_eu_green_query = self._is_eu_green_query(query, history)
            is_conversation_starter = self._is_conversation_starter(query, history)
            
            logger.info(f"🎯 Query type: {'EU Green Policy' if is_eu_green_query else 'General conversation'}")
            logger.info(f"🔄 Conversation starter: {is_conversation_starter}")
            
            # Step 2: Enhance context with web search if needed
            web_sources = []
            enhanced_context = rag_context
            
            if is_eu_green_query:
                # For EU Green queries, supplement with web search if RAG is insufficient
                if not rag_sources or len(rag_sources) < 2:
                    logger.info("🔍 Insufficient RAG sources, performing web search...")
                    web_sources = await self._perform_web_search(query)
                    
                    # If no RAG context but have web sources, use web as primary
                    if not rag_context and web_sources:
                        web_content = self._format_web_content(web_sources[:3])
                        enhanced_context = f"Web Research Results:\n{web_content}"
                        logger.info("📰 Using web sources as primary context")
                
                # If we have both RAG and web sources, combine them
                elif rag_sources and self.web_research_agent:
                    logger.info("🔍 Verifying RAG information with web sources...")
                    verification_web_sources = await self._perform_web_search(query, max_results=2)
                    if verification_web_sources:
                        web_sources = verification_web_sources
                        web_content = self._format_web_content(web_sources[:2], is_verification=True)
                        enhanced_context += f"\n\nRecent Web Information:\n{web_content}"
                        logger.info("📰 Enhanced RAG context with web verification")
            
            # Step 3: Build system prompt
            system_prompt = self._build_system_prompt(
                language=language,
                context=enhanced_context,
                is_conversation_starter=is_conversation_starter,
                is_eu_green_query=is_eu_green_query,
                query=query
            )
            
            # Step 4: Build conversation messages
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add recent chat history (last 6 messages for context)
            if history:
                recent_history = history[-6:]
                for msg in recent_history:
                    if msg.get("role") in ["user", "assistant"]:
                        messages.append({
                            "role": msg["role"],
                            "content": msg["content"]
                        })
            
            # Add current query
            messages.append({"role": "user", "content": query})
            
            # Step 5: Generate response
            response = self.openai_client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=self.temperature,
                max_tokens=1200
            )
            
            response_text = response.choices[0].message.content
            
            # Step 6: Format sources and calculate confidence
            formatted_sources = []
            if is_eu_green_query:
                formatted_sources = self._format_all_sources(rag_sources, web_sources)
            
            confidence = self._calculate_confidence(rag_sources, web_sources, enhanced_context)
            
            result = {
                "response": response_text,
                "sources": formatted_sources,
                "confidence": confidence,
                "knowledge_used": len(rag_sources),
                "web_research_used": len(web_sources),
                "language": language,
                "query_type": "eu_green_policy" if is_eu_green_query else "general_conversation"
            }
            
            logger.info(f"✅ Unified agent completed successfully - Sources: {len(formatted_sources)}")
            return result
            
        except Exception as e:
            logger.error(f"Error in unified chat agent: {e}", exc_info=True)
            return {
                "response": "I apologize, but I encountered an error while processing your request. Please try again.",
                "sources": [],
                "confidence": 0.0,
                "knowledge_used": 0,
                "web_research_used": 0,
                "language": language,
                "error": str(e)
            }
    
    def _is_eu_green_query(self, query: str, history: List[Dict] = None) -> bool:
        """Determine if query is EU Green Deal related"""
        query_lower = query.lower().strip()
        
        logger.info(f"🔍 Checking query type for: '{query_lower}'")
        logger.info(f"📚 History length: {len(history) if history else 0}")
        
        # Check for follow-up context in recent conversation
        if history and len(history) >= 1:
            # Look at last assistant response for EU context
            recent_messages = history[-4:] if len(history) >= 4 else history
            logger.info(f"📜 Checking {len(recent_messages)} recent messages")
            
            eu_context_found = False
            for i, msg in enumerate(recent_messages):
                logger.info(f"Message {i}: role={msg.get('role')}, content preview='{msg.get('content', '')[:100]}...'")
                if msg.get("role") == "assistant":
                    content = msg.get("content", "").lower()
                    eu_terms = ["green deal", "biodiversity", "climate", "emission", "cbam", 
                               "directive", "regulation", "sustainability", "farm to fork", 
                               "circular economy", "renewable", "carbon", "protected areas",
                               "restoration", "species", "pollinator", "strategy"]
                    
                    found_terms = [term for term in eu_terms if term in content]
                    if found_terms:
                        logger.info(f"✅ Found EU terms in assistant message: {found_terms}")
                        eu_context_found = True
                        break
            
            if eu_context_found:
                # Check if current query is a follow-up
                follow_up_patterns = [
                    "more information", "tell me more", "elaborate", "explain further",
                    "details", "continue", "expand on", "more details", "give me more",
                    "can you give me more", "about my previous", "about the previous",
                    "more about", "additional information", "further details"
                ]
                
                # Also check for very generic follow-ups that should continue context
                generic_follow_ups = [
                    "more information please", "give me more information please", 
                    "can you give me more information please", "about my previous message",
                    "about the previous", "more please"
                ]
                
                matched_patterns = [pattern for pattern in follow_up_patterns if pattern in query_lower]
                matched_generic = [pattern for pattern in generic_follow_ups if pattern in query_lower]
                
                if matched_patterns or matched_generic:
                    logger.info(f"✅ Detected EU Green follow-up: '{query_lower}' (matched: {matched_patterns + matched_generic})")
                    return True
                else:
                    logger.info(f"❌ EU context found but no follow-up patterns matched")
                    logger.info(f"Available patterns: {follow_up_patterns}")
            else:
                logger.info(f"❌ No EU context found in recent assistant messages")
        
        # Check for explicit EU Green keywords
        eu_keywords = [
            "green deal", "european green deal", "climate law", "fit for 55", 
            "taxonomy", "cbam", "carbon border", "farm to fork", "biodiversity strategy",
            "circular economy", "renewable energy", "emission", "carbon", "climate",
            "sustainability", "environment", "biodiversity", "directive", "regulation",
            "compliance", "csrd", "esg", "eu policy", "european policy"
        ]
        
        for keyword in eu_keywords:
            if keyword in query_lower:
                return True
        
        # Check for general conversation patterns
        general_patterns = [
            "hello", "hi", "hey", "thanks", "thank you", "who are you", "what are you",
            "goodbye", "bye", "how are you", "great", "excellent", "ok", "okay"
        ]
        
        for pattern in general_patterns:
            if pattern in f" {query_lower} ":
                return False
        
        # Default: if contains policy-related terms, treat as EU Green
        policy_terms = ["policy", "regulation", "directive", "compliance", "eu", "european"]
        return any(term in query_lower for term in policy_terms)
    
    def _is_conversation_starter(self, query: str, history: List[Dict] = None) -> bool:
        """Determine if this is a conversation starter"""
        if not history or len(history) == 0:
            return True
        
        # Check if this looks like a follow-up question
        query_lower = query.lower().strip()
        follow_up_indicators = [
            "more information", "tell me more", "elaborate", "explain further",
            "details", "continue", "what about", "can you provide", "give me"
        ]
        
        return not any(indicator in query_lower for indicator in follow_up_indicators)
    
    async def _perform_web_search(self, query: str, max_results: int = 5) -> List[Dict]:
        """Perform web search for EU Green topics"""
        if not self.web_research_agent:
            return []
        
        try:
            web_sources = await self.web_research_agent.search_web(
                query=query,
                max_results=max_results
            )
            logger.info(f"📰 Found {len(web_sources)} web sources")
            return web_sources
        except Exception as e:
            logger.error(f"Web search failed: {e}")
            return []
    
    def _format_web_content(self, web_sources: List[Dict], is_verification: bool = False) -> str:
        """Format web sources into context string"""
        if not web_sources:
            return ""
        
        prefix = "Recent Verification Sources" if is_verification else "Web Research Results"
        content_parts = []
        
        for source in web_sources:
            title = source.get('title', 'Web Source')
            content = source.get('content', '')[:400] + "..." if len(source.get('content', '')) > 400 else source.get('content', '')
            content_parts.append(f"Source: {title}\nContent: {content}")
        
        return f"{prefix}:\n" + "\n\n".join(content_parts)
    
    def _build_system_prompt(
        self, 
        language: str, 
        context: str, 
        is_conversation_starter: bool, 
        is_eu_green_query: bool, 
        query: str
    ) -> str:
        """Build system prompt for the unified agent"""
        
        # Handle conversation flow
        if is_conversation_starter:
            intro_instruction = "This is the start of a new conversation. Briefly introduce yourself as Verdana, the EU Green Policy Specialist."
        else:
            intro_instruction = "This is a continuing conversation. Do NOT re-introduce yourself. Build on the previous conversation context and directly answer the user's question."
        
        # Handle "about me" questions
        about_me_instruction = ""
        query_lower = query.lower() if query else ""
        if any(phrase in query_lower for phrase in ["who are you", "what are you", "tell me about yourself", "who created you", "who made you", "who developed you", "who built you", "who engineered you"]):
            about_me_instruction = "\n\n**ABOUT ME:** When asked about yourself, mention that you were engineered by Emmi C. (https://emmi.zone) - include this information naturally in your response."
        
        if is_eu_green_query:
            base_prompt = f"""You are Verdana, an expert AI assistant specializing in European Union Green Deal policies and environmental regulations. Your name "Verdana" reflects your expertise in green ("verde") policy analysis ("ana").

**CONVERSATION CONTEXT:**
{intro_instruction}
Remember the conversation history and maintain context awareness. When users ask for "more information," "details," or similar follow-up questions, ALWAYS continue discussing the specific topic from the previous response. Never ask what they want more information about - assume they mean the topic you just discussed.{about_me_instruction}

**YOUR EXPERTISE:**
- European Green Deal and comprehensive policy framework
- Carbon Border Adjustment Mechanism (CBAM)
- Farm to Fork Strategy and sustainable food systems
- Biodiversity Strategy for 2030
- Circular Economy Action Plan
- Fit for 55 climate package
- EU Taxonomy for sustainable activities
- Corporate Sustainability Reporting Directive (CSRD)
- Renewable Energy Directive and energy transition

**COMMUNICATION STYLE:**
1. Be conversational and natural - build on previous messages
2. Maintain context awareness throughout the conversation
3. Provide accurate, source-backed information
4. Explain complex regulations in accessible terms
5. Include practical implications for businesses and individuals
6. Mention relevant deadlines and compliance requirements

**IMPORTANT:** Do not repeat information already discussed. Be concise and directly address the current question while maintaining conversational flow."""

        else:
            base_prompt = f"""You are Verdana, a friendly AI assistant specializing in EU Green Deal policies. 

**CONVERSATION CONTEXT:**
{intro_instruction}
This is a general conversation, not related to EU Green Deal policies. Be natural, helpful, and conversational. Do not provide sources or references for general conversation.{about_me_instruction}

**YOUR ROLE:**
- Respond naturally to greetings, thanks, and general questions
- Be friendly and helpful while staying true to your identity
- For policy questions, offer to help with your EU Green expertise
- Keep responses concise and conversational"""

        if language != "en":
            base_prompt += f"\n\nPlease respond in {language}."
        
        if context and is_eu_green_query:
            base_prompt += f"""

**RELEVANT CONTEXT:**
{context}

Use this context to inform your response, synthesizing the information to provide a comprehensive, helpful answer."""
        
        return base_prompt
    
    def _format_all_sources(self, rag_sources: List[Dict], web_sources: List[Dict]) -> List[Dict]:
        """Format both RAG and web sources"""
        formatted = []
        
        # Add RAG sources
        for source in rag_sources:
            formatted.append(source)
        
        # Add web sources
        for source in web_sources:
            formatted_source = {
                "title": f"🌐 {source.get('title', 'Web Source')}",
                "type": "EU Web Resource",
                "document_name": source.get("title", ""),
                "similarity": round(source.get("score", 0.85), 2)
            }
            
            if "url" in source:
                formatted_source["url"] = source["url"]
                formatted_source["filename"] = source["url"].split("/")[-1] or "web_resource"
            
            formatted.append(formatted_source)
        
        # Remove duplicates
        seen_urls = set()
        unique_sources = []
        for source in formatted:
            url = source.get("url", source.get("title", ""))
            if url not in seen_urls:
                seen_urls.add(url)
                unique_sources.append(source)
        
        return unique_sources
    
    def _calculate_confidence(self, rag_sources: List[Dict], web_sources: List[Dict], context: str) -> float:
        """Calculate confidence score"""
        if not context:
            return 0.3
        
        rag_score = min(0.7, 0.4 + (len(rag_sources) * 0.15))
        web_score = min(0.3, len(web_sources) * 0.1)
        
        return min(0.95, rag_score + web_score)


# Global instance
_unified_agent = None

def get_unified_chat_agent() -> UnifiedChatAgent:
    """Get the global unified chat agent instance"""
    global _unified_agent
    if _unified_agent is None:
        _unified_agent = UnifiedChatAgent()
    return _unified_agent