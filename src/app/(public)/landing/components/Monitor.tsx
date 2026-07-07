/**
 * Monitor component — A high-fidelity reusable vector illustration asset of a widescreen workstation monitor.
 * Employs status indicator lights, screen reflection layers, and bezel shadow castings.
 */

"use client";

import React from "react";

interface MonitorProps {
  isOn?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Monitor({ isOn = false, className = "", style, children }: MonitorProps) {
  return (
    <div className={`relative flex flex-col items-center transition-all duration-700 ${className}`} style={style}>
      {/* Widescreen Monitor Screen Frame */}
      <div
        className={`relative w-full aspect-[16/9] bg-[#151310] border-4 border-[#2d2822] rounded-lg overflow-hidden transition-all duration-1000 ${
          isOn
            ? "shadow-[0_0_80px_rgba(212,160,82,0.12),_0_30px_60px_rgba(0,0,0,0.6)] border-[#3d362d]"
            : "shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
        }`}
      >
        {/* Anti-glare Screen display screen */}
        <div
          className={`w-full h-full flex flex-col transition-colors duration-1000 ${
            isOn ? "bg-[#181613]" : "bg-[#070605]"
          }`}
        >
          {/* Active screen content display */}
          <div className={`w-full h-full flex flex-col transition-opacity duration-1000 ${isOn ? "opacity-100" : "opacity-0"}`}>
            {children}
          </div>
        </div>

        {/* Diagonal glare glass reflection layer */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
            isOn ? "opacity-25" : "opacity-10"
          }`}
          style={{
            background: "linear-gradient(120deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 60%, rgba(212,160,82,0.04) 100%)",
          }}
        />

        {/* Ambient room backlight glow effect */}
        <div
          className={`absolute -inset-10 -z-10 rounded-full blur-[80px] pointer-events-none transition-opacity duration-1000 ${
            isOn ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "radial-gradient(circle, rgba(212,160,82,0.15) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Monitor Stand/Neck support */}
      <div
        className="w-10 h-16 bg-gradient-to-b from-[#24201a] via-[#1a1713] to-[#0f0e0b] border-x border-[#1a1713] relative -mt-0.5 z-[-1]"
        style={{
          clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
        }}
      />

      {/* Heavy metallic base */}
      <div
        className="w-44 h-2.5 bg-gradient-to-b from-[#2d2822] to-[#151310] border border-[#1a1713] rounded-t shadow-md relative z-[-1]"
        style={{
          transform: "rotateX(20deg)",
        }}
      >
        {/* Soft amber power status indicator light */}
        <div
          className={`absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-700 ${
            isOn ? "bg-amber-500 shadow-[0_0_6px_#f59e0b]" : "bg-neutral-800"
          }`}
        />
      </div>
    </div>
  );
}
