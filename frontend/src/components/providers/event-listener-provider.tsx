"use client";

import { useEffect } from "react";

export function EventListenerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add passive event listener configuration to prevent console warnings
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;

    // Override addEventListener to automatically add passive: true for touch and wheel events
    EventTarget.prototype.addEventListener = function(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      let newOptions = options;
      
      // Auto-add passive: true for touch and wheel events to prevent console warnings
      if (typeof options === 'boolean') {
        if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' || type === 'mousewheel') {
          newOptions = { capture: options, passive: true };
        }
      } else if (typeof options === 'object' && options !== null) {
        if ((type === 'touchstart' || type === 'touchmove' || type === 'wheel' || type === 'mousewheel') && 
            options.passive === undefined) {
          newOptions = { ...options, passive: true };
        }
      } else if (options === undefined) {
        if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' || type === 'mousewheel') {
          newOptions = { passive: true };
        }
      }
      
      return originalAddEventListener.call(this, type, listener, newOptions);
    };

    // Cleanup function to restore original methods
    return () => {
      EventTarget.prototype.addEventListener = originalAddEventListener;
      EventTarget.prototype.removeEventListener = originalRemoveEventListener;
    };
  }, []);

  return <>{children}</>;
}