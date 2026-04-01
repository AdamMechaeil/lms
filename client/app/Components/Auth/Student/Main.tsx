"use client";

import { useAuth } from "@/app/Context/Authcontext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BRAND_NAME } from "@/app/Utils/Constants/Brandname";
import { WavyBackground } from "@/app/Components/ui/wavy-background";
import { toast } from "sonner";
import { Loader2, User, Lock, Eye, EyeOff, Building2, Search, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Studentlogin, UpdateStudentPassword, SearchInstitutes } from "@/app/Services/Auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/Components/ui/dialog";

const TYPING_SPEED = 150;
const TEXT_TO_TYPE = `Welcome ${BRAND_NAME} Student`;

export default function Main() {
  const { login } = useAuth();
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Password Update State
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Institute Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [selectedInstitute, setSelectedInstitute] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setInstitutes([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await SearchInstitutes(searchQuery);
        setInstitutes(results);
      } catch (error) {
        console.error(error);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstitute) {
      toast.error("Please explicitly select your institute from the dropdown");
      return;
    }
    
    setLoading(true);
    try {
      const response = await Studentlogin({ 
        studentId, 
        password,
        instituteId: selectedInstitute._id 
      });
      if (response.message === "First Login! Update your password") {
        toast.info("First login detected. Please update your password.");
        setShowUpdatePassword(true);
      } else {
        toast.success("Login successful!");
        login({
          userId: response.userId,
          email: response.email,
          role: response.role,
          verified: response.verified,
        });
        router.push("/Dashboard/student");
      }
    } catch (error: any) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setUpdateLoading(true);
    try {
      await UpdateStudentPassword({
        studentId,
        oldPassword: password,
        newPassword,
        instituteId: selectedInstitute._id,
      });
      toast.success(
        "Password updated successfully! Please login with new password.",
      );
      setShowUpdatePassword(false);
      setPassword(""); // Clear password to force re-entry
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error);
    } finally {
      setUpdateLoading(false);
    }
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
            {/* Institute Selection */}
            <div className="space-y-2 relative">
              <div className="relative group">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search your Institute..."
                  value={selectedInstitute ? selectedInstitute.name : searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedInstitute) setSelectedInstitute(null);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-10 pr-10 py-3 bg-zinc-100/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/50 dark:focus:bg-white/10 transition-all font-medium"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {searchLoading ? (
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  ) : selectedInstitute ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Search className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Dropdown Results */}
              {showDropdown && (searchQuery || institutes.length > 0) && !selectedInstitute && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-hidden">
                  {institutes.length === 0 && searchQuery && !searchLoading ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No institutes found matching "{searchQuery}"
                    </div>
                  ) : (
                    institutes.map((inst) => (
                      <div
                        key={inst._id}
                        onClick={() => {
                          setSelectedInstitute(inst);
                          setSearchQuery("");
                          setShowDropdown(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-white/5 cursor-pointer transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                      >
                        {inst.logoUrl ? (
                          <img src={inst.logoUrl} alt={inst.name} className="w-8 h-8 rounded-md object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase" style={{ color: inst.primaryColor || '#38bdf8' }}>
                            {inst.name.substring(0, 2)}
                          </div>
                        )}
                        <span className="font-medium text-sm text-foreground">{inst.name}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

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
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-zinc-100/50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/50 dark:focus:bg-white/10 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !selectedInstitute}
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

      {/* Password Update Dialog */}
      <Dialog open={showUpdatePassword} onOpenChange={setShowUpdatePassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Password</DialogTitle>
            <DialogDescription>
              This is your first login. Please verify your old password and set
              a new one to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-4">
            {/* Read-only Student ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Student ID</label>
              <input
                type="text"
                value={studentId}
                disabled
                className="w-full px-4 py-2 bg-muted border rounded-lg cursor-not-allowed opacity-70"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-transparent border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={updateLoading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updateLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Update Password"
                )}
              </motion.button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </WavyBackground>
  );
}
