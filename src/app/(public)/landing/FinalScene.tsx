/**
 * FinalScene — Premium Developer Workspace Scene.
 *
 * Flat, absolute positioned layout mimicking a real study room wall/desk.
 * Sits inside a padded container to prevent browser window/scrollbar truncation.
 * Occupies strictly 340px height inside a 356px box, stretching 100% wide.
 * All resting props align precisely with the desk top surface line (bottom-[32%]).
 *
 * Note: This is a decorative/interactive closing scene, NOT the site footer.
 * The real site footer is rendered in (public)/layout.tsx.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Monitor } from "lucide-react";
import { gsap } from "gsap";

interface FinalSceneProps {
  progress: number;
  reducedMotion: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function FinalScene({ progress: _progress, reducedMotion: _reducedMotion }: FinalSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [quote, setQuote] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const [time, setTime] = useState("");

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const quotes = [
    "Clean code always looks like it was written by someone who cares.",
    "First, solve the problem. Then, write the code.",
    "Simplicity is the soul of efficiency.",
    "Make it work, make it right, make it fast.",
    "Before software can be reusable it first has to be usable."
  ];

  const handleCoffeeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const rand = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(rand);
    setShowQuote(true);
    setTimeout(() => setShowQuote(false), 4000);
  };

  const handleScrollTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Magnetic hover pull effect
  useEffect(() => {
    const items = rootRef.current?.querySelectorAll(".study-prop");
    if (!items) return;

    items.forEach((item) => {
      const el = item as HTMLElement;
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.1;
        const y = (e.clientY - r.top - r.height / 2) * 0.1;
        gsap.to(el, { x, y, scale: 1.03, duration: 0.3, ease: "power2.out" });
      };
      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, scale: 1, duration: 0.4, ease: "elastic.out(1, 0.6)" });
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    });
  }, []);

  return (
    <section
      ref={rootRef}
      className="study-room relative overflow-hidden w-full"
      aria-label="Developer Workspace Scene"
      style={{
        height: "356px",
        paddingInline: "0px",
        paddingBottom: "16px", // Lifts the scene from absolute bottom to prevent browser scrollbar truncation
      }}
    >
      <div
        className="study-scene relative w-full h-full overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #1c1a17 0%, #141210 100%)",
          minHeight: "340px",
          height: "340px",
          borderBottom: "1px solid rgba(240, 230, 214, 0.08)",
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes zzz-float-1 {
            0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
            20% { opacity: 0.8; }
            100% { transform: translate(4px, -18px) scale(1); opacity: 0; }
          }
          @keyframes zzz-float-2 {
            0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
            20% { opacity: 0.8; }
            100% { transform: translate(-4px, -22px) scale(1); opacity: 0; }
          }
          @keyframes zzz-float-3 {
            0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
            20% { opacity: 0.8; }
            100% { transform: translate(5px, -26px) scale(1.1); opacity: 0; }
          }
          @keyframes kitten-breath {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.08) scaleX(1.02) translateY(-0.5px); }
          }
          .animate-zzz-1 {
            animation: zzz-float-1 3.5s linear infinite;
          }
          .animate-zzz-2 {
            animation: zzz-float-2 3.5s linear infinite;
            animation-delay: 1.1s;
          }
          .animate-zzz-3 {
            animation: zzz-float-3 3.5s linear infinite;
            animation-delay: 2.2s;
          }
          .animate-kitten-breath {
            animation: kitten-breath 3.5s ease-in-out infinite;
          }
        `}} />

        {/* Ambient Monitor Glow */}
        <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[700px] h-[220px] bg-[radial-gradient(ellipse,rgba(245,158,11,0.07)_0%,transparent_70%)] pointer-events-none" />

        {/* ═══════════ SURFACE 1: SHELF ═══════════ */}
        {/* Long horizontal wood shelf line (upper wall height) */}
        <div className="absolute left-[16%] right-[16%] top-[22%] h-[8px] bg-[#4a3f33] border-b border-[#251e18] rounded-sm shadow-md z-10" />

        {/* Books on shelf (sitting on shelf top at bottom-[78%] - scaled up by 35% width, 10% height) */}
        <Link
          href="/interview"
          className="study-prop group absolute left-[20%] bottom-[78%] flex items-end gap-[3.5px] cursor-pointer z-25"
          style={{ transformOrigin: "bottom center" }}
        >
          <div className="w-[30px] h-[44px] bg-gradient-to-b from-red-700 to-red-900 rounded-t-sm border border-neutral-900 shadow flex items-center justify-center">
            <span className="text-[10px] font-black text-[#f0e6d6]" style={{ writingMode: "vertical-rl" }}>Sys</span>
          </div>
          <div className="w-[30px] h-[38px] bg-gradient-to-b from-amber-600 to-amber-800 rounded-t-sm border border-neutral-900 shadow flex items-center justify-center">
            <span className="text-[10px] font-black text-[#f0e6d6]" style={{ writingMode: "vertical-rl" }}>DSA</span>
          </div>
          <div className="w-[30px] h-[42px] bg-gradient-to-b from-emerald-700 to-emerald-900 rounded-t-sm border border-neutral-900 shadow flex items-center justify-center">
            <span className="text-[10px] font-black text-[#f0e6d6]" style={{ writingMode: "vertical-rl" }}>STAR</span>
          </div>
          <div className="w-[30px] h-[36px] bg-gradient-to-b from-blue-700 to-blue-900 rounded-t-sm border border-neutral-900 shadow flex items-center justify-center">
            <span className="text-[10px] font-black text-[#f0e6d6]" style={{ writingMode: "vertical-rl" }}>API</span>
          </div>
          <span className="tooltip absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[#faf8f5] text-[10px] px-2 py-1 rounded border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            Browse Bookshelf
          </span>
        </Link>

        {/* Plant on shelf (+15% larger) */}
        <div
          className="study-prop group absolute right-[20%] bottom-[78%] flex flex-col items-center justify-end z-25"
        >
          <div className="flex gap-[3.5px] mb-[2px]">
            <span className="w-[4.5px] h-[18px] bg-emerald-600 rounded-full rotate-[-25deg]" />
            <span className="w-[5.5px] h-[24px] bg-emerald-500 rounded-full" />
            <span className="w-[4.5px] h-[18px] bg-emerald-600 rounded-full rotate-[25deg]" />
          </div>
          <div className="w-[34px] h-[22px] bg-gradient-to-b from-amber-800 to-amber-950 rounded-b-sm border border-neutral-800 shadow" />
          <span className="tooltip absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[#faf8f5] text-[10px] px-2 py-1 rounded border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            Shelf Plant
          </span>
        </div>



        {/* Right wall stack */}
        {/* Calendar */}
        <div className="absolute right-[3%] top-[8%] w-[58px] h-[62px] bg-[#faf8f5] border border-neutral-300 rounded shadow-md flex flex-col overflow-hidden z-20 text-center select-none">
          <div className="h-[16px] bg-red-700 flex items-center justify-center">
            <span className="text-[12px] font-black text-white tracking-wide">JUL</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[26px] font-black text-neutral-800 leading-none">08</span>
          </div>
        </div>

        {/* Sticky Note */}
        <div
          className="study-prop group absolute right-[8.5%] top-[8%] w-[56px] h-[56px] bg-[var(--color-post-it)] border border-neutral-400 rounded flex flex-col justify-center items-center shadow p-1 z-20"
          style={{ transform: "rotateZ(-4deg)" }}
        >
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full absolute top-0.5 shadow" />
          <span className="text-[13px] text-neutral-800 font-black font-mono">Suggest</span>
          <span className="tooltip absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-[#faf8f5] text-[10px] px-2 py-1 rounded border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            Suggest Q&amp;A
          </span>
        </div>

        {/* Clock (+35% larger, Text 15px bold, glowing amber contrast) */}
        <div className="absolute right-[3%] top-[55%] w-[98px] h-[35px] border border-neutral-800 bg-[#0c0a09] rounded flex items-center justify-center text-[15px] text-[#f59e0b] font-black font-mono tracking-widest px-0.5 z-20 shadow-inner">
          {time}
        </div>

        {/* Headphones */}
        <Link
          href="/interview"
          className="study-prop group absolute right-[9%] top-[55%] w-[42px] h-[36px] flex flex-col items-center justify-center cursor-pointer z-20"
        >
          <div className="w-[23px] h-[6px] border-2 border-b-0 border-neutral-500 rounded-t-full relative animate-pulse" />
          <div className="flex justify-between w-[28px] absolute bottom-1">
            <span className="w-2.5 h-4.5 bg-neutral-800 border border-neutral-700 rounded shadow-sm" />
            <span className="w-2.5 h-4.5 bg-neutral-800 border border-neutral-700 rounded shadow-sm" />
          </div>
          <span className="tooltip absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-[#faf8f5] text-[10px] px-2 py-1 rounded border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            Guide Walkthroughs
          </span>
        </Link>


        {/* ═══════════ SURFACE 3: DESK SURFACE ═══════════ */}
        {/* Desk top surface background panel */}
        <div className="absolute bottom-0 inset-x-0 h-[32%] bg-gradient-to-b from-[#1e1b18] to-[#141210] border-t border-[#3d3329] shadow-inner z-10" />

        {/* Wood Desk front thickness/edge to prevent truncation cut-off */}
        <div className="absolute bottom-0 inset-x-0 h-[12px] bg-gradient-to-b from-[#5a4d3f] to-[#3d3329] border-t border-neutral-900 z-20 shadow-lg" />

        {/* Desk reflection bloom */}
        <div className="absolute left-[8%] bottom-[12px] w-[20%] h-[32%] bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.1)_0%,_transparent_75%)] pointer-events-none z-15" />

        {/* Symmetrical / absolute positioned props resting on foreground baseline bottom-[28%] */}
        
        {/* Left Side: Mouse, Notebook, Lamp */}
        <Link
          href="/search"
          className="study-prop group absolute left-[9%] bottom-[28%] w-[23px] h-[35px] bg-gradient-to-b from-neutral-700 to-neutral-900 border border-neutral-600 rounded-full shadow flex flex-col items-center justify-start pt-1 gap-[2px] cursor-pointer z-40"
        >
          <span className="w-[3.5px] h-[6px] bg-neutral-500 rounded-full" />
          <span className="w-[9px] h-[0.5px] bg-neutral-600" />
          <span className="tooltip absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[#faf8f5] text-[10px] px-2 py-1 rounded border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            Quick Search
          </span>
          {/* Contact Shadow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-[20px] h-[3px] bg-black/45 blur-[1.5px] rounded-full" style={{ bottom: "-2px" }} />
        </Link>

        {/* Profile Notebook */}
        <Link
          href="/profile"
          className="study-prop group absolute left-[13%] bottom-[28%] w-[48px] h-[30px] bg-[#faf8f5] border border-neutral-300 rounded shadow-md flex flex-col p-1.5 gap-[2px] rotate-[-2deg] cursor-pointer z-40"
        >
          <span className="w-full h-[2px] bg-neutral-300" />
          <span className="w-full h-[2px] bg-neutral-300" />
          <span className="w-full h-[2px] bg-neutral-300" />
          <span className="tooltip absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[#faf8f5] text-[10px] px-2 py-1 rounded border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            Open Profile
          </span>
          {/* Contact Shadow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-[44px] h-[3px] bg-black/45 blur-[1.5px] rounded-full" style={{ bottom: "-2px" }} />
        </Link>

        <a
          href="#top"
          onClick={handleScrollTop}
          className="study-prop group absolute left-[19.5%] bottom-[32%] w-[46px] h-[92px] flex flex-col items-center justify-end cursor-pointer z-25"
        >
          <div className="w-12 h-[22px] bg-amber-500/20 border border-amber-500/30 rounded-t-full relative z-30 shadow-[0_0_4px_rgba(245,158,11,0.15)]" />
          <div className="w-[3px] h-[72px] bg-neutral-600" />
          <div className="w-[26px] h-[6px] bg-neutral-750 rounded-t" />
          <span className="tooltip absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[#faf8f5] text-[10px] px-2 py-1 rounded border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            Scroll to Top
          </span>
          {/* Contact Shadow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-10 h-[3px] bg-black/45 blur-[1.5px] rounded-full" style={{ bottom: "-2px" }} />
        </a>

        {/* Sleeping Kitten resting cozy on the desk left of monitor screen */}
        <div className="study-prop group absolute left-[29%] bottom-[28%] flex flex-col items-center justify-end z-45 select-none pointer-events-none">
          {/* Floating ZZZs of sleeping */}
          <div className="absolute bottom-[24px] left-[15px] h-[40px] w-[30px] overflow-visible pointer-events-none flex flex-col items-center">
            <span className="absolute animate-zzz-1 text-[9px] font-bold text-amber-500/80 font-mono">z</span>
            <span className="absolute animate-zzz-2 text-[11px] font-bold text-amber-500/70 font-mono">z</span>
            <span className="absolute animate-zzz-3 text-[13px] font-bold text-amber-500/60 font-mono">Z</span>
          </div>
          {/* Animated breathing kitten shape */}
          <div className="animate-kitten-breath origin-bottom">
            <svg width="42" height="26" viewBox="0 0 42 26" fill="none">
              {/* Ground Shadow */}
              <ellipse cx="21" cy="23" rx="18" ry="3" fill="rgba(0,0,0,0.35)" />
              {/* Tabby Cat Body (sleeping curl) */}
              <path d="M6 18C6 10 14 6 22 6C30 6 36 10 36 17C36 22 30 24 22 24C14 24 6 22 6 18Z" fill="#d97706" />
              {/* Gentle Tabby Head */}
              <circle cx="10" cy="14" r="8" fill="#d97706" />
              {/* Closed cozy sleeping eyes */}
              <path d="M6 14C6.8 14.8 7.6 14.8 8.4 14" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M10.6 14C11.4 14.8 12.2 14.8 13 14" stroke="#78350f" strokeWidth="1.2" strokeLinecap="round" />
              {/* Cute sleeping nose */}
              <polygon points="9.2,15.5 10.2,15.5 9.7,16" fill="#f87171" />
              {/* Tabby stripes */}
              <path d="M19 7C19.5 9 19.2 11 18.2 12.5" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M23 7C23.5 9 23.2 11 22.2 12.5" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M27 7C27.5 9 27.2 11 26.2 12.5" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
              {/* Cute cozy ears */}
              <polygon points="4,9.5 8,10.5 5,6.5" fill="#d97706" />
              <polygon points="4,9.5 8,10.5 5,6.5" fill="#f87171" />
              <polygon points="12.2,8.5 15.2,10.5 15.2,6.5" fill="#d97706" />
              <polygon points="12.2,8.5 15.2,10.5 15.2,6.5" fill="#f87171" />
              {/* Tail wrapped snugly */}
              <path d="M35 16C37.5 17.5 39.5 20.5 38.5 22.5C37.2 24.5 33 24 30.5 23" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
              <path d="M35 16C37.5 17.5 39.5 20.5 38.5 22.5C37.2 24.5 33 24 30.5 23" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="tooltip absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[#faf8f5] text-[10px] px-2 py-1 rounded border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            Sleeping Kitten
          </span>
          {/* Extra bottom margin contact shadow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-[34px] h-[3px] bg-black/40 blur-[1.5px] rounded-full" style={{ bottom: "-2px" }} />
        </div>

        {/* Center: Monitor (TALL & WIDE, Screen Height 190px for full prominence, overlaps wall shelf behind it naturally) */}
        <Link
          href="/interview"
          className="study-prop group absolute left-[50%] -translate-x-1/2 bottom-[32%] w-[480px] h-[210px] flex flex-col items-center justify-end cursor-pointer z-35"
        >
          {/* Screen */}
          <div className="w-full h-[190px] bg-[#12100e] border border-neutral-700 rounded-md p-[2.5px] shadow-lg relative">
            <div className="border border-neutral-800 rounded bg-[#070605] w-full h-full flex flex-col items-center justify-center p-3 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08)_0%,transparent_60%)] pointer-events-none" />
              <Monitor size={36} className="text-amber-500/80 mb-3 animate-pulse" />
              <span className="text-[24px] font-black text-[#ffffff] font-mono tracking-wider">LOOPORA LIBRARY</span>
              <span className="text-[16px] text-[#a3a3a3] mt-2 font-semibold">Your workspace is ready</span>
            </div>
          </div>
          {/* Stand Neck */}
          <div className="w-[10px] h-[14px] bg-gradient-to-b from-neutral-600 to-neutral-855 border-x border-neutral-850" />
          {/* Stand Base/Foot */}
          <div className="w-[72px] h-[4px] bg-neutral-800 border border-neutral-700 rounded-t-sm shadow-md relative">
            {/* Contact shadow for the monitor base */}
            <div className="absolute left-1/2 -translate-x-1/2 w-[72px] h-[3px] bg-black/60 blur-[1.5px] rounded-full" style={{ bottom: "-2px" }} />
          </div>
          <span className="tooltip absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[#faf8f5] text-[10px] px-2 py-1 rounded border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            Enter Library
          </span>
        </Link>

        {/* Center: Keyboard (+20% Wider, key spacing slightly increased, centered under monitor, z-40 to go in front of monitor stand) */}
        <Link
          href="/signup"
          className="study-prop group absolute left-[50%] -translate-x-1/2 bottom-[28%] w-[156px] h-[16px] bg-gradient-to-b from-neutral-700 to-neutral-900 border border-neutral-600 rounded shadow flex items-center justify-around px-2 cursor-pointer z-40"
        >
          {[...Array(8)].map((_, i) => (
            <span key={i} className="w-[12px] h-[4px] bg-neutral-955 rounded-sm border border-neutral-850" />
          ))}
          <span className="tooltip absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[#faf8f5] text-[10px] px-2 py-1 rounded border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            Create Free Account
          </span>
          {/* Contact Shadow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-[150px] h-[4px] bg-black/50 blur-[2px] rounded-full" style={{ bottom: "-3px" }} />
        </Link>

        {/* Right Side: Coffee Mug */}
        <a
          href="#coffee"
          onClick={handleCoffeeClick}
          className="study-prop group absolute right-[13%] bottom-[28%] w-[35px] h-[37px] flex flex-col items-center justify-end cursor-pointer z-40"
        >
          <div className="w-[30px] h-[33px] bg-gradient-to-b from-red-700 to-red-900 rounded-t-sm rounded-b-md border border-neutral-900 shadow relative flex items-center justify-center">
            <span className="absolute right-[-4.5px] top-[4px] w-[4.5px] h-[14px] border-2 border-l-0 border-neutral-900 rounded-r-sm" />
          </div>
          <span className="tooltip absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[#faf8f5] text-[10px] px-2 py-1 rounded border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            Grab Coffee
          </span>
          {/* Contact Shadow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-[28px] h-[3.5px] bg-black/40 blur-[1.5px] rounded-full" style={{ bottom: "-2px" }} />
        </a>


        {/* Dynamic Coffee quote box popup */}
        {showQuote && (
          <div className="absolute bottom-[48%] left-1/2 -translate-x-1/2 bg-[#0c0a09] border border-amber-500/30 rounded-md p-4 max-w-sm text-center shadow-2xl z-50">
            <p className="text-xs text-[#f0e6d6] italic font-mono">&quot;{quote}&quot;</p>
          </div>
        )}
      </div>
    </section>
  );
}
