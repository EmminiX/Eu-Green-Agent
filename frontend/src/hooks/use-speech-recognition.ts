/**
 * Custom hook for Speech-to-Text functionality using Web Speech API
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognitionInstance;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognitionInstance;
    };
  }
}


interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  finalTranscript: string;
  interimTranscript: string;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    continuous = false,
    interimResults = true,
    language = 'en-US'
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  // Use ref to track user intent (avoids useEffect dependency issues)
  const userWantsToRecordRef = useRef(false);
  // Use ref to accumulate transcript across restarts
  const accumulatedTranscriptRef = useRef('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Check if Web Speech API is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let currentSessionFinal = '';
        let currentSessionInterim = '';

        // Build transcript from current recognition session
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            currentSessionFinal += result[0].transcript;
          } else {
            currentSessionInterim += result[0].transcript;
          }
        }

        // If we have new final text from this session, add it to accumulated
        if (currentSessionFinal) {
          accumulatedTranscriptRef.current += currentSessionFinal;
          console.log('Added to accumulated transcript:', currentSessionFinal);
          console.log('Total accumulated:', accumulatedTranscriptRef.current);
        }

        // Set states for display
        setFinalTranscript(accumulatedTranscriptRef.current);
        setInterimTranscript(currentSessionInterim);
        
        // Combined transcript = accumulated final + current interim
        const combinedTranscript = (accumulatedTranscriptRef.current + currentSessionInterim).trim();
        setTranscript(combinedTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.log('Speech recognition error:', event.error);
        
        // If it's 'no-speech' and user wants to keep recording, restart silently
        if (event.error === 'no-speech' && userWantsToRecordRef.current) {
          console.log('No speech detected, but user wants to keep recording. Restarting...');
          setTimeout(() => {
            if (userWantsToRecordRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log('Successfully restarted after no-speech');
              } catch (e) {
                console.log('Failed to restart after no-speech:', e);
                userWantsToRecordRef.current = false;
                setIsListening(false);
                setError('Speech recognition stopped.');
              }
            }
          }, 100);
          return;
        }
        
        // For other errors, stop completely
        userWantsToRecordRef.current = false;
        setIsListening(false);
        
        // Provide user-friendly error messages
        switch (event.error) {
          case 'no-speech':
            setError('No speech detected. Click the microphone to try again.');
            break;
          case 'audio-capture':
            setError('Microphone not available. Please check your microphone permissions.');
            break;
          case 'not-allowed':
            setError('Microphone access denied. Please allow microphone access and try again.');
            break;
          case 'network':
            setError('Network error occurred. Please check your internet connection.');
            break;
          default:
            setError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended. User wants to record:', userWantsToRecordRef.current);
        
        // If user wants to keep recording, restart immediately
        if (userWantsToRecordRef.current) {
          console.log('Recognition ended but user wants to keep recording. Restarting...');
          setTimeout(() => {
            if (userWantsToRecordRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
                console.log('Successfully restarted after end');
              } catch (e) {
                console.log('Failed to restart after end:', e);
                userWantsToRecordRef.current = false;
                setIsListening(false);
              }
            }
          }, 100);
        } else {
          setIsListening(false);
        }
        
        // Keep any final transcript, clear interim
        setInterimTranscript('');
        // Ensure transcript reflects final state only
        setTranscript(prev => prev.trim());
      };
    }

    return () => {
      userWantsToRecordRef.current = false; // Stop any auto-restart on cleanup
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [continuous, interimResults, language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setError(null);
      setInterimTranscript('');
      // Reset accumulated transcript for new recording session
      accumulatedTranscriptRef.current = '';
      userWantsToRecordRef.current = true; // Key: Tell the system user wants to keep recording
      try {
        recognitionRef.current.start();
        console.log('Started listening, userWantsToRecord = true, reset accumulated transcript');
      } catch {
        setError('Failed to start speech recognition. Please try again.');
        userWantsToRecordRef.current = false;
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    console.log('User manually stopping, setting userWantsToRecord = false');
    userWantsToRecordRef.current = false; // Key: Tell the system to stop auto-restarting
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setFinalTranscript('');
    setInterimTranscript('');
    setError(null);
    accumulatedTranscriptRef.current = ''; // Reset accumulated transcript
    userWantsToRecordRef.current = false; // Stop any auto-restart when resetting
  }, []);

  return {
    isListening,
    transcript,
    finalTranscript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
}

// Extend the Window interface to include speech recognition
