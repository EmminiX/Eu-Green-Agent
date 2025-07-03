"""
Chat Service for handling user interactions with the EU Green Policies Chatbot
"""

import logging
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import json

from core.config import get_settings
from core.logging_config import get_logger
from core.database import get_db
from services.rag_service import get_rag_service
from agents.unified_chat_agent import get_unified_chat_agent
# Removed circular import - using dict instead

logger = get_logger(__name__)
settings = get_settings()


class ChatService:
    """Service for handling chat interactions"""
    
    def __init__(self):
        self.rag_service = get_rag_service()
        self.chat_history: Dict[str, List[Dict]] = {}
    
    async def process_message(
        self,
        message: str,
        session_id: Optional[str] = None,
        language: str = "en",
        context: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Process a user message and generate a response
        
        Args:
            message: User message
            session_id: Chat session ID
            language: Language code
            context: Additional context
            
        Returns:
            Chat response with sources and metadata
        """
        try:
            # Generate session ID if not provided
            if not session_id:
                session_id = str(uuid.uuid4())
            
            logger.info(f"Processing message for session {session_id}")
            
            # Get chat history for context
            history = self.chat_history.get(session_id, [])
            logger.info(f"🗃️ Retrieved history for {session_id}: {len(history)} messages")
            for i, msg in enumerate(history[-3:]):  # Log last 3 stored messages
                logger.info(f"Stored[{i}]: {msg.get('role')} - {msg.get('content', '')[:50]}...")
            
            # Add current user message to history BEFORE orchestrator call
            # This ensures follow-up classification can see conversation context
            current_user_message = {
                "role": "user",
                "content": message,
                "timestamp": datetime.utcnow().isoformat()
            }
            updated_history = history + [current_user_message]
            
            # Save user message to persistent history immediately
            if session_id not in self.chat_history:
                self.chat_history[session_id] = []
            self.chat_history[session_id].append(current_user_message)
            
            # Get relevant context from RAG system
            async for db in get_db():
                logger.info(f"Getting RAG context for query: {message}")
                rag_context = await self.rag_service.get_context_for_query(
                    query=message,
                    max_chunks=5,
                    max_tokens=2000,
                    db=db
                )
                logger.info(f"RAG context retrieved: {len(rag_context.get('sources', []))} sources, {rag_context.get('chunk_count', 0)} chunks")
                break
            
            # Get unified chat agent
            unified_agent = get_unified_chat_agent()
            
            # Debug: Log the history being passed to agent
            logger.info(f"🔄 Passing history with {len(updated_history)} messages to unified agent")
            for i, msg in enumerate(updated_history[-3:]):  # Log last 3 messages
                logger.info(f"History[{i}]: {msg.get('role')} - {msg.get('content', '')[:50]}...")
            
            # Process message through unified agent with simplified interface
            agent_response = await unified_agent.process_query(
                query=message,
                language=language,
                history=updated_history,  # Use updated history with current user message
                rag_context=rag_context["context"],
                rag_sources=rag_context["sources"]
            )
            
            # Extract response components
            response_text = agent_response.get("response", "I apologize, but I couldn't process your request.")
            # Use sources from agent response (which already includes formatted RAG sources)
            sources = agent_response.get("sources", [])
            
            # Log source information for debugging
            logger.info(f"Agent response contains {len(sources)} sources")
            logger.info(f"Knowledge used: {agent_response.get('knowledge_used', 0)}, Web research used: {agent_response.get('web_research_used', 0)}")
            
            # Remove duplicates based on title and type
            seen_sources = set()
            unique_sources = []
            for source in sources:
                source_key = (source.get("title", ""), source.get("type", ""))
                if source_key not in seen_sources:
                    seen_sources.add(source_key)
                    unique_sources.append(source)
            sources = unique_sources
            confidence = agent_response.get("confidence", 0.0)
            
            # Note: Knowledge is already stored in RAG system via document chunks
            
            # Update chat history with assistant response only (user message already added)
            self._update_chat_history_response_only(session_id, response_text)
            logger.info(f"💾 Saved assistant response to history. Total messages now: {len(self.chat_history.get(session_id, []))}")
            
            # Create response
            chat_response = {
                "response": response_text,
                "session_id": session_id,
                "sources": sources,
                "confidence": confidence,
                "timestamp": datetime.utcnow().isoformat(),
                "language": language
            }
            
            logger.info(f"Generated response for session {session_id}")
            return chat_response
            
        except Exception as e:
            logger.error(f"Error processing message: {e}", exc_info=True)
            
            # Return error response
            return {
                "response": "I apologize, but I encountered an error while processing your request. Please try again.",
                "session_id": session_id or str(uuid.uuid4()),
                "sources": [],
                "confidence": 0.0,
                "timestamp": datetime.utcnow().isoformat(),
                "language": language
            }
    
    def _update_chat_history(self, session_id: str, user_message: str, bot_response: str):
        """Update chat history for session"""
        try:
            if session_id not in self.chat_history:
                self.chat_history[session_id] = []
            
            # Add user message
            self.chat_history[session_id].append({
                "role": "user",
                "content": user_message,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Add bot response
            self.chat_history[session_id].append({
                "role": "assistant",
                "content": bot_response,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Keep only last 20 messages to prevent memory issues
            if len(self.chat_history[session_id]) > 20:
                self.chat_history[session_id] = self.chat_history[session_id][-20:]
                
        except Exception as e:
            logger.error(f"Failed to update chat history: {e}")
    
    def _update_chat_history_response_only(self, session_id: str, bot_response: str):
        """Update chat history with assistant response only (user message already added)"""
        try:
            if session_id not in self.chat_history:
                self.chat_history[session_id] = []
            
            # Add bot response
            self.chat_history[session_id].append({
                "role": "assistant",
                "content": bot_response,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            # Keep only last 20 messages to prevent memory issues
            if len(self.chat_history[session_id]) > 20:
                self.chat_history[session_id] = self.chat_history[session_id][-20:]
                
        except Exception as e:
            logger.error(f"Failed to update chat history: {e}")
    
    async def get_chat_history(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get chat history for a session"""
        try:
            if session_id not in self.chat_history:
                return None
            
            messages = self.chat_history[session_id]
            if not messages:
                return None
            
            # Get first and last message timestamps
            created_at = datetime.fromisoformat(messages[0]["timestamp"])
            updated_at = datetime.fromisoformat(messages[-1]["timestamp"])
            
            return {
                "session_id": session_id,
                "messages": messages,
                "created_at": created_at.isoformat(),
                "updated_at": updated_at.isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting chat history: {e}")
            return None
    
    async def clear_chat_history(self, session_id: str) -> bool:
        """Clear chat history for a session"""
        try:
            if session_id in self.chat_history:
                del self.chat_history[session_id]
                logger.info(f"Cleared chat history for session {session_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error clearing chat history: {e}")
            return False
    
    async def get_suggested_questions(self, language: str = "en") -> List[str]:
        """Get suggested questions based on current knowledge"""
        try:
            # Search for common EU Green policies topics
            topics = [
                "European Green Deal",
                "Carbon Border Adjustment Mechanism",
                "Circular Economy Action Plan",
                "Farm to Fork Strategy",
                "Biodiversity Strategy"
            ]
            
            suggestions = []
            async for db in get_db():
                for topic in topics:
                    # Get knowledge about topic from RAG
                    knowledge = await self.rag_service.search_similar_chunks(
                        query=topic,
                        limit=1,
                        db=db
                    )
                    
                    if knowledge:
                        # Generate question based on topic and available RAG content
                        if topic == "European Green Deal":
                            suggestions.append("What is the European Green Deal and what are its main goals?")
                        elif topic == "Circular Economy Action Plan":
                            suggestions.append("What are the key requirements of the Circular Economy Action Plan?")
                        elif topic == "Farm to Fork Strategy":
                            suggestions.append("What sustainability targets does the Farm to Fork Strategy set?")
                        elif topic == "Biodiversity Strategy":
                            suggestions.append("What are the EU's biodiversity commitments for 2030?")
                break
            
            # Add questions based on actual RAG content
            rag_based_questions = [
                "What are the key targets of the EU Biodiversity Strategy for 2030?",
                "How does the Circular Economy Action Plan affect businesses?", 
                "What are the main goals of the Farm to Fork Strategy?",
                "What is included in the Fit for 55 climate package?"
            ]
            
            suggestions.extend(rag_based_questions)
            return suggestions[:8]  # Return max 8 suggestions
            
        except Exception as e:
            logger.error(f"Error getting suggested questions: {e}")
            return [
                "What is the European Green Deal?",
                "How does CBAM affect my business?",
                "What are the sustainability reporting requirements?"
            ]
    
    async def get_chat_analytics(self) -> Dict[str, Any]:
        """Get analytics about chat interactions"""
        try:
            total_sessions = len(self.chat_history)
            total_messages = sum(len(messages) for messages in self.chat_history.values())
            
            # Get RAG stats
            async for db in get_db():
                rag_stats = await self.rag_service.get_document_stats(db)
                break
            
            return {
                "total_chat_sessions": total_sessions,
                "total_messages": total_messages,
                "average_messages_per_session": total_messages / total_sessions if total_sessions > 0 else 0,
                "rag_stats": rag_stats,
                "last_updated": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting chat analytics: {e}")
            return {
                "total_chat_sessions": 0,
                "total_messages": 0,
                "average_messages_per_session": 0,
                "rag_stats": {},
                "last_updated": datetime.utcnow().isoformat()
            }


# Global singleton instance
_chat_service = None


def get_chat_service() -> ChatService:
    """Get the global chat service instance"""
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service