import { cn } from "@/app/Utils/cn";

import { GlassCard } from "./glass-card";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  watermark,
  metric,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  watermark?: React.ReactNode;
  metric?: string | number;
}) => {
  return (
    <GlassCard
      className={cn(
        "row-span-1 group/bento transition duration-200 justify-between flex flex-col space-y-4 relative overflow-hidden",
        className
      )}
    >
      {watermark && (
        <div className="absolute right-6 bottom-4 opacity-[0.4] dark:opacity-[0.3] scale-[2.5] rotate-12 group-hover/bento:rotate-0 transition-all duration-300 pointer-events-none z-0 select-none text-neutral-800 dark:text-neutral-400">
          {watermark}
        </div>
      )}
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200">
            {title}
          </div>
        </div>

        {metric !== undefined && (
          <div className="font-sans font-bold text-3xl text-neutral-800 dark:text-neutral-100 my-2">
            {metric}
          </div>
        )}

        <div className="font-sans font-normal text-neutral-600 dark:text-neutral-300 text-xs">
          {description}
        </div>
      </div>
    </GlassCard>
  );
};
