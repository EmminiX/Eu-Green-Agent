"use client";
import { useState, useEffect } from 'react';

// Type for Google Analytics gtag function
interface WindowWithGtag extends Window {
  gtag?: (command: string, action: string, parameters?: Record<string, unknown>) => void;
}

interface AIDisclosureState {
  hasAccepted: boolean;
  hasDeclined: boolean;
  timestamp: string | null;
  language: string;
}

const STORAGE_KEY = 'eu-ai-act-disclosure';
const DISCLOSURE_VERSION = '1.0'; // Increment this when disclosure content changes

export const useAIDisclosure = (language: string = 'en') => {
  const [disclosureState, setDisclosureState] = useState<AIDisclosureState>({
    hasAccepted: false,
    hasDeclined: false,
    timestamp: null,
    language
  });
  
  const [showDisclosure, setShowDisclosure] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storageAvailable, setStorageAvailable] = useState(true);

  // Load saved disclosure state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Check if the disclosure is for the same version and language
        if (parsed.version === DISCLOSURE_VERSION && parsed.language === language) {
          setDisclosureState(parsed.state);
          setShowDisclosure(!parsed.state.hasAccepted && !parsed.state.hasDeclined);
        } else {
          // Version or language changed, show disclosure again
          setShowDisclosure(true);
        }
      } else {
        // First time visitor
        setShowDisclosure(true);
      }
    } catch (error) {
      console.error('Error loading AI disclosure state:', error);
      setStorageAvailable(false);
      // Fallback: always show disclosure when localStorage unavailable
      setShowDisclosure(true);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  // Save disclosure state to localStorage
  const saveDisclosureState = (state: AIDisclosureState) => {
    if (!storageAvailable) {
      // Silently skip saving when localStorage is unavailable
      // State will persist for current session only
      return;
    }
    
    try {
      const toSave = {
        version: DISCLOSURE_VERSION,
        language,
        state,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Error saving AI disclosure state:', error);
      setStorageAvailable(false);
    }
  };

  // Handle user acceptance
  const handleAccept = () => {
    const newState: AIDisclosureState = {
      hasAccepted: true,
      hasDeclined: false,
      timestamp: new Date().toISOString(),
      language
    };
    
    setDisclosureState(newState);
    setShowDisclosure(false);
    saveDisclosureState(newState);

    // Track acceptance for analytics (optional)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as WindowWithGtag).gtag?.('event', 'ai_disclosure_accepted', {
        language,
        timestamp: newState.timestamp
      });
    }
  };

  // Handle user decline
  const handleDecline = () => {
    const newState: AIDisclosureState = {
      hasAccepted: false,
      hasDeclined: true,
      timestamp: new Date().toISOString(),
      language
    };
    
    setDisclosureState(newState);
    setShowDisclosure(false);
    saveDisclosureState(newState);

    // Track decline for analytics (optional)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as WindowWithGtag).gtag?.('event', 'ai_disclosure_declined', {
        language,
        timestamp: newState.timestamp
      });
    }

    // Optionally redirect user away from AI features
    // or show alternative content
  };

  // Reset disclosure (for testing or when disclosure content changes)
  const resetDisclosure = () => {
    if (storageAvailable) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Error removing AI disclosure state:', error);
      }
    }
    
    setDisclosureState({
      hasAccepted: false,
      hasDeclined: false,
      timestamp: null,
      language
    });
    setShowDisclosure(true);
  };

  // Check if user can interact with AI
  const canUseAI = disclosureState.hasAccepted && !disclosureState.hasDeclined;

  // Check if disclosure should be shown
  const shouldShowDisclosure = showDisclosure && !isLoading;

  return {
    disclosureState,
    showDisclosure: shouldShowDisclosure,
    isLoading,
    canUseAI,
    handleAccept,
    handleDecline,
    resetDisclosure
  };
};