"use client";
import React from "react";
import { Header } from "@/components/layout/header";
import { CanvasBackground } from "@/components/ui/canvas-background";
import { Database, MessageSquare, Search, Brain, Zap, Shield, GitBranch, CheckCircle2, Activity, Clock } from "lucide-react";

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <CanvasBackground />
      <Header />
      
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              System{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                Architecture
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Understanding the Verdana AI agent architecture with PostgreSQL vector storage, OpenAI embeddings, and web verification powering the EU Green Policies Chatbot
            </p>
          </div>

          {/* Architecture Overview */}
          <div className="max-w-6xl mx-auto space-y-16">
            
            {/* System Overview */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Brain className="h-8 w-8 text-green-400 mr-3" />
                Verdana AI Agent Architecture Overview
              </h2>
              <p className="text-white/80 text-xl leading-relaxed mb-6">
                Our system uses Verdana, an intelligent AI agent that combines query classification, automatic language detection, 
                PostgreSQL vector search, real-time web verification, and OpenAI Whisper speech processing to deliver accurate, 
                context-aware responses about EU Green Deal policies.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-300 mb-3">PostgreSQL + pgvector</h3>
                  <p className="text-white/70 text-lg">
                    High-performance vector database storing 3072-dimensional OpenAI embeddings of 24+ official EU policy documents for semantic search.
                  </p>
                </div>
                <div className="bg-blue-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-300 mb-3">OpenAI Integration</h3>
                  <p className="text-white/70 text-lg">
                    Uses GPT-4 for response generation, text-embedding-3-large for vectorization, and Whisper API for speech-to-text processing.
                  </p>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-purple-300 mb-3">Verdana AI Agent</h3>
                  <p className="text-white/70 text-lg">
                    Intelligent agent with query classification, language detection, conversation context, and proactive web search capabilities.
                  </p>
                </div>
              </div>
            </section>

            {/* Knowledge Base */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Database className="h-8 w-8 text-blue-400 mr-3" />
                Comprehensive Knowledge Base
              </h2>
              <p className="text-white/80 text-xl leading-relaxed mb-6">
                Our system contains 24+ official EU policy documents, processed into 800-token chunks with 300-token overlap, 
                embedded using OpenAI text-embedding-3-large for precise semantic retrieval of relevant policy information.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-500/20 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <CheckCircle2 className="h-6 w-6 text-green-400 mr-2" />
                    <h3 className="text-lg font-semibold text-green-300">Official Sources</h3>
                  </div>
                  <p className="text-white/70 text-base">
                    All documents sourced directly from European Commission official publications and legal databases.
                  </p>
                </div>
                <div className="bg-blue-500/20 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <GitBranch className="h-6 w-6 text-blue-400 mr-2" />
                    <h3 className="text-lg font-semibold text-blue-300">Vector Search</h3>
                  </div>
                  <p className="text-white/70 text-base">
                    Uses cosine similarity on 3072-dimensional embeddings with 0.3 threshold to find the most relevant policy content for each query.
                  </p>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-6">
                  <div className="flex items-center mb-3">
                    <Search className="h-6 w-6 text-purple-400 mr-2" />
                    <h3 className="text-lg font-semibold text-purple-300">Semantic Understanding</h3>
                  </div>
                  <p className="text-white/70 text-base">
                    Advanced semantic search understands context and intent, not just keyword matching.
                  </p>
                </div>
              </div>
            </section>


            {/* System Workflow */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Activity className="h-8 w-8 text-purple-400 mr-3" />
                Verdana Agent Processing Workflow
              </h2>
              <p className="text-white/80 text-xl leading-relaxed mb-8">
                Verdana handles the complete interaction lifecycle with intelligent query classification, automatic language detection, 
                conversation context awareness, vector search, real-time web verification, and comprehensive source attribution.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-orange-500/20 rounded-lg p-6 border-l-4 border-orange-400">
                  <div className="flex items-center mb-4">
                    <MessageSquare className="h-6 w-6 text-orange-400 mr-2" />
                    <h3 className="text-lg font-semibold text-orange-300">1. Query Classification</h3>
                  </div>
                  <p className="text-white/70 text-base">
                    Verdana classifies queries as casual conversation, identity, or EU Green Deal policy queries and detects user language.
                  </p>
                </div>

                <div className="bg-green-500/20 rounded-lg p-6 border-l-4 border-green-400">
                  <div className="flex items-center mb-4">
                    <Database className="h-6 w-6 text-green-400 mr-2" />
                    <h3 className="text-lg font-semibold text-green-300">2. Vector Search</h3>
                  </div>
                  <p className="text-white/70 text-base">
                    PostgreSQL pgvector cosine similarity search using OpenAI embeddings to find relevant EU policy content.
                  </p>
                </div>

                <div className="bg-blue-500/20 rounded-lg p-6 border-l-4 border-blue-400">
                  <div className="flex items-center mb-4">
                    <Search className="h-6 w-6 text-blue-400 mr-2" />
                    <h3 className="text-lg font-semibold text-blue-300">3. Web Verification</h3>
                  </div>
                  <p className="text-white/70 text-base">
                    Dual web search via Tavily API - EU domain-restricted search plus broader policy research for comprehensive coverage.
                  </p>
                </div>

                <div className="bg-purple-500/20 rounded-lg p-6 border-l-4 border-purple-400">
                  <div className="flex items-center mb-4">
                    <Brain className="h-6 w-6 text-purple-400 mr-2" />
                    <h3 className="text-lg font-semibold text-purple-300">4. Context Integration</h3>
                  </div>
                  <p className="text-white/70 text-base">
                    Verdana integrates conversation history, vector search results, and web verification data for context-aware responses.
                  </p>
                </div>

                <div className="bg-yellow-500/20 rounded-lg p-6 border-l-4 border-yellow-400">
                  <div className="flex items-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-yellow-400 mr-2" />
                    <h3 className="text-lg font-semibold text-yellow-300">5. Source Attribution</h3>
                  </div>
                  <p className="text-white/70 text-base">
                    Response delivered with comprehensive source attribution, relevance scores, and deduplicated reference list.
                  </p>
                </div>
              </div>
            </section>

            {/* Unified Agent Details */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Brain className="h-8 w-8 text-green-400 mr-3" />
                Unified Chat Agent Architecture
              </h2>
              <p className="text-white/80 text-xl leading-relaxed mb-8">
                Our streamlined architecture uses a single intelligent agent that combines all necessary capabilities 
                in one efficient system, eliminating the complexity of multiple agent coordination.
              </p>
              
              <div className="space-y-8">
                {/* Unified Agent */}
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-8 border border-green-400/30">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                      <Brain className="h-10 w-10 text-green-400 mr-4" />
                      <div>
                        <h3 className="text-2xl font-semibold text-green-300">Unified Chat Agent</h3>
                        <div className="flex items-center mt-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          <span className="text-green-400 text-sm font-medium">✅ Active - Production System</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-white/80 text-lg mb-6 leading-relaxed">
                    Our unified agent consolidates all AI capabilities into a single, efficient system that handles the complete interaction lifecycle. 
                    It processes voice input via local Whisper, performs RAG retrieval, conducts web verification, and generates comprehensive responses 
                    all within one streamlined workflow.
                  </p>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-orange-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-300 mb-3 flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Speech Processing
                      </h4>
                      <ul className="text-white/70 text-sm space-y-2">
                        <li>• Local Whisper transcription</li>
                        <li>• Multi-language support</li>
                        <li>• High-quality audio processing</li>
                        <li>• Real-time conversion</li>
                      </ul>
                    </div>

                    <div className="bg-green-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-green-300 mb-3 flex items-center">
                        <Database className="h-5 w-5 mr-2" />
                        RAG Retrieval
                      </h4>
                      <ul className="text-white/70 text-sm space-y-2">
                        <li>• Semantic document search</li>
                        <li>• Vector similarity matching</li>
                        <li>• Context-aware retrieval</li>
                        <li>• Source ranking & scoring</li>
                      </ul>
                    </div>

                    <div className="bg-blue-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-300 mb-3 flex items-center">
                        <Search className="h-5 w-5 mr-2" />
                        Web Verification
                      </h4>
                      <ul className="text-white/70 text-sm space-y-2">
                        <li>• Real-time source checking</li>
                        <li>• EU official site priority</li>
                        <li>• Policy update detection</li>
                        <li>• Accuracy validation</li>
                      </ul>
                    </div>

                    <div className="bg-purple-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-300 mb-3 flex items-center">
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Response Generation
                      </h4>
                      <ul className="text-white/70 text-sm space-y-2">
                        <li>• Comprehensive synthesis</li>
                        <li>• Source attribution</li>
                        <li>• Confidence scoring</li>
                        <li>• EU AI Act compliance</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 bg-green-500/10 rounded-lg p-4 border border-green-400/20">
                    <h4 className="font-semibold text-green-300 mb-3">Architecture Benefits</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="text-white/70 text-sm space-y-2">
                        <li>• <strong>Simplified Architecture:</strong> Single agent reduces complexity</li>
                        <li>• <strong>Faster Processing:</strong> No inter-agent communication overhead</li>
                        <li>• <strong>Better Consistency:</strong> Unified decision-making process</li>
                      </ul>
                      <ul className="text-white/70 text-sm space-y-2">
                        <li>• <strong>Enhanced Reliability:</strong> Fewer points of failure</li>
                        <li>• <strong>Easier Maintenance:</strong> Single codebase to manage</li>
                        <li>• <strong>Cost Efficiency:</strong> Reduced resource requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Stack */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Zap className="h-8 w-8 text-green-400 mr-3" />
                Technical Stack & Infrastructure
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-300 mb-3">Database Layer</h3>
                  <ul className="text-white/70 space-y-2">
                    <li className="text-base">• PostgreSQL 15+ with pgvector</li>
                    <li className="text-base">• Vector similarity search</li>
                    <li className="text-base">• 1536-dimensional embeddings</li>
                    <li className="text-base">• Efficient indexing & caching</li>
                  </ul>
                </div>
                
                <div className="bg-green-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-300 mb-3">AI & ML Services</h3>
                  <ul className="text-white/70 space-y-2">
                    <li className="text-base">• OpenAI GPT-4o-mini</li>
                    <li className="text-base">• OpenAI Whisper speech-to-text</li>
                    <li className="text-base">• text-embedding-3-large</li>
                    <li className="text-base">• Tavily search API</li>
                  </ul>
                </div>
                
                <div className="bg-purple-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-purple-300 mb-3">Backend Services</h3>
                  <ul className="text-white/70 space-y-2">
                    <li className="text-base">• FastAPI with async support</li>
                    <li className="text-base">• LangChain framework</li>
                    <li className="text-base">• WebSocket real-time chat</li>
                    <li className="text-base">• Structured logging</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Local Whisper Integration */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <MessageSquare className="h-8 w-8 text-orange-400 mr-3" />
                Local Whisper Speech Processing
              </h2>
              <p className="text-white/80 text-xl leading-relaxed mb-8">
                Our system uses OpenAI Whisper deployed locally for high-quality, privacy-focused speech-to-text processing. 
                Audio is processed server-side ensuring consistent quality and eliminating browser compatibility issues.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">Whisper Implementation</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-orange-500/20 rounded-lg p-4 border-l-4 border-orange-400">
                      <h4 className="font-semibold text-orange-300 mb-2">Frontend Audio Capture</h4>
                      <p className="text-white/70 text-base">
                        MediaRecorder API captures high-quality audio in multiple formats (WebM, MP4, OGG) for optimal compatibility.
                      </p>
                    </div>
                    
                    <div className="bg-blue-500/20 rounded-lg p-4 border-l-4 border-blue-400">
                      <h4 className="font-semibold text-blue-300 mb-2">Server-Side Processing</h4>
                      <p className="text-white/70 text-base">
                        Audio files are sent to backend where Whisper processes them with language detection and confidence scoring.
                      </p>
                    </div>
                    
                    <div className="bg-green-500/20 rounded-lg p-4 border-l-4 border-green-400">
                      <h4 className="font-semibold text-green-300 mb-2">Docker Integration</h4>
                      <p className="text-white/70 text-base">
                        Whisper runs in containerized environment with FFmpeg support and optimized resource allocation.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">Technical Benefits</h3>
                  
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-500/20 rounded border border-green-400/30">
                        <span className="text-white font-medium">Quality</span>
                        <span className="text-green-400 text-sm">Enterprise-grade accuracy</span>
                      </div>
                      <p className="text-white/70 text-sm">
                        Whisper provides state-of-the-art speech recognition quality across multiple languages.
                      </p>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded border border-blue-400/30">
                        <span className="text-white font-medium">Privacy</span>
                        <span className="text-blue-400 text-sm">Local processing</span>
                      </div>
                      <p className="text-white/70 text-sm">
                        Audio data is processed locally, not sent to external speech recognition services.
                      </p>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-500/20 rounded border border-purple-400/30">
                        <span className="text-white font-medium">Reliability</span>
                        <span className="text-purple-400 text-sm">Browser-independent</span>
                      </div>
                      <p className="text-white/70 text-sm">
                        Eliminates Web Speech API limitations and browser compatibility issues.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-orange-500/10 rounded-lg p-6 border border-orange-400/20">
                <h4 className="font-semibold text-orange-300 mb-4">Supported Features</h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h5 className="text-white font-medium mb-2">Audio Formats</h5>
                    <ul className="text-white/70 text-sm space-y-1">
                      <li>• MP3, WAV, WebM</li>
                      <li>• M4A, OGG, FLAC</li>
                      <li>• Up to 25MB file size</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-white font-medium mb-2">Languages</h5>
                    <ul className="text-white/70 text-sm space-y-1">
                      <li>• English, French, German</li>
                      <li>• Spanish, Italian, Portuguese</li>
                      <li>• Dutch, Polish, Romanian</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-white font-medium mb-2">Processing</h5>
                    <ul className="text-white/70 text-sm space-y-1">
                      <li>• Real-time transcription</li>
                      <li>• Automatic language detection</li>
                      <li>• Confidence scoring</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* User Experience & Accessibility */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Shield className="h-8 w-8 text-orange-400 mr-3" />
                User Experience & Accessibility
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-orange-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-orange-300 mb-3">Voice Input</h3>
                  <ul className="text-white/70 space-y-2">
                    <li className="text-base">• OpenAI Whisper integration</li>
                    <li className="text-base">• Multi-language voice recognition</li>
                    <li className="text-base">• Server-side speech-to-text processing</li>
                    <li className="text-base">• High-quality AI transcription</li>
                  </ul>
                </div>
                
                <div className="bg-blue-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-300 mb-3">Visual Feedback</h3>
                  <ul className="text-white/70 space-y-2">
                    <li className="text-base">• Recording state indicators</li>
                    <li className="text-base">• Toast notifications</li>
                    <li className="text-base">• Loading animations</li>
                    <li className="text-base">• Error state handling</li>
                  </ul>
                </div>
                
                <div className="bg-cyan-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-cyan-300 mb-3">Session Management</h3>
                  <ul className="text-white/70 space-y-2">
                    <li className="text-base">• Multiple conversation sessions by topic</li>
                    <li className="text-base">• Browser localStorage persistence (private)</li>
                    <li className="text-base">• No external server storage for privacy</li>
                    <li className="text-base">• Auto-session naming and organization</li>
                    <li className="text-base">• Context continuity across sessions</li>
                    <li className="text-base">• Data cleared only with browser cache</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Intelligent Verification System */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Shield className="h-8 w-8 text-green-400 mr-3" />
                Intelligent Verification System
              </h2>
              <p className="text-white/80 text-xl leading-relaxed mb-8">
                Every user query triggers an automatic verification process that cross-checks RAG results with current web sources, 
                ensuring responses are both comprehensive and up-to-date.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">How Verification Works</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-green-500/20 rounded-lg p-4 border-l-4 border-green-400">
                      <h4 className="font-semibold text-green-300 mb-2">Step 1: RAG Retrieval</h4>
                      <p className="text-white/70 text-base">
                        System searches knowledge base for relevant EU policy information using semantic similarity.
                      </p>
                    </div>
                    
                    <div className="bg-blue-500/20 rounded-lg p-4 border-l-4 border-blue-400">
                      <h4 className="font-semibold text-blue-300 mb-2">Step 2: Web Verification</h4>
                      <p className="text-white/70 text-base">
                        Simultaneously searches EU official sources for latest updates, policy changes, and current information.
                      </p>
                    </div>
                    
                    <div className="bg-purple-500/20 rounded-lg p-4 border-l-4 border-purple-400">
                      <h4 className="font-semibold text-purple-300 mb-2">Step 3: Confidence Analysis</h4>
                      <p className="text-white/70 text-base">
                        Compares RAG and web results, calculates confidence scores, and determines optimal response strategy.
                      </p>
                    </div>
                    
                    <div className="bg-yellow-500/20 rounded-lg p-4 border-l-4 border-yellow-400">
                      <h4 className="font-semibold text-yellow-300 mb-2">Step 4: Enhanced Response</h4>
                      <p className="text-white/70 text-base">
                        Generates final response combining verified knowledge base information with current web insights.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">Verification Strategies</h3>
                  
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-500/20 rounded border border-green-400/30">
                        <span className="text-white font-medium">High Confidence (90%+)</span>
                        <span className="text-green-400 text-sm">Use RAG</span>
                      </div>
                      <p className="text-white/70 text-base">
                        When web sources confirm RAG information is current and accurate.
                      </p>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded border border-blue-400/30">
                        <span className="text-white font-medium">Medium Confidence (60-89%)</span>
                        <span className="text-blue-400 text-sm">Combine Sources</span>
                      </div>
                      <p className="text-white/70 text-base">
                        When minor updates are detected, blend RAG knowledge with recent web findings.
                      </p>
                      
                      <div className="flex items-center justify-between p-3 bg-yellow-500/20 rounded border border-yellow-400/30">
                        <span className="text-white font-medium">Lower Confidence (&lt;60%)</span>
                        <span className="text-yellow-400 text-sm">Prioritize Web</span>
                      </div>
                      <p className="text-white/70 text-base">
                        When significant policy changes are detected, emphasize current web information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Performance Metrics */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Clock className="h-8 w-8 text-blue-400 mr-3" />
                System Performance & Metrics
              </h2>
              
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-green-500/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-400 mb-2">24+</div>
                  <div className="text-white/80">EU Policy Documents</div>
                </div>
                
                <div className="text-center p-6 bg-blue-500/20 rounded-lg">
                  <div className="text-3xl font-bold text-blue-400 mb-2">24</div>
                  <div className="text-white/80">EU Languages Supported</div>
                </div>
                
                <div className="text-center p-6 bg-purple-500/20 rounded-lg">
                  <div className="text-3xl font-bold text-purple-400 mb-2">3072</div>
                  <div className="text-white/80">Vector Dimensions</div>
                </div>
                
                <div className="text-center p-6 bg-yellow-500/20 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">0.3</div>
                  <div className="text-white/80">Similarity Threshold</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}