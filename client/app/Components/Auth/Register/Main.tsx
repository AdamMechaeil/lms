"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_NAME } from "@/app/Utils/Constants/Brandname";
import { WavyBackground } from "@/app/Components/ui/wavy-background";
import { AdminRegister } from "@/app/Services/Auth";
import { useAuth } from "@/app/Context/Authcontext";
import { toast } from "sonner";
import { Label } from "@/app/Components/ui/label";
import { Input } from "@/app/Components/ui/input";
import { useRouter } from "next/navigation";

const TYPING_SPEED = 100;
const TEXT_TO_TYPE = `Register your Institute on ${BRAND_NAME}`;

export default function RegisterMain() {
  const { login } = useAuth();
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const router = useRouter();
  // Form State
  const [instituteName, setInstituteName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

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

  // Validate form before showing Google Button
  useEffect(() => {
    if (instituteName.length > 2 && subdomain.length > 2) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [instituteName, subdomain]);

  return (
    <WavyBackground className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl space-y-8 z-10 relative">
        {/* Animated Header */}
        <div className="space-y-2 text-center w-full">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400">
              {displayedText}
            </span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              className="inline-block w-1.5 h-8 ml-1 align-middle bg-primary rounded-full"
            />
          </h1>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">
            Start your Free 14-Day Trial today.
          </p>
        </div>

        {/* Form Inputs (Visible after typing completes) */}
        {isTypingComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="instituteName">Institute Name</Label>
              <Input
                id="instituteName"
                placeholder="e.g. Aakash Academy"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                className="bg-white/5 border-white/10 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2 pb-4">
              <Label htmlFor="subdomain">Desired Subdomain</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="subdomain"
                  placeholder="e.g. aakash"
                  value={subdomain}
                  onChange={(e) =>
                    setSubdomain(
                      e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""),
                    )
                  }
                  className="bg-white/5 border-white/10 focus-visible:ring-primary lowercase"
                />
                <span className="text-muted-foreground text-sm font-medium">
                  .lms.com
                </span>
              </div>
            </div>

            {/* Google Login Button (Reveals only when form is valid) */}
            <AnimatePresence>
              {isFormValid && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-center pt-2"
                >
                  <div className="hover:brightness-90 transition-all duration-200 cursor-pointer">
                    <GoogleLogin
                      onSuccess={async (credentialResponse) => {
                        try {
                          if (credentialResponse.credential) {
                            const response = await AdminRegister({
                              token: credentialResponse.credential,
                              instituteName,
                              subdomain,
                            });
                            login(response);
                            toast.success(
                              "Institute Registered! Please select a plan.",
                            );
                            router.push("/Pricing");
                          }
                        } catch (error: any) {
                          toast.error(error);
                        }
                      }}
                      onError={() => {
                        toast.error("Google Registration Failed");
                      }}
                      size="large"
                      shape="pill"
                      theme="outline"
                      text="signup_with"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </WavyBackground>
  );
}
