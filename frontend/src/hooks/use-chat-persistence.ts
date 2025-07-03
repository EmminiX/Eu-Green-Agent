/**
 * Hook for managing chat persistence in browser localStorage
 */

import { useState, useEffect, useCallback } from 'react';

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Array<{
    title: string;
    url?: string;
    type: string;
    filename?: string;
    document_name?: string;
    similarity?: number;
  }>;
}

interface ChatSession {
  sessionId: string;
  messages: Message[];
  lastActivity: string;
  title?: string;
}

const STORAGE_KEY = 'eu-green-chat-sessions';
const MAX_SESSIONS = 10; // Keep last 10 sessions
const SESSION_EXPIRY_DAYS = 30; // Sessions expire after 30 days

export function useChatPersistence() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // Generate a new session ID
  const generateSessionId = useCallback((): string => {
    return `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get all sessions from localStorage
  const getAllSessions = useCallback((): ChatSession[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored) as ChatSession[];
      const now = new Date();
      
      // Filter out expired sessions
      return sessions.filter(session => {
        const lastActivity = new Date(session.lastActivity);
        const daysDiff = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= SESSION_EXPIRY_DAYS;
      }).slice(0, MAX_SESSIONS); // Keep only recent sessions
    } catch (error) {
      console.error('Error reading chat sessions from localStorage:', error);
      return [];
    }
  }, []);

  // Save sessions to localStorage
  const saveSessions = useCallback((sessions: ChatSession[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving chat sessions to localStorage:', error);
    }
  }, []);

  // Load a session by ID
  const loadSession = useCallback((sessionId: string): Message[] => {
    const sessions = getAllSessions();
    const session = sessions.find(s => s.sessionId === sessionId);
    
    if (session) {
      // Convert timestamp strings back to Date objects
      const messagesWithDates = session.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      return messagesWithDates;
    }
    
    return [];
  }, [getAllSessions]);

  // Save current session
  const saveCurrentSession = useCallback((sessionId: string, messages: Message[]) => {
    if (!sessionId || messages.length === 0) return;

    const sessions = getAllSessions();
    const existingIndex = sessions.findIndex(s => s.sessionId === sessionId);
    
    // Generate title from first user message
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    let title = 'New Conversation';
    
    if (firstUserMessage) {
      // Create a more readable title by cleaning up the question
      let cleanTitle = firstUserMessage.content
        .replace(/^(what|how|when|where|why|who|which|can|could|would|should|is|are|do|does)\s+/i, '') // Remove question words
        .replace(/\?+$/, '') // Remove question marks
        .trim();
      
      // Capitalize first letter
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
      
      // Truncate if too long
      title = cleanTitle.length > 45 ? cleanTitle.slice(0, 45) + '...' : cleanTitle;
      
      // Fallback to original method if cleaning resulted in empty string
      if (!title || title === '...') {
        title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
      }
    }
    
    const session: ChatSession = {
      sessionId,
      messages,
      lastActivity: new Date().toISOString(),
      title
    };

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session); // Add to beginning
    }

    // Keep only MAX_SESSIONS most recent
    const trimmedSessions = sessions.slice(0, MAX_SESSIONS);
    saveSessions(trimmedSessions);
  }, [getAllSessions, saveSessions]);

  // Start a new session
  const startNewSession = useCallback((): string => {
    const newSessionId = generateSessionId();
    setCurrentSessionId(newSessionId);
    setMessages([]);
    return newSessionId;
  }, [generateSessionId]);

  // Continue an existing session
  const continueSession = useCallback((sessionId: string) => {
    const sessionMessages = loadSession(sessionId);
    setCurrentSessionId(sessionId);
    setMessages(sessionMessages);
    return sessionMessages;
  }, [loadSession]);

  // Add a message to current session
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      const updated = [...prev, message];
      if (currentSessionId) {
        saveCurrentSession(currentSessionId, updated);
      }
      return updated;
    });
  }, [currentSessionId, saveCurrentSession]);

  // Update messages array (for bulk updates)
  const updateMessages = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
    if (currentSessionId) {
      saveCurrentSession(currentSessionId, newMessages);
    }
  }, [currentSessionId, saveCurrentSession]);

  // Get the most recent session (for auto-resume)
  const getMostRecentSession = useCallback((): ChatSession | null => {
    const sessions = getAllSessions();
    return sessions.length > 0 ? sessions[0] : null;
  }, [getAllSessions]);

  // Delete a session
  const deleteSession = useCallback((sessionId: string) => {
    const sessions = getAllSessions();
    const filtered = sessions.filter(s => s.sessionId !== sessionId);
    saveSessions(filtered);
    
    // If current session was deleted, start new one
    if (currentSessionId === sessionId) {
      startNewSession();
    }
  }, [getAllSessions, saveSessions, currentSessionId, startNewSession]);

  // Clear all sessions
  const clearAllSessions = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    startNewSession();
  }, [startNewSession]);

  // Initialize - try to resume most recent session or start new one
  useEffect(() => {
    if (!currentSessionId) {
      const recentSession = getMostRecentSession();
      if (recentSession && recentSession.messages.length > 0) {
        // Auto-resume most recent session if it has messages
        continueSession(recentSession.sessionId);
      } else {
        // Start new session
        startNewSession();
      }
    }
  }, [currentSessionId, getMostRecentSession, continueSession, startNewSession]);

  return {
    currentSessionId,
    messages,
    addMessage,
    updateMessages,
    startNewSession,
    continueSession,
    deleteSession,
    clearAllSessions,
    getAllSessions,
    getMostRecentSession,
  };
}