"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <button
      className="p-2 border rounded bg-card text-card-foreground"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      Toggle Theme (Current: {theme})
    </button>
  );
}
