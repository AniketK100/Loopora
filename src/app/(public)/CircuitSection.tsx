/**
 * The Circuit Scroll Section — Client Component
 *
 * Implements a scroll-linked SVG circuit wire scrollytelling path:
 * 1. Pinned layout section that scrubs animations over 3x viewport height.
 * 2. Visual hand-drawn circuit wire connecting 4 laptop-station differentiators.
 * 3. MatchMedia fallback layout for users who prefer reduced motion.
 *
 * @module app/(public)/CircuitSection
 */

"use client";

import React, { useEffect, useRef } from "react";
import { FileText, Video, TrendingUp, MessageSquare } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Badge } from "@/components/ui";

export default function CircuitSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const stationRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Register GSAP ScrollTrigger plugin on client side
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const path = pathRef.current;
    const stations = stationRefs.current;

    if (!container || !path) return;

    // Safe context for React hydration + cleanup
    const ctx = gsap.context(() => {
      // 1. Accessibility matchMedia guard
      const mm = gsap.matchMedia();

      // Active animations only if user doesn't prefer reduced motion
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Setup initial dash properties for the SVG path stroke animation
        const pathLength = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
        });

        // GSAP ScrollTrigger Timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "+=250%", // Pinned scroll distance duration
            scrub: 0.5,
            pin: true,
            invalidateOnRefresh: true,
          },
        });

        // Clean timeline animation steps
        tl.to(path, {
          strokeDashoffset: 0,
          ease: "none",
        });

        stations.forEach((station, index) => {
          if (!station) return;

          const laptop = station.querySelector(".laptop-icon");
          const screenGlow = station.querySelector(".screen-glow");
          const cardBody = station.querySelector(".card-body");

          // Calculate offset trigger points based on station index position
          const progressStart = index * 0.25;

          // Fade-in icon
          tl.to(
            laptop,
            {
              opacity: 1,
              color: "var(--color-accent)",
              scale: 1.1,
              duration: 0.2,
            },
            progressStart
          );

          // Glow effect on active station laptop screen
          if (screenGlow) {
            tl.to(
              screenGlow,
              {
                opacity: 0.85,
                boxShadow: "0 0 20px 4px rgba(239, 68, 68, 0.4)",
                duration: 0.15,
              },
              progressStart
            );
          }

          // Slide copy text details card up
          if (cardBody) {
            tl.to(
              cardBody,
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.25,
              },
              progressStart
            );
          }
        });
      });

      // Reduced-motion fallback config (static state, no animations/pinning)
      mm.add("(prefers-reduced-motion: reduce)", () => {
        if (path) {
          gsap.set(path, { strokeDashoffset: 0 });
        }
        stations.forEach((station) => {
          if (!station) return;
          const laptop = station.querySelector(".laptop-icon");
          const screenGlow = station.querySelector(".screen-glow");
          const cardBody = station.querySelector(".card-body");

          gsap.set([laptop, screenGlow, cardBody], {
            opacity: 1,
            y: 0,
            scale: 1,
            clearProps: "all",
          });
        });
      });
    }, container);

    return () => ctx.revert(); // GSAP context cleanup
  }, []);

  const features = [
    {
      title: "Model Answers",
      description: "Expertly written solutions with concise short takeaways and complete code/STAR narratives.",
      icon: <FileText size={28} className="stroke-[2.5]" />,
    },
    {
      title: "Video Explanation",
      description: "Cross-referenced walkthrough options from multiple creators to clarify complex topics.",
      icon: <Video size={28} className="stroke-[2.5]" />,
    },
    {
      title: "Frequency Ranks",
      description: "Priority metrics derived from actual candidate feedback. Know what's actually asked.",
      icon: <TrendingUp size={28} className="stroke-[2.5]" />,
    },
    {
      title: "Feedback Engine",
      description: "Interactive suggestion board for correction logs, alternative solutions, and community peer review.",
      icon: <MessageSquare size={28} className="stroke-[2.5]" />,
    },
  ];

  return (
    <section
      id="circuit-section"
      ref={containerRef}
      className="w-full bg-[var(--color-bg-alt)] border-y-2 border-[var(--color-border)] py-16 overflow-hidden relative"
    >
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        {/* Title Header */}
        <div className="text-center space-y-3">
          <Badge variant="accent" className="text-sm tracking-wider uppercase">
            ⚡ Interactive Circuit
          </Badge>
          <h2
            className="text-4xl font-bold text-[var(--color-fg)]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            How Loopora Works
          </h2>
          <p className="text-base text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] max-w-lg mx-auto">
            Scroll down to watch the learning current travel through our key differentiators.
          </p>
        </div>

        {/* Visual Circuit Canvas Grid */}
        <div className="relative pt-12 pb-24 md:pb-32">
          {/* SVG Connector Circuit Wire (Hidden on mobile/reduced motion) */}
          <div className="absolute inset-x-0 top-24 hidden md:block" aria-hidden="true">
            <svg
              className="w-full h-12 overflow-visible"
              viewBox="0 0 1000 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                ref={pathRef}
                d="M 50,25 C 150,5 250,45 350,25 C 450,5 550,45 650,25 C 750,5 850,45 950,25"
                stroke="var(--color-accent)"
                strokeWidth="4"
                strokeLinecap="round"
                className="opacity-70"
              />
            </svg>
          </div>

          {/* Laptops Stations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {features.map((feat, i) => (
              <div
                key={feat.title}
                ref={(el) => {
                  stationRefs.current[i] = el;
                }}
                className="flex flex-col items-center text-center space-y-4 group"
              >
                {/* Visual Station Laptop Icon Node */}
                <div className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-[var(--color-bg)] border-2 border-[var(--color-border)] rounded-xl wobbly-sm shadow-[var(--shadow-default)]">
                  {/* Laptop screen glow layer */}
                  <div className="screen-glow absolute inset-1 bg-red-500/0 rounded-lg opacity-0 transition-opacity duration-150" />
                  
                  {/* Center icon */}
                  <div className="laptop-icon text-gray-400 opacity-60 scale-100 transition-all duration-300 relative z-10">
                    {feat.icon}
                  </div>
                </div>

                {/* Narrative Details Card */}
                <div
                  className="card-body bg-[var(--color-bg)] border-2 border-[var(--color-border)] p-5 wobbly-sm shadow-[var(--shadow-default)] opacity-100 md:opacity-0 md:translate-y-8 md:scale-95 transition-all duration-300"
                >
                  <h3
                    className="text-lg font-bold text-[var(--color-fg)] mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)] leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
