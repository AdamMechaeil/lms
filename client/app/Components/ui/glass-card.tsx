"use client";
import { cn } from "@/lib/utils";
import React from "react";

/**
 * A reusable card with premium Glassmorphism effect.
 * Optimized with minimal DOM nesting.
 */
export const GlassCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "p-6 rounded-xl border border-slate-200 dark:border-white/10 bg-white/30 dark:bg-black/40 backdrop-blur-md shadow-lg hover:shadow-xl dark:shadow-none transition-all duration-300 hover:bg-white/40 dark:hover:bg-black/50",
        className
      )}
    >
      {children}
    </div>
  );
};
