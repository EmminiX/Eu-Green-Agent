"use client";
import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { AccessibilityMenu } from './accessibility-menu';

export const Docks = () => {
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  return (
    <>
      <div
        className="
          inline-flex rounded-lg overflow-hidden relative
          bg-white/20 backdrop-blur-md
          shadow-lg shadow-black/20
          border border-white/30
          transition-colors duration-500
        "
      >
        <button
          onClick={() => setIsAccessibilityOpen(true)}
          className="
            px-4 py-2 rounded-lg
            flex items-center gap-2
            text-white
            bg-transparent
            hover:bg-white/10
            transition-colors duration-300
            focus:outline-none focus:ring-2 focus:ring-white/30
            group
          "
          aria-label="Open Accessibility Settings"
        >
          <Eye
            className="
              w-5 h-5
              text-current
              transition-transform duration-300
              group-hover:scale-110
            "
            aria-hidden="true"
          />
          <span className="select-none">Accessibility</span>
        </button>
      </div>

      <AccessibilityMenu 
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
      />
    </>
  );
};