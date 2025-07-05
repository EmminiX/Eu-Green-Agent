import React from "react";
import { Header } from "@/components/layout/header";
import { CanvasBackground } from "@/components/ui/canvas-background";
import { Shield, CheckCircle, AlertTriangle, FileText, Users } from "lucide-react";
import { Metadata } from "next";
import { generateMetadata } from "@/lib/seo-config";

export const metadata: Metadata = generateMetadata({
  title: "EU AI Act Compliance - Article 50 Transparency Requirements",
  description: "Learn how our Verdana AI agent fully complies with EU AI Act Article 50 transparency requirements, including AI disclosure, content marking, and user rights protection across 24 EU languages.",
  keywords: ["EU AI Act", "AI compliance", "Article 50", "AI transparency", "AI disclosure", "AI regulation", "EU AI law"],
  canonical: "https://verdana.emmi.zone/compliance"
});

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <CanvasBackground />
      <Header />
      
      <main className="relative z-10 pt-24 md:pt-24 pb-16">
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
              My Verdana AI agent fully complies with EU AI Act Article 50 transparency requirements, providing clear AI disclosure, content marking, and user rights protection across 24 EU languages
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
                  <h3 className="text-xl font-semibold text-blue-300">My Verdana AI Implementation</h3>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Verdana proactively implements Article 50 requirements with intelligent query classification, 
                    multilingual disclosure support, and comprehensive transparency measures. Our agent provides 
                    clear AI identification, detailed capability descriptions, and source attribution across all interactions.
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
                    ✅ <strong>Verdana Implementation:</strong> Users receive a comprehensive disclosure modal before 
                    first interaction in their detected language, explaining Verdana&apos;s capabilities, EU policy expertise, 
                    web verification features, and interaction requirements with explicit consent tracking.
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
                    ✅ <strong>Verdana Implementation:</strong> All AI responses include machine-readable markers, 
                    clear human-readable notices (&quot;Generated by Verdana AI Agent&quot;), source attribution with 
                    confidence scores, and structured metadata for AI content identification.
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
                    ✅ <strong>Verdana Implementation:</strong> Disclosure appears before any AI interaction with 
                    automatic language detection for 24 EU languages, voice accessibility via OpenAI Whisper, 
                    and comprehensive capability descriptions including RAG search and web verification.
                  </p>
                </div>
              </div>
            </section>

            {/* Verdana AI Implementation Details */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <Users className="h-8 w-8 text-purple-400 mr-3" />
                Verdana AI Compliance Implementation
              </h2>
              
              <div className="space-y-8">
                {/* AI System Disclosure */}
                <div className="bg-green-500/20 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-xl font-semibold text-green-300 mb-4">🤖 AI System Disclosure</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-green-200 font-medium mb-2">Automatic Disclosure</h4>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li>• Modal appears before first interaction</li>
                        <li>• Language auto-detection (24 EU languages)</li>
                        <li>• Clear AI system identification as &quot;Verdana&quot;</li>
                        <li>• Comprehensive capability description</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-green-200 font-medium mb-2">User Consent Management</h4>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li>• Explicit consent required before interaction</li>
                        <li>• Consent status stored locally</li>
                        <li>• Right to withdraw consent anytime</li>
                        <li>• Multilingual consent forms</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Content Marking */}
                <div className="bg-blue-500/20 rounded-lg p-6 border border-blue-500/30">
                  <h3 className="text-xl font-semibold text-blue-300 mb-4">🏷️ AI Content Marking</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-blue-200 font-medium mb-2">Machine-Readable Markers</h4>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li>• JSON metadata with AI generation flag</li>
                        <li>• Agent identification (&quot;verdana-ai-agent&quot;)</li>
                        <li>• Source attribution with confidence scores</li>
                        <li>• Processing timestamp and version tracking</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-blue-200 font-medium mb-2">Human-Readable Notices</h4>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li>• &quot;Generated by Verdana AI Agent&quot; label</li>
                        <li>• Source citations with relevance scores</li>
                        <li>• Clear AI vs human content distinction</li>
                        <li>• Verification status indicators</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Transparency Features */}
                <div className="bg-purple-500/20 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-xl font-semibold text-purple-300 mb-4">🔍 Transparency & Explainability</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-purple-200 font-medium mb-2">System Capabilities</h4>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li>• EU Green Deal policy specialization</li>
                        <li>• 24+ official documents knowledge base</li>
                        <li>• Real-time web verification via Tavily API</li>
                        <li>• OpenAI Whisper speech processing</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-purple-200 font-medium mb-2">Limitations & Disclaimers</h4>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li>• Not legal advice disclaimer</li>
                        <li>• Information verification recommendations</li>
                        <li>• Response confidence scoring</li>
                        <li>• Source quality assessments</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Technical Implementation */}
                <div className="bg-amber-500/20 rounded-lg p-6 border border-amber-500/30">
                  <h3 className="text-xl font-semibold text-amber-300 mb-4">⚙️ Technical Implementation</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-amber-200 font-medium mb-2">Query Classification</h4>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li>• Automatic query type detection</li>
                        <li>• EU policy vs general conversation</li>
                        <li>• Language detection and persistence</li>
                        <li>• Context awareness across sessions</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-amber-200 font-medium mb-2">Response Generation</h4>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li>• PostgreSQL vector search (pgvector)</li>
                        <li>• OpenAI text-embedding-3-large</li>
                        <li>• Dual web verification process</li>
                        <li>• Source deduplication and ranking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>


            {/* User Rights Under EU AI Act */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8">Your Rights Under EU AI Act</h2>
              
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-500/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-green-300 mb-4">Right to Information</h3>
                    <ul className="space-y-2 text-white/70 text-base">
                      <li>• Clear notification of AI interaction with Verdana</li>
                      <li>• Detailed AI system capability descriptions</li>
                      <li>• Access to data processing information</li>
                      <li>• View source citations and confidence scores</li>
                      <li>• Understanding of query classification process</li>
                      <li>• Information about web verification methods</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-500/20 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-blue-300 mb-4">Right to Control</h3>
                    <ul className="space-y-2 text-white/70 text-base">
                      <li>• Withdraw AI consent at any time via settings</li>
                      <li>• Choose to disable AI interactions completely</li>
                      <li>• Delete local chat sessions and data</li>
                      <li>• Control language preferences and persistence</li>
                      <li>• Manage voice input and accessibility features</li>
                      <li>• Access alternative information sources</li>
                    </ul>
                  </div>
                </div>

                {/* Privacy Rights */}
                <div className="bg-purple-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-purple-300 mb-4">Privacy & Data Rights</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-purple-200 font-medium mb-2">Local Data Control</h4>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li>• All chat data stored locally in browser only</li>
                        <li>• No external storage of conversation history</li>
                        <li>• Multiple session management with topic organization</li>
                        <li>• User-controlled data retention and deletion</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-purple-200 font-medium mb-2">Processing Transparency</h4>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li>• Clear information about OpenAI API usage</li>
                        <li>• Tavily web search processing disclosure</li>
                        <li>• Voice data processing via Whisper API</li>
                        <li>• No long-term storage of personal data</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Accessibility Rights */}
                <div className="bg-cyan-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-cyan-300 mb-4">Accessibility & Language Rights</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-cyan-200 font-medium mb-2">Multilingual Support</h4>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li>• Automatic language detection (24 EU languages)</li>
                        <li>• Consistent language use within sessions</li>
                        <li>• AI disclosure in your preferred language</li>
                        <li>• Technical term preservation across languages</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-cyan-200 font-medium mb-2">Accessibility Features</h4>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li>• Voice input via OpenAI Whisper</li>
                        <li>• Visual feedback for recording states</li>
                        <li>• Font size customization</li>
                        <li>• Screen reader compatible interface</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-6">Questions or Concerns?</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-white/80 text-lg mb-4">
                    If you have questions about my AI system, compliance practices, or want to 
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
                    <strong>Full Implementation Date:</strong> August 1, 2026
                  </p>
                  <p className="text-white/70 text-base">
                    <strong>Verdana Compliance Version:</strong> 2.0 (Production Ready)
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
                    Verdana AI agent provides information about EU environmental policies based on 24+ official documents 
                    but should not be considered as legal advice. While my system includes real-time web verification 
                    and comprehensive source attribution, always consult official EU sources and qualified legal professionals 
                    for compliance decisions. AI-generated responses may contain errors and should be verified with authoritative sources.
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