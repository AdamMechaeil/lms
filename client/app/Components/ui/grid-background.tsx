"use client";
import React from "react";

export function GridBackground() {
  return (
    <div className="h-full w-full relative flex items-center justify-center bg-white dark:bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
    </div>
  );
}
