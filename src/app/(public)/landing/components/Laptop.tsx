/**
 * Laptop component — A high-fidelity reusable vector illustration asset of a developer laptop.
 * Supports on/off power states, backlit key glows, screen reflections, and customizable screen displays.
 */

"use client";

import React from "react";

interface LaptopProps {
  isOn?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Laptop({ isOn = false, className = "", style, children }: LaptopProps) {
  return (
    <div
      className={`relative flex flex-col items-center transition-all duration-700 ${className}`}
      style={{
        perspective: "800px",
        ...style,
      }}
    >
      {/* Laptop Screen / Lid */}
      <div
        className={`relative w-full aspect-[16/10] bg-[#1c1813] border-2 border-neutral-800 rounded-t-lg overflow-hidden shadow-2xl transition-all duration-700 ${
          isOn ? "shadow-[0_0_60px_rgba(212,160,82,0.15)]" : ""
        }`}
        style={{
          transform: "rotateX(-5deg)",
          transformOrigin: "bottom center",
        }}
      >
        {/* Bezel Status Camera */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-neutral-900 flex items-center justify-center">
          <div className={`w-0.5 h-0.5 rounded-full transition-colors duration-500 ${isOn ? "bg-amber-600" : "bg-neutral-800"}`} />
        </div>

        {/* Screen Display Panel */}
        <div
          className={`w-full h-full p-3 pt-4 flex flex-col transition-colors duration-700 ${
            isOn ? "bg-[#1a1814]" : "bg-[#090807]"
          }`}
        >
          {/* Active application screen content */}
          <div className={`w-full h-full rounded overflow-hidden flex flex-col transition-opacity duration-1000 ${isOn ? "opacity-100" : "opacity-0"}`}>
            {children}
          </div>
        </div>

        {/* Screen Glass Reflection Overlay */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
            isOn ? "opacity-30" : "opacity-10"
          }`}
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%, rgba(212,160,82,0.05) 100%)",
          }}
        />
      </div>

      {/* Hinge Linkage */}
      <div className="w-[90%] h-2.5 bg-gradient-to-b from-neutral-800 to-neutral-900 border-x border-neutral-700 shadow-inner z-10" />

      {/* Keyboard Base / Deck */}
      <div
        className="relative w-[112%] h-4 bg-gradient-to-b from-[#24201a] to-[#12100d] border border-neutral-800 rounded-b-xl shadow-2xl flex items-center justify-between px-6 overflow-hidden"
        style={{
          transform: "rotateX(30deg)",
          transformOrigin: "top center",
        }}
      >
        {/* Backlit Keyboard glow strips */}
        <div
          className={`absolute inset-x-4 top-1 h-1 bg-amber-500/20 blur-[2px] transition-opacity duration-700 ${
            isOn ? "opacity-100 animate-pulse" : "opacity-0"
          }`}
        />
        
        {/* Soft layout trackpad border */}
        <div className="w-1/3 h-2 mx-auto mt-1 border-t border-x border-neutral-700/50 rounded-t opacity-45" />

        {/* Base connection status indicator LED */}
        <div
          className={`absolute right-4 bottom-1 w-1.5 h-1.5 rounded-full transition-all duration-700 ${
            isOn ? "bg-emerald-500 shadow-[0_0_6px_#10b981]" : "bg-neutral-800"
          }`}
        />
      </div>
    </div>
  );
}
