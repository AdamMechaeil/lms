import { cn } from "@/app/Utils/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted bg-neutral-200 dark:bg-neutral-800",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
