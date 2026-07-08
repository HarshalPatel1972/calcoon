"use client";

import React, { useState, useEffect, useRef } from "react";
import { Display } from "./Display";
import { Keypad } from "./Keypad";
import { FactCard } from "./FactCard";
import * as math from "mathjs";
import { isComplexExpression } from "@/lib/classifier";
import { curiosity, Fact } from "@/lib/curiosity";

const BACKEND_URL = "http://localhost:8000";

export function Calculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<number | string | null>(null);
  const [activeFact, setActiveFact] = useState<Fact | null>(null);
  const pinged = useRef(false);

  // Fetch facts on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/facts/`)
      .then(res => res.json())
      .then(data => {
        if (data.facts) curiosity.setFacts(data.facts);
      })
      .catch(err => console.error("Could not load facts:", err));
  }, []);

  useEffect(() => {
    if (!expression) {
      setResult(null);
      pinged.current = false;
      return;
    }

    // Cold-start mitigation
    if (isComplexExpression(expression) && !pinged.current) {
      pinged.current = true;
      fetch(`${BACKEND_URL}/ping`).catch(() => {});
    }

    // We only live-evaluate simple math. 
    // Complex math requires explicit "=" (evaluate action) to not spam the server.
    if (!isComplexExpression(expression)) {
      try {
        const res = math.evaluate(expression);
        if (typeof res === "number" && Number.isFinite(res)) {
          setResult(res);
          const fact = curiosity.checkForFact(res);
          if (fact && !activeFact) setActiveFact(fact);
        }
      } catch (e) {
        // invalid simple math, ignore
      }
    }
  }, [expression, activeFact]);

  const handleKeyPress = (key: string) => {
    setExpression((prev) => prev + key);
  };

  const handleAction = async (action: "clear" | "backspace" | "evaluate") => {
    if (action === "clear") {
      setExpression("");
      setResult(null);
      setActiveFact(null);
    } else if (action === "backspace") {
      setExpression((prev) => prev.slice(0, -1));
    } else if (action === "evaluate") {
      if (isComplexExpression(expression)) {
        try {
          const res = await fetch(`${BACKEND_URL}/solve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expression })
          });
          const data = await res.json();
          if (res.ok) {
            setResult(data.result);
            // Attempt to parse string result to number for facts if possible
            const num = parseFloat(data.result);
            if (!isNaN(num)) {
              const fact = curiosity.checkForFact(num);
              if (fact) setActiveFact(fact);
            }
          } else {
            setResult("Error: " + data.detail);
          }
        } catch (e) {
          setResult("Network Error");
        }
      } else {
        if (typeof result === "number") {
          setExpression(parseFloat(result.toFixed(8)).toString());
        }
      }
    }
  };

  const handleDismissFact = () => {
    curiosity.recordInteraction('dismissed');
    setActiveFact(null);
  };

  const handleEngageFact = () => {
    curiosity.recordInteraction('engaged');
    // In a full implementation, we'd log this to the backend
  };

  return (
    <div className="max-w-sm w-full mx-auto mt-12 shadow-2xl rounded-3xl overflow-hidden bg-background border border-surface-raised ring-1 ring-white/5 pb-4">
      <Display expression={expression} result={result} />
      <Keypad onKeyPress={handleKeyPress} onAction={handleAction} />
      <FactCard fact={activeFact} onDismiss={handleDismissFact} onEngage={handleEngageFact} />
    </div>
  );
}
