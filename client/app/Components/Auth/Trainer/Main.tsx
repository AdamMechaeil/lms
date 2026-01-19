"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BRAND_NAME } from "@/app/Utils/Constants/Brandname";
import { WavyBackground } from "@/app/Components/ui/wavy-background";
import { Trainerlogin } from "@/app/Services/Auth";
import { useAuth } from "@/app/Context/Authcontext";
import { toast } from "sonner";

import { GoogleConnectModal } from "@/app/Components/ui/google-connect-modal";

const TYPING_SPEED = 150;
const TEXT_TO_TYPE = `Welcome ${BRAND_NAME} Trainer`;

export default function Main() {
  const { login } = useAuth();
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [pendingTrainerId, setPendingTrainerId] = useState("");

  const [pendingLoginResponse, setPendingLoginResponse] = useState<any>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return (
    <WavyBackground className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen px-4">
      <div className="relative z-10 flex flex-col items-center justify-center p-12 rounded-3xl bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl space-y-8">
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
            Sign in to manage your training sessions
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
                    const response = await Trainerlogin(
                      credentialResponse.credential
                    );

                    if (response.firstLogin) {
                      // First login: show connect modal
                      setPendingTrainerId(response.trainerId);
                      setPendingLoginResponse(response);
                      setShowConnectModal(true);
                      toast.info(
                        "First login detected. Please connect your Google Account."
                      );
                    } else {
                      // Regular login
                      login(response);
                      toast.success("Login successful");
                      window.location.href = "/Dashboard/trainer";
                    }
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

      {/* Google Connect Modal for First Login */}
      <GoogleConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)} // Ideally prevent closing without connecting? User says "portal should open... for that i need refresh token" imply strict. But let's allow closing to try again if needed.
        trainerId={pendingTrainerId}
        onSuccess={(connectResponse) => {
          // On connection success, proceed to login user
          if (pendingLoginResponse) {
            const updatedUser = { ...pendingLoginResponse, firstLogin: false };
            login(updatedUser);
            window.location.href = "/Dashboard/trainer";
          }
        }}
      />
    </WavyBackground>
  );
}
