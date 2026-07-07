/**
 * StudyRoom — The final interactive developer workspace.
 *
 * All major study room elements are hoverable & clickable,
 * navigating the user to context-appropriate pages.
 * Includes interactive tooltip elements on hover.
 */

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Keyboard,
  Coffee,
  GraduationCap,
  Volume2,
  Compass,
  ArrowUp,
  Mail,
  Cpu,
  Bookmark,
  ShieldAlert,
  Code2,
  ExternalLink
} from "lucide-react";
import { gsap } from "gsap";

interface StudyRoomProps {
  progress: number;
  reducedMotion: boolean;
}

export function StudyRoom({ progress, reducedMotion }: StudyRoomProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const isVisible = progress > 0.85 || reducedMotion;

  // Scroll to top action
  const handleScrollTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Setup subtle magnetic effect for desktop hover items
  useEffect(() => {
    if (reducedMotion) return;
    const elements = rootRef.current?.querySelectorAll(".study-object");
    if (!elements) return;

    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const onMove = (e: MouseEvent) => {
        const rect = htmlEl.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.12;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.12;
        gsap.to(htmlEl, { x, y, duration: 0.3, ease: "power2.out" });
      };
      const onLeave = () => {
        gsap.to(htmlEl, { x: 0, y: 0, duration: 0.4, ease: "elastic.out(1, 0.5)" });
      };

      htmlEl.addEventListener("mousemove", onMove);
      htmlEl.addEventListener("mouseleave", onLeave);

      return () => {
        htmlEl.removeEventListener("mousemove", onMove);
        htmlEl.removeEventListener("mouseleave", onLeave);
      };
    });
  }, [reducedMotion]);

  return (
    <section
      ref={rootRef}
      className="study-room"
      aria-label="Interactive developer study room workspace"
    >
      <div className="study-heading">
        <p>The final desk</p>
        <h2>Your workspace is ready. Step in.</h2>
      </div>

      <div className="study-scene">
        {/* Bookshelf */}
        <Link href="/interview" className="study-object obj-bookshelf" aria-label="Bookshelf - Explore all question categories">
          <BookOpen size={24} />
          <span>Library</span>
          <span className="tooltip">Browse tracks & categories</span>
        </Link>

        {/* Wall monitor */}
        <Link href="/interview" className="study-object obj-monitor" aria-label="Monitor - Start preparing questions">
          <GraduationCap size={32} />
          <span>Start Preparing</span>
          <span className="tooltip">Launch Interview Library</span>
        </Link>

        {/* Certificate */}
        <Link href="/terms" className="study-object obj-certificate" aria-label="Certificate - View Terms of Service">
          <GraduationCap size={20} />
          <span>Terms</span>
          <span className="tooltip">Read our terms of service</span>
        </Link>

        {/* Keyboard */}
        <Link href="/signup" className="study-object obj-keyboard" aria-label="Keyboard - Join Loopora free">
          <Keyboard size={24} />
          <span>Join Loopora</span>
          <span className="tooltip">Create a free account</span>
        </Link>

        {/* Physical notebook */}
        <Link href="/profile" className="study-object obj-notebook" aria-label="Notebook - View Profile and Progress">
          <Bookmark size={20} />
          <span>Progress</span>
          <span className="tooltip">Check your metrics & bookmarks</span>
        </Link>

        {/* Coffee Mug with steam */}
        <Link href="/signup" className="study-object obj-coffee" aria-label="Coffee cup - Sign up free">
          <div className="coffee-steam" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <Coffee size={20} />
          <span>Coffee</span>
          <span className="tooltip">Start free preparation</span>
        </Link>

        {/* GitHub sticker */}
        <a
          href="https://github.com/AniketK100/Loopora"
          target="_blank"
          rel="noopener noreferrer"
          className="study-object obj-github"
          aria-label="GitHub sticker - View Source Code"
        >
          <Code2 size={20} />
          <span>GitHub</span>
          <span className="tooltip">Open-source Repository</span>
        </a>

        {/* Contact Pen Holder */}
        <a href="mailto:hello@loopora.app" className="study-object obj-mail" aria-label="Pen holder - Send Email Contact">
          <Mail size={18} />
          <span>Contact</span>
          <span className="tooltip">Email our support team</span>
        </a>

        {/* Ambient server/router */}
        <div className="study-object obj-router" aria-hidden="true" style={{ pointerEvents: "none" }}>
          <Cpu size={18} />
          <span>Cloud</span>
          <span className="tooltip">Connected & Syncing</span>
        </div>

        {/* Headphones */}
        <Link href="/interview" className="study-object obj-headphones" aria-label="Headphones - Listen to explanation walk-throughs">
          <Volume2 size={16} />
          <span>Guides</span>
          <span className="tooltip">Listen to explanations</span>
        </Link>

        {/* Desk Lamp */}
        <a href="#top" onClick={handleScrollTop} className="study-object obj-lamp" aria-label="Lamp - Back to top">
          <ArrowUp size={16} />
          <span>Back to Top</span>
          <span className="tooltip">Return to top of page</span>
        </a>

        {/* Router / server / other clickable decor */}
        <Link href="/search" className="study-object obj-mouse" aria-label="Mouse - Open search bar">
          <Compass size={14} />
          <span>Search</span>
          <span className="tooltip">Quick search questions</span>
        </Link>

        {/* Small plant */}
        <Link href="/privacy" className="study-object obj-plant" aria-label="Plant - View Privacy Policy">
          <ShieldAlert size={14} />
          <span>Privacy</span>
          <span className="tooltip">Read our privacy policy</span>
        </Link>
      </div>

      <div className="study-cta-container">
        <p className={`study-cta-text ${isVisible ? "visible" : ""}`}>
          Ready to streamline your interview prep?
        </p>
        <Link href="/interview" className="study-main-cta">
          Enter Loopora <ExternalLink size={18} />
        </Link>
      </div>
    </section>
  );
}
