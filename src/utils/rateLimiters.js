// src/utils/rateLimiters.js

/**
 * Rate Limiters
 * Provides debounce and throttle utilities for performance optimization
 */

/**
 * Debounce function - delays execution until after wait time
 * @param {Function} fn - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, wait = 300) {
  let timeout = null;
  
  return function debounced(...args) {
    const context = this;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      fn.apply(context, args);
      timeout = null;
    }, wait);
  };
}

/**
 * Throttle function - limits execution to once per wait time
 * @param {Function} fn - Function to throttle
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, wait = 150) {
  let lastCall = 0;
  let timeout = null;
  
  return function throttled(...args) {
    const context = this;
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;
    
    if (timeSinceLastCall >= wait) {
      lastCall = now;
      fn.apply(context, args);
    } else {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        lastCall = Date.now();
        fn.apply(context, args);
        timeout = null;
      }, wait - timeSinceLastCall);
    }
  };
}

// Note: React hooks should be in a separate file or imported from React
// This utility file is for non-React debounce/throttle functions

