"use client";
import React, { useRef, useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { CanvasBackground } from "@/components/ui/canvas-background";
import { ChatInterface, ChatInterfaceRef } from "@/components/chat/chat-interface";
import { Leaf, Globe, Factory, Zap, Droplets, Building, Users, Calendar, ArrowRight, ExternalLink, FileText, Database } from "lucide-react";

interface KnowledgeBaseDocument {
  filename: string;
  title: string;
  document_id: string;
  chunk_count: number;
  last_updated: string;
  type: string;
  url: string;
}

export default function PoliciesPage() {
  const chatRef = useRef<ChatInterfaceRef>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<{documents: KnowledgeBaseDocument[], total_documents: number} | null>(null);
  const [loadingKB, setLoadingKB] = useState(true);

  const handleChatOpen = () => {
    if (chatRef.current && chatRef.current.openChat) {
      chatRef.current.openChat(true); // Open in maximized mode
    }
  };

  // Fetch knowledge base documents
  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/documents/knowledge-base`);
        if (response.ok) {
          const data = await response.json();
          setKnowledgeBase(data);
        } else {
          // If API is not available, set to null to show the static content
          setKnowledgeBase(null);
        }
      } catch (error) {
        console.error('Failed to fetch knowledge base:', error);
        // If there's an error, set to null to show the static content
        setKnowledgeBase(null);
      } finally {
        setLoadingKB(false);
      }
    };

    fetchKnowledgeBase();
  }, []);
  const mainPolicies = [
    {
      title: "European Green Deal",
      description: "The EU's flagship strategy to become climate neutral by 2050",
      icon: Leaf,
      color: "green",
      url: "https://ec.europa.eu/info/strategy/priorities-2019-2024/european-green-deal_en",
      keyMeasures: [
        "Climate Law - legally binding 2050 climate neutrality target",
        "55% emissions reduction by 2030 compared to 1990 levels",
        "€1 trillion investment plan over the next decade"
      ]
    },
    {
      title: "Carbon Border Adjustment Mechanism (CBAM)",
      description: "EU's carbon pricing system for imports to prevent carbon leakage",
      icon: Factory,
      color: "blue",
      url: "https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en",
      keyMeasures: [
        "Covers cement, iron & steel, aluminum, fertilizers, electricity, hydrogen",
        "Transitional phase: 2023-2025 (reporting only)",
        "Full implementation: 2026 (financial obligations)"
      ]
    },
    {
      title: "Farm to Fork Strategy",
      description: "Making EU food systems fair, healthy and environmentally-friendly",
      icon: Globe,
      color: "amber",
      url: "https://ec.europa.eu/food/horizontal-topics/farm-fork-strategy_en",
      keyMeasures: [
        "25% of EU agricultural land under organic farming by 2030",
        "50% reduction in pesticide use and risk by 2030",
        "20% reduction in fertilizer use by 2030"
      ]
    },
    {
      title: "Circular Economy Action Plan",
      description: "EU's plan for sustainable product policy and waste reduction",
      icon: Building,
      color: "purple",
      url: "https://ec.europa.eu/environment/circular-economy/",
      keyMeasures: [
        "Sustainable Products Initiative",
        "Right to repair legislation",
        "Textile strategy for circularity"
      ]
    },
    {
      title: "EU Biodiversity Strategy 2030",
      description: "Bringing nature back into our lives with ambitious biodiversity targets",
      icon: Droplets,
      color: "cyan",
      url: "https://ec.europa.eu/environment/strategy/biodiversity-strategy-2030_en",
      keyMeasures: [
        "30% of EU land and sea areas to be protected",
        "Restore 20% of EU land and sea areas by 2030",
        "Plant 3 billion trees by 2030"
      ]
    },
    {
      title: "Renewable Energy Directive (RED III)",
      description: "Accelerating renewable energy deployment across the EU",
      icon: Zap,
      color: "yellow",
      url: "https://ec.europa.eu/energy/topics/renewable-energy/renewable-energy-directive/overview_en",
      keyMeasures: [
        "42.5% renewable energy by 2030",
        "Simplified permitting procedures",
        "Enhanced sustainability criteria"
      ]
    }
  ];

  const keyDeadlines = [
    { year: "2024", milestone: "CBAM Reporting Phase", status: "Active" },
    { year: "2025", milestone: "Nature Restoration Law Implementation", status: "Upcoming" },
    { year: "2026", milestone: "CBAM Full Implementation", status: "Upcoming" },
    { year: "2027", milestone: "ETS2 for Buildings & Transport", status: "Upcoming" },
    { year: "2030", milestone: "55% Emissions Reduction Target", status: "Target" },
    { year: "2035", milestone: "Zero-emission Cars & Vans", status: "Target" },
    { year: "2050", milestone: "Climate Neutrality", status: "Target" }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      green: "bg-green-500/20 border-green-500/30 text-green-300",
      blue: "bg-blue-500/20 border-blue-500/30 text-blue-300",
      amber: "bg-amber-500/20 border-amber-500/30 text-amber-300",
      purple: "bg-purple-500/20 border-purple-500/30 text-purple-300",
      cyan: "bg-cyan-500/20 border-cyan-500/30 text-cyan-300",
      yellow: "bg-yellow-500/20 border-yellow-500/30 text-yellow-300"
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <CanvasBackground />
      <Header />
      
      <main className="relative z-10 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              EU Green{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                Policies
              </span>
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Comprehensive overview of the European Union&apos;s environmental and climate policies
            </p>
          </div>

          <div className="max-w-7xl mx-auto space-y-16">
            
            {/* Policy Overview */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <Leaf className="h-8 w-8 text-green-400 mr-3" />
                <h2 className="text-3xl font-bold text-white">Policy Framework Overview</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-green-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-300 mb-3">Climate Action</h3>
                  <p className="text-white/70 text-base">
                    Ambitious climate targets with legally binding commitments to achieve 
                    climate neutrality by 2050 and 55% emissions reduction by 2030.
                  </p>
                </div>
                
                <div className="bg-blue-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-blue-300 mb-3">Economic Transformation</h3>
                  <p className="text-white/70 text-base">
                    Transition to a sustainable, circular economy with new business models 
                    and green financing mechanisms supporting the transformation.
                  </p>
                </div>
                
                <div className="bg-purple-500/20 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-purple-300 mb-3">Social Justice</h3>
                  <p className="text-white/70 text-base">
                    Ensuring a just transition that leaves no one behind, with support 
                    for affected communities and workers in carbon-intensive industries.
                  </p>
                </div>
              </div>
            </section>

            {/* Main Policies Grid */}
            <section>
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <Globe className="h-8 w-8 text-blue-400 mr-3" />
                Key EU Green Policies
              </h2>
              
              <div className="grid lg:grid-cols-2 gap-8">
                {mainPolicies.map((policy, index) => {
                  const IconComponent = policy.icon;
                  return (
                    <div
                      key={index}
                      className={`rounded-2xl p-8 border transition-all duration-300 hover:scale-105 ${getColorClasses(policy.color)}`}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className={`p-3 rounded-lg ${policy.color === 'green' ? 'bg-green-500/30' : policy.color === 'blue' ? 'bg-blue-500/30' : policy.color === 'amber' ? 'bg-amber-500/30' : policy.color === 'purple' ? 'bg-purple-500/30' : policy.color === 'cyan' ? 'bg-cyan-500/30' : 'bg-yellow-500/30'}`}>
                            <IconComponent className="h-8 w-8" />
                          </div>
                        </div>
                        <ExternalLink className="h-5 w-5 opacity-60" />
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-4">
                        {policy.title}
                      </h3>

                      <p className="text-white/80 text-lg mb-6 leading-relaxed">
                        {policy.description}
                      </p>

                      <div className="space-y-3 mb-6">
                        <h4 className="font-semibold text-white text-sm">Key Measures:</h4>
                        <ul className="space-y-2">
                          {policy.keyMeasures.map((measure, measureIndex) => (
                            <li key={measureIndex} className="flex items-start space-x-2 text-white/70 text-base">
                              <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span>{measure}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <a
                        href={policy.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-white hover:text-white/80 transition-colors font-medium"
                      >
                        Learn More
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Implementation Timeline */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <Calendar className="h-8 w-8 text-purple-400 mr-3" />
                Implementation Timeline
              </h2>
              
              <div className="space-y-4">
                {keyDeadlines.map((deadline, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        deadline.status === 'Active' ? 'bg-green-500/30 text-green-300' :
                        deadline.status === 'Upcoming' ? 'bg-blue-500/30 text-blue-300' :
                        'bg-purple-500/30 text-purple-300'
                      }`}>
                        {deadline.year}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{deadline.milestone}</h3>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      deadline.status === 'Active' ? 'bg-green-500/20 text-green-300' :
                      deadline.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {deadline.status}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Cross-cutting Themes */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <Users className="h-8 w-8 text-green-400 mr-3" />
                Cross-cutting Themes
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-green-500/20 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-green-300 mb-3">Digital Transition</h3>
                  <p className="text-white/70 text-base">
                    Leveraging digital technologies for environmental monitoring and green innovation.
                  </p>
                </div>
                
                <div className="bg-blue-500/20 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-blue-300 mb-3">Just Transition</h3>
                  <p className="text-white/70 text-base">
                    Supporting workers and communities affected by the green transition.
                  </p>
                </div>
                
                <div className="bg-purple-500/20 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-purple-300 mb-3">Innovation</h3>
                  <p className="text-white/70 text-base">
                    Promoting research, development and deployment of clean technologies.
                  </p>
                </div>
                
                <div className="bg-amber-500/20 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-amber-300 mb-3">Global Leadership</h3>
                  <p className="text-white/70 text-base">
                    Setting international standards and promoting global climate action.
                  </p>
                </div>
              </div>
            </section>

            {/* Knowledge Base Section */}
            <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
                <Database className="h-8 w-8 text-blue-400 mr-3" />
                Chatbot Knowledge Base
              </h2>
              
              <div className="mb-6">
                <p className="text-white/80 text-lg mb-4">
                  Our AI chatbot has comprehensive knowledge about {knowledgeBase?.total_documents || 24} official EU Green Deal policy documents. 
                  This ensures accurate, up-to-date information directly from official sources.
                </p>
                <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-300/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-300" />
                    <span className="text-blue-300 font-semibold">All documents sourced from:</span>
                  </div>
                  <a 
                    href="https://commission.europa.eu/publications/legal-documents-delivering-european-green-deal_en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-200 hover:text-blue-100 underline text-sm"
                  >
                    European Commission - Legal Documents Delivering European Green Deal
                  </a>
                </div>
              </div>

              {loadingKB ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                  <p className="text-white/60 mt-4">Loading document list...</p>
                </div>
              ) : knowledgeBase ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Available Documents ({knowledgeBase.total_documents} total):
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {knowledgeBase.documents.map((doc, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                        <h4 className="text-white font-medium text-sm mb-2 leading-tight">
                          {doc.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-green-300 bg-green-500/20 px-2 py-1 rounded">
                            {doc.chunk_count} sections
                          </span>
                          <span className="text-white/60">
                            {doc.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-green-500/20 rounded-lg border border-green-300/30">
                    <p className="text-green-200 text-sm">
                      <strong>Quality Assurance:</strong> All responses are generated from these official EU documents, 
                      ensuring accuracy and reliability. Sources are provided with each answer for verification.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-300/20">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Knowledge Base Contents
                    </h3>
                    <p className="text-white/70 mb-4">
                      Verdana&apos;s knowledge base includes comprehensive coverage of all major EU Green Deal policies and regulations:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ul className="space-y-2 text-white/60 text-sm">
                        <li className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <span>European Green Deal Communication</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <span>Climate Law Regulation</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <span>CBAM Regulation & Implementing Acts</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <span>Farm to Fork Strategy</span>
                        </li>
                      </ul>
                      <ul className="space-y-2 text-white/60 text-sm">
                        <li className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <span>Circular Economy Action Plan</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <span>Biodiversity Strategy 2030</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <span>Renewable Energy Directive</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-green-400">✓</span>
                          <span>And 16+ more official documents</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="p-4 bg-green-500/20 rounded-lg border border-green-300/30">
                    <p className="text-green-200 text-sm">
                      <strong>Quality Assurance:</strong> All responses are generated from official EU documents, 
                      ensuring accuracy and reliability. Sources are provided with each answer for verification.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Call to Action */}
            <section className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-8 border border-white/20 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Need Detailed Policy Information?</h2>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                Use our AI-powered chatbot to get specific information about any EU Green Deal policy, 
                implementation timeline, or compliance requirement.
              </p>
              <button 
                onClick={handleChatOpen}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Chatting
              </button>
            </section>
          </div>
        </div>
      </main>
      
      {/* Chat Interface */}
      <ChatInterface ref={chatRef} language="en" />
    </div>
  );
}