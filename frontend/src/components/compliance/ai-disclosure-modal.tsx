"use client";
import React, { useState, useEffect } from "react";
import { X, AlertCircle, CheckCircle, Bot, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AIDisclosureModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  language?: string;
}

const translations = {
  en: {
    title: "AI System Disclosure",
    subtitle: "EU AI Act Article 50 Compliance",
    mainText: "You are about to interact with an Artificial Intelligence (AI) system designed to provide information about EU Green Deal policies and environmental regulations.",
    features: [
      "Multi-agent AI system using OpenAI GPT-4o-mini",
      "PostgreSQL vector database with RAG search",
      "Real-time web research capabilities",
      "Multilingual response generation",
      "Source citations and confidence scoring"
    ],
    dataProcessing: "Data Processing Notice",
    dataText: "This AI system processes your queries to provide relevant information. Your conversations may be used to improve the system's knowledge base in accordance with privacy regulations.",
    rights: "Your Rights",
    rightsText: "You have the right to know when you're interacting with AI, request information about the system's operation, and discontinue use at any time.",
    acceptText: "I understand and agree to interact with this AI system",
    declineText: "I decline to use this AI system",
    moreInfo: "Learn more about our AI system",
    complianceNote: "This disclosure is required under EU AI Act Article 50"
  },
  fr: {
    title: "Divulgation du Système d'IA",
    subtitle: "Conformité à l'Article 50 de l'AI Act UE",
    mainText: "Vous êtes sur le point d'interagir avec un système d'Intelligence Artificielle (IA) conçu pour fournir des informations sur les politiques du Green Deal européen et les réglementations environnementales.",
    features: [
      "Système d'IA multi-agents utilisant OpenAI GPT-4o-mini",
      "Base de données vectorielle PostgreSQL avec recherche RAG",
      "Capacités de recherche web en temps réel",
      "Génération de réponses multilingues",
      "Citations de sources et évaluation de confiance"
    ],
    dataProcessing: "Avis de Traitement des Données",
    dataText: "Ce système d'IA traite vos requêtes pour fournir des informations pertinentes. Vos conversations peuvent être utilisées pour améliorer la base de connaissances du système conformément aux réglementations sur la confidentialité.",
    rights: "Vos Droits",
    rightsText: "Vous avez le droit de savoir quand vous interagissez avec l'IA, de demander des informations sur le fonctionnement du système et d'arrêter l'utilisation à tout moment.",
    acceptText: "Je comprends et accepte d'interagir avec ce système d'IA",
    declineText: "Je refuse d'utiliser ce système d'IA",
    moreInfo: "En savoir plus sur notre système d'IA",
    complianceNote: "Cette divulgation est requise par l'Article 50 de l'AI Act UE"
  },
  de: {
    title: "KI-System Offenlegung",
    subtitle: "EU-KI-Gesetz Artikel 50 Konformität",
    mainText: "Sie sind dabei, mit einem Künstlichen Intelligenz (KI) System zu interagieren, das entwickelt wurde, um Informationen über EU Green Deal Politiken und Umweltvorschriften bereitzustellen.",
    features: [
      "Multi-Agent KI-System mit OpenAI GPT-4o-mini",
      "PostgreSQL Vektordatenbank mit RAG-Suche",
      "Echtzeit-Web-Recherche-Fähigkeiten",
      "Mehrsprachige Antwortgenerierung",
      "Quellenzitate und Vertrauensbewertung"
    ],
    dataProcessing: "Datenverarbeitungshinweis",
    dataText: "Dieses KI-System verarbeitet Ihre Anfragen, um relevante Informationen bereitzustellen. Ihre Gespräche können zur Verbesserung der Wissensbasis des Systems gemäß Datenschutzbestimmungen verwendet werden.",
    rights: "Ihre Rechte",
    rightsText: "Sie haben das Recht zu wissen, wann Sie mit KI interagieren, Informationen über den Betrieb des Systems anzufordern und die Nutzung jederzeit einzustellen.",
    acceptText: "Ich verstehe und stimme der Interaktion mit diesem KI-System zu",
    declineText: "Ich lehne die Nutzung dieses KI-Systems ab",
    moreInfo: "Mehr über unser KI-System erfahren",
    complianceNote: "Diese Offenlegung ist gemäß EU-KI-Gesetz Artikel 50 erforderlich"
  },
  it: {
    title: "Divulgazione del Sistema di IA",
    subtitle: "Conformità all'Articolo 50 dell'AI Act UE",
    mainText: "Stai per interagire con un sistema di Intelligenza Artificiale (IA) progettato per fornire informazioni sulle politiche del Green Deal dell'UE e le normative ambientali.",
    features: [
      "Sistema di IA multi-agente utilizzando OpenAI GPT-4o-mini",
      "Database vettoriale PostgreSQL con ricerca RAG",
      "Capacità di ricerca web in tempo reale",
      "Generazione di risposte multilingue",
      "Citazioni delle fonti e punteggio di fiducia"
    ],
    dataProcessing: "Avviso di Elaborazione Dati",
    dataText: "Questo sistema di IA elabora le tue domande per fornire informazioni pertinenti. Le tue conversazioni possono essere utilizzate per migliorare la base di conoscenza del sistema in conformità con le normative sulla privacy.",
    rights: "I Tuoi Diritti",
    rightsText: "Hai il diritto di sapere quando stai interagendo con l'IA, richiedere informazioni sul funzionamento del sistema e interrompere l'uso in qualsiasi momento.",
    acceptText: "Capisco e accetto di interagire con questo sistema di IA",
    declineText: "Rifiuto di utilizzare questo sistema di IA",
    moreInfo: "Scopri di più sul nostro sistema di IA",
    complianceNote: "Questa divulgazione è richiesta dall'Articolo 50 dell'AI Act UE"
  },
  ro: {
    title: "Dezvăluirea Sistemului de IA",
    subtitle: "Conformitate cu Articolul 50 din AI Act UE",
    mainText: "Sunteți pe cale să interactionați cu un sistem de Inteligență Artificială (IA) conceput pentru a furniza informații despre politicile Green Deal ale UE și reglementările de mediu.",
    features: [
      "Sistem de IA multi-agent folosind OpenAI GPT-4o-mini",
      "Bază de date vectorială PostgreSQL cu căutare RAG",
      "Capabilități de cercetare web în timp real",
      "Generarea de răspunsuri multilingve",
      "Citarea surselor și punctajul de încredere"
    ],
    dataProcessing: "Aviz de Prelucrare a Datelor",
    dataText: "Acest sistem de IA procesează întrebările dvs. pentru a furniza informații relevante. Conversațiile dvs. pot fi folosite pentru a îmbunătăți baza de cunoștințe a sistemului în conformitate cu reglementările de confidențialitate.",
    rights: "Drepturile Dvs.",
    rightsText: "Aveți dreptul să știți când interactionați cu IA, să solicitați informații despre funcționarea sistemului și să întrerupeți utilizarea în orice moment.",
    acceptText: "Înțeleg și sunt de acord să interactionez cu acest sistem de IA",
    declineText: "Refuz să folosesc acest sistem de IA",
    moreInfo: "Aflați mai multe despre sistemul nostru de IA",
    complianceNote: "Această dezvăluire este necesară conform Articolului 50 din AI Act UE"
  }
};

