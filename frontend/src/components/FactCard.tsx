"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fact } from "@/lib/curiosity";
import { Button } from "./Button";

interface FactCardProps {
  fact: Fact | null;
  onDismiss: () => void;
  onEngage: () => void;
}

export function FactCard({ fact, onDismiss, onEngage }: FactCardProps) {
  return (
    <AnimatePresence>
      {fact && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ type: "spring", bounce: 0.2 }}
          className="bg-surface-raised mx-4 p-4 rounded-xl mt-4 shadow-lg border border-accent/20"
        >
          <div className="text-sm text-accent mb-1 font-bold uppercase tracking-wider">
            {fact.format_family.replace(/_/g, " ")}
          </div>
          <div className="text-foreground text-lg mb-3">
            {fact.copy_template}
          </div>
          <div className="flex gap-2">
            <Button
              className="h-10 text-sm"
              variant="accent"
              label="Wow!"
              onClick={() => {
                onEngage();
                onDismiss();
              }}
            />
            <Button
              className="h-10 text-sm"
              variant="action"
              label="Dismiss"
              onClick={onDismiss}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
