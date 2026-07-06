/**
 * Root Layout — InterviewLoop
 *
 * Configures the global HTML shell with:
 * - Self-hosted Google Fonts via `next/font` (no render-blocking external requests)
 *   - Kalam: hand-drawn headings and accent text
 *   - Patrick Hand: body text with a handwritten feel
 * - CSS variable injection for fonts (consumed by Tailwind and globals.css)
 * - Global metadata defaults
 *
 * @module app/layout
 * @see 02_TRD.md §2 — Performance Requirements (font loading)
 * @see 04_UIUX_Design_Brief.md §1 — Design Direction
 */

import type { Metadata } from "next";
import { Kalam, Patrick_Hand } from "next/font/google";
import "./globals.css";

/**
 * Kalam — used for headings, hero text, accent elements, rank badges.
 * Weights: 300 (light), 400 (regular), 700 (bold).
 * The design system specifies this as the primary display font.
 */
const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

/**
 * Patrick Hand — used for body text, question text, UI labels.
 * Weight: 400 only (single weight font).
 * Provides the handwritten aesthetic for content-heavy areas.
 */
const patrickHand = Patrick_Hand({
  variable: "--font-patrick-hand",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InterviewLoop — Ace Every Interview Question",
    template: "%s | InterviewLoop",
  },
  description:
    "Structured interview preparation with 500+ frequently asked questions, " +
    "written model answers, and real video explanations across HR, Technical, " +
    "Situational, and more interview types.",
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${kalam.variable} ${patrickHand.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
