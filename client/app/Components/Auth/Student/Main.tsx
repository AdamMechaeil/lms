"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BRAND_NAME } from "@/app/Utils/Constants/Brandname";
import { WavyBackground } from "@/app/Components/ui/wavy-background";
import { toast } from "sonner";
import { Loader2, User, Lock } from "lucide-react";

const TYPING_SPEED = 150;
const TEXT_TO_TYPE = `Welcome ${BRAND_NAME} Student`;

export default function Main() {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= TEXT_TO_TYPE.length) {
        setDisplayedText(TEXT_TO_TYPE.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTypingComplete(true);
      }
    }, TYPING_SPEED);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call for UI check
    setTimeout(() => {
      console.log("Login attempt:", { studentId, password });
      toast.success("Login functionality will be implemented later");
      setLoading(false);
    }, 1000);
  };

  return (
    <WavyBackground
      className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen px-4"
      colors={["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"]}
      waveOpacity={0.3}
      blur={10}
    >
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-zinc-200 dark:border-white/20 shadow-2xl space-y-8 w-full max-w-lg relative z-10">
        {/* Animated Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl min-h-[3rem] sm:min-h-[4rem]">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400">
              {displayedText}
            </span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="inline-block w-2 h-8 sm:h-12 ml-2 align-middle bg-primary rounded-full"
            />
          </h1>
          <p className="text-lg text-muted-foreground font-medium animate-pulse">
            Sign in to access your learning dashboard
          </p>
        </div>

        {/* Login Form */}
        {isTypingComplete && (
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleLogin}
            className="w-full space-y-4"
          >
            <div className="space-y-2">
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-100/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/50 dark:focus:bg-white/10 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-100/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/50 dark:focus:bg-white/10 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Login to Portal"
                )}
              </span>
            </motion.button>
          </motion.form>
        )}
      </div>
    </WavyBackground>
  );
}
