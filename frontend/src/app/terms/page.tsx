"use client";
import React from "react";
import { Header } from "@/components/layout/header";
import { CanvasBackground } from "@/components/ui/canvas-background";
import { FileText, AlertTriangle, Shield } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <CanvasBackground />
      <Header />
      
      <main className="relative z-10 pt-24 pb-16">
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
              Please read these terms carefully before using our EU Green Policies Chatbot
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
                    This AI system provides information about EU environmental policies but should not 
                    be considered as legal advice. Always consult official EU sources and qualified 
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
                    By accessing and using the EU Green Policies Chatbot, you accept and agree to be bound by 
                    the terms and provision of this agreement. If you do not agree to abide by the above, 
                    please do not use this service.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">2. Service Description</h3>
                  <p className="text-white/80 leading-relaxed mb-4">
                    Our service provides a multi-agent AI system for understanding EU environmental policies, 
                    featuring automatic verification and real-time research capabilities:
                  </p>
                  <ul className="text-white/70 space-y-2 ml-4">
                    <li>• AI-powered search through 26+ official EU policy documents</li>
                    <li>• Automatic verification against current web sources</li>
                    <li>• Real-time policy updates and change detection</li>
                    <li>• Multi-language support for European languages</li>
                    <li>• Source-backed responses with confidence scoring</li>
                    <li>• Links to official EU resources and recent publications</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">3. AI System Disclosure</h3>
                  <p className="text-white/80 leading-relaxed">
                    In compliance with EU AI Act Article 50, we clearly disclose that you are interacting 
                    with a multi-agent AI system powered by OpenAI GPT-4o-mini, PostgreSQL vector database, 
                    and real-time web research. All responses are AI-generated with automatic verification 
                    and should be confirmed with official sources for critical decisions.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">4. Limitation of Liability</h3>
                  <p className="text-white/80 leading-relaxed">
                    This service is provided for informational purposes only. We make no warranties about 
                    the accuracy, completeness, or reliability of the information provided. Users are 
                    responsible for verifying information with official EU sources before making any 
                    business or legal decisions.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">5. Data and Privacy</h3>
                  <p className="text-white/80 leading-relaxed">
                    We are committed to protecting your privacy. Our system processes data through multiple 
                    third-party services (OpenAI, Tavily, Firecrawl) but does not store personal conversation 
                    data. Our practices comply with GDPR requirements. For detailed information, please refer 
                    to our Privacy Policy.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">6. Open Source License</h3>
                  <p className="text-white/80 leading-relaxed">
                    This project is open source and available under standard open source licensing terms. 
                    The source code is available for review, contribution, and community participation.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">7. Changes to Terms</h3>
                  <p className="text-white/80 leading-relaxed">
                    We reserve the right to modify these terms at any time. Changes will be effective 
                    immediately upon posting. Your continued use of the service after any changes 
                    constitutes acceptance of the new terms.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-green-300 mb-4">8. Contact Information</h3>
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
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-green-300 mb-2">EU AI Act Compliance</h4>
                  <p className="text-white/70 text-sm">
                    Fully compliant with Article 50 transparency requirements for AI systems.
                  </p>
                </div>
                
                <div className="bg-blue-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-300 mb-2">GDPR Compliance</h4>
                  <p className="text-white/70 text-sm">
                    Data processing practices align with EU General Data Protection Regulation.
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