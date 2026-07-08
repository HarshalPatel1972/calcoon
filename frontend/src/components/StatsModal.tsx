"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button";

interface StatsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function StatsModal({ visible, onClose }: StatsModalProps) {
  // In a real app, fetch these from the backend or localStorage
  const stats = {
    totalCalcs: 42,
    factsUnlocked: 4,
    complexCalcs: 2,
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
            <h2 className="text-2xl font-bold text-accent mb-4">Your Stats</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center bg-background p-3 rounded-xl">
                <span className="text-foreground-muted">Total Calculations</span>
                <span className="text-xl font-bold">{stats.totalCalcs}</span>
              </div>
              <div className="flex justify-between items-center bg-background p-3 rounded-xl">
                <span className="text-foreground-muted">Facts Unlocked</span>
                <span className="text-xl font-bold text-accent">{stats.factsUnlocked}</span>
              </div>
              <div className="flex justify-between items-center bg-background p-3 rounded-xl">
                <span className="text-foreground-muted">Complex Formulas</span>
                <span className="text-xl font-bold">{stats.complexCalcs}</span>
              </div>
            </div>

            <Button label="Close" onClick={onClose} variant="action" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
