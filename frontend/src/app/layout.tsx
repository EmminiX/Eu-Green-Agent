import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lexend } from "next/font/google";
import { EventListenerProvider } from "@/components/providers/event-listener-provider";
import { generateMetadata, seoConfig, viewport as seoViewport } from "@/lib/seo-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: 'swap',
});

export const metadata: Metadata = generateMetadata();
export const viewport: Viewport = seoViewport;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical fonts for performance - Only in production */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <link 
              rel="preload" 
              href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" 
              as="style"
            />
            <link 
              href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" 
              rel="stylesheet" 
            />
          </>
        )}
        
        {/* App Icons */}
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#22c55e" />
        <meta name="theme-color" content="#22c55e" />
        
        {/* Additional Meta Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Schema.org Structured Data - Minimal for performance */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": seoConfig.siteUrl,
              "name": seoConfig.siteName,
              "description": seoConfig.description
            })
          }}
        />
        
        {/* Plausible Analytics - Only in production */}
        {process.env.NODE_ENV === 'production' && (
          <script defer data-domain="verdana.emmi.zone" src="https://plausible.emmi.zone/js/script.js"></script>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} antialiased font-sans`}
        style={{ fontFamily: 'var(--font-lexend), Inter, system-ui, sans-serif' }}
      >
        <EventListenerProvider>
          {children}
        </EventListenerProvider>
      </body>
    </html>
  );
}
