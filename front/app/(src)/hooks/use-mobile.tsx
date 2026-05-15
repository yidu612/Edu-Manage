"use client";

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Initialize with false (or undefined) to avoid hydration mismatch
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // This code only runs on the client
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
  // Listener receives a MediaQueryListEvent in modern browsers
  const onChange = (e?: MediaQueryListEvent) => {
      if (typeof e?.matches === "boolean") {
        setIsMobile(e.matches);
      } else {
        // Fallback for older browsers or manual calls
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }
    };

    // Set initial value from the MediaQueryList if available
    setIsMobile(mql.matches);

    // Use feature detection. Create a typed wrapper that includes legacy methods
    type MQLWithLegacy = MediaQueryList & {
      addEventListener?: (type: "change", listener: (e: MediaQueryListEvent) => void) => void;
      removeEventListener?: (type: "change", listener: (e: MediaQueryListEvent) => void) => void;
      addListener?: (listener: (e: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (e: MediaQueryListEvent) => void) => void;
    };

    const mqlWithLegacy = mql as MQLWithLegacy;

    if (typeof mqlWithLegacy.addEventListener === "function") {
      mqlWithLegacy.addEventListener("change", onChange as (ev: MediaQueryListEvent) => void);
    } else if (typeof mqlWithLegacy.addListener === "function") {
      mqlWithLegacy.addListener(onChange);
    }

    return () => {
      if (typeof mqlWithLegacy.removeEventListener === "function") {
        mqlWithLegacy.removeEventListener("change", onChange as (ev: MediaQueryListEvent) => void);
      } else if (typeof mqlWithLegacy.removeListener === "function") {
        mqlWithLegacy.removeListener(onChange);
      }
    };
  }, []);

  return isMobile;
}