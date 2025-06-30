// Frontend: Chat Container Component (React/Next.js)
'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ExternalLink, Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sources?: Array<{
    title: string;
    url: string;
    type: 'official' | 'policy' | 'document';
  }>;
  confidence?: number;
}

export function EUGreenChatbot() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hasAcknowledgedAI, setHasAcknowledgedAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to EU Green Chat');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('ai_response', (data) => {
      setIsTyping(false);
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: data.message,
        isUser: false,
        timestamp: new Date(),
        sources: data.sources,
        confidence: data.confidence
      };
      setMessages(prev => [...prev, aiMessage]);
    });

    newSocket.on('typing', () => {
      setIsTyping(true);
    });

    newSocket.on('error', (error) => {
      console.error('Chat error:', error);
      setIsTyping(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!inputValue.trim() || !socket || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    socket.emit('chat_message', {
      message: inputValue,
      timestamp: new Date().toISOString()
    });

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col">
      {/* EU AI Act Disclosure */}
      {!hasAcknowledgedAI && (
        <Card className="m-4 p-4 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-blue-600 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">
                AI Transparency Notice
              </h3>
              <p className="text-blue-800 text-sm mb-3">
                You are interacting with an AI system designed to provide information about EU Green Deal policies. 
                This chatbot generates responses automatically and should be verified with official EU sources. 
                No personal data is stored or tracked.
              </p>
              <Button 
                onClick={() => setHasAcknowledgedAI(true)}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                I understand
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">EU Green Deal Assistant</h1>
            <p className="text-green-100">
              Your guide to European environmental policies and regulations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <h3 className="text-lg font-semibold mb-2">Welcome to EU Green Deal Assistant</h3>
              <p>Ask me anything about EU environmental policies, the Green Deal, CBAM, biodiversity strategies, and more!</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {[
                "What is the European Green Deal?",
                "How does CBAM affect my business?",
                "What are the EU biodiversity targets for 2030?",
                "Explain the Farm to Fork strategy"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-left p-3 h-auto"
                  onClick={() => setInputValue(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.isUser
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              
              {/* AI Response Metadata */}
              {!message.isUser && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {/* Confidence Score */}
                  {message.confidence && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-600">Confidence:</span>
                      <Badge variant={message.confidence > 0.8 ? 'default' : 'secondary'}>
                        {Math.round(message.confidence * 100)}%
                      </Badge>
                    </div>
                  )}
                  
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-600 block mb-2">Sources:</span>
                      <div className="space-y-1">
                        {message.sources.map((source, index) => (
                          <a
                            key={index}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink size={12} />
                            <span className="truncate">{source.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {source.type}
                            </Badge>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Timestamp */}
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about EU Green Deal policies..."
            className="flex-1"
            disabled={!isConnected || !hasAcknowledgedAI}
            maxLength={500}
          />
          <Button
            onClick={sendMessage}
            disabled={!inputValue.trim() || !isConnected || !hasAcknowledgedAI}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send size={20} />
          </Button>
        </div>
        <div className="text-xs text-gray-500 mt-2 flex justify-between">
          <span>Press Enter to send</span>
          <span>{inputValue.length}/500</span>
        </div>
      </div>
    </div>
  );
}