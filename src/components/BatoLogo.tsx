import React from "react";

interface BatoLogoProps {
  className?: string;
  animate?: boolean;
  size?: number;
  monochrome?: boolean;
}

export default function BatoLogo({ className = "", animate = true, size = 48, monochrome = true }: BatoLogoProps) {
  // Ultra-luxurious color palette: Deep Velvet Blue, Electric Cyan, Gold/Bronze elements, and crisp Platinum highlights.
  const strokeOuter = monochrome ? "#18181B" : "url(#outerShieldGrad)";
  const strokeB = monochrome ? "#27272A" : "url(#bGrad)";
  const strokeS = monochrome ? "#71717A" : "url(#sGrad)";
  const strokeDot = monochrome ? "#09090B" : "#06B6D4";

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${animate ? "logo-svg" : ""}`}
      >
        <defs>
          {/* Stunning High-End Gradients */}
          <linearGradient id="outerShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          
          <linearGradient id="bGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes draw {
            to {
              stroke-dashoffset: 0;
            }
          }
          @keyframes logoPulse {
            0% {
              filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.2)) drop-shadow(0 0 4px rgba(6, 182, 212, 0.1));
            }
            50% {
              filter: drop-shadow(0 0 14px rgba(59, 130, 246, 0.7)) drop-shadow(0 0 6px rgba(6, 182, 212, 0.4));
            }
            100% {
              filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.2)) drop-shadow(0 0 4px rgba(6, 182, 212, 0.1));
            }
          }
          @keyframes popIn {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            80% {
              transform: scale(1.2);
              opacity: 0.8;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          .draw-path {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: draw 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .outer-hex-1 {
            animation-delay: 0.1s;
          }
          .outer-hex-2 {
            animation-delay: 0.3s;
          }
          .letter-b-stem {
            animation-delay: 0.5s;
          }
          .letter-b-loops {
            animation-delay: 0.7s;
          }
          .letter-s-curve {
            animation-delay: 0.9s;
          }
          .terminal-dot {
            transform-origin: center;
            opacity: 0;
            animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .dot-b-top { animation-delay: 1.4s; transform-origin: 36px 24px; }
          .dot-b-bottom { animation-delay: 1.5s; transform-origin: 36px 58px; }
          .dot-s-start { animation-delay: 1.6s; transform-origin: 64px 42px; }
          .dot-s-end { animation-delay: 1.7s; transform-origin: 48px 70px; }
          
          .logo-svg {
            animation: logoPulse 4s ease-in-out 1.8s infinite;
          }
        `}} />
        
        {/* Dynamic Outer Shield 1: High-end Chamfered Hexagon (Representing rock-solid stability) */}
        <path 
          d="M50 8 L86 26 L86 74 L50 92 L14 74 L14 26 Z" 
          stroke={strokeOuter} 
          strokeWidth="2" 
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="100"
          className="draw-path outer-hex-1"
        />

        {/* Inner concentric Hexagon (Technical Precision) */}
        <path 
          d="M50 14 L80 29 L80 71 L50 86 L20 71 L20 29 Z" 
          stroke={strokeOuter} 
          strokeWidth="1" 
          strokeDasharray="4 3"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="100"
          className="draw-path outer-hex-2"
          opacity="0.6"
        />
        
        {/* The Luxury Minimalist 'B' */}
        {/* B Vertical Stem */}
        <path 
          d="M36 24 V 58" 
          stroke={strokeB} 
          strokeWidth="4" 
          strokeLinecap="round" 
          pathLength="100"
          className="draw-path letter-b-stem"
        />
        {/* B Double Loops */}
        <path 
          d="M36 24 H 48 C 55 24 55 41 48 41 H 36 M 36 41 H 50 C 57 41 57 58 50 58 H 36" 
          stroke={strokeB} 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          pathLength="100"
          className="draw-path letter-b-loops"
        />
        
        {/* The Interlocking 'S' (Offset gracefully in coordinate space) */}
        <path 
          d="M64 42 C 64 35 48 35 48 46 C 48 57 64 55 64 66 C 64 77 48 77 48 70" 
          stroke={strokeS} 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          pathLength="100"
          className="draw-path letter-s-curve"
        />

        {/* Elegant Precision Terminal Dots (Constructed piece by piece) */}
        <circle cx="36" cy="24" r="2.5" fill={strokeDot} className="terminal-dot dot-b-top" />
        <circle cx="36" cy="58" r="2.5" fill={strokeDot} className="terminal-dot dot-b-bottom" />
        <circle cx="64" cy="42" r="2.5" fill={strokeDot} className="terminal-dot dot-s-start" />
        <circle cx="48" cy="70" r="2.5" fill={strokeDot} className="terminal-dot dot-s-end" />
      </svg>
    </div>
  );
}
