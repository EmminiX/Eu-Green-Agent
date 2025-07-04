"use client";
import React from "react";
import Link from "next/link";
import { Github, Coffee, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Docks } from "@/components/ui/docks";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-white hover:text-green-300 transition-colors flex items-center space-x-2">
          <Leaf className="h-6 w-6 text-green-400" />
          <span>EU Green Chatbot</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <Link 
            href="/#resources" 
            className="relative px-4 py-2 text-white/90 font-medium rounded-lg hover:text-green-300 hover:bg-white/10 transition-all duration-300 group"
          >
            <span className="relative z-10">EU Resources</span>
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </Link>
          <Link 
            href="/policies" 
            className="relative px-4 py-2 text-white/90 font-medium rounded-lg hover:text-green-300 hover:bg-white/10 transition-all duration-300 group"
          >
            <span className="relative z-10">Policies</span>
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </Link>
          <Link 
            href="/compliance" 
            className="relative px-4 py-2 text-white/90 font-medium rounded-lg hover:text-green-300 hover:bg-white/10 transition-all duration-300 group"
          >
            <span className="relative z-10">AI Act Compliance</span>
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </Link>
          <Link 
            href="/architecture" 
            className="relative px-4 py-2 text-white/90 font-medium rounded-lg hover:text-green-300 hover:bg-white/10 transition-all duration-300 group"
          >
            <span className="relative z-10">Architecture</span>
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-green-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </Link>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center space-x-4">
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
      </div>
    </header>
  );
};