"use client";
import React, { useState } from "react";
import { Shield, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ComplianceBannerProps {
  language?: string;
  className?: string;
}

const translations = {
  en: {
    title: "AI-Powered System",
    description: "This website uses artificial intelligence to provide information about EU Green policies.",
    learnMore: "Learn More",
    dismiss: "Understood"
  },
  fr: {
    title: "Système alimenté par IA",
    description: "Ce site web utilise l'intelligence artificielle pour fournir des informations sur les politiques vertes de l'UE.",
    learnMore: "En savoir plus",
    dismiss: "Compris"
  },
  de: {
    title: "KI-gestütztes System",
    description: "Diese Website nutzt künstliche Intelligenz, um Informationen über EU-Grünpolitiken bereitzustellen.",
    learnMore: "Mehr erfahren",
    dismiss: "Verstanden"
  },
  it: {
    title: "Sistema basato su IA",
    description: "Questo sito web utilizza l'intelligenza artificiale per fornire informazioni sulle politiche verdi dell'UE.",
    learnMore: "Scopri di più",
    dismiss: "Capito"
  },
  ro: {
    title: "Sistem alimentat de IA",
    description: "Acest site web folosește inteligența artificială pentru a furniza informații despre politicile verzi ale UE.",
    learnMore: "Aflați mai multe",
    dismiss: "Am înțeles"
  }
};

export const ComplianceBanner: React.FC<ComplianceBannerProps> = ({
  language = "en",
  className
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const t = translations[language as keyof typeof translations] || translations.en;

  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      // Store dismissal in localStorage
      localStorage.setItem('eu-ai-act-banner-dismissed', 'true');
    }, 300);
  };

  const handleLearnMore = () => {
    // Scroll to architecture section or open modal
    const architectureSection = document.getElementById('architecture');
    if (architectureSection) {
      architectureSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: navigate to architecture page
      window.location.href = '/architecture';
    }
  };

  // Check if banner was previously dismissed
  React.useEffect(() => {
    const dismissed = localStorage.getItem('eu-ai-act-banner-dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed top-20 left-0 right-0 z-40 mx-4 transition-all duration-300",
      isAnimating ? "transform -translate-y-full opacity-0" : "transform translate-y-0 opacity-100",
      className
    )}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg rounded-lg border border-white/20 backdrop-blur-sm">
          <div className="px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {t.title}
                  </p>
                  <p className="text-xs text-white/90 mt-1">
                    {t.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Button
                  onClick={handleLearnMore}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 text-xs px-3 py-1.5 h-auto"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {t.learnMore}
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 text-xs px-3 py-1.5 h-auto"
                >
                  {t.dismiss}
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 p-1 h-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};