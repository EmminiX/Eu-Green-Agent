"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { MovingBorderButton } from "@/components/ui/moving-border-button";
import { MessageCircle, ExternalLink, Leaf, Scale, Target, Shield } from "lucide-react";
import { Boxes } from "@/components/ui/background-boxes";

interface HeroSectionProps {
  onChatOpen?: (maximized?: boolean) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onChatOpen }) => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background with boxes */}
      <div className="absolute inset-0 z-0">
        <Boxes />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Main heading */}
        <div className="space-y-5 mb-10">
          <div className="flex items-center justify-center space-x-2 text-green-300 mb-4">
            <Leaf className="h-8 w-8" />
            <span className="text-xl font-semibold">EU Green Policies</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
            Navigate{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
              EU Green Deal
            </span>{" "}
            Compliance
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Your intelligent assistant for understanding EU environmental policies, 
            sustainability requirements, and compliance deadlines
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-5 border border-white/20">
            <Scale className="h-7 w-7 text-green-400 mb-2 mx-auto" />
            <h3 className="text-base font-semibold text-white mb-2">Compliance Guidance</h3>
            <p className="text-white/70 text-sm">
              Get clear guidance on CBAM, F2F Strategy, and other EU green regulations
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-5 border border-white/20">
            <Target className="h-7 w-7 text-blue-400 mb-2 mx-auto" />
            <h3 className="text-base font-semibold text-white mb-2">Real-time Updates</h3>
            <p className="text-white/70 text-sm">
              Stay updated with the latest policy changes and implementation deadlines
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-5 border border-white/20">
            <MessageCircle className="h-7 w-7 text-purple-400 mb-2 mx-auto" />
            <h3 className="text-base font-semibold text-white mb-2">Unified AI Agent</h3>
            <p className="text-white/70 text-sm">
              Single intelligent agent streamlines RAG retrieval, web verification, and local Whisper speech processing
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-5 border border-white/20">
            <Shield className="h-7 w-7 text-orange-400 mb-2 mx-auto" />
            <h3 className="text-base font-semibold text-white mb-2">Voice Accessible</h3>
            <p className="text-white/70 text-sm">
              AI-powered speech recognition using OpenAI Whisper for accessible interaction design
            </p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <MovingBorderButton
            onClick={() => onChatOpen?.(true)}
            duration={2000}
            borderRadius="0.75rem"
            className="px-6 py-3 text-base font-medium"
            containerClassName="h-auto w-auto"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Start Chatting
          </MovingBorderButton>
          
          <Button
            variant="outline"
            size="default"
            asChild
            className="border-white/60 bg-white/10 text-white hover:bg-white/20 hover:border-white/80 px-6 py-3 text-base h-auto backdrop-blur-sm"
          >
            <a href="#resources">
              <ExternalLink className="h-5 w-5 mr-2" />
              Explore Resources
            </a>
          </Button>
        </div>

        {/* Training Data & Name Info */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-lg p-5 border border-white/10">
            <div className="grid md:grid-cols-3 gap-5">
              {/* Training Data Info */}
              <div className="text-center md:text-left">
                <h4 className="text-base font-semibold text-white mb-2 flex items-center justify-center md:justify-start">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Official Training Data
                </h4>
                <p className="text-white/80 text-sm">
                  Trained on <strong className="text-green-400">26 official EU Green Deal documents</strong> from the{' '}
                  <a 
                    href="https://commission.europa.eu/publications/legal-documents-delivering-european-green-deal_en" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:text-blue-200 underline"
                  >
                    European Commission
                  </a>
                  , ensuring authoritative policy information.
                </p>
              </div>
              
              {/* Name Etymology */}
              <div className="text-center md:text-left">
                <h4 className="text-base font-semibold text-white mb-2 flex items-center justify-center md:justify-start">
                  <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About the Name
                </h4>
                <p className="text-white/80 text-sm">
                  <strong className="text-purple-400">&quot;Verdana&quot;</strong> combines <strong>&quot;Verde&quot;</strong> (green in Romanian/Spanish/Italian) with <strong>&quot;Ana&quot;</strong> (analysis), representing green policy expertise across European languages.
                </p>
              </div>

              {/* Privacy & Sessions */}
              <div className="text-center md:text-left">
                <h4 className="text-base font-semibold text-white mb-2 flex items-center justify-center md:justify-start">
                  <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Privacy & Sessions
                </h4>
                <p className="text-white/80 text-sm">
                  <strong className="text-cyan-400">Multiple chat sessions</strong> organize conversations by topic. Chat history is stored <strong>locally in your browser</strong> - ensuring complete privacy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">50+</div>
            <div className="text-white/70 text-sm">EU Regulations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">24/7</div>
            <div className="text-white/70 text-sm">Availability</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">5</div>
            <div className="text-white/70 text-sm">Languages</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">2050</div>
            <div className="text-white/70 text-sm">Climate Target</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};