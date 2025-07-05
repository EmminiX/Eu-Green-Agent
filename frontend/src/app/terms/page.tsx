import React from "react";
import { Header } from "@/components/layout/header";
import { CanvasBackground } from "@/components/ui/canvas-background";
import { FileText, AlertTriangle, Shield } from "lucide-react";
import { Metadata } from "next";
import { generateMetadata } from "@/lib/seo-config";

export const metadata: Metadata = generateMetadata({
  title: "Terms of Service - Usage Guidelines & Legal Information",
  description: "Read our terms of service for using the EU Green Policies Chatbot with Verdana AI agent. Learn about usage guidelines, limitations, and legal considerations.",
  keywords: ["terms of service", "usage guidelines", "legal information", "AI terms", "service agreement", "EU chatbot terms"],
  canonical: "https://verdana.emmi.zone/terms"
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <CanvasBackground />
      <Header />
      
      <main className="relative z-10 pt-24 md:pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Terms of{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                Service
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Please read these terms carefully before using Verdana, our EU Green Policies AI assistant with multiple chat sessions and local browser storage
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Important Notice */}
            <section className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-amber-300 mb-2">Important Notice</h3>
                  <p className="text-amber-100 text-sm leading-relaxed">
                    Verdana AI agent provides information about EU environmental policies based on 24+ official documents 
                    with real-time web verification, but should not be considered as legal advice. While our system includes 
                    comprehensive source attribution and confidence scoring, always consult official EU sources and qualified 
                    legal professionals for compliance decisions.
                  </p>
                </div>
              </div>
            </section>

            {/* Terms Sections */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <FileText className="h-8 w-8 text-blue-400 mr-3" />
                Terms and Conditions
              </h2>
              
              <div className="space-y-8">
                
                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">1. Acceptance of Terms</h3>
                  <p className="text-white/80 leading-relaxed">
                    By accessing and using Verdana, our EU Green Policies AI assistant, you accept and agree to be bound by 
                    the terms and provisions of this agreement. This includes consent to AI interactions, local data storage 
                    in your browser, and processing through our integrated services. If you do not agree to abide by these terms, 
                    please do not use this service.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">2. Service Description</h3>
                  <p className="text-white/80 leading-relaxed mb-4">
                    Verdana is an advanced AI agent specialized in EU environmental policies, featuring intelligent query classification, 
                    automatic language detection, and comprehensive web verification capabilities:
                  </p>
                  <ul className="text-white/70 space-y-2 ml-4">
                    <li>• Intelligent query classification (casual vs EU policy questions)</li>
                    <li>• 24 EU languages with automatic detection and session persistence</li>
                    <li>• Vector search through 24+ official EU policy documents (PostgreSQL + pgvector)</li>
                    <li>• Real-time web verification via Tavily API with EU domain restrictions</li>
                    <li>• OpenAI Whisper speech-to-text for voice accessibility</li>
                    <li>• Multiple chat sessions with local browser storage (privacy-first)</li>
                    <li>• Comprehensive source attribution with relevance scores</li>
                    <li>• Source deduplication and quality ranking</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">3. AI System Disclosure</h3>
                  <p className="text-white/80 leading-relaxed">
                    In compliance with EU AI Act Article 50, we clearly disclose that you are interacting 
                    with Verdana, our specialized AI agent powered by OpenAI GPT-4, text-embedding-3-large, 
                    PostgreSQL vector database with pgvector extension, and real-time web research via Tavily API. 
                    All responses are AI-generated with intelligent classification, automatic verification, 
                    and comprehensive source attribution. Responses should be confirmed with official sources for critical decisions.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">4. Limitation of Liability</h3>
                  <p className="text-white/80 leading-relaxed">
                    Verdana is provided for informational purposes only. While our system includes comprehensive 
                    web verification, source attribution with confidence scores, and processing of 24+ official EU documents, 
                    we make no warranties about the accuracy, completeness, or reliability of AI-generated information. 
                    Users are responsible for verifying information with official EU sources before making any 
                    business, legal, or compliance decisions.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">5. Data Privacy & Local Storage</h3>
                  <p className="text-white/80 leading-relaxed mb-4">
                    We are committed to protecting your privacy with a privacy-first architecture. Verdana processes 
                    queries through third-party services (OpenAI, Tavily) for response generation but implements 
                    comprehensive local data management:
                  </p>
                  <ul className="text-white/70 space-y-2 ml-4">
                    <li>• <strong>Local Storage Only:</strong> All chat sessions and history stored in browser localStorage</li>
                    <li>• <strong>Multiple Sessions:</strong> Create separate conversations for different EU policy topics</li>
                    <li>• <strong>No External Storage:</strong> Conversation history never sent to external servers</li>
                    <li>• <strong>Language Persistence:</strong> Each session remembers your detected language preference</li>
                    <li>• <strong>User Control:</strong> Delete individual sessions or clear all data via browser settings</li>
                    <li>• <strong>GDPR Compliance:</strong> Complete user control over personal conversation data</li>
                  </ul>
                  <p className="text-white/80 leading-relaxed mt-4">
                    For detailed information about our privacy practices, please refer to our Privacy Policy.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">6. Accessibility & User Rights</h3>
                  <p className="text-white/80 leading-relaxed mb-4">
                    Verdana is designed with accessibility and user rights in mind:
                  </p>
                  <ul className="text-white/70 space-y-2 ml-4">
                    <li>• <strong>Voice Accessibility:</strong> OpenAI Whisper speech-to-text in multiple languages</li>
                    <li>• <strong>Language Rights:</strong> Support for all 24 official EU languages</li>
                    <li>• <strong>AI Consent Control:</strong> Explicit consent required with right to withdraw</li>
                    <li>• <strong>Data Portability:</strong> Export or delete your local chat sessions</li>
                    <li>• <strong>Transparency:</strong> Clear information about AI capabilities and limitations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">7. Open Source License</h3>
                  <p className="text-white/80 leading-relaxed">
                    This project is open source and available under the MIT License. 
                    The source code is available for review, contribution, and community participation. 
                    This includes the Verdana agent implementation, frontend interface, and documentation.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">8. Changes to Terms</h3>
                  <p className="text-white/80 leading-relaxed">
                    We reserve the right to modify these terms at any time. Changes will be effective 
                    immediately upon posting. Your continued use of the service after any changes 
                    constitutes acceptance of the new terms.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">9. Contact Information</h3>
                  <p className="text-white/80 leading-relaxed">
                    If you have any questions about these Terms of Service, please contact us at: 
                    <a href="mailto:e.covasa@me.com" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors">e.covasa@me.com</a>
                  </p>
                </div>

              </div>
            </section>

            {/* Compliance Notice */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Shield className="h-6 w-6 text-green-400 mr-3" />
                Regulatory Compliance
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-green-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-300 mb-2">EU AI Act Compliance</h4>
                  <p className="text-white/70 text-sm">
                    Verdana fully complies with Article 50 transparency requirements including clear AI disclosure, 
                    content marking, and multilingual user rights protection.
                  </p>
                </div>
                
                <div className="bg-blue-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-300 mb-2">GDPR Compliance</h4>
                  <p className="text-white/70 text-sm">
                    Privacy-first architecture with local browser storage, user data control, 
                    and comprehensive data protection practices.
                  </p>
                </div>
                
                <div className="bg-purple-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-300 mb-2">Accessibility Standards</h4>
                  <p className="text-white/70 text-sm">
                    Voice input support, 24 EU languages, visual feedback, and screen reader compatibility 
                    for inclusive user experience.
                  </p>
                </div>
              </div>
            </section>

            {/* Last Updated */}
            <div className="text-center text-white/60 text-sm">
              Last updated: January 2025
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}