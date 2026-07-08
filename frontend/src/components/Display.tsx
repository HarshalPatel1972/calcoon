"use client";

import React from "react";
import { AnimatedNumber } from "./AnimatedNumber";

interface DisplayProps {
  expression: string;
  result: number | string | null;
}

export function Display({ expression, result }: DisplayProps) {
  // If result is a number, we animate it.
  // If it's a string (e.g. "Error"), we just show it.
  const isNumberResult = typeof result === "number";

  return (
    <div className="w-full h-40 flex flex-col items-end justify-end p-6 bg-background text-right rounded-t-3xl">
      {/* Expression Area */}
      <div className="text-foreground-muted text-xl h-8 overflow-hidden mb-2 font-medium tracking-wide">
        {expression || ""}
      </div>
      
      {/* Result Area */}
      <div className="text-5xl font-bold tracking-tight text-foreground h-16 flex items-center justify-end w-full overflow-hidden">
        {isNumberResult ? (
          <AnimatedNumber value={result as number} />
        ) : (
          <span>{result ?? "0"}</span>
        )}
      </div>
    </div>
  );
}
