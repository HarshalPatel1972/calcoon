"use client";

import React, { useState, useEffect } from "react";
import { Display } from "./Display";
import { Keypad } from "./Keypad";
import * as math from "mathjs";

export function Calculator() {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState<number | string | null>(null);

  // Evaluate the expression whenever it changes to provide a live preview of the result.
  useEffect(() => {
    if (!expression) {
      setResult(null);
      return;
    }

    try {
      // math.evaluate can throw on incomplete expressions like "5 +"
      const res = math.evaluate(expression);
      if (typeof res === "number") {
        // Simple sanity check to avoid rendering NaN or Infinity if they arise
        if (Number.isFinite(res)) {
          setResult(res);
        } else {
          setResult("Error");
        }
      }
    } catch (e) {
      // Do nothing, leave the previous result or wait for valid input
    }
  }, [expression]);

  const handleKeyPress = (key: string) => {
    setExpression((prev) => prev + key);
  };

  const handleAction = (action: "clear" | "backspace" | "evaluate") => {
    if (action === "clear") {
      setExpression("");
      setResult(null);
    } else if (action === "backspace") {
      setExpression((prev) => prev.slice(0, -1));
    } else if (action === "evaluate") {
      // On evaluate, if we have a valid result, we make it the new expression
      // so the user can chain operations on it.
      if (typeof result === "number") {
        // Format to remove excessive precision noise
        const formatted = parseFloat(result.toFixed(8)).toString();
        setExpression(formatted);
      }
    }
  };

  return (
    <div className="max-w-sm w-full mx-auto mt-12 shadow-2xl rounded-3xl overflow-hidden bg-background border border-surface-raised ring-1 ring-white/5">
      <Display expression={expression} result={result} />
      <Keypad onKeyPress={handleKeyPress} onAction={handleAction} />
    </div>
  );
}
