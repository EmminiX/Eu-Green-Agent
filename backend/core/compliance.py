"""
EU AI Act Compliance utilities and middleware
Article 50 - Transparency obligations for providers and deployers of certain AI systems
"""

import logging
from datetime import datetime
from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

from core.config import get_settings
from core.logging_config import get_logger

logger = get_logger(__name__)
settings = get_settings()


class AISystemType(Enum):
    """Types of AI systems as defined in EU AI Act"""
    CHATBOT = "chatbot"
    CONTENT_GENERATION = "content_generation"
    EMOTION_RECOGNITION = "emotion_recognition"
    BIOMETRIC_CATEGORIZATION = "biometric_categorization"
    DEEPFAKE_GENERATION = "deepfake_generation"


@dataclass
class AIDisclosureInfo:
    """Information required for AI system disclosure"""
    system_type: AISystemType
    interaction_timestamp: datetime
    user_language: str
    disclosure_version: str = "1.0"
    has_user_consent: bool = False
    consent_timestamp: Optional[datetime] = None


class AIActCompliance:
    """
    EU AI Act Article 50 compliance handler
    Ensures proper transparency obligations are met
    """
    
    def __init__(self):
        self.disclosure_version = "1.0"
        self.system_name = "EU Green Policies Chatbot"
        self.provider_info = {
            "name": settings.APP_NAME,
            "version": settings.VERSION,
            "contact": "info@example.com"  # Update with actual contact
        }
    
    def create_ai_disclosure_notice(self, language: str = "en") -> Dict[str, Any]:
        """
        Create AI disclosure notice as required by Article 50(1)
        
        Args:
            language: Language for the disclosure notice
            
        Returns:
            Structured disclosure notice
        """
        
        # Multilingual disclosure texts
        disclosure_texts = {
            "en": {
                "title": "AI System Disclosure",
                "main_text": "You are interacting with an Artificial Intelligence (AI) system. This system is designed to provide information about EU Green Deal policies and environmental regulations.",
                "capabilities": [
                    "Multi-agent AI system using large language models",
                    "Knowledge graph-based information retrieval",
                    "Real-time web research capabilities",
                    "Multilingual response generation"
                ],
                "data_processing": "This AI system processes your queries to provide relevant information. Conversations may be stored and analyzed to improve system performance.",
                "user_rights": "You have the right to know when interacting with AI systems, to understand how your data is processed, and to withdraw consent at any time.",
                "legal_basis": "This disclosure is required under EU AI Act Article 50"
            },
            "fr": {
                "title": "Divulgation du Système d'IA",
                "main_text": "Vous interagissez avec un système d'Intelligence Artificielle (IA). Ce système est conçu pour fournir des informations sur les politiques du Green Deal européen et les réglementations environnementales.",
                "capabilities": [
                    "Système d'IA multi-agents utilisant de grands modèles de langage",
                    "Récupération d'informations basée sur un graphe de connaissances",
                    "Capacités de recherche web en temps réel",
                    "Génération de réponses multilingues"
                ],
                "data_processing": "Ce système d'IA traite vos requêtes pour fournir des informations pertinentes. Les conversations peuvent être stockées et analysées pour améliorer les performances du système.",
                "user_rights": "Vous avez le droit de savoir quand vous interagissez avec des systèmes d'IA, de comprendre comment vos données sont traitées et de retirer votre consentement à tout moment.",
                "legal_basis": "Cette divulgation est requise par l'Article 50 de l'AI Act UE"
            },
            "de": {
                "title": "KI-System Offenlegung",
                "main_text": "Sie interagieren mit einem Künstlichen Intelligenz (KI) System. Dieses System ist entwickelt, um Informationen über EU Green Deal Politiken und Umweltvorschriften bereitzustellen.",
                "capabilities": [
                    "Multi-Agent KI-System mit großen Sprachmodellen",
                    "Wissensbasierten Informationsabruf",
                    "Echtzeit-Web-Recherche-Fähigkeiten",
                    "Mehrsprachige Antwortgenerierung"
                ],
                "data_processing": "Dieses KI-System verarbeitet Ihre Anfragen, um relevante Informationen bereitzustellen. Gespräche können gespeichert und analysiert werden, um die Systemleistung zu verbessern.",
                "user_rights": "Sie haben das Recht zu wissen, wann Sie mit KI-Systemen interagieren, zu verstehen, wie Ihre Daten verarbeitet werden, und die Zustimmung jederzeit zu widerrufen.",
                "legal_basis": "Diese Offenlegung ist gemäß EU-KI-Gesetz Artikel 50 erforderlich"
            },
            "it": {
                "title": "Divulgazione del Sistema di IA",
                "main_text": "Stai interagendo con un sistema di Intelligenza Artificiale (IA). Questo sistema è progettato per fornire informazioni sulle politiche del Green Deal dell'UE e le normative ambientali.",
                "capabilities": [
                    "Sistema di IA multi-agente che utilizza grandi modelli linguistici",
                    "Recupero di informazioni basato su grafo della conoscenza",
                    "Capacità di ricerca web in tempo reale",
                    "Generazione di risposte multilingue"
                ],
                "data_processing": "Questo sistema di IA elabora le tue domande per fornire informazioni pertinenti. Le conversazioni possono essere archiviate e analizzate per migliorare le prestazioni del sistema.",
                "user_rights": "Hai il diritto di sapere quando interagisci con sistemi di IA, di capire come vengono elaborati i tuoi dati e di ritirare il consenso in qualsiasi momento.",
                "legal_basis": "Questa divulgazione è richiesta dall'Articolo 50 dell'AI Act UE"
            },
            "ro": {
                "title": "Dezvăluirea Sistemului de IA",
                "main_text": "Interacționați cu un sistem de Inteligență Artificială (IA). Acest sistem este conceput pentru a furniza informații despre politicile Green Deal ale UE și reglementările de mediu.",
                "capabilities": [
                    "Sistem de IA multi-agent folosind modele mari de limbaj",
                    "Recuperarea informațiilor bazată pe graf de cunoștințe",
                    "Capabilități de cercetare web în timp real",
                    "Generarea de răspunsuri multilingve"
                ],
                "data_processing": "Acest sistem de IA procesează întrebările dvs. pentru a furniza informații relevante. Conversațiile pot fi stocate și analizate pentru a îmbunătăți performanța sistemului.",
                "user_rights": "Aveți dreptul să știți când interacționați cu sisteme de IA, să înțelegeți cum sunt procesate datele dvs. și să retrageți consimțământul în orice moment.",
                "legal_basis": "Această dezvăluire este necesară conform Articolului 50 din AI Act UE"
            }
        }
        
        # Get text for specified language or fallback to English
        text = disclosure_texts.get(language, disclosure_texts["en"])
        
        return {
            "disclosure_info": {
                "system_type": AISystemType.CHATBOT.value,
                "provider": self.provider_info,
                "disclosure_version": self.disclosure_version,
                "timestamp": datetime.utcnow().isoformat(),
                "language": language
            },
            "content": text,
            "compliance": {
                "legal_basis": "EU AI Act Article 50(1)",
                "requirement": "Transparency obligation for AI systems interacting with natural persons",
                "implementation_date": "2026-08-01"  # When Article 50 becomes applicable
            }
        }
    
    def mark_ai_generated_content(self, content: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Mark content as AI-generated as required by Article 50(2)
        
        Args:
            content: The AI-generated content
            metadata: Additional metadata about the generation
            
        Returns:
            Content with proper AI generation markers
        """
        
        ai_markers = {
            "ai_generated": True,
            "generation_timestamp": datetime.utcnow().isoformat(),
            "model_info": {
                "provider": "OpenAI",
                "model": settings.OPENAI_MODEL,
                "temperature": settings.OPENAI_TEMPERATURE
            },
            "system_info": {
                "name": self.system_name,
                "version": self.disclosure_version,
                "type": AISystemType.CHATBOT.value
            },
            "compliance_markers": {
                "eu_ai_act_article_50": True,
                "machine_readable_format": True,
                "detectable_as_artificial": True
            }
        }
        
        if metadata:
            ai_markers.update(metadata)
        
        return {
            "content": content,
            "ai_markers": ai_markers,
            "human_readable_notice": "This content was generated by artificial intelligence."
        }
    
    def validate_consent(self, consent_data: Dict[str, Any]) -> bool:
        """
        Validate user consent for AI interaction
        
        Args:
            consent_data: User consent information
            
        Returns:
            Whether consent is valid
        """
        required_fields = ["timestamp", "language", "version", "accepted"]
        
        # Check if all required fields are present
        if not all(field in consent_data for field in required_fields):
            logger.warning("Missing required consent fields")
            return False
        
        # Check if consent was explicitly accepted
        if not consent_data.get("accepted", False):
            logger.info("User declined AI interaction consent")
            return False
        
        # Check if consent version matches current disclosure version
        if consent_data.get("version") != self.disclosure_version:
            logger.warning("Consent version mismatch")
            return False
        
        # Log consent validation
        logger.info(f"AI interaction consent validated for timestamp: {consent_data['timestamp']}")
        return True
    
    def create_compliance_headers(self) -> Dict[str, str]:
        """
        Create HTTP headers for AI content compliance
        
        Returns:
            Dictionary of compliance headers
        """
        return {
            "X-AI-Generated": "true",
            "X-AI-System": self.system_name,
            "X-AI-Provider": self.provider_info["name"],
            "X-AI-Compliance": "EU-AI-Act-Article-50",
            "X-AI-Disclosure-Version": self.disclosure_version
        }
    
    def log_ai_interaction(self, 
                          session_id: str, 
                          query: str, 
                          response: str,
                          consent_info: Optional[Dict[str, Any]] = None):
        """
        Log AI interaction for compliance tracking
        
        Args:
            session_id: User session identifier
            query: User query
            response: AI-generated response
            consent_info: User consent information
        """
        
        interaction_log = {
            "timestamp": datetime.utcnow().isoformat(),
            "session_id": session_id,
            "interaction_type": "ai_chat",
            "compliance": {
                "eu_ai_act_disclosure": True,
                "user_informed": True,
                "consent_validated": consent_info is not None and self.validate_consent(consent_info),
                "content_marked": True
            },
            "query_length": len(query),
            "response_length": len(response),
            "model_used": settings.OPENAI_MODEL
        }
        
        # Log for compliance tracking (in production, store in compliance database)
        logger.info(f"AI interaction logged: {interaction_log}")


# Global compliance instance
_ai_act_compliance = None


def get_ai_act_compliance() -> AIActCompliance:
    """Get the global AI Act compliance instance"""
    global _ai_act_compliance
    if _ai_act_compliance is None:
        _ai_act_compliance = AIActCompliance()
    return _ai_act_compliance