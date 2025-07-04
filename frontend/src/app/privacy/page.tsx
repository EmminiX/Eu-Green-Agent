"use client";
import React from "react";
import { Header } from "@/components/layout/header";
import { CanvasBackground } from "@/components/ui/canvas-background";
import { Shield, Lock, Eye, Database, Users, Globe } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <CanvasBackground />
      <Header />
      
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Privacy{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                Policy
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Privacy Overview */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-green-400 mr-3" />
                <h2 className="text-3xl font-bold text-white">Privacy Overview</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-white/80 text-lg leading-relaxed mb-4">
                    We are committed to protecting your privacy with a privacy-first architecture. 
                    Your chat conversations are stored locally in your browser only - we never store 
                    your conversation history on external servers.
                  </p>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Our practices comply with the EU General Data Protection Regulation (GDPR) and 
                    give you complete control over your personal conversation data.
                  </p>
                </div>
                
                <div className="bg-green-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-300 mb-4">Privacy-First Approach</h3>
                  <ul className="space-y-2 text-white/70 text-base">
                    <li>• Chat history stored locally in your browser only</li>
                    <li>• Multiple chat sessions for topic organization</li>
                    <li>• No external servers store your conversations</li>
                    <li>• GDPR compliant with user data control</li>
                    <li>• Transparent AI processing with source attribution</li>
                    <li>• Clear data only when you clear browser cache</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Chat Sessions & Local Storage */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Database className="h-6 w-6 text-green-400 mr-3" />
                Multiple Chat Sessions & Local Storage
              </h2>
              
              <div className="space-y-6">
                <div className="bg-green-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-300 mb-3">How Chat Sessions Work</h3>
                  <ul className="text-white/70 text-base space-y-2">
                    <li>• <strong>Multiple Sessions:</strong> Create separate conversations for different EU policy topics (e.g., &quot;CBAM Questions&quot;, &quot;Circular Economy Research&quot;)</li>
                    <li>• <strong>Session History:</strong> Each session maintains its own conversation history and context</li>
                    <li>• <strong>Language Persistence:</strong> Each session remembers your detected language preference</li>
                    <li>• <strong>Easy Management:</strong> Switch between sessions via the history menu with clear session titles</li>
                  </ul>
                </div>

                <div className="bg-blue-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-300 mb-3">Local Browser Storage Details</h3>
                  <ul className="text-white/70 text-base space-y-2">
                    <li>• <strong>localStorage:</strong> All chat data stored in browser&apos;s localStorage (not cookies)</li>
                    <li>• <strong>Device-Specific:</strong> Data stays on your device - not synced across devices</li>
                    <li>• <strong>No External Backup:</strong> We do not backup or store your conversations on our servers</li>
                    <li>• <strong>User Control:</strong> You can delete individual sessions or clear all data via browser settings</li>
                  </ul>
                  <div className="mt-4 p-3 bg-blue-600/20 rounded border border-blue-400/30">
                    <p className="text-blue-200 text-sm">
                      <strong>Technical Note:</strong> Your chat data is stored as JSON in localStorage with session IDs. 
                      Data persists until you clear browser cache, delete sessions manually, or uninstall your browser.
                    </p>
                  </div>
                </div>

                <div className="bg-purple-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">What Gets Stored Locally</h3>
                  <ul className="text-white/70 text-base space-y-2">
                    <li>• Chat messages (your questions and Verdana&apos;s responses)</li>
                    <li>• Session metadata (titles, creation dates, last activity)</li>
                    <li>• Language preferences per session</li>
                    <li>• AI consent acknowledgment status</li>
                    <li>• Current session identifier</li>
                  </ul>
                  <div className="mt-4 p-3 bg-purple-600/20 rounded border border-purple-400/30">
                    <p className="text-purple-200 text-sm">
                      <strong>Privacy Guarantee:</strong> This data never leaves your browser unless you explicitly 
                      share chat content. We cannot access your stored conversations.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Collection */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Database className="h-6 w-6 text-blue-400 mr-3" />
                Information We Collect
              </h2>
              
              <div className="space-y-6">
                <div className="bg-green-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-300 mb-3">Chat Data Processing</h3>
                  <p className="text-white/70 text-base mb-3">
                    <strong>Important:</strong> Your chat conversations are processed through our multi-agent AI system 
                    which includes PostgreSQL vector database for document retrieval, web research capabilities via Tavily/Firecrawl APIs, 
                    and OpenAI for response generation. No personal conversation history is permanently stored.
                  </p>
                </div>

                <div className="bg-blue-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-300 mb-3">Temporary Processing</h3>
                  <p className="text-white/70 text-base mb-3">
                    During your session, we temporarily process:
                  </p>
                  <ul className="text-white/60 text-base space-y-1 ml-4">
                    <li>• Your questions (processed through our RAG system and OpenAI API)</li>
                    <li>• Document search queries (for policy information retrieval)</li>
                    <li>• Web research verification data (via Tavily/Firecrawl)</li>
                    <li>• AI responses (generated and displayed)</li>
                    <li>• Language preferences (stored locally in your browser)</li>
                    <li>• EU AI Act consent status (stored locally in your browser)</li>
                  </ul>
                </div>

                <div className="bg-purple-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Technical Information</h3>
                  <p className="text-white/70 text-base mb-3">
                    Standard web server logs may temporarily record:
                  </p>
                  <ul className="text-white/60 text-base space-y-1 ml-4">
                    <li>• IP addresses (for security and rate limiting)</li>
                    <li>• Browser type (for compatibility)</li>
                    <li>• Pages visited (for analytics)</li>
                    <li>• Access timestamps (for monitoring)</li>
                  </ul>
                  <p className="text-white/60 text-xs mt-2">
                    <em>These logs are automatically purged and contain no personal data.</em>
                  </p>
                </div>

                <div className="bg-amber-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-amber-300 mb-3">Third-Party Services</h3>
                  <p className="text-white/70 text-base mb-3">
                    We use multiple third-party services for AI processing:
                  </p>
                  <ul className="text-white/60 text-base space-y-1 ml-4">
                    <li>• <strong>OpenAI API:</strong> For AI response generation</li>
                    <li>• <strong>Tavily API:</strong> For web search and verification</li>
                    <li>• <strong>Firecrawl API:</strong> For detailed web content extraction</li>
                    <li>• Data subject to respective third-party privacy policies</li>
                    <li>• Temporary processing only, no long-term storage by us</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Data */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Eye className="h-6 w-6 text-green-400 mr-3" />
                How We Process Your Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-300 mb-3">Real-time Processing</h3>
                  <ul className="text-white/70 text-base space-y-2">
                    <li>• Search EU policy documents in our knowledge base</li>
                    <li>• Verify information with real-time web research</li>
                    <li>• Generate AI responses using OpenAI</li>
                    <li>• Display verified, source-backed answers</li>
                    <li>• Maintain conversation context during session</li>
                    <li>• Support multiple European languages</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-blue-300 mb-3">No Long-term Storage</h3>
                  <ul className="text-white/70 text-base space-y-2">
                    <li>• No conversation history retained</li>
                    <li>• No user profiles created</li>
                    <li>• No personal data databases</li>
                    <li>• Session data cleared on browser close</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-green-500/20 rounded-lg p-4 mt-6">
                <p className="text-green-200 text-sm">
                  <strong>Privacy by Design:</strong> Our architecture ensures your conversations remain private 
                  by not storing any personal data on our servers.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Users className="h-6 w-6 text-purple-400 mr-3" />
                Your Rights Under GDPR
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-purple-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-300 mb-2">Right to Access</h4>
                    <p className="text-white/70 text-base">
                      Request access to your personal data we hold.
                    </p>
                  </div>
                  
                  <div className="bg-blue-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-300 mb-2">Right to Rectification</h4>
                    <p className="text-white/70 text-base">
                      Correct inaccurate or incomplete data.
                    </p>
                  </div>
                  
                  <div className="bg-green-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-300 mb-2">Right to Erasure</h4>
                    <p className="text-white/70 text-base">
                      Request deletion of your personal data.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-amber-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-300 mb-2">Right to Portability</h4>
                    <p className="text-white/70 text-base">
                      Receive your data in a portable format.
                    </p>
                  </div>
                  
                  <div className="bg-cyan-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-cyan-300 mb-2">Right to Object</h4>
                    <p className="text-white/70 text-base">
                      Object to certain types of data processing.
                    </p>
                  </div>
                  
                  <div className="bg-pink-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-pink-300 mb-2">Right to Withdraw</h4>
                    <p className="text-white/70 text-base">
                      Withdraw consent for AI interactions.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Lock className="h-6 w-6 text-yellow-400 mr-3" />
                Data Security & Retention
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-300 mb-3">Security Measures</h3>
                  <ul className="text-white/70 text-base space-y-2">
                    <li>• Encrypted data transmission (HTTPS)</li>
                    <li>• Secure API communication with OpenAI</li>
                    <li>• No server-side data storage</li>
                    <li>• Browser-only session management</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-green-300 mb-3">Data Retention</h3>
                  <ul className="text-white/70 text-base space-y-2">
                    <li>• Chat data: Not stored on our servers</li>
                    <li>• Technical logs: Minimal, auto-purged</li>
                    <li>• User preferences: Browser local storage only</li>
                    <li>• Personal data: Zero retention policy</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-500/20 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-blue-300 mb-2">Third-Party Data Handling</h4>
                <p className="text-white/70 text-sm">
                  Your messages are processed by OpenAI, Tavily, and Firecrawl according to their respective data usage policies. 
                  We recommend reviewing each service&apos;s privacy policy for details on their data handling practices.
                </p>
              </div>
            </section>

            {/* International Transfers */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Globe className="h-6 w-6 text-blue-400 mr-3" />
                International Data Transfers
              </h2>
              
              <p className="text-white/80 leading-relaxed mb-4">
                Our services primarily operate within the European Union. Any international data 
                transfers are conducted with appropriate safeguards in compliance with GDPR requirements.
              </p>
              
              <div className="bg-blue-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-300 mb-2">Transfer Safeguards</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Adequacy decisions where applicable</li>
                  <li>• Standard contractual clauses</li>
                  <li>• Additional technical and organizational measures</li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">Contact & Questions</h2>
              
              <p className="text-white/80 mb-4">
                If you have questions about this Privacy Policy or want to exercise your rights, 
                please contact us at: <a href="mailto:e.covasa@me.com" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors">e.covasa@me.com</a>
              </p>
              
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-white/70 text-sm">
                  <strong>Last Updated:</strong> January 2025<br />
                  <strong>Review Schedule:</strong> Annually or as needed for regulatory changes
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}