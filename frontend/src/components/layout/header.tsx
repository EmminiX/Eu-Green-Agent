"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Github, Coffee, Leaf, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Docks } from "@/components/ui/docks";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-white hover:text-green-300 transition-colors flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-green-400" />
          <span>EU Green Chatbot</span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-2">
          <Link 
            href="/#resources" 
            className="relative px-4 py-2 text-white/90 font-medium rounded-lg hover:text-green-300 hover:bg-white/10 transition-all duration-150 group"
          >
            <span className="relative z-10">EU Resources</span>
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-150 origin-left"></span>
          </Link>
          <Link 
            href="/policies" 
            className="relative px-4 py-2 text-white/90 font-medium rounded-lg hover:text-green-300 hover:bg-white/10 transition-all duration-150 group"
          >
            <span className="relative z-10">Policies</span>
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-150 origin-left"></span>
          </Link>
          <Link 
            href="/compliance" 
            className="relative px-4 py-2 text-white/90 font-medium rounded-lg hover:text-green-300 hover:bg-white/10 transition-all duration-150 group"
          >
            <span className="relative z-10">AI Act Compliance</span>
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-150 origin-left"></span>
          </Link>
          <Link 
            href="/architecture" 
            className="relative px-4 py-2 text-white/90 font-medium rounded-lg hover:text-green-300 hover:bg-white/10 transition-all duration-150 group"
          >
            <span className="relative z-10">Architecture</span>
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-150 origin-left"></span>
          </Link>
        </nav>

        {/* Right side controls - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Theme switcher */}
          <Docks />
          
          {/* GitHub link */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-white hover:text-green-300 hover:bg-white/10"
          >
            <Link href="https://github.com/EmminiX/Eu-Green-Agent/tree/main" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
            </Link>
          </Button>

          {/* Buy me coffee */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-white/60 bg-white/10 text-white hover:bg-white/20 hover:border-white/80 hover:text-green-300 backdrop-blur-sm"
          >
            <Link href="https://buymeacoffee.com/emmix" target="_blank" rel="noopener noreferrer">
              <Coffee className="h-4 w-4 mr-2" />
              Support
            </Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-white hover:text-green-300 transition-colors p-2 relative z-50"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu - Dropdown Style */}
      <div className={`md:hidden transition-all duration-150 ease-in-out ${
        isMobileMenuOpen 
          ? 'max-h-screen opacity-100' 
          : 'max-h-0 opacity-0'
      } overflow-hidden bg-slate-900/95 backdrop-blur-sm border-t border-white/20`}>
        <div className="container mx-auto px-4 py-6 space-y-3">
          {/* Mobile Navigation Links */}
          <Link 
            href="/#resources" 
            onClick={closeMobileMenu}
            className="block px-6 py-4 text-white font-medium text-lg rounded-xl active:text-green-300 active:bg-white/10 transition-all duration-150 border border-white/10"
          >
            🌍 EU Resources
          </Link>
          <Link 
            href="/policies" 
            onClick={closeMobileMenu}
            className="block px-6 py-4 text-white font-medium text-lg rounded-xl active:text-green-300 active:bg-white/10 transition-all duration-150 border border-white/10"
          >
            📋 Policies
          </Link>
          <Link 
            href="/compliance" 
            onClick={closeMobileMenu}
            className="block px-6 py-4 text-white font-medium text-lg rounded-xl active:text-green-300 active:bg-white/10 transition-all duration-150 border border-white/10"
          >
            🛡️ AI Act Compliance
          </Link>
          <Link 
            href="/architecture" 
            onClick={closeMobileMenu}
            className="block px-6 py-4 text-white font-medium text-lg rounded-xl active:text-green-300 active:bg-white/10 transition-all duration-150 border border-white/10"
          >
            🏗️ Architecture
          </Link>
          <Link 
            href="/privacy" 
            onClick={closeMobileMenu}
            className="block px-6 py-4 text-white font-medium text-lg rounded-xl active:text-green-300 active:bg-white/10 transition-all duration-150 border border-white/10"
          >
            🔒 Privacy
          </Link>
          <Link 
            href="/terms" 
            onClick={closeMobileMenu}
            className="block px-6 py-4 text-white font-medium text-lg rounded-xl active:text-green-300 active:bg-white/10 transition-all duration-150 border border-white/10"
          >
            📄 Terms
          </Link>
          <Link 
            href="/about" 
            onClick={closeMobileMenu}
            className="block px-6 py-4 text-white font-medium text-lg rounded-xl active:text-green-300 active:bg-white/10 transition-all duration-150 border border-white/10"
          >
            ℹ️ About
          </Link>
          
          {/* Mobile Action Buttons */}
          <div className="flex flex-col space-y-4 pt-6 mt-6 border-t border-white/20">
            <div className="flex items-center justify-center">
              <Docks />
            </div>
            
            <div className="flex flex-col space-y-3">
              <Button
                variant="ghost"
                size="lg"
                asChild
                className="w-full text-white hover:text-green-300 hover:bg-white/10 border border-white/10 py-4"
              >
                <Link href="https://github.com/EmminiX/Eu-Green-Agent/tree/main" target="_blank" rel="noopener noreferrer">
                  <Github className="h-5 w-5 mr-3" />
                  View on GitHub
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full border-green-400/60 bg-green-500/20 text-white hover:bg-green-500/30 hover:border-green-400/80 hover:text-green-300 backdrop-blur-sm py-4"
              >
                <Link href="https://buymeacoffee.com/emmix" target="_blank" rel="noopener noreferrer">
                  <Coffee className="h-5 w-5 mr-3" />
                  Support Project
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};