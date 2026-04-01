"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VerifyToken } from "@/app/Services/Auth";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Direct route protection as mandated
        await VerifyToken();
        setIsVerifying(false);
      } catch (error) {
        // Zero-trust policy: Any failure bumps user natively to login
        router.push("/Auth/login");
      }
    };

    checkAuth();
  }, [router]);

  if (isVerifying) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-neutral-950">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return <>{children}</>;
}
