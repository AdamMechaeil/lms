"use client";
import React, { useEffect, useRef, useState } from "react";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Button } from "@/app/Components/ui/button";
import { toast } from "sonner";
import { Upload, Building2, Loader2, ImageIcon, Zap, CreditCard } from "lucide-react";
import Link from "next/link";
import AxiosInstance from "@/app/Utils/AxiosInstance";

export default function SettingsPage() {
  const [institute, setInstitute] = useState<{
    name: string;
    logoUrl?: string;
    currentSubscription?: {
      status: string;
      planId?: { name: string };
      endDate?: string;
      trialEndsAt?: string;
    };
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    AxiosInstance.get("/api/v1/admin/institute/profile")
      .then((res) => setInstitute(res.data))
      .catch(() => toast.error("Failed to load institute profile"));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only allow images
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("instituteLogo", selectedFile);

      const res = await AxiosInstance.patch(
        "/api/v1/admin/institute/branding",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setInstitute((prev) => prev ? { ...prev, logoUrl: res.data.logoUrl } : prev);
      setPreview(null);
      setSelectedFile(null);
      toast.success("Logo updated successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to upload logo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Institute Settings
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Manage your institute's branding shown across all user portals.
        </p>
      </div>

      {/* Branding Card */}
      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <Building2 className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Institute Branding
          </h2>
        </div>

        {/* Institute Name (read-only for now) */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Institute Name
          </p>
          <p className="text-lg font-bold text-neutral-900 dark:text-white">
            {institute?.name ?? "—"}
          </p>
        </div>

        {/* Logo Section */}
        <div className="space-y-4">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Institute Logo
          </p>

          {/* Current / Preview */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 flex-shrink-0">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : institute?.logoUrl ? (
                <img src={institute.logoUrl} alt="Institute Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-neutral-400">
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-[10px]">No logo</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Recommended: Square image, min 128×128px. PNG or JPG.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {institute?.logoUrl ? "Change Logo" : "Upload Logo"}
              </Button>
            </div>
          </div>

          {/* Save button — only shown after file is selected */}
          {selectedFile && (
            <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? "Uploading..." : "Save Logo"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSelectedFile(null); setPreview(null); }}
                disabled={uploading}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Plan & Billing Card */}
      <GlassCard className="p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <CreditCard className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Plan &amp; Billing
          </h2>
        </div>

        {(() => {
          const sub = institute?.currentSubscription;
          const planName = sub?.planId?.name ?? "Free";
          const status = sub?.status ?? "trialing";
          const isPaid = status === "active" && !planName.toLowerCase().includes("free");

          const statusColors: Record<string, string> = {
            active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            trialing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
            past_due: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            canceled: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
          };

          return (
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className={`w-4 h-4 ${isPaid ? "text-yellow-400 fill-yellow-400" : "text-indigo-400"}`} />
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">
                    {planName} Plan
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColors[status] ?? statusColors.trialing}`}>
                    {status}
                  </span>
                  
                  {status === "trialing" && sub?.trialEndsAt && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Ends {new Date(sub.trialEndsAt).toLocaleDateString()}
                    </span>
                  )}
                  {status === "active" && sub?.endDate && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Renews {new Date(sub.endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {!isPaid && (
                <Link href="/Pricing">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-500/20">
                    <Zap className="w-4 h-4" />
                    Upgrade Plan
                  </Button>
                </Link>
              )}
            </div>
          );
        })()}
      </GlassCard>
    </div>
  );
}
