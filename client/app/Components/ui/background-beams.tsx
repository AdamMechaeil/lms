"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "absolute h-full w-full inset-0 overflow-hidden bg-slate-950",
        className
      )}
    >
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-indigo-500/20 to-transparent blur-3xl opacity-40" />
      <div className="absolute bottom-0 right-0 w-full h-[50vh] bg-gradient-to-t from-violet-500/20 to-transparent blur-3xl opacity-40" />

      {/* Reduced Particle Count for Performance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-slate-950/[0.8]"
        style={{ willChange: "transform" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />
      </motion.div>
    </div>
  );
};
