"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { toast } from "sonner";
import { ConnectGoogle } from "@/app/Services/Auth";
import { useAuth } from "@/app/Context/Authcontext";
import { Loader2 } from "lucide-react";

interface GoogleConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainerId: string;
  onSuccess: (response: any) => void;
}

export const GoogleConnectModal = ({
  isOpen,
  onClose,
  trainerId,
  onSuccess,
}: GoogleConnectModalProps) => {
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      setLoading(true);
      try {
        const response = await ConnectGoogle(codeResponse.code, trainerId);
        toast.success("Google Account Connected Successfully!");
        onSuccess(response); // Logic to login user properly
        onClose();
      } catch (error: any) {
        toast.error(error || "Failed to connect Google Account");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Google Connection Failed");
    },
    scope:
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.readonly", // Required scopes
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-50 w-full max-w-md p-6 overflow-hidden border shadow-2xl bg-zinc-950/80 border-white/10 backdrop-blur-xl rounded-3xl"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div className="p-3 bg-blue-500/10 rounded-full ring-1 ring-blue-500/20">
                <AlertCircle className="w-8 h-8 text-blue-400" />
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  Connect Google Account
                </h2>
                <p className="text-sm text-zinc-400">
                  To enable automated meeting links and recording management, we
                  need permission to access your Google Calendar and Drive.
                </p>
              </div>

              {/* Button */}
              <button
                onClick={() => googleLogin()}
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition-all hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fab"
                        data-icon="google"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 488 512"
                      >
                        <path
                          fill="currentColor"
                          d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                        ></path>
                      </svg>
                      Connect with Google
                    </>
                  )}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
