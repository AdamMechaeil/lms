"use client";
import React, { useMemo } from "react";
import { Sidebar } from "@/app/Components/Shared/Sidebar";
import { ShootingStars } from "@/app/Components/ui/shooting-stars";
import { StarsBackground } from "@/app/Components/ui/stars-background";
import RetroGrid from "@/app/Components/ui/retro-grid";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface SharedDashboardLayoutProps {
  links: {
    label: string;
    href: string;
    icon: React.ReactNode;
  }[];
  children: React.ReactNode;
  userType?: "admin" | "trainer" | "student";
}

export default function SharedDashboardLayout({
  links,
  children,
  userType = "admin",
}: SharedDashboardLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize background logic to prevent re-renders on route changes
  const Background = useMemo(() => {
    if (!mounted) return null;

    if (theme === "dark") {
      // Dark Mode: Shooting Stars + Star Field
      return (
        <>
          <StarsBackground />
          <ShootingStars />
        </>
      );
    } else {
      // Light Mode: Retro Grid
      return <RetroGrid />;
    }
  }, [theme, mounted]);

  return (
    <div className="relative flex h-screen w-full overflow-hidden font-sans bg-background text-foreground transition-colors duration-300">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">{Background}</div>

      {/* Glass Sidebar & Content Wrapper */}
      <div className="relative z-10 flex h-full w-full">
        <Sidebar links={links} />
        <main className="flex-1 overflow-y-auto relative">
          <div className="h-full w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
