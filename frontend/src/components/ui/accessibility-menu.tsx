"use client";
import React, { useState, useEffect } from 'react';
import { Eye, Type } from 'lucide-react';

interface AccessibilityMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const fonts = [
  {
    name: 'Lexend (Recommended)',
    value: 'Lexend, system-ui, sans-serif',
    description: 'Improves reading proficiency by up to 25%'
  },
  {
    name: 'OpenDyslexic',
    value: 'OpenDyslexic, sans-serif',
    description: 'Designed specifically for dyslexic readers'
  },
  {
    name: 'Atkinson Hyperlegible',
    value: 'Atkinson Hyperlegible, sans-serif', 
    description: 'Enhanced readability for low vision readers'
  }
];

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ isOpen, onClose }) => {
  const [selectedFont, setSelectedFont] = useState('Lexend, system-ui, sans-serif');

  useEffect(() => {
    // Load saved preferences
    const savedFont = localStorage.getItem('accessibility-font');
    
    if (savedFont) {
      setSelectedFont(savedFont);
      document.documentElement.style.setProperty('--font-family', savedFont);
    }
  }, []);

  const handleFontChange = (fontValue: string) => {
    setSelectedFont(fontValue);
    document.documentElement.style.setProperty('--font-family', fontValue);
    localStorage.setItem('accessibility-font', fontValue);
  };


  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
        onClick={onClose}
      />
      
      {/* Menu */}
      <div className="fixed top-20 right-4 z-[210] bg-gradient-to-br from-purple-900/95 via-purple-800/95 to-purple-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-white/20 p-6 w-80 max-w-[90vw]">
        <div className="flex items-center gap-2 mb-6">
          <Eye className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Accessibility Settings</h3>
        </div>

        {/* Font Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-white/80" />
            <label className="text-sm font-medium text-white/80">Reading Font</label>
          </div>
          
          <div className="space-y-2">
            {fonts.map((font) => (
              <label key={font.value} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="font"
                  value={font.value}
                  checked={selectedFont === font.value}
                  onChange={() => handleFontChange(font.value)}
                  className="mt-1 text-green-500 bg-white/20 border-white/30 focus:ring-green-500"
                />
                <div>
                  <div className="text-white font-medium" style={{ fontFamily: font.value }}>
                    {font.name}
                  </div>
                  <div className="text-xs text-white/60">{font.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Apply Settings
        </button>
      </div>
    </>
  );
};