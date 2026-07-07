/**
 * NotebookAsset component — A high-fidelity reusable vector illustration asset of the signature Loopora premium notebook.
 * Renders either closed cover state or open lined paper state with textures, margin line grids, and paper shadows.
 */

"use client";

import React from "react";

interface NotebookAssetProps {
  isOpen?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function NotebookAsset({ isOpen = false, className = "", style, children }: NotebookAssetProps) {
  return (
    <div
      className={`relative select-none transition-all duration-1000 ${className}`}
      style={{
        perspective: "1000px",
        ...style,
      }}
    >
      {!isOpen ? (
        /* CLOSED NOTEBOOK COVER STATE */
        <div
          className="relative w-72 aspect-[3/4] bg-gradient-to-br from-[#2f2b26] to-[#1e1b18] border border-[#403b35] rounded-l-md rounded-r-2xl p-6 shadow-[0_20px_45px_rgba(0,0,0,0.6),_inset_0_1px_0_rgba(255,255,255,0.05)] flex flex-col justify-between"
          style={{
            transform: "rotateY(-15deg) rotateX(10deg)",
            transformOrigin: "left center",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7), -5px 0 15px rgba(0,0,0,0.4)",
          }}
        >
          {/* Notebook Bindings spine lines */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/40 via-transparent to-black/10 border-r border-[#1a1816]" />
          
          {/* Gold loop spine ring attachments */}
          <div className="absolute left-[-6px] top-6 bottom-6 flex flex-col justify-between h-[85%] w-3 pointer-events-none" aria-hidden="true">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-4 h-2 bg-gradient-to-r from-[#d4a052] to-[#8c6227] rounded-full border border-black/30 shadow-md" />
            ))}
          </div>

          {/* Ribbon marker strip */}
          <div className="absolute right-8 top-0 w-4 h-full bg-gradient-to-b from-[#e63946] to-[#b51725] opacity-80 shadow z-10" style={{ transform: "translateY(12px)", height: "calc(100% + 12px)", borderRadius: "0 0 2px 2px" }} />

          {/* Book title plate label */}
          <div className="mt-8 border border-[#d4a052]/30 bg-[#161412] p-4 rounded-lg wobbly-sm text-center shadow-inner relative overflow-hidden">
            {/* Background leather grain texture */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-black" />
            <h2
              className="text-[#f0e6d6] text-xl font-bold tracking-wider mb-1"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Loopora
            </h2>
            <p
              className="text-[#a89882] text-[0.7rem] uppercase tracking-[0.18em]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Crack the Interview
            </p>
          </div>

          {/* Signature Pencil clip mockup */}
          <div className="self-end mt-auto flex items-center gap-1.5 opacity-50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4a052]" />
            <span className="text-[0.62rem] text-[#a89882] uppercase tracking-widest font-mono">Premium Rev.</span>
          </div>
        </div>
      ) : (
        /* OPENED LINED PAPER NOTEBOOK STATE */
        <div
          className="relative w-[520px] aspect-[4/3] bg-[#faf8f5] border-2 border-[#e6e2da] p-8 shadow-[0_15px_35px_rgba(0,0,0,0.5)] flex flex-col"
          style={{
            backgroundImage: "radial-gradient(circle, #e6e2da 0.8px, transparent 0.8px)",
            backgroundSize: "24px 24px",
            borderRadius: "8px 24px 24px 8px",
            boxShadow: "inset 0 0 40px rgba(0,0,0,0.02), 0 20px 50px rgba(0,0,0,0.5)",
          }}
        >
          {/* Lined margins */}
          <div className="absolute left-10 top-0 bottom-0 w-[1px] bg-red-400/50" />
          <div className="absolute left-0 right-0 top-12 h-[1px] bg-red-400/50" />

          {/* Binding binder holes on left page edge */}
          <div className="absolute left-[-2px] top-4 bottom-4 flex flex-col justify-between h-[90%] w-2" aria-hidden="true">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 bg-neutral-800 rounded-full border border-neutral-700 shadow-inner" />
            ))}
          </div>

          {/* Child contents in the center */}
          <div className="w-full h-full pl-8 pt-4 flex flex-col relative z-10">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
