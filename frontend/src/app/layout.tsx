import type { Metadata } from "next";
import { Geist, Geist_Mono, Lexend } from "next/font/google";
import { EventListenerProvider } from "@/components/providers/event-listener-provider";
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

export const metadata: Metadata = {
  title: "EU Green Policies Chatbot - Navigate Sustainability Compliance",
  description: "Your intelligent assistant for understanding EU environmental policies, Green Deal compliance, and sustainability requirements. Get expert guidance on CBAM, F2F Strategy, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical fonts for performance */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" 
          as="style"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
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
