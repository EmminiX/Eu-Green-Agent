"use client";
import React from "react";
import { Header } from "@/components/layout/header";
import { CanvasBackground } from "@/components/ui/canvas-background";
import { Users, Globe, Zap, Heart, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <CanvasBackground />
      <Header />
      
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                Our Project
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Empowering businesses and individuals to navigate EU environmental policies with AI-powered assistance
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-16">
            
            {/* Mission */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <Heart className="h-8 w-8 text-green-400 mr-3" />
                <h2 className="text-3xl font-bold text-white">Our Mission</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-white/80 text-lg leading-relaxed mb-6">
                    The EU Green Deal represents one of the most ambitious environmental policy frameworks in history. 
                    However, its complexity can be overwhelming for businesses and individuals trying to understand 
                    compliance requirements and implementation timelines.
                  </p>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Our mission is to democratize access to EU environmental policy information through intelligent, 
                    AI-powered assistance that makes complex regulations understandable and actionable.
                  </p>
                </div>
                
                <div className="bg-green-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-300 mb-4">What Verdana Provides</h3>
                  <ul className="space-y-3 text-white/80">
                    <li>• Clear explanations of 24+ official EU policy documents</li>
                    <li>• Real-time web verification and additional information</li>
                    <li>• Intelligent query classification and context awareness</li>
                    <li>• 24 EU languages with automatic detection</li>
                    <li>• Privacy-first multiple chat sessions</li>
                    <li>• Voice accessibility with OpenAI Whisper</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Technology */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <Zap className="h-8 w-8 text-blue-400 mr-3" />
                Technology & Innovation
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-300 mb-3">Verdana AI Agent</h3>
                  <p className="text-white/70 text-sm">
                    Advanced agent with intelligent query classification, automatic language detection for 24 EU languages, 
                    conversation context awareness, and proactive web search capabilities.
                  </p>
                </div>
                
                <div className="bg-purple-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Vector Search & RAG</h3>
                  <p className="text-white/70 text-sm">
                    OpenAI text-embedding-3-large with PostgreSQL pgvector for semantic similarity search, 
                    combined with real-time Tavily API web verification.
                  </p>
                </div>
                
                <div className="bg-green-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-300 mb-3">Privacy & Compliance</h3>
                  <p className="text-white/70 text-sm">
                    EU AI Act Article 50 compliant with transparent AI disclosures, local browser storage only, 
                    and GDPR-compliant data handling practices.
                  </p>
                </div>
              </div>
            </section>

            {/* Accessibility Features */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <Shield className="h-8 w-8 text-blue-400 mr-3" />
                Accessibility & Inclusion
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-300 mb-3">Voice Input</h3>
                  <p className="text-white/70 text-sm">
                    AI-powered speech-to-text using OpenAI Whisper provides high-quality transcription in multiple languages, enabling hands-free interaction for users with mobility challenges or visual impairments.
                  </p>
                </div>
                
                <div className="bg-green-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-300 mb-3">24 EU Language Support</h3>
                  <p className="text-white/70 text-sm">
                    Automatic language detection from first message with session persistence. Supports all 24 official EU languages 
                    with voice recognition, making EU policy information accessible to all European citizens.
                  </p>
                </div>
                
                <div className="bg-purple-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Visual Feedback</h3>
                  <p className="text-white/70 text-sm">
                    Clear visual indicators for voice recording state, loading states, and error messages to ensure accessible user experience.
                  </p>
                </div>
                
                <div className="bg-yellow-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-3">Multiple Chat Sessions</h3>
                  <p className="text-white/70 text-sm">
                    Create separate conversations for different EU policy topics (e.g., &quot;CBAM Questions&quot;, &quot;Circular Economy&quot;). 
                    All chat history stored locally in browser with session management and conversation context preservation.
                  </p>
                </div>
              </div>
            </section>

            {/* Impact */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <Globe className="h-8 w-8 text-green-400 mr-3" />
                Our Impact
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">24+</div>
                  <div className="text-white/70 text-sm">Official EU Documents</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">24</div>
                  <div className="text-white/70 text-sm">EU Languages Supported</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
                  <div className="text-white/70 text-sm">Privacy Protection</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">3072</div>
                  <div className="text-white/70 text-sm">Vector Dimensions</div>
                </div>
              </div>
            </section>

            {/* Open Source */}
            <section className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <Users className="h-8 w-8 text-green-400 mr-3" />
                Open Source & Community
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-white/80 mb-4">
                    This project is open source and built for the community. We believe that access to 
                    environmental policy information should be free and available to everyone.
                  </p>
                  <p className="text-white/80">
                    Contributions, feedback, and suggestions are welcome as we work together to 
                    support Europe&apos;s green transition.
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-4">Get Involved</h4>
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li>• Report issues on GitHub</li>
                    <li>• Suggest new features</li>
                    <li>• Contribute translations</li>
                    <li>• Share feedback and ideas</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}