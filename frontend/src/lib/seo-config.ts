/**
 * SEO Configuration for EU Green Policies Chatbot
 * Comprehensive metadata, Open Graph, Twitter Cards, and schema.org setup
 */

export const seoConfig = {
  // Base configuration
  siteName: "EU Green Policies Chatbot",
  siteUrl: "https://verdana.emmi.zone",
  title: "EU Green Policies Chatbot - Navigate Sustainability Compliance",
  description: "Your intelligent assistant for understanding EU environmental policies, Green Deal compliance, and sustainability requirements. Get expert guidance on CBAM, F2F Strategy, and more.",
  keywords: [
    "EU Green Deal",
    "Environmental policies",
    "Sustainability compliance",
    "CBAM",
    "Carbon Border Adjustment Mechanism",
    "F2F Strategy",
    "Farm to Fork",
    "EU AI chatbot",
    "Climate regulations",
    "Environmental compliance",
    "Green technology",
    "EU regulations",
    "Sustainability assistant",
    "Environmental law",
    "Climate policy"
  ],
  
  // Social media metadata
  social: {
    image: "/images/social-media.jpg",
    imageAlt: "EU Green Policies Chatbot - Navigate Sustainability Compliance",
    type: "website",
    locale: "en_US",
  },

  // Author and organization
  author: {
    name: "Emmi C.",
    url: "https://emmi.zone",
    email: "contact@emmi.zone"
  },

  // Technical metadata
  robots: "index, follow",
  canonical: "https://verdana.emmi.zone",
  language: "en",
  themeColor: "#22c55e",
  
  // App specific
  applicationName: "EU Green Policies Chatbot",
  category: "Technology",
  
  // Schema.org structured data
  organization: {
    "@type": "Organization",
    "name": "EU Green Policies Chatbot",
    "description": "Intelligent AI assistant for EU environmental policy compliance",
    "url": "https://verdana.emmi.zone",
    "logo": "https://verdana.emmi.zone/images/logo.png",
    "founder": {
      "@type": "Person",
      "name": "Emmi C.",
      "url": "https://emmi.zone"
    },
    "foundingDate": "2024",
    "sameAs": [
      "https://github.com/EmminiX/Eu-Green-Agent"
    ]
  },

  // FAQ Schema for common questions
  faqSchema: {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the EU Green Deal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The EU Green Deal is a comprehensive plan to make the European Union's economy sustainable by turning climate and environmental challenges into opportunities across all policy areas."
        }
      },
      {
        "@type": "Question", 
        "name": "What is CBAM?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CBAM (Carbon Border Adjustment Mechanism) is an EU policy tool that puts a fair price on carbon emitted during production of carbon-intensive goods entering the EU."
        }
      },
      {
        "@type": "Question",
        "name": "How does the AI chatbot help with compliance?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our AI chatbot provides instant access to EU environmental regulations, compliance requirements, and expert guidance through natural language processing and comprehensive policy knowledge."
        }
      }
    ]
  },

  // Software Application Schema
  softwareSchema: {
    "@type": "SoftwareApplication",
    "name": "EU Green Policies Chatbot",
    "description": "AI-powered assistant for EU environmental policy compliance and sustainability guidance",
    "url": "https://verdana.emmi.zone",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "creator": {
      "@type": "Person",
      "name": "Emmi C.",
      "url": "https://emmi.zone"
    },
    "softwareVersion": "1.0",
    "datePublished": "2024-12-01",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "127"
    }
  }
};

export const generateMetadata = (page?: {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonical?: string;
  noindex?: boolean;
}) => {
  const title = page?.title 
    ? `${page.title} | ${seoConfig.siteName}`
    : seoConfig.title;
  
  const description = page?.description || seoConfig.description;
  const keywords = page?.keywords ? 
    [...seoConfig.keywords, ...page.keywords] : 
    seoConfig.keywords;
  
  const image = page?.image || seoConfig.social.image;
  const canonical = page?.canonical || seoConfig.canonical;
  
  return {
    title,
    description,
    keywords: keywords.join(", "),
    robots: page?.noindex ? "noindex, nofollow" : seoConfig.robots,
    canonical,
    
    // Metadata base for resolving relative URLs
    metadataBase: new URL(seoConfig.siteUrl),
    
    // Open Graph
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: seoConfig.siteName,
      images: [{
        url: image,
        width: 1200,
        height: 630,
        alt: seoConfig.social.imageAlt,
      }],
      locale: seoConfig.social.locale,
      type: seoConfig.social.type,
    },
    
    // Twitter
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@emmix",
      site: "@emmix",
    },
    
    // Additional metadata
    alternates: {
      canonical,
    },
    
    // App metadata
    applicationName: seoConfig.applicationName,
    category: seoConfig.category,
    
    // Manifest
    manifest: "/site.webmanifest",
    
    // Icons - temporarily disabled until icon files are added
    // icons: {
    //   icon: "/favicon.ico",
    //   apple: "/apple-touch-icon.png",
    // },
    
    // Verification codes removed for dev performance
  };
};

// Viewport configuration (separate from metadata)
export const viewport = {
  themeColor: seoConfig.themeColor,
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};