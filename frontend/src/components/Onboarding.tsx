"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";

export function Onboarding() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("calcoon_onboarding_seen");
    if (!seen) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("calcoon_onboarding_seen", "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-surface w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-white/10"
          >
            <h2 className="text-2xl font-bold text-accent mb-4">Welcome to Calcoon!</h2>
            <p className="text-foreground-muted mb-4 leading-relaxed">
              I'm Calcoon, the curious calculator. I work just like a normal calculator, but sometimes, when you calculate an interesting number, I'll share a cool fact about it!
            </p>
            <p className="text-foreground-muted mb-6 leading-relaxed">
              I also know calculus and advanced formulas. Just type them out and hit equals!
            </p>
            <Button label="Let's Go!" onClick={dismiss} variant="accent" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
