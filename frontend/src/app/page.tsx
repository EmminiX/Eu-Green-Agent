"use client";
import React, { useState, useRef } from "react";
import { ChatInterfaceRef } from "@/components/chat/chat-interface";
import { Header } from "@/components/layout/header";
import { HeroSection } from "@/components/sections/hero-section";
import { ResourcesSection } from "@/components/sections/resources-section";
import { ChatInterface } from "@/components/chat/chat-interface";
import { CanvasBackground } from "@/components/ui/canvas-background";
import AnimatedFooter from "@/components/ui/animated-footer";
import { ComplianceBanner } from "@/components/compliance/compliance-banner";

export default function Home() {
  const [currentLanguage] = useState("en");
  const chatRef = useRef<ChatInterfaceRef>(null);

  const handleChatOpen = (maximized = false) => {
    // Trigger the chat interface to open
    if (chatRef.current && chatRef.current.openChat) {
      chatRef.current.openChat(maximized);
    }
  };

  const footerLeftLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/about", label: "About" },
    { href: "https://emmi.zone", label: "Contact" },
    { href: "https://linux.emmi.zone", label: "Linux Learning Platform" },
    { href: "https://greencelt.emmi.zone", label: "GreenCeltAI" },
  ];

  const footerRightLinks = [
    { href: "https://ec.europa.eu/info/strategy/priorities-2019-2024/european-green-deal_en", label: "EU Green Deal" },
    { href: "https://ec.europa.eu/clima/eu-action/european-green-deal/european-climate-law_en", label: "Climate Law" },
    { href: "https://ec.europa.eu/environment/circular-economy/", label: "Circular Economy" },
    { href: "https://ec.europa.eu/food/horizontal-topics/farm-fork-strategy_en", label: "Farm to Fork" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Canvas Background */}
      <CanvasBackground />
      
      {/* Header */}
      <Header />
      
      {/* EU AI Act Compliance Banner */}
      <ComplianceBanner 
        language={currentLanguage}
      />
      
      {/* Main Content */}
      <main className="relative z-10 pt-12 md:pt-11">
        {/* Hero Section */}
        <HeroSection onChatOpen={handleChatOpen} />
        
        {/* Resources Section */}
        <ResourcesSection />
      </main>
      
      {/* Chat Interface */}
      <ChatInterface 
        ref={chatRef}
        language={currentLanguage}
      />
      
      {/* Footer */}
      <AnimatedFooter
        leftLinks={footerLeftLinks}
        rightLinks={footerRightLinks}
        copyrightText="© 2025 EU Green Policies Chatbot. Open Source Project."
      />
    </div>
  );
}
