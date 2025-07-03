"use client";
import React from "react";
import { Header } from "@/components/layout/header";
import { CanvasBackground } from "@/components/ui/canvas-background";
import { Shield, CheckCircle, AlertTriangle, FileText, Users } from "lucide-react";

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <CanvasBackground />
      <Header />
      
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              EU AI Act{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                Compliance
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Our commitment to transparency and compliance with EU AI Act Article 50 requirements
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Overview */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <Shield className="h-8 w-8 text-green-400 mr-3" />
                <h2 className="text-3xl font-bold text-white">Compliance Overview</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-green-300">What is the EU AI Act?</h3>
                  <p className="text-white/80 text-lg leading-relaxed">
                    The{" "}
                    <a 
                      href="https://artificialintelligenceact.eu/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors font-semibold"
                    >
                      EU AI Act
                    </a>{" "}
                    is the world&apos;s first comprehensive AI law, establishing a risk-based 
                    framework for AI systems. Article 50 specifically requires transparency obligations 
                    for AI systems that interact directly with natural persons.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-blue-300">Our Compliance Approach</h3>
                  <p className="text-white/80 text-lg leading-relaxed">
                    We proactively implement Article 50 requirements, ensuring users are clearly 
                    informed when interacting with our AI system and providing transparent 
                    information about our AI capabilities and limitations.
                  </p>
                </div>
              </div>
            </section>

            {/* Article 50 Requirements */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <FileText className="h-8 w-8 text-blue-400 mr-3" />
                Article 50 Requirements
              </h2>
              
              <div className="space-y-6">
                <div className="bg-green-500/20 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-xl font-semibold text-green-300 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Transparency Obligations (Article 50.1)
                  </h3>
                  <p className="text-white/80 text-lg mb-4">
                    <strong>Requirement:</strong> &quot;Providers shall ensure that AI systems intended to interact 
                    directly with natural persons are designed and developed in such a way that the natural 
                    persons concerned are informed that they are interacting with an AI system.&quot;
                  </p>
                  <p className="text-green-200 text-sm">
                    ✅ <strong>Our Implementation:</strong> Users receive a clear disclosure modal before 
                    first interaction, explaining our AI system capabilities and requirements.
                  </p>
                </div>

                <div className="bg-blue-500/20 rounded-lg p-6 border border-blue-500/30">
                  <h3 className="text-xl font-semibold text-blue-300 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Content Marking (Article 50.2)
                  </h3>
                  <p className="text-white/80 text-lg mb-4">
                    <strong>Requirement:</strong> AI-generated content must be marked in a machine-readable 
                    format and detectable as artificially generated.
                  </p>
                  <p className="text-blue-200 text-sm">
                    ✅ <strong>Our Implementation:</strong> All AI responses include machine-readable markers 
                    and clear human-readable notices of AI generation.
                  </p>
                </div>

                <div className="bg-amber-500/20 rounded-lg p-6 border border-amber-500/30">
                  <h3 className="text-xl font-semibold text-amber-300 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Information Provision (Article 50.5)
                  </h3>
                  <p className="text-white/80 text-lg mb-4">
                    <strong>Requirement:</strong> Information must be provided &quot;in a clear and distinguishable 
                    manner at the latest at the time of the first interaction or exposure.&quot;
                  </p>
                  <p className="text-amber-200 text-sm">
                    ✅ <strong>Our Implementation:</strong> Disclosure appears before any AI interaction, 
                    with multilingual support and accessibility compliance.
                  </p>
                </div>
              </div>
            </section>

            {/* Implementation Details */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <Users className="h-8 w-8 text-purple-400 mr-3" />
                Implementation Details
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-purple-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">User Consent</h3>
                  <ul className="space-y-2 text-white/70 text-base">
                    <li>• Explicit consent before AI interaction</li>
                    <li>• Consent versioning and tracking</li>
                    <li>• Right to withdraw consent</li>
                    <li>• Clear consent language</li>
                  </ul>
                </div>
                
                <div className="bg-green-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-300 mb-3">Content Marking</h3>
                  <ul className="space-y-2 text-white/70 text-base">
                    <li>• Machine-readable AI markers</li>
                    <li>• Human-readable notices</li>
                    <li>• Metadata preservation</li>
                    <li>• Technical standards compliance</li>
                  </ul>
                </div>
                
                <div className="bg-blue-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-300 mb-3">Transparency</h3>
                  <ul className="space-y-2 text-white/70 text-base">
                    <li>• Clear system capabilities description</li>
                    <li>• Limitation acknowledgments</li>
                    <li>• Source citation requirements</li>
                    <li>• Performance metrics display</li>
                  </ul>
                </div>
              </div>
            </section>


            {/* User Rights */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6">Your Rights</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-green-300">Right to Information</h3>
                  <ul className="space-y-2 text-white/70 text-base">
                    <li>• Know when you&apos;re interacting with AI</li>
                    <li>• Understand AI system capabilities</li>
                    <li>• Access information about data processing</li>
                    <li>• View source citations and confidence scores</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-blue-300">Right to Control</h3>
                  <ul className="space-y-2 text-white/70 text-base">
                    <li>• Withdraw consent at any time</li>
                    <li>• Choose not to interact with AI</li>
                    <li>• Request deletion of your data</li>
                    <li>• Access alternative human support</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6">Questions or Concerns?</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-white/80 text-lg mb-4">
                    If you have questions about our AI system, compliance practices, or want to 
                    exercise your rights, please contact us:
                  </p>
                  <ul className="space-y-2 text-white/70 text-base">
                    <li>• Email: <a href="mailto:e.covasa@me.com" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors">e.covasa@me.com</a></li>
                  </ul>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Regulatory Information</h4>
                  <p className="text-white/70 text-base mb-2">
                    <strong>Legal Basis:</strong> EU AI Act Article 50
                  </p>
                  <p className="text-white/70 text-base mb-2">
                    <strong>Implementation Date:</strong> August 1, 2026
                  </p>
                  <p className="text-white/70 text-base">
                    <strong>Compliance Version:</strong> 1.0
                  </p>
                </div>
              </div>
            </section>

            {/* Warning Notice */}
            <section className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-amber-300 mb-2">Important Notice</h3>
                  <p className="text-amber-100 text-sm leading-relaxed">
                    This AI system provides information about EU environmental policies but should not 
                    be considered as legal advice. Always consult official EU sources and qualified 
                    legal professionals for compliance decisions. AI-generated responses may contain 
                    errors and should be verified with authoritative sources.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}