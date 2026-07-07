/**
 * FinalScene component — The cinematic room exploration conclusion.
 * 
 * Renders a full front-view developer workspace.
 * Employs a 2-second delayed CTA reveal, looping micro-animations (clock, steam),
 * and magnetic hover linkages mapped to 7 key navigation points.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Keyboard,
  Coffee,
  GraduationCap,
  ExternalLink,
  Lightbulb
} from "lucide-react";
import { gsap } from "gsap";

interface FinalSceneProps {
  progress: number;
  reducedMotion: boolean;
}

export function FinalScene({ progress, reducedMotion }: FinalSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [showCTA, setShowCTA] = useState(false);
  const isVisible = progress > 0.85 || reducedMotion;

  // Clock time update
  const [time, setTime] = useState("");
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to top handler
  const handleScrollTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 2-second delayed CTA trigger
  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => setShowCTA(false), 0);
      return () => clearTimeout(timer);
    }

    if (reducedMotion) {
      const timer = setTimeout(() => setShowCTA(true), 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setShowCTA(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isVisible, reducedMotion]);

  // Magnetic hover layout interaction
  useEffect(() => {
    if (reducedMotion) return;
    const items = rootRef.current?.querySelectorAll(".study-object");
    if (!items) return;

    items.forEach((item) => {
      const el = item as HTMLElement;
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.12;
        const y = (e.clientY - r.top - r.height / 2) * 0.12;
        gsap.to(el, { x, y, duration: 0.3, ease: "power2.out" });
      };
      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: "elastic.out(1, 0.5)" });
      };
      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      return () => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      };
    });
  }, [reducedMotion]);

  return (
    <section
      ref={rootRef}
      className="study-room relative overflow-hidden"
      aria-label="Interactive workspace ending"
    >
      <div className="study-heading text-center">
        <p className="text-amber-500 uppercase tracking-widest text-[0.72rem] font-bold">The Final Scene</p>
        <h2 className="text-3xl font-extrabold text-[#f0e6d6] mt-1" style={{ fontFamily: "var(--font-heading)" }}>
          Everything is powered. Ready when you are.
        </h2>
      </div>

      {/* Spatial Front-View Study Room */}
      <div className="study-scene border border-neutral-800 rounded-lg shadow-2xl relative w-full max-w-[960px] aspect-[16/10] mx-auto bg-gradient-to-b from-[#1c1a16] to-[#0d0b09] overflow-hidden">
        
        {/* Wall shelf illustrations */}
        <div className="absolute top-[10%] left-[8%] w-[24%] h-[40%] flex flex-col justify-end" aria-hidden="true">
          {/* Bookshelf items */}
          <Link href="/interview" className="study-object obj-bookshelf h-full w-full flex flex-col items-center justify-center gap-2 border border-neutral-700 bg-neutral-900/60 rounded p-4">
            <BookOpen size={24} className="text-amber-500" />
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-neutral-300">Bookshelf</span>
            <span className="tooltip text-[0.6rem] bg-neutral-900 border border-neutral-800 p-1.5 rounded shadow absolute -bottom-10 whitespace-nowrap opacity-0 transition-opacity">Explore Categories</span>
          </Link>
        </div>

        {/* Central Widescreen workstation screen */}
        <div className="absolute top-[18%] left-[34%] w-[32%] h-[32%]" aria-hidden="true">
          <Link href="/interview" className="study-object obj-monitor h-full w-full flex flex-col items-center justify-center gap-2 border border-neutral-700 bg-neutral-900/60 rounded p-4">
            <GraduationCap size={28} className="text-amber-500" />
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-neutral-300">Library</span>
            <span className="tooltip text-[0.6rem] bg-neutral-900 border border-neutral-800 p-1.5 rounded shadow absolute -bottom-10 whitespace-nowrap opacity-0 transition-opacity">Open Library Folders</span>
          </Link>
        </div>

        {/* Sticky notes on cork wall */}
        <div className="absolute top-[15%] right-[10%] w-[16%] h-[20%]" aria-hidden="true">
          <Link href="/suggest" className="study-object obj-notebook h-full w-full flex flex-col items-center justify-center gap-2 border border-neutral-700 bg-neutral-900/60 rounded p-4">
            <Lightbulb size={22} className="text-amber-500" />
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-neutral-300">Suggest Q&A</span>
            <span className="tooltip text-[0.6rem] bg-neutral-900 border border-neutral-800 p-1.5 rounded shadow absolute -bottom-10 whitespace-nowrap opacity-0 transition-opacity">Contribute Questions</span>
          </Link>
        </div>

        {/* Keyboard on desk surface */}
        <div className="absolute bottom-[10%] left-[30%] w-[38%] h-[12%]" aria-hidden="true">
          <Link href="/signup" className="study-object obj-keyboard h-full w-full flex flex-col items-center justify-center gap-2 border border-neutral-700 bg-neutral-900/60 rounded p-4">
            <Keyboard size={20} className="text-amber-500" />
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-neutral-300">Sign Up</span>
            <span className="tooltip text-[0.6rem] bg-neutral-900 border border-neutral-800 p-1.5 rounded shadow absolute -bottom-10 whitespace-nowrap opacity-0 transition-opacity">Create Free Account</span>
          </Link>
        </div>

        {/* Coffee mug with ambient steam loops */}
        <div className="absolute bottom-[12%] right-[18%] w-[10%] h-[16%]" aria-hidden="true">
          <div className="study-object obj-coffee h-full w-full flex flex-col items-center justify-center gap-1 border border-neutral-700 bg-neutral-900/60 rounded p-2">
            <div className="coffee-steam flex gap-0.5 justify-center mb-1">
              <span className="w-[1.5px] h-3 bg-neutral-400/30 rounded animate-[steam_2.5s_infinite]" />
              <span className="w-[1.5px] h-3 bg-neutral-400/30 rounded animate-[steam_2.5s_infinite_0.7s]" />
            </div>
            <Coffee size={18} className="text-amber-500" />
            <span className="text-[0.62rem] font-bold uppercase text-neutral-300">Coffee</span>
          </div>
        </div>

        {/* Pinned github sticker */}
        <div className="absolute bottom-[12%] left-[10%] w-[12%] h-[14%]" aria-hidden="true">
          <a href="https://github.com/AniketK100/Loopora" target="_blank" rel="noopener noreferrer" className="study-object obj-github h-full w-full flex flex-col items-center justify-center gap-1 border border-neutral-700 bg-neutral-900/60 rounded p-2">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            <span className="text-[0.62rem] font-bold uppercase text-neutral-300">GitHub</span>
          </a>
        </div>

        {/* Desk Lamp for scroll back to top */}
        <div className="absolute top-[12%] left-[4%] w-[10%] h-[18%]" aria-hidden="true">
          <a href="#top" onClick={handleScrollTop} className="study-object obj-lamp h-full w-full flex flex-col items-center justify-center gap-1 border border-neutral-700 bg-neutral-900/60 rounded p-2 text-amber-500 hover:text-amber-400">
            <span className="text-[0.62rem] font-bold uppercase text-neutral-300">Lamp</span>
          </a>
        </div>

        {/* Live system ticking clock on wall */}
        <div className="absolute top-[8%] right-[38%] w-[10%] h-[8%] border border-neutral-800 bg-black/60 rounded flex items-center justify-center text-[0.7rem] text-amber-500/80 font-mono tracking-widest px-2" aria-hidden="true">
          {time}
        </div>
      </div>

      {/* Delayed CTA Panel */}
      <div className="study-cta-container flex flex-col items-center justify-center mt-8 min-h-[90px]">
        <div className={`transition-all duration-1000 ${showCTA ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <p className="study-cta-text text-[#a89882] text-sm mb-4">
            Your prep desk is clean, powered, and syncs automatically.
          </p>
          <Link href="/interview" className="study-main-cta inline-flex items-center gap-2">
            Enter Loopora Workspace <ExternalLink size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
