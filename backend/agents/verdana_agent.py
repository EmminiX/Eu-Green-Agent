import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import re

from services.rag_service import RAGService
from services.web_service import WebService
from services.stt_service import STTService
from core.config import settings
import openai

logger = logging.getLogger(__name__)


class VerdanaAgent:
    """
    Verdana - EU Green Deal Compliance Assistant
    
    Proper Logic Flow:
    1. Classify query type (casual vs EU Green Deal specific)
    2. For casual queries: respond directly without sources
    3. For EU Green Deal queries:
       a. Search embedded documents first
       b. If relevant docs found: verify with web search
       c. If no relevant docs: fall back to web search only
       d. Always provide structured sources for EU queries
    """
    
    def __init__(self):
        self.rag_service = RAGService()
        self.web_service = WebService()
        self.stt_service = STTService()
        
        # Initialize OpenAI client
        self.openai_client = openai.OpenAI(
            api_key=settings.OPENAI_API_KEY
        )
        
        # Session management
        self.session_contexts: Dict[str, List[Dict]] = {}
        self.session_languages: Dict[str, str] = {}  # Track detected language per session
        
        # EU Green Deal keywords for query classification
        self.eu_green_keywords = [
            'green deal', 'eu green', 'european green', 'climate law', 'biodiversity',
            'cbam', 'carbon border', 'farm to fork', 'circular economy', 'taxonomy',
            'emissions trading', 'renewable energy', 'energy efficiency', 'fit for 55',
            'climate neutral', 'net zero', 'paris agreement', 'climate change',
            'sustainability', 'environmental policy', 'carbon footprint', 'emission',
            'directive', 'regulation', 'compliance', 'environment', 'climate',
            'sustainable', 'carbon', 'greenhouse gas', 'pollution', 'biodiversity',
            'ecosystem', 'deforestation', 'reforestation', 'organic farming',
            'pesticide', 'fertilizer', 'soil health', 'water quality', 'air quality',
            'waste management', 'recycling', 'plastic', 'packaging', 'transport',
            'aviation', 'maritime', 'shipping', 'electric vehicle', 'hydrogen',
            'solar', 'wind', 'battery', 'energy storage', 'grid', 'smart city',
            'building renovation', 'insulation', 'heat pump', 'district heating',
            'industrial strategy', 'steel', 'cement', 'chemical', 'textile',
            'construction', 'digital', 'artificial intelligence', 'blockchain',
            'monitoring', 'reporting', 'verification', 'audit', 'certification',
            'label', 'standard', 'criteria', 'threshold', 'target', 'goal',
            'objective', 'milestone', 'timeline', 'deadline', 'implementation',
            'transition', 'transformation', 'innovation', 'investment', 'funding',
            'finance', 'bank', 'loan', 'subsidy', 'incentive', 'tax', 'levy',
            'penalty', 'fine', 'enforcement', 'litigation', 'court', 'justice'
        ]
    
    async def process_query(
        self, 
        query: str, 
        session_id: str, 
        language: str = "en"
    ) -> Dict[str, Any]:
        """Main processing function with proper logic flow"""
        
        try:
            logger.info(f"Processing query: {query[:100]}...")
            
            # Initialize session context if needed
            if session_id not in self.session_contexts:
                self.session_contexts[session_id] = []
            
            # Step 1: Detect and set session language
            detected_language = await self._detect_and_set_language(query, session_id, language)
            
            # Add user query to context
            self.session_contexts[session_id].append({
                "role": "user",
                "content": query,
                "timestamp": datetime.now(),
                "language": detected_language
            })
            
            # Step 2: Classify query type
            query_type = await self._classify_query(query)
            
            if query_type == "identity":
                response_data = await self._handle_identity_query(query, detected_language)
            elif query_type == "casual":
                response_data = await self._handle_casual_query(query, detected_language)
            else:  # eu_green_deal
                response_data = await self._handle_eu_green_query(query, detected_language, session_id)
            
            # Add assistant response to context
            self.session_contexts[session_id].append({
                "role": "assistant",
                "content": response_data["response"],
                "timestamp": datetime.now()
            })
            
            # Keep context manageable (last 20 messages)
            if len(self.session_contexts[session_id]) > 20:
                self.session_contexts[session_id] = self.session_contexts[session_id][-20:]
            
            return response_data
            
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return {
                "response": "I apologize, but I encountered an error processing your request. Please try again.",
                "sources": []
            }
    
    async def _classify_query(self, query: str) -> str:
        """Classify query into: identity, casual, or eu_green_deal"""
        
        query_lower = query.lower().strip()
        
        # Check for identity queries
        identity_keywords = [
            "who are you", "what are you", "tell me about yourself",
            "your identity", "your name", "who created you",
            "who made you", "who built you", "who engineered you",
            "your creator", "your developer", "about verdana"
        ]
        
        if any(keyword in query_lower for keyword in identity_keywords):
            return "identity"
        
        # Check for casual conversation
        casual_patterns = [
            r'^hi$', r'^hello$', r'^hey$', r'^good morning$', r'^good afternoon$',
            r'^good evening$', r'^how are you', r'^what\'s up', r'^thanks?$',
            r'^thank you$', r'^ok$', r'^okay$', r'^yes$', r'^no$', r'^bye$',
            r'^goodbye$', r'^see you', r'^nice to meet you', r'^pleased to meet you'
        ]
        
        # Short queries that are likely casual
        if len(query.split()) <= 3:
            for pattern in casual_patterns:
                if re.match(pattern, query_lower):
                    return "casual"
        
        # Check for EU Green Deal keywords
        if any(keyword in query_lower for keyword in self.eu_green_keywords):
            return "eu_green_deal"
        
        # If query mentions policy, regulation, law, directive, etc.
        policy_keywords = ['policy', 'regulation', 'directive', 'law', 'compliance', 'requirement']
        if any(keyword in query_lower for keyword in policy_keywords):
            return "eu_green_deal"
        
        # Default to EU Green Deal for longer, substantive queries
        if len(query.split()) > 5:
            return "eu_green_deal"
        
        return "casual"
    
    async def _detect_and_set_language(self, query: str, session_id: str, default_language: str = "en") -> str:
        """Detect language from query and set for session persistence"""
        
        # If this is the first message in session, detect language
        if session_id not in self.session_languages or len(self.session_contexts.get(session_id, [])) == 0:
            try:
                # Use OpenAI to detect language
                detection_prompt = f"""
Detect the language of this text and return ONLY the ISO language code (e.g., en, ro, fr, de, es, it, pl, etc.).

Text: "{query}"

Language code:"""
                
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",  # Use cheaper model for language detection
                    messages=[
                        {"role": "user", "content": detection_prompt}
                    ],
                    temperature=0,
                    max_tokens=10
                )
                
                detected_lang = response.choices[0].message.content.strip().lower()
                
                # Validate it's a reasonable language code (2-3 characters)
                if len(detected_lang) >= 2 and len(detected_lang) <= 3 and detected_lang.isalpha():
                    self.session_languages[session_id] = detected_lang
                    logger.info(f"Detected language for session {session_id}: {detected_lang}")
                    return detected_lang
                else:
                    # Fallback to default
                    self.session_languages[session_id] = default_language
                    return default_language
                    
            except Exception as e:
                logger.warning(f"Language detection failed: {e}, using default: {default_language}")
                self.session_languages[session_id] = default_language
                return default_language
        else:
            # Use previously detected language for this session
            return self.session_languages.get(session_id, default_language)
    
    def _get_language_name(self, language_code: str) -> str:
        """Convert language code to readable name"""
        language_names = {
            'en': 'English',
            'ro': 'Romanian',
            'fr': 'French', 
            'de': 'German',
            'es': 'Spanish',
            'it': 'Italian',
            'pl': 'Polish',
            'pt': 'Portuguese',
            'nl': 'Dutch',
            'da': 'Danish',
            'sv': 'Swedish',
            'fi': 'Finnish',
            'el': 'Greek',
            'hu': 'Hungarian',
            'cs': 'Czech',
            'sk': 'Slovak',
            'sl': 'Slovenian',
            'bg': 'Bulgarian',
            'hr': 'Croatian',
            'et': 'Estonian',
            'lv': 'Latvian',
            'lt': 'Lithuanian',
            'mt': 'Maltese'
        }
        return language_names.get(language_code, language_code.upper())
    
    def _build_conversation_context(self, session_id: str, max_messages: int = 10) -> str:
        """Build conversation context for the AI to understand previous queries"""
        if not session_id or session_id not in self.session_contexts:
            return ""
        
        messages = self.session_contexts[session_id]
        if len(messages) <= 1:  # Only current message
            return ""
        
        # Get recent conversation (excluding the current query)
        recent_messages = messages[-max_messages-1:-1]  # Exclude the last message (current query)
        
        context_parts = []
        for msg in recent_messages:
            role = "User" if msg["role"] == "user" else "Assistant"
            content = msg["content"][:200] + "..." if len(msg["content"]) > 200 else msg["content"]
            context_parts.append(f"{role}: {content}")
        
        if context_parts:
            return f"""
CONVERSATION HISTORY (for context):
{chr(10).join(context_parts)}

CURRENT QUERY CONTEXT: The user may be referring to previous parts of this conversation when asking questions.
"""
        return ""
    
    async def _handle_casual_query(self, query: str, language: str) -> Dict[str, Any]:
        """Handle casual conversation without sources"""
        
        system_prompt = f"""
You are Verdana, a friendly and engaging EU Green Deal Compliance Assistant. 

The user is making casual conversation. Respond warmly and naturally with personality:

- For greetings: Greet them back enthusiastically and offer to help
- For thanks: Acknowledge gracefully and encourage more questions
- For testing: Be playful and supportive
- For simple responses: Be conversational and engaging

Show personality while maintaining professionalism. Be encouraging about EU Green Deal topics.
Keep responses conversational but not too short - show some enthusiasm!

Do NOT include any source listings or citations in your response.
IMPORTANT: Respond in {self._get_language_name(language)} language. If the user is speaking in a specific EU language, continue the conversation in that same language throughout the session.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=0.7,
                max_tokens=200  # Keep casual responses short
            )
            
            return {
                "response": response.choices[0].message.content,
                "sources": []
            }
            
        except Exception as e:
            logger.error(f"Error handling casual query: {str(e)}")
            return {
                "response": "Hello! I'm here to help you with EU Green Deal policies and compliance questions. How can I assist you today?",
                "sources": []
            }
    
    async def _handle_identity_query(self, query: str, language: str) -> Dict[str, Any]:
        """Handle queries about agent identity"""
        
        identity_response = f"""
