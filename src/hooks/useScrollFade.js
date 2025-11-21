// src/hooks/useScrollFade.js

import { useEffect, useRef } from "react";

/**
 * Hook that adds fade-in animation as elements scroll into view
 * Adds 'wc-visible' class when element enters viewport
 */
export function useScrollFade(options = {}) {
  const ref = useRef(null);
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px" } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Add initial fade class
    element.classList.add("wc-scroll-fade");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("wc-visible");
            // Optionally unobserve after animation
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin]);

  return ref;
}

