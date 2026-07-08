"use client";

import React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "number" | "operator" | "accent" | "action";

interface ButtonProps {
  label: React.ReactNode;
  onClick: () => void;
  variant?: ButtonVariant;
  className?: string;
}

export function Button({ label, onClick, variant = "number", className }: ButtonProps) {
  const baseClasses =
    "btn-3d flex items-center justify-center rounded-2xl text-2xl font-semibold select-none cursor-pointer active:scale-95 transition-all w-full h-16";

  const variantClasses = {
    number: "btn-number",
    operator: "btn-operator",
    accent: "btn-accent",
    action: "bg-surface-raised text-action",
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], className)}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