I am **{settings.AGENT_NAME}**, your EU Green Deal Compliance Assistant. My name reflects my expertise in green ("verde") policy analysis ("ana").

## My Capabilities:
- **EU Green Deal Expertise**: Deep knowledge of EU environmental policies and regulations
- **Document Analysis**: Access to comprehensive EU Green Deal documentation
- **Real-time Verification**: I cross-reference information with current online sources
- **Multi-lingual Support**: I can assist in multiple languages
- **Policy Guidance**: Practical advice on compliance and implementation

## What I Can Help You With:
- Understanding EU Green Deal policies
- Compliance requirements and deadlines
- Environmental regulations and standards
- Policy implementation strategies
- Recent updates and changes

## How I Work:
1. I search my knowledge base of EU Green Deal documents
2. I verify information with current online sources
3. I provide you with accurate, up-to-date responses
4. I cite my sources for transparency

I'm here to help you navigate the complex landscape of EU environmental policy and ensure your compliance with Green Deal requirements.

*I was engineered by [Emmi C.](https://emmi.zone)*

**Language Support:** I can communicate in all EU official languages. Simply start our conversation in your preferred language (English, Romanian, French, German, Spanish, Italian, Polish, etc.) and I'll continue in that language throughout our session.
        """.strip()
        
        return {
            "response": identity_response,
            "sources": []  # No sources needed for identity
        }
    
    async def _handle_eu_green_query(self, query: str, language: str, session_id: str) -> Dict[str, Any]:
        """Handle EU Green Deal specific queries with proper workflow"""
        
        # Step 1: Search embedded documents
        logger.info("Searching embedded documents...")
        rag_results = await self.rag_service.search_documents(query)
        
        # Step 2: Determine if we have good document matches
        has_relevant_docs = (
            len(rag_results) > 0 and 
            any(doc.get('similarity', 0) > 0.3 for doc in rag_results)
        )
        
        # Step 3: Always get comprehensive web search for all queries
        logger.info("Getting web verification/additional information...")
        web_results = await self.web_service.search_for_verification(query)
        
        # Also get broader web search for comprehensive coverage
        logger.info("Getting additional comprehensive web search...")
        enhanced_web_results = await self.web_service.search_current_news(query)
        
        # Combine and log results
        all_web_results = web_results + enhanced_web_results
        logger.info(f"Combined web search results: {len(web_results)} verification + {len(enhanced_web_results)} broader = {len(all_web_results)} total")
        
        # Step 4: Generate response based on available information
        if has_relevant_docs:
            # Use embedded docs as primary source + comprehensive web search
            return await self._generate_response_with_docs(
                query, rag_results, all_web_results, language, session_id
            )
        else:
            # Use the comprehensive web results already obtained
            return await self._generate_response_web_only(
                query, all_web_results, language, session_id
            )
    
    async def _generate_response_with_docs(
        self, 
        query: str, 
        rag_results: List[Dict], 
        web_results: List[Dict], 
        language: str,
        session_id: str = None
    ) -> Dict[str, Any]:
        """Generate response using embedded documents + web verification"""
        
        # Build conversation context
        conversation_context = self._build_conversation_context(session_id) if session_id else ""
        
        # Build context from top RAG results
        doc_context = "\n\n".join([
            f"Document: {doc['title']}\nContent: {doc['content'][:800]}..."
            for doc in rag_results[:3]
        ])
        
        # Build verification context from web results (excluding web summary)
        web_context = "\n\n".join([
            f"Source: {result['title']}\nContent: {result['content'][:400]}..."
            for result in web_results[:3] 
            if result.get('title') != 'Web Search Summary'
        ])
        
        system_prompt = f"""
You are Verdana, an expert EU Green Deal Compliance Assistant.

{conversation_context}

PRIMARY INFORMATION from EU Green Deal Documents:
{doc_context}

VERIFICATION INFORMATION from Current Sources:
{web_context}

Instructions:
1. Answer the query using PRIMARILY the EU Green Deal documents provided
2. Use the web verification and additional sources to confirm current information and add comprehensive details
3. If there are any conflicts, note them and explain which source is more current
4. Provide comprehensive, accurate information with specific details - use ALL available information sources
5. If you mention something briefly, be prepared to elaborate if asked for more details
6. Be proactive - combine document knowledge with web information for complete responses
7. Format with clear headings and bullet points where appropriate
8. Do NOT include any source listings or citations in your response text - sources are handled separately
9. Keep response focused and well-structured
10. Respond in {self._get_language_name(language)} language - maintain language consistency throughout the session

IMPORTANT: Be consistent - if you mention specific details in your response, ensure they are backed by your sources or clearly note when additional research would be helpful.

LANGUAGE: Continue the conversation in {self._get_language_name(language)} language as established in this session.

Remember: Do NOT add "Sources:" or any source listings to your response text.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=settings.OPENAI_TEMPERATURE,
                max_tokens=settings.OPENAI_MAX_TOKENS
            )
            
            ai_response = response.choices[0].message.content
            
            # Build structured sources
            sources = []
            
            # Always add the primary EU Green Deal source first
            sources.append({
                "title": "European Green Deal - Official EU Documentation",
                "url": "https://commission.europa.eu/publications/delivering-european-green-deal_en",
                "type": "official_source",
                "verified": True,
                "description": "Official EU Commission source for Green Deal documentation"
            })
            
            # Add document sources with deduplication by filename
            added_docs = set()  # Track added documents to prevent duplicates
            for doc in rag_results[:5]:  # Check more docs but deduplicate
                filename = doc.get("filename", doc.get("title", "Unknown"))
                if filename not in added_docs:
                    added_docs.add(filename)
                    sources.append({
                        "title": doc["title"],
                        "type": "knowledge_base",
                        "filename": doc.get("filename"),
                        "similarity": round(doc.get("similarity", 0), 2),
                        "verified": True,
                        "description": f"Internal document - {doc.get('filename', 'PDF file')}"
                    })
                    if len([s for s in sources if s.get("type") == "knowledge_base"]) >= 3:
                        break  # Limit to 3 unique documents
            
            # Add web sources with better validation and deduplication
            added_urls = set()  # Track URLs to prevent duplicates
            web_source_count = 0
            
            logger.info(f"Processing {len(web_results)} web results for sources")
            
            for result in web_results:
                # Validate web result
                title = result.get('title', '').strip()
                url = result.get('url', '').strip()
                
                # Skip invalid results
                if not title or not url or title == 'Web Search Summary':
                    continue
                    
                # Skip duplicates
                if url in added_urls:
                    continue
                    
                added_urls.add(url)
                
                # Determine source type based on origin
                source_type = "web_verification" if result.get("source") == "web_search" else "web_search"
                
                sources.append({
                    "title": title,
                    "url": url,
                    "type": source_type, 
                    "verified": True,
                    "description": "Click to view online source"
                })
                
                web_source_count += 1
                if web_source_count >= 5:  # Limit web sources
                    break
            
            logger.info(f"Added {web_source_count} web sources to response")
            
            return {
                "response": ai_response,
                "sources": sources
            }
            
        except Exception as e:
            logger.error(f"Error generating response with docs: {str(e)}")
            return {
                "response": "I apologize, but I'm having trouble accessing the information right now. Please try again.",
                "sources": []
            }
    
    async def _generate_response_web_only(
        self, 
        query: str, 
        web_results: List[Dict], 
        language: str,
        session_id: str = None
    ) -> Dict[str, Any]:
        """Generate response using web search only (fallback)"""
        
        # Build conversation context
        conversation_context = self._build_conversation_context(session_id) if session_id else ""
        
        # Build context from web results (excluding web summary)
        web_context = "\n\n".join([
            f"Source: {result['title']}\nContent: {result['content'][:600]}..."
            for result in web_results[:4]
            if result.get('title') != 'Web Search Summary'
        ])
        
        system_prompt = f"""
You are Verdana, an expert EU Green Deal Compliance Assistant.

{conversation_context}

CURRENT INFORMATION from Web Sources:
{web_context}

Instructions:
1. Answer the query using the current web information provided
2. Focus on official EU sources and recent information
3. Provide comprehensive, accurate information about EU Green Deal policies
4. Be proactive and thorough - use all available information to give detailed responses
5. If the query asks about something specific that requires more detail, provide as much context as possible
6. Format with clear headings and bullet points where appropriate  
7. Do NOT include any source listings or citations in your response text - sources are handled separately
8. If some aspects need more research, acknowledge this but still provide substantive information from available sources
9. Connect EU Green Deal topics to broader EU policy context when relevant
10. Respond in {self._get_language_name(language)} language - maintain language consistency throughout the session

IMPORTANT: Provide detailed, helpful responses. If you have web information about a topic, use it comprehensively rather than saying information is unavailable.

LANGUAGE: Continue the conversation in {self._get_language_name(language)} language as established in this session.

Remember: Do NOT add "Sources:" or any source listings to your response text.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                temperature=settings.OPENAI_TEMPERATURE,
                max_tokens=settings.OPENAI_MAX_TOKENS
            )
            
            ai_response = response.choices[0].message.content
            
            # Build structured sources (exclude web summary)
            sources = []
            
            # Always add the primary EU Green Deal source first
            sources.append({
                "title": "European Green Deal - Official EU Documentation",
                "url": "https://commission.europa.eu/publications/delivering-european-green-deal_en",
                "type": "official_source",
                "verified": True,
                "description": "Official EU Commission source for Green Deal documentation"
            })
            
            # Add web search sources
            for result in web_results[:4]:
                title = result.get('title', '').strip()
                url = result.get('url', '').strip()
                
                if title != 'Web Search Summary' and url:
                    sources.append({
                        "title": title,
                        "url": url,
                        "type": "web_search",
                        "verified": True,
                        "description": "Click to view online source"
                    })
            
            return {
                "response": ai_response,
                "sources": sources
            }
            
        except Exception as e:
            logger.error(f"Error generating web-only response: {str(e)}")
            return {
                "response": "I apologize, but I'm having trouble accessing current information. Please try again.",
                "sources": []
            }
    
    async def process_audio(self, audio_file: bytes) -> str:
        """Process audio input using STT service"""
        return await self.stt_service.transcribe_audio(audio_file)