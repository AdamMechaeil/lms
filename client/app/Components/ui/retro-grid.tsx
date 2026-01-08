"use client";

import { cn } from "@/lib/utils";

/**
 * Retro Grid Background
 *
 * A 3D perspective grid with movement.
 * Requires the 'grid' keyframe animation in globals.css.
 */
export default function RetroGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute h-full w-full overflow-hidden opacity-50 [perspective:200px]",
        className
      )}
    >
      {/* Grid */}
      <div className="absolute inset-0 [transform:rotateX(35deg)]">
        <div
          className={cn(
            "animate-grid",
            "[background-repeat:repeat] [background-size:60px_60px]",
            "[height:300vh] [inset:0%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:600vw]",

            // Light Styles
            "[background-image:linear-gradient(to_right,rgba(0,0,0,0.45)_1px,transparent_0),linear-gradient(to_bottom,rgba(0,0,0,0.45)_1px,transparent_0)]",

            // Dark Styles
            "dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_0),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_0)]"
          )}
        />
      </div>

      {/* Gradient Fade - Reduced fade height to show more grid */}
      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent to-60% dark:from-slate-950" />
    </div>
  );
}
