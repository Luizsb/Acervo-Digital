import React from 'react';

export function Logo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle cx="20" cy="20" r="18" fill="url(#gradient1)" />
      
      {/* Game controller base */}
      <path 
        d="M 10 18 Q 10 14 14 14 L 26 14 Q 30 14 30 18 L 30 24 Q 30 28 26 28 L 14 28 Q 10 28 10 24 Z" 
        fill="white" 
        opacity="0.95"
      />
      
      {/* D-pad left */}
      <rect x="13" y="19" width="4" height="2" rx="0.5" fill="url(#gradient2)" />
      {/* D-pad up/down */}
      <rect x="15" y="17" width="2" height="6" rx="0.5" fill="url(#gradient2)" />
      
      {/* Action buttons */}
      <circle cx="24" cy="18" r="1.5" fill="url(#gradient3)" />
      <circle cx="27" cy="21" r="1.5" fill="url(#gradient4)" />
      <circle cx="24" cy="24" r="1.5" fill="url(#gradient5)" />
      <circle cx="21" cy="21" r="1.5" fill="url(#gradient6)" />
      
      {/* Book/learning element */}
      <path 
        d="M 18 20 L 18 22 L 22 22 L 22 20 Z M 18.5 19.5 L 21.5 19.5 M 20 19.5 L 20 22.5" 
        stroke="url(#gradient2)" 
        strokeWidth="0.8" 
        fill="none"
        strokeLinecap="round"
      />
      
      {/* Sparkle effects */}
      <circle cx="8" cy="10" r="1" fill="white" opacity="0.8" />
      <circle cx="32" cy="12" r="1.5" fill="white" opacity="0.6" />
      <circle cx="6" cy="30" r="1" fill="white" opacity="0.7" />
      
      <defs>
        <linearGradient id="gradient1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="gradient2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="gradient3" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="gradient4" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="gradient5" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="gradient6" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>
      </defs>
    </svg>
  );
}