export const AIDisclosureModal: React.FC<AIDisclosureModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
  language = "en"
}) => {
  const [showMore, setShowMore] = useState(false);
  const t = translations[language as keyof typeof translations] || translations.en;

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className={cn(
        "relative w-full h-full sm:w-auto sm:h-auto sm:max-w-lg md:max-w-xl lg:max-w-2xl sm:max-h-[90vh] overflow-y-auto",
        "bg-white dark:bg-gray-900 sm:rounded-2xl shadow-2xl",
        "sm:border border-gray-200 dark:border-gray-700"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {t.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.subtitle}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDecline}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Main disclosure */}
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t.mainText}
            </p>
          </div>

          {/* System capabilities */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-500" />
              AI System Capabilities
            </h3>
            <ul className="space-y-2">
              {t.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Expandable sections */}
          {showMore && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t.dataProcessing}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.dataText}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t.rights}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t.rightsText}
                </p>
              </div>
            </div>
          )}

          {/* More info toggle */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMore(!showMore)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Info className="h-4 w-4 mr-2" />
              {showMore ? 'Show Less' : t.moreInfo}
            </Button>
          </div>

          {/* Compliance notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200 text-center">
              <Shield className="h-3 w-3 inline mr-1" />
              {t.complianceNote}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={onAccept}
            className="w-full bg-green-600 hover:bg-green-700 text-white min-h-[48px] text-sm sm:text-base"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {t.acceptText}
          </Button>
          <Button
            onClick={onDecline}
            variant="outline"
            className="w-full min-h-[48px] text-sm sm:text-base"
          >
            {t.declineText}
          </Button>
        </div>
      </div>
    </div>
  );
};