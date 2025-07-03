/**
 * Custom hook for Speech-to-Text functionality using Whisper via backend API
 * Replaces Web Speech API with more reliable server-side Whisper transcription
 */

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseWhisperSpeechRecognitionOptions {
  language?: string;
}

interface UseWhisperSpeechRecognitionReturn {
  isRecording: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
  isProcessing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  resetTranscript: () => void;
}

export function useWhisperSpeechRecognition(
  options: UseWhisperSpeechRecognitionOptions = {}
): UseWhisperSpeechRecognitionReturn {
  const { language = 'en' } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported] = useState(
    typeof window !== 'undefined' && 
    navigator.mediaDevices && 
    typeof MediaRecorder !== 'undefined'
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  }, []);

  const processAudioWithWhisper = useCallback(async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      
      // Determine file extension based on blob type
      let filename = 'audio.webm';
      if (audioBlob.type.includes('mp4')) {
        filename = 'audio.mp4';
      } else if (audioBlob.type.includes('ogg')) {
        filename = 'audio.ogg';
      } else if (audioBlob.type.includes('wav')) {
        filename = 'audio.wav';
      }

      formData.append('audio_file', audioBlob, filename);
      formData.append('language', language);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/chat/speech-to-text`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to transcribe audio`);
      }

      const result = await response.json();
      
      if (result.transcript) {
        setTranscript(result.transcript);
        setError(null);
      } else {
        setError('No speech detected. Please try speaking more clearly.');
      }

    } catch (error) {
      console.error('Error processing audio with Whisper:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('413')) {
          setError('Audio file too large. Please keep recordings under 25MB.');
        } else if (error.message.includes('400')) {
          setError('Invalid audio format. Please try again.');
        } else if (error.message.includes('502')) {
          setError('Speech recognition service temporarily unavailable. Please try again.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to process audio');
      }
    }
  }, [language]);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Audio recording is not supported in this browser. Please use Chrome, Firefox, or Edge.');
      return;
    }

    if (isRecording || isProcessing) {
      return;
    }

    try {
      setError(null);
      audioChunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });

      streamRef.current = stream;

      // Try different MIME types for better compatibility
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error('No supported audio format found');
      }

      // Create MediaRecorder with appropriate format
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data collection
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);

        try {
          if (audioChunksRef.current.length === 0) {
            throw new Error('No audio data recorded');
          }

          // Create audio blob
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: selectedMimeType 
          });

          // Check if we have sufficient audio data (minimum 0.5 seconds worth)
          if (audioBlob.size < 1000) {
            throw new Error('Recording too short. Please speak for at least 1 second.');
          }

          // Send to backend for transcription
          await processAudioWithWhisper(audioBlob);

        } catch (error) {
          console.error('Error processing audio:', error);
          setError(error instanceof Error ? error.message : 'Failed to process audio recording');
        } finally {
          setIsProcessing(false);
          cleanupStream();
        }
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred');
        setIsRecording(false);
        setIsProcessing(false);
        cleanupStream();
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);

    } catch (error) {
      console.error('Error starting recording:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setError('Microphone access denied. Please allow microphone access and try again.');
        } else if (error.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to start recording');
      }
      
      cleanupStream();
    }
  }, [isSupported, isRecording, isProcessing, cleanupStream, processAudioWithWhisper]);

  const stopRecording = useCallback(async () => {
    if (!isRecording || !mediaRecorderRef.current) {
      return;
    }

    try {
      // Stop the media recorder
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError('Failed to stop recording');
      setIsRecording(false);
      setIsProcessing(false);
      cleanupStream();
    }
  }, [isRecording, cleanupStream]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStream();
    };
  }, [cleanupStream]);

  return {
    isRecording,
    transcript,
    error,
    isSupported,
    isProcessing,
    startRecording,
    stopRecording,
    resetTranscript
  };
}