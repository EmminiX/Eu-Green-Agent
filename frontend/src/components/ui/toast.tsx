/**
 * Simple toast notification component
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
  show?: boolean;
}

export function Toast({ message, type = 'info', duration = 3000, onClose, show = true }: ToastProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          setTimeout(onClose, 300); // Wait for fade out animation
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className={cn(
      "fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm w-auto sm:w-full",
      "transform transition-all duration-300 ease-in-out",
      isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
    )}>
      <div className={cn(
        "flex items-center p-3 rounded-lg border shadow-lg min-h-[48px]",
        getBackgroundColor()
      )}>
        {getIcon()}
        <span className="ml-2 text-sm sm:text-base text-gray-700 flex-1">{message}</span>
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="ml-2 text-gray-400 hover:text-gray-600 min-w-[24px] min-h-[24px] flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}