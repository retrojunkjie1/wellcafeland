// src/components/content/ReadToMeButton.jsx
// "Read to me" button with cinematic styling
// Phase 39: Intelligent Audio Narration Engine

import React from 'react';
import { Volume2, Loader2 } from 'lucide-react';

const ReadToMeButton = ({ onClick, isLoading = false, isPlaying = false, className = '' }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-2
        px-4 py-2 rounded-xl
        bg-gradient-to-r from-amber-500/20 to-orange-500/20
        border border-amber-500/30
        text-amber-200 text-sm font-medium
        hover:from-amber-500/30 hover:to-orange-500/30
        hover:border-amber-400/50
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      <span>{isPlaying ? 'Reading...' : 'Read to me'}</span>
    </button>
  );
};

export default ReadToMeButton;

