/**
 * LandingMotionWrapper Client Component — Landing Page Animations
 *
 * Utilizes Framer Motion to provide scroll reveal and entry stagger
 * transitions for landing sections.
 *
 * @module app/(public)/LandingMotionWrapper
 */

"use client";

import React from "react";
import { motion } from "framer-motion";

interface LandingMotionWrapperProps {
  children: React.ReactNode;
  type: "hero" | "post-its";
}

export function LandingMotionWrapper({ children, type }: LandingMotionWrapperProps) {
  if (type === "hero") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-6"
      >
        {children}
      </motion.div>
    );
  }

  if (type === "post-its") {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        {children}
      </motion.div>
    );
  }

  return <>{children}</>;
}
