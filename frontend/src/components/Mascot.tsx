"use client";

import React from "react";
import { motion } from "framer-motion";

interface MascotProps {
  factActive: boolean;
}

export function Mascot({ factActive }: MascotProps) {
  return (
    <div className="flex justify-center mb-6">
      <motion.div
        animate={{
          y: factActive ? [-5, 0, -5] : [0, -2, 0],
          rotate: factActive ? [0, 5, -5, 0] : 0,
        }}
        transition={{
          repeat: Infinity,
          duration: factActive ? 0.5 : 3,
          ease: "easeInOut",
        }}
        className="w-24 h-24 bg-surface-raised rounded-full flex items-center justify-center border-4 border-accent relative"
      >
        {/* Placeholder SVG for Calcoon */}
        <svg viewBox="0 0 100 100" className="w-16 h-16 text-foreground" fill="currentColor">
          <circle cx="50" cy="50" r="45" fill="var(--color-surface)" />
          {/* Eyes */}
          <circle cx="35" cy="40" r="8" fill="var(--color-foreground)" />
          <circle cx="65" cy="40" r="8" fill="var(--color-foreground)" />
          {/* Mask */}
          <path d="M 20 40 Q 50 50 80 40 L 90 50 Q 50 65 10 50 Z" fill="rgba(0,0,0,0.5)" />
          {/* Nose */}
          <circle cx="50" cy="60" r="5" fill="var(--color-accent)" />
          {/* Ears */}
          <polygon points="20,20 30,5 45,15" fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth="2" />
          <polygon points="80,20 70,5 55,15" fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth="2" />
        </svg>
      </motion.div>
    </div>
  );
}
