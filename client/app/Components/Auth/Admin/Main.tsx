"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BRAND_NAME } from "@/app/Utils/Constants/Brandname";
import { WavyBackground } from "@/app/Components/ui/wavy-background";
import { Adminlogin } from "@/app/Services/Auth";
import { useAuth } from "@/app/Context/Authcontext";
import { toast } from "sonner";

const TYPING_SPEED = 150;
const TEXT_TO_TYPE = `Welcome ${BRAND_NAME} Admin`;

export default function Main() {
  const { login } = useAuth();
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

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

  return (
    <WavyBackground className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen px-4">
      <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl space-y-8">
        {/* Animated Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-7xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400">
              {displayedText}
            </span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="inline-block w-2 h-16 ml-2 align-middle bg-primary rounded-full"
            />
          </h1>
          <p className="text-lg text-muted-foreground font-medium animate-pulse">
            Sign in to manage your LMS dashboard
          </p>
        </div>

        {/* Google Login Button */}
        {isTypingComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.2 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="mt-8 hover:brightness-90 transition-all duration-200 ease-in-out cursor-pointer"
          >
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  if (credentialResponse.credential) {
                    const response = await Adminlogin(
                      credentialResponse.credential
                    );
                    login(response);
                    toast.success("Login successful");
                    window.location.href = "/Dashboard/admin"; // Using direct navigation to ensure full reload if needed, or stick to router
                  }
                } catch (error: any) {
                  toast.error(error);
                }
              }}
              onError={() => {
                toast.error("Google Login Failed");
              }}
              size="large"
              shape="pill"
              theme="outline" // Changed to match theme better
            />
          </motion.div>
        )}
      </div>
    </WavyBackground>
  );
}
