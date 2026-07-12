/**
 * LandingHero — High-fidelity developer landing header.
 * 
 * Layout:
 * - Left side: Crack the Interview heading with a dynamic hacker typing terminal animation showing question categories.
 * - Right side: Animated floating index cards/revision sheets showing interview questions.
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface SessionUser {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

interface CustomSession {
  user?: SessionUser | null;
}

interface LandingHeroProps {
  poweredOn: boolean;
  reducedMotion?: boolean;
  totalQuestions: number;
  totalCategories: number;
  session?: CustomSession | null;
}

// Declared outside to prevent effect re-trigger cycles
const categoriesList = [
  "System Design: Consistent Hashing & Sharding",
  "Data Structures: Dynamic Programming & Graphs",
  "Behavioral: STAR Framework & Leadership",
  "Databases: Concurrency & SQL Tuning",
  "OOP Coding: Design Patterns & Solid Principles"
];

const scrambleWords = [
  "coding-round.",
  "sys-design.",
  "algorithms.",
  "interview.",
  "behavioral."
];

export function LandingHero({
  poweredOn,
  reducedMotion,
  totalQuestions,
  totalCategories,
  session,
}: LandingHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);

  // Hacker terminal typing state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Slot machine / scramble decryption state for the main title word (initialized to coding-round.)
  const [displayWord, setDisplayWord] = useState("coding-round.");
  const [isTranslating, setIsTranslating] = useState(false);

  const isAuthenticated = !!session?.user;

  // Text typing effect loop for the terminal
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const fullText = categoriesList[currentIdx];
    
    const tick = () => {
      if (!isDeleting) {
        setTypedText(fullText.slice(0, typedText.length + 1));
        if (typedText === fullText) {
          timer = setTimeout(() => setIsDeleting(true), 2500);
          return;
        }
      } else {
        setTypedText(fullText.slice(0, typedText.length - 1));
        if (typedText === "") {
          setIsDeleting(false);
          setCurrentIdx((prev) => (prev + 1) % categoriesList.length);
          return;
        }
      }
      
      const speed = isDeleting ? 30 : 60;
      timer = setTimeout(tick, speed);
    };

    timer = setTimeout(tick, 100);
    return () => clearTimeout(timer);
  }, [typedText, isDeleting, currentIdx]);

  // Slot machine roll & text scramble effect
  useEffect(() => {
    let wordIdx = 0;
    const chars = "#@$%#haha"; // The specific change characters requested by the user

    const interval = setInterval(() => {
      // 1. Slide down & fade out (slot machine roll start)
      setIsTranslating(true);

      setTimeout(() => {
        // 2. Switch word index and execute scramble transition
        wordIdx = (wordIdx + 1) % scrambleWords.length;
        const target = scrambleWords[wordIdx];
        let iteration = 0;

        const scrambleInterval = setInterval(() => {
          const scrambled = target
            .split("")
            .map((char, index) => {
              if (char === "." || char === "-") return char;
              if (index < iteration) {
                return target[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

          setDisplayWord(scrambled);

          if (iteration >= target.length) {
            clearInterval(scrambleInterval);
            // 3. Slide back up & fade in (slot machine roll settle)
            setIsTranslating(false);
          }
          iteration += 0.5;
        }, 30);

      }, 350); // Matches the slide transition duration
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Realistic Paper Wind Scroll Animation
  useEffect(() => {
    if (reducedMotion) return;

    const refs = [card1Ref.current, card2Ref.current, card3Ref.current];
    const hero = heroRef.current;
    if (!refs.every(Boolean) || !hero) return;

    const cards = refs as HTMLDivElement[];

    // Disable CSS float animations + transitions on cards
    cards.forEach((el) => {
      const p = el.parentElement;
      if (p) p.style.animation = "none";
      el.style.transition = "none";
    });

    // Lock starting transforms (mirroring original Tailwind inline styles)
    // Card 1: rotate-[2deg] translate-y-[-10px]
    // Card 2: -rotate-[4deg] -translate-x-8 -translate-y-2
    // Card 3: rotate-[6deg] translate-x-12 translate-y-4
    const init = [
      { x: 0, y: -10, rotation: 2 },
      { x: -32, y: -8, rotation: -4 },
      { x: 48, y: 16, rotation: 6 },
    ];
    cards.forEach((el, i) => gsap.set(el, init[i]));

    // Scale factor for smaller screens
    const s = window.innerWidth < 1024 ? 0.65 : window.innerWidth < 1440 ? 0.85 : 1;

    // Single ScrollTrigger timeline — instant 1:1 scroll binding
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      }
    });

    // ——— CARD 1 : TOP-LEFT ———
    tl.to(cards[0], { x: -25, y: -30, rotation: -4, rotateX: 4, duration: 0.05, ease: "none" }, 0);
    tl.to(cards[0], { x: -70, y: -65, rotation: -7, rotateX: 6, duration: 0.07, ease: "none" }, 0.05);
    tl.to(cards[0], { x: -140 * s, y: -110 * s, rotation: -9, rotateX: 7, rotateY: -4, scale: 0.96, duration: 0.10, ease: "none" }, 0.12);
    tl.to(cards[0], { x: -240 * s, y: -210 * s, rotation: -7, rotateX: 4, rotateY: -6, scale: 0.92, duration: 0.11, ease: "none" }, 0.22);
    tl.to(cards[0], { x: -400 * s, y: -380 * s, rotation: -13, rotateX: 5, rotateY: -8, scale: 0.84, duration: 0.16, ease: "none" }, 0.33);
    tl.to(cards[0], { x: "-=60", y: "-=50", opacity: 0, scale: 0.76, duration: 0.13, ease: "none" }, 0.49);

    // ——— CARD 2 : TOP-RIGHT ———
    tl.to(cards[1], { x: -15, y: -15, rotation: -2, rotateX: 3, duration: 0.06, ease: "none" }, 0.10);
    tl.to(cards[1], { x: 30, y: -45, rotation: 1, rotateX: 5, rotateY: 2, duration: 0.07, ease: "none" }, 0.16);
    tl.to(cards[1], { x: 100 * s, y: -100 * s, rotation: 3, rotateX: 6, rotateY: 3, scale: 0.96, duration: 0.10, ease: "none" }, 0.23);
    tl.to(cards[1], { x: 200 * s, y: -200 * s, rotation: 5, rotateX: 4, rotateY: 4, scale: 0.92, duration: 0.11, ease: "none" }, 0.33);
    tl.to(cards[1], { x: 370 * s, y: -360 * s, rotation: 9, rotateX: 5, rotateY: 3, scale: 0.84, duration: 0.16, ease: "none" }, 0.44);
    tl.to(cards[1], { x: "+=60", y: "-=50", opacity: 0, scale: 0.76, duration: 0.13, ease: "none" }, 0.60);

    // ——— CARD 3 : STRAIGHT UPWARD ———
    tl.to(cards[2], { x: 30, y: -15, rotation: 4, rotateX: 3, duration: 0.07, ease: "none" }, 0.20);
    tl.to(cards[2], { x: 10, y: -60, rotation: 2, rotateX: 4, rotateY: 1, duration: 0.08, ease: "none" }, 0.27);
    tl.to(cards[2], { x: -5, y: -140 * s, rotation: -1, rotateX: 3, rotateY: -1, scale: 0.96, duration: 0.10, ease: "none" }, 0.35);
    tl.to(cards[2], { x: 10, y: -240 * s, rotation: 1, rotateX: 4, rotateY: 1, scale: 0.92, duration: 0.11, ease: "none" }, 0.45);
    tl.to(cards[2], { x: 0, y: -450 * s, rotation: 0, rotateX: 2, rotateY: 0, scale: 0.84, duration: 0.18, ease: "none" }, 0.56);
    tl.to(cards[2], { y: "-=120", opacity: 0, scale: 0.76, duration: 0.14, ease: "none" }, 0.74);

    ScrollTrigger.refresh();
    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => { tl.kill(); };
  }, [reducedMotion]);

  return (
    <section
      ref={heroRef}
      className={`landing-hero relative w-full min-h-[90vh] flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-12 bg-gradient-to-b from-[#110f0d] to-[#151310] ${
        poweredOn ? "powered-on" : ""
      }`}
      aria-labelledby="landing-title"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(2deg); }
          50% { transform: translateY(-12px) rotate(3.5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(-4deg); }
          50% { transform: translateY(-18px) rotate(-2.5deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(6deg); }
          50% { transform: translateY(-10px) rotate(4.5deg); }
        }
        .animate-float-slow {
          animation: float-slow 7s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 5s ease-in-out infinite;
        }
      `}} />

      {/* Desk surface backdrop layer */}
      <div className="desk-surface absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(28,24,20,0.15)_0%,_transparent_70%)] pointer-events-none" />

      {/* LEFT COLUMN: Main title & Hacker typing terminal */}
      <div className="flex-1 max-w-xl space-y-6 z-10 text-left">
        <h1
          id="landing-title"
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#f0e6d6] leading-tight flex items-baseline flex-wrap"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          <span className="shrink-0">Crack the&nbsp;</span>
          <span
            className={`text-[#d4a052] inline-flex justify-center text-center font-mono shrink-0 transition-all duration-350 transform ${
              isTranslating ? "translate-y-[15px] opacity-0 blur-[1px]" : "translate-y-0 opacity-100 blur-0"
            }`}
          >
            {displayWord}
          </span>
        </h1>

        <p className="text-base text-[#a89882] max-w-md">
          Prep with {totalQuestions}+ hand-curated questions across {totalCategories} tracks. Loopora is structured like a physical revision notebook.
        </p>

        {/* Hacker style terminal typing box (Redesigned with high contrast colors matching the layout theme) */}
        <div className="border border-[#d4a052]/15 bg-[#141210] rounded-md p-4 font-mono text-xs text-[#a89882] relative overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-1.5 mb-2.5 border-b border-neutral-900 pb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            <span className="text-[11px] text-neutral-400 ml-1 font-bold">loopora-terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#d4a052] font-black">$</span>
            <span className="text-[#f0e6d6] font-semibold">{typedText}</span>
            <span className="w-1.5 h-3.5 bg-[#d4a052] animate-[blink_1s_infinite]" />
          </div>
        </div>

        {/* CTAs with fixed consistent high-fidelity color styling matching the site layout theme */}
        <div className="flex flex-wrap gap-4 pt-2">
          <Link
            href="/interview"
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-black rounded bg-[#d4a052] hover:bg-[#c39043] text-[#141210] transition-all duration-300 shadow-[0_8px_30px_rgba(212,160,82,0.2)] hover:shadow-[0_12px_40px_rgba(212,160,82,0.35)] hover:-translate-y-0.5"
          >
            Start Preparing <ArrowRight size={16} />
          </Link>
          <Link
            href={isAuthenticated ? "/interview" : "/signup"}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-bold text-neutral-300 bg-[#1c1a17]/80 hover:bg-[#25221e]/80 border border-neutral-800 hover:border-neutral-700 rounded transition-all duration-300 hover:-translate-y-0.5"
          >
            {isAuthenticated ? "Resume Preparation" : "Sign up free"}
          </Link>
        </div>
      </div>

      {/* RIGHT COLUMN: Beautiful Floating 3D Index Cards / Revision Sheets */}
      <div className="w-full md:w-[500px] h-[400px] flex items-center justify-center relative mt-12 md:mt-0 z-10 select-none">
        <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: "1200px" }}>
          
          {/* Card 3 (Bottom, Behavioral, tilted right) */}
          <div className="absolute animate-float-fast z-10">
            <div 
              ref={card3Ref}
              className="w-[240px] h-[280px] bg-[#faf6ef] border border-neutral-300 rounded shadow-lg p-5 rotate-[6deg] translate-x-12 translate-y-4 hover:opacity-100 transition-opacity duration-300"
            >
              <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full mb-4" />
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Behavioral</div>
              <div className="text-sm font-black text-neutral-800 font-serif leading-tight">STAR method details:</div>
              <div className="space-y-2 mt-4 text-[11px] text-neutral-600 font-mono">
                <div>S - Situation</div>
                <div>T - Task</div>
                <div>A - Action</div>
                <div>R - Result</div>
              </div>
              <div className="absolute bottom-4 right-4 text-[10px] font-bold text-neutral-400 font-mono">Loopora #03</div>
            </div>
          </div>

          {/* Card 2 (Middle, Algorithms, tilted left) */}
          <div className="absolute animate-float-medium z-10">
            <div 
              ref={card2Ref}
              className="w-[250px] h-[290px] bg-[#fdfcfa] border border-neutral-300 rounded shadow-xl p-5 -rotate-[4deg] -translate-x-8 -translate-y-2 hover:opacity-100 transition-opacity duration-300"
            >
              <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full mb-4" />
              <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Algorithms</div>
              <div className="text-sm font-black text-neutral-800 font-serif leading-tight">Reverse a Linked List:</div>
              <div className="bg-[#12100e] text-amber-500/90 font-mono text-[9.5px] p-2.5 rounded border border-neutral-800 mt-4 leading-normal">
                <span className="text-neutral-500"># Iterative approach</span><br />
                curr = head<br />
                prev = None<br />
                while curr:<br />
                &nbsp;&nbsp;nxt = curr.next<br />
                &nbsp;&nbsp;curr.next = prev<br />
                &nbsp;&nbsp;prev = curr<br />
                &nbsp;&nbsp;curr = nxt
              </div>
              <div className="absolute bottom-4 right-4 text-[10px] font-bold text-neutral-400 font-mono">Loopora #02</div>
            </div>
          </div>

          {/* Card 1 (Top, System Design, pinned in center) */}
          <div className="absolute animate-float-slow z-20">
            <div 
              ref={card1Ref}
              className="w-[270px] h-[300px] bg-[#faf8f5] border border-neutral-300 rounded shadow-[0_15px_35px_rgba(0,0,0,0.25)] p-6 rotate-[2deg] translate-y-[-10px] hover:scale-105 transition-all duration-300"
            >
              {/* Red thumbtack/pin with shadow */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-red-600 rounded-full border border-red-500 shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
              </div>
              
              {/* Ruled paper vertical red line margin */}
              <div className="absolute left-[24px] top-0 bottom-0 w-[1px] bg-red-300" />
              
              <div className="pl-4 h-full flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1.5">System Design</div>
                  <div className="text-lg font-black text-neutral-800 font-serif leading-tight">Consistent Hashing</div>
                  
                  {/* Horizontal notebook lines */}
                  <div className="space-y-3 mt-5">
                    <div className="flex items-center gap-2 text-[11px] text-neutral-700 font-bold">
                      <CheckCircle2 size={12} className="text-green-600 shrink-0" />
                      <span>Avoid hotspot nodes</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-700 font-bold">
                      <CheckCircle2 size={12} className="text-green-600 shrink-0" />
                      <span>Minimize sharding delta</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-700 font-bold">
                      <CheckCircle2 size={12} className="text-green-600 shrink-0" />
                      <span>Hash ring implementation</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 font-mono">
                  <span>Page 24</span>
                  <span>Loopora #01</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
