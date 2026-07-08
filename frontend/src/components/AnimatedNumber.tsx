"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  format?: (val: number) => string;
}

export function AnimatedNumber({ value, className, format }: AnimatedNumberProps) {
  // We use framer-motion's useSpring to animate a number.
  // We need to keep a local spring value that updates when `value` prop changes.
  const springValue = useSpring(value, {
    bounce: 0,
    duration: 600, // 600ms count up
  });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  // Format it as a string
  const display = useTransform(springValue, (current) => {
    // If it's a very large number or needs scientific notation, format handles it.
    // Otherwise just stringify or round for animation frames.
    if (format) {
      return format(current);
    }
    // Default format: up to 8 decimal places to prevent massive float strings
    // We parse back to float to remove trailing zeros
    return parseFloat(current.toFixed(8)).toString();
  });

  return <motion.span className={className}>{display}</motion.span>;
}
