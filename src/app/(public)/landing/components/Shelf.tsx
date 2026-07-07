/**
 * Shelf component — A high-fidelity reusable vector illustration asset of a wooden wall shelf.
 * Supports realistic drop shadows, layered wood textures, and decorative book/mug overlays.
 */

"use client";

import React from "react";

interface ShelfProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Shelf({ className = "", style, children }: ShelfProps) {
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`} style={style}>
      {/* Decorative items resting on top of shelf */}
      <div className="relative w-[92%] flex justify-between items-end px-4 z-10 -mb-0.5">
        {/* Left: Decorative vector pile of books */}
        <div className="flex items-end -space-x-1.5 opacity-80" aria-hidden="true">
          <div className="w-4 h-16 bg-[#5c4a37] border-l border-t border-[#735e47] rounded-l shadow transform rotate-[-4deg] origin-bottom-left" />
          <div className="w-5 h-18 bg-[#453629] border-l border-t border-[#544333] rounded shadow" />
          <div className="w-4.5 h-14 bg-[#6e5842] border-l border-t border-[#856b52] rounded shadow transform rotate-[3deg] origin-bottom" />
        </div>

        {/* Middle: Screen mount or main items area */}
        <div className="flex-1 flex justify-center px-4">
          {children}
        </div>

        {/* Right: Small office coffee mug and micro plant */}
        <div className="flex items-end gap-3 opacity-80" aria-hidden="true">
          {/* Coffee Mug */}
          <div className="relative w-7 h-8 bg-[#3d362d] border border-[#544a3e] rounded-b-md shadow flex items-center justify-center">
            {/* Handle */}
            <div className="absolute left-[-5px] top-1.5 w-2 h-4 border-2 border-[#3d362d] rounded-l-md" />
            <div className="w-3.5 h-0.5 bg-[#d4a052]/30 rounded-full mb-1" />
          </div>

          {/* Micro plant pot */}
          <div className="flex flex-col items-center">
            {/* Leaves */}
            <div className="flex gap-0.5 -mb-1">
              <span className="w-2.5 h-4 bg-emerald-700/60 rounded-full transform -rotate-[25deg]" />
              <span className="w-3 h-5 bg-emerald-600/70 rounded-full" />
              <span className="w-2.5 h-4 bg-emerald-700/60 rounded-full transform rotate-[25deg]" />
            </div>
            {/* Terracotta Pot */}
            <div
              className="w-6 h-6 bg-gradient-to-b from-[#8f503c] to-[#703d2d] border-t border-[#a65f49] shadow"
              style={{
                clipPath: "polygon(10% 0%, 90% 0%, 80% 100%, 20% 100%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Wood Shelf Board (Top surface) */}
      <div
        className="w-full h-3 bg-gradient-to-b from-[#3a3228] to-[#26201a] border border-[#4d4235]/40 shadow-lg relative z-20"
        style={{
          borderRadius: "3px 3px 1px 1px",
        }}
      />

      {/* Wood Shelf Depth Profile (Front face) */}
      <div
        className="w-[99.5%] h-5 bg-gradient-to-b from-[#26201a] to-[#12100d] border-[#1f1a14]/60 border-t-0 border-x border-b shadow-xl relative z-10"
        style={{
          borderRadius: "0 0 4px 4px",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Soft amber desk spotlight reflection on shelf edge */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4a052]/20 to-transparent" />
      </div>

      {/* Drop shadow cast on the wall behind/below the shelf */}
      <div
        className="absolute bottom-[-15px] inset-x-2 h-5 bg-black/60 blur-md pointer-events-none z-[1]"
        style={{
          borderRadius: "50%",
        }}
      />
    </div>
  );
}
