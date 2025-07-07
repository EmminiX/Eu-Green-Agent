"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Send, MessageCircle, X, Loader2, Shield, Maximize2, Minimize2, History, Trash2, Mic, MicOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AIDisclosureModal } from "@/components/compliance/ai-disclosure-modal";
import { useAIDisclosure } from "@/hooks/use-ai-disclosure";
import { useChatPersistence } from "@/hooks/use-chat-persistence";
import { useToast } from "@/hooks/use-toast";
import { Toast } from "@/components/ui/toast";
import { useWhisperSpeechRecognition } from "@/hooks/use-whisper-speech-recognition";
import ReactMarkdown from 'react-markdown';
import { ShiningText } from "@/components/ui/shining-text";

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
    verified?: boolean;
    score?: number;
    source_type?: string;
  }>;
}

interface ChatInterfaceProps {
  className?: string;
  language?: string;
  initialMaximized?: boolean;
}

export interface ChatInterfaceRef {
  openChat: (maximized?: boolean) => void;
}

export const ChatInterface = React.forwardRef<ChatInterfaceRef, ChatInterfaceProps>(({ className, language = "en", initialMaximized = false }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(initialMaximized);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Use chat persistence hook
  const {
    currentSessionId,
    messages,
    addMessage,
    startNewSession,
    continueSession,
    deleteSession,
    getAllSessions,
  } = useChatPersistence();

  // Use toast for notifications
  const { toasts, showToast, removeToast } = useToast();
  
  // Speech recognition for voice input using Whisper
  const {
    isRecording,
    transcript,
    error: speechError,
    isSupported: speechSupported,
    isProcessing,
    startRecording,
    stopRecording,
    resetTranscript
  } = useWhisperSpeechRecognition({
    language: language === 'en' ? 'en' : language === 'fr' ? 'fr' : language === 'de' ? 'de' : 'en'
  });
  
  // Memoized font size classes to prevent flicker
  const fontSizeClasses = useMemo(() => {
    switch (fontSize) {
      case 'small':
        return {
          base: 'text-xs',
          small: 'text-xs',
          medium: 'text-xs',
          large: 'text-xs',
          h1: 'text-base',
          h2: 'text-sm',
          h3: 'text-xs'
        };
      case 'large':
        return {
          base: 'text-base',
          small: 'text-sm',
          medium: 'text-sm',
          large: 'text-sm',
          h1: 'text-xl',
          h2: 'text-lg',
          h3: 'text-base'
        };
      default: // medium
        return {
          base: 'text-sm',
          small: 'text-xs',
          medium: 'text-xs',
          large: 'text-xs',
          h1: 'text-lg',
          h2: 'text-base',
          h3: 'text-sm'
        };
    }
  }, [fontSize]);

  
  // EU AI Act compliance
  const {
    showDisclosure,
    canUseAI,
    isLoading: disclosureLoading,
    handleAccept,
    handleDecline
  } = useAIDisclosure(language);

  // Smart scroll behavior: keep user message at top when agent responds
  const prevMessageCountRef = useRef(messages.length);
  const userMessageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage?.role === 'user') {
        // For user messages: scroll to show the new user message at top
        setTimeout(() => {
          const userMessageElement = userMessageRefs.current[lastMessage.id];
          if (userMessageElement) {
            userMessageElement.scrollIntoView({ 
              behavior: "smooth", 
              block: "start" // Align to top of viewport
            });
          }
        }, 100);
      } else if (lastMessage?.role === 'assistant') {
        // For assistant messages: find the corresponding user message and keep it at top
        // Find the most recent user message
        let userMessageIndex = -1;
        for (let i = messages.length - 2; i >= 0; i--) {
          if (messages[i]?.role === 'user') {
            userMessageIndex = i;
            break;
          }
        }
        
        if (userMessageIndex >= 0) {
          const userMessage = messages[userMessageIndex];
          setTimeout(() => {
            const userMessageElement = userMessageRefs.current[userMessage.id];
            if (userMessageElement) {
              userMessageElement.scrollIntoView({ 
                behavior: "smooth", 
                block: "start" // Keep user message at top
              });
            }
          }, 200);
        }
      }
      prevMessageCountRef.current = messages.length;
    }
  }, [messages]);

  // Focus input when chat opens and manage body scroll
  useEffect(() => {
    if (isOpen) {
      // Focus input
      if (inputRef.current) {
        inputRef.current.focus();
      }
      
      // Prevent body scroll when chat is open (especially when maximized)
      if (isMaximized) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      // Re-enable body scroll when chat is closed
      document.body.style.overflow = '';
    }
    
    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMaximized]);

  // Auto-adjust font size based on maximized state
  useEffect(() => {
    if (isMaximized) {
      setFontSize('large');
    } else {
      setFontSize('medium');
    }
  }, [isMaximized]);

  // Close session menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showSessionMenu) {
        setShowSessionMenu(false);
      }
    };

    if (showSessionMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSessionMenu]);

  // Handle speech recognition transcript
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  // Handle speech recognition errors
  useEffect(() => {
    if (speechError) {
      showToast(`Voice input error: ${speechError}`, 'error');
      resetTranscript();
    }
  }, [speechError, showToast, resetTranscript]);

  // Voice input handlers
  const handleVoiceInput = useCallback(async () => {
    if (!speechSupported) {
      showToast('Audio recording is not supported in this browser. Please use Chrome, Firefox, or Edge.', 'error');
      return;
    }

    if (isRecording) {
      // Stop recording
      await stopRecording();
      showToast('Recording stopped. Processing audio...', 'info');
    } else {
      resetTranscript();
      setInputValue(''); // Clear input before starting
      await startRecording();
      showToast('🎙️ Recording... Click the microphone again to stop.', 'info');
    }
  }, [speechSupported, isRecording, stopRecording, resetTranscript, startRecording, showToast]);


  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading || !canUseAI || !currentSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Add user message to local state and persist
    addMessage(userMessage);
    setInputValue("");
    setIsLoading(true);

    try {
      // Create AbortController for request timeout (35s for Safari/Brave compatibility)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 second timeout for complex RAG queries (Safari/Brave compatibility)

      // Call backend API with current session ID
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/chat/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: currentSessionId,
          language: language,
          ai_consent: canUseAI ? {
            accepted: true,
            timestamp: new Date().toISOString(),
            language: language,
            version: "1.0"
          } : null
        }),
        signal: controller.signal,
      });

      // Clear timeout if request completes successfully
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I apologize, but I couldn't process your request.",
        timestamp: new Date(),
        sources: data.sources?.combined || data.sources || [],
      };

      // Add assistant message to local state and persist
      addMessage(assistantMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Provide specific error messages based on error type
      let errorContent = "I apologize, but I'm having trouble connecting to the server. Please try again later.";
      
      if (error instanceof Error && error.name === 'AbortError') {
        errorContent = "The request took too long to complete (25s timeout). Please try again with a shorter message or check your connection.";
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorContent = "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (error instanceof Error && error.message.includes('Failed to get response')) {
        errorContent = "The server is currently unavailable. Please try again in a few moments.";
      } else if (error instanceof SyntaxError) {
        errorContent = "Received an invalid response from the server. Please try again.";
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
      };

      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, canUseAI, currentSessionId, language, addMessage]);


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Suggested questions for getting started
  const suggestedQuestions = [
    "What are the key targets of the EU Biodiversity Strategy for 2030?",
    "How does the Circular Economy Action Plan affect businesses?",
    "What are the main goals of the Farm to Fork Strategy?",
    "What is included in the Fit for 55 climate package?",
  ];

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleChatOpen = useCallback((maximized = false) => {
    if (!canUseAI && !disclosureLoading) {
      // Show disclosure modal first
      return;
    }
    setIsMaximized(maximized);
    setIsOpen(true);
  }, [canUseAI, disclosureLoading]);

  // Expose the handleChatOpen function to parent components
  React.useImperativeHandle(ref, () => ({
    openChat: handleChatOpen,
  }), [handleChatOpen]);

  if (!isOpen) {
    return (
      <>
        <Button
          onClick={() => handleChatOpen(false)}
          disabled={disclosureLoading}
          className={cn(
            "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl",
            "bg-green-600 hover:bg-green-700 text-white",
            "transition-all duration-300 hover:scale-110",
            !canUseAI && !disclosureLoading && "bg-amber-600 hover:bg-amber-700",
            className
          )}
        >
          {!canUseAI && !disclosureLoading ? (
            <Shield className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
        
        {/* AI Disclosure Modal */}
        <AIDisclosureModal
          isOpen={showDisclosure && !canUseAI}
          onAccept={() => {
            handleAccept();
            // Don't auto-open chat, let user click the button
          }}
          onDecline={handleDecline}
          language={language}
        />
      </>
    );
  }

  return (
    <div className={cn(
      isMaximized 
        ? "fixed top-30 left-4 right-4 bottom-4 z-50" 
        : "fixed bottom-6 right-6 z-50 w-96 h-[500px]",
      "bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl",
      "border border-white/20 flex flex-col",
      "transition-all duration-300",
      className
    )}>
      {/* Header */}
      <div className="border-b border-gray-200/50 bg-green-600 text-white rounded-t-2xl">
        {/* Top row - Font selector */}
        <div className="flex justify-center px-4 pt-2 pb-1">
          <div className="flex flex-col items-center space-y-1">
            <span className="text-white/80 text-xs font-medium">Font:</span>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as 'small' | 'medium' | 'large')}
              className="bg-white/20 text-white text-xs rounded px-2 py-1 border border-white/30 hover:bg-white/30 focus:outline-none focus:ring-1 focus:ring-white/50"
              title={`Font size (auto: ${isMaximized ? 'Large' : 'Medium'} for ${isMaximized ? 'maximized' : 'normal'} mode)`}
            >
              <option value="small" className="text-gray-900">Small</option>
              <option value="medium" className="text-gray-900">Medium{!isMaximized ? ' (auto)' : ''}</option>
              <option value="large" className="text-gray-900">Large{isMaximized ? ' (auto)' : ''}</option>
            </select>
          </div>
        </div>
        
        {/* Main header row */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <h3 className="font-semibold">Verdana - EU Green Assistant</h3>
          </div>
          <div className="flex items-center space-x-2">
            {/* Session Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSessionMenu(!showSessionMenu)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                title="Chat History"
              >
                <History className="h-4 w-4" />
              </Button>
            
            {showSessionMenu && (
              <div className="absolute top-10 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[250px] max-h-[300px] overflow-y-auto z-50">
                <div className="text-gray-700 text-sm font-medium mb-2 px-2">Chat Sessions</div>
                
                <Button
                  onClick={() => {
                    startNewSession();
                    setShowSessionMenu(false);
                  }}
                  className="w-full text-left text-sm mb-2 bg-green-100 hover:bg-green-200 text-green-800 flex items-center justify-start gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Start New Chat
                </Button>
                
                <div className="space-y-1">
                  {getAllSessions().map((session, index) => (
                    <div key={session.sessionId} className="flex items-center space-x-1">
                      <Button
                        onClick={() => {
                          continueSession(session.sessionId);
                          setShowSessionMenu(false);
                          showToast(`Resumed conversation: ${session.title}`, 'success');
                        }}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "flex-1 text-left text-xs px-2 py-1 h-auto",
                          session.sessionId === currentSessionId ? "bg-green-100 text-green-800" : "text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        <div className="truncate">
                          {session.title || `Session ${index + 1}`}
                        </div>
                        <div className="text-xs opacity-60">
                          {new Date(session.lastActivity).toLocaleDateString()}
                        </div>
                      </Button>
                      
                      <Button
                        onClick={() => {
                          deleteSession(session.sessionId);
                          if (getAllSessions().length === 0) {
                            setShowSessionMenu(false);
                          }
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-100 h-6 w-6 p-0"
                        title="Delete session"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {getAllSessions().length === 0 && (
                  <div className="text-gray-500 text-xs px-2 py-4 text-center">
                    No saved conversations
                  </div>
                )}
              </div>
            )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMaximized(!isMaximized)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
              title={isMaximized ? "Minimize" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0 mr-1"
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Recording Indicator Banner */}
      {(isRecording || isProcessing) && (
        <div className="absolute top-4 left-4 right-4 z-50">
          <div className={cn(
            "p-3 rounded-lg shadow-xl border text-white backdrop-blur-sm",
            isRecording 
              ? "bg-gradient-to-r from-red-500/95 to-red-600/95 border-red-400"
              : "bg-gradient-to-r from-blue-500/95 to-blue-600/95 border-blue-400"
          )}>
            <div className="flex items-center justify-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                {isRecording ? (
                  <>
                    <Mic className="h-5 w-5 animate-pulse" />
                    <span className="font-semibold">🎙️ RECORDING IN PROGRESS</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="font-semibold">🔄 PROCESSING AUDIO</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-center text-red-100 text-sm mt-1">
              {isRecording 
                ? "Speak now... Click the microphone button to stop recording"
                : "Converting speech to text using AI..."
              }
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onWheel={(e) => {
          // Prevent scroll propagation with passive-safe approach
          e.stopPropagation();
        }}>
        
        
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 space-y-4">
            {/* AI System Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-xs font-semibold text-blue-700">AI System Notice</span>
              </div>
              <p className="text-xs text-blue-600">
                You are interacting with an AI system designed to provide information about EU Green policies. 
                Responses are generated by artificial intelligence and should be verified with official sources.
              </p>
            </div>

            {/* Session & Storage Information */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center mb-2">
                <History className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-xs font-semibold text-green-700">Chat Sessions & Storage</span>
              </div>
              <div className="text-xs text-green-600 space-y-1">
                <p>• <strong>Multiple Sessions:</strong> You can have separate conversations for different topics</p>
                <p>• <strong>Local Storage:</strong> Chat history is saved in your browser locally (private & secure)</p>
                <p>• <strong>Data Persistence:</strong> Your conversations are preserved until you clear your browser cache</p>
                <p>• <strong>Privacy:</strong> No chat data is sent to external servers for storage</p>
              </div>
            </div>
            
            <p className={fontSizeClasses.base}>
              👋 Hi! I&apos;m <strong>Verdana</strong>, your EU Green Policy Specialist. My name reflects my expertise in green (&quot;verde&quot;) policy analysis (&quot;ana&quot;). Ask me anything about EU environmental policies!
            </p>
            
            {getAllSessions().length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 mb-2">
                  💾 <strong>Chat History Available</strong> - Click the history icon above to access your previous conversations
                </p>
              </div>
            )}
            <div className="space-y-2">
              <p className={`${fontSizeClasses.small} text-gray-500`}>Try asking:</p>
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className={`block w-full text-left ${fontSizeClasses.small} p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors`}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              ref={message.role === 'user' ? (el) => { userMessageRefs.current[message.id] = el; } : undefined}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg p-3 text-sm",
                  message.role === "user"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-900"
                )}
              >
                <div className={`markdown-content ${fontSizeClasses.base} leading-relaxed`}>
                  <ReactMarkdown
                    components={{
                      h1: ({children}) => <h1 className={`${fontSizeClasses.h1} font-bold mb-2 mt-4`}>{children}</h1>,
                      h2: ({children}) => <h2 className={`${fontSizeClasses.h2} font-bold mb-2 mt-3`}>{children}</h2>,
                      h3: ({children}) => <h3 className={`${fontSizeClasses.h3} font-semibold mb-1 mt-2`}>{children}</h3>,
                      p: ({children}) => <p className="mb-2">{children}</p>,
                      strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                      ul: ({children}) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
                      li: ({children}) => <li className="mb-1">{children}</li>,
                      code: ({children}) => <code className={`bg-gray-100 px-1 rounded ${fontSizeClasses.small}`}>{children}</code>,
                      a: ({href, children, ...props}) => (
                        <a 
                          href={href} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline"
                          {...props}
                        >
                          {children}
                        </a>
                      )
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <p className={`${fontSizeClasses.small} font-semibold text-gray-700`}>Sources & Verification:</p>
                    </div>
                    <div className="space-y-2">
                      {message.sources.map((source, index) => {
                        // Determine source styling based on type
                        const getSourceStyle = (type: string, verified?: boolean) => {
                          switch (type) {
                            case 'knowledge_base':
                              return verified 
                                ? "bg-green-50 border-green-200 text-green-800"
                                : "bg-blue-50 border-blue-200 text-blue-800";
                            case 'web_verification':
                              return "bg-emerald-50 border-emerald-200 text-emerald-800";
                            case 'verification':
                              return "bg-yellow-50 border-yellow-200 text-yellow-800";
                            case 'web_search':
                              return "bg-purple-50 border-purple-200 text-purple-800";
                            default:
                              return "bg-gray-50 border-gray-200 text-gray-800";
                          }
                        };

                        const getSourceIcon = (type: string, verified?: boolean) => {
                          switch (type) {
                            case 'knowledge_base':
                              return verified ? "✅" : "📚";
                            case 'web_verification':
                              return "🔍";
                            case 'verification':
                              return "⚡";
                            case 'web_search':
                              return "🌐";
                            default:
                              return "📄";
                          }
                        };

                        // Type-safe access to optional properties
                        const extendedSource = source as typeof source & { verified?: boolean; score?: number };
                        const sourceStyle = getSourceStyle(source.type, extendedSource.verified);
                        const sourceIcon = getSourceIcon(source.type, extendedSource.verified);

                        return (
                          <div key={index} className={`rounded-lg p-2 border ${sourceStyle}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="text-xs">{sourceIcon}</span>
                                  {source.url ? (
                                    <a
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-medium text-xs leading-relaxed hover:underline"
                                    >
                                      {source.title || source.filename || source.document_name}
                                    </a>
                                  ) : (
                                    <span className="font-medium text-xs">
                                      {source.title || source.filename || source.document_name}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs bg-white/70 px-2 py-0.5 rounded capitalize">
                                    {source.type.replace('_', ' ')}
                                  </span>
                                  
                                  {extendedSource.verified && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                      ✓ Verified
                                    </span>
                                  )}
                                  
                                  {source.similarity && (
                                    <span className="text-xs bg-white/70 px-2 py-0.5 rounded">
                                      {Math.round(source.similarity * 100)}% relevance
                                    </span>
                                  )}
                                  
                                  {extendedSource.score && (
                                    <span className="text-xs bg-white/70 px-2 py-0.5 rounded">
                                      {Math.round(extendedSource.score * 100)}% confidence
                                    </span>
                                  )}
                                </div>
                                
                                {source.filename && source.filename !== source.title && (
                                  <div className="text-xs opacity-70 mt-1">
                                    File: {source.filename}
                                  </div>
                                )}
                              </div>
                              
                              {source.url && (
                                <svg className="w-3 h-3 ml-2 mt-0.5 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <ShiningText text="Verdana is analyzing your question..." />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200/50">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "Recording... click microphone to stop" : isProcessing ? "Processing audio..." : "Ask about EU Green policies or use voice input..."}
            className={cn(
              "flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm text-gray-900 bg-white placeholder-gray-500",
              isRecording 
                ? "border-red-400 focus:ring-red-500 bg-red-50" 
                : isProcessing
                ? "border-blue-400 focus:ring-blue-500 bg-blue-50"
                : "border-gray-300 focus:ring-green-500"
            )}
            disabled={isLoading || isRecording || isProcessing}
          />
          
          {/* Voice Input Button */}
          {speechSupported && (
            <Button
              onClick={handleVoiceInput}
              disabled={isLoading}
              size="sm"
              variant={isRecording ? "destructive" : isProcessing ? "outline" : "outline"}
              className={cn(
                "transition-all duration-200 relative",
                isRecording 
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50 animate-pulse ring-2 ring-red-400 ring-opacity-75" 
                  : isProcessing
                  ? "border-blue-300 text-blue-600 bg-blue-50 opacity-75 cursor-not-allowed"
                  : "border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
              )}
              title={isRecording ? "🎙️ Recording... Click to stop" : isProcessing ? "Processing audio..." : "Click to start voice recording"}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          )}
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
});

ChatInterface.displayName = "ChatInterface";