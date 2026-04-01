"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Sidebar as SidebarPrimitive,
  SidebarBody,
  SidebarLink,
} from "../ui/sidebar";
import { LogOut, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/app/Utils/cn";
import { Logout } from "@/app/Services/Auth";
import AxiosInstance from "@/app/Utils/AxiosInstance";

interface SidebarProps {
  links: {
    label: string;
    href: string;
    icon: React.ReactNode;
  }[];
  userType?: "admin" | "trainer" | "student";
}

export const Sidebar = ({ links, userType = "admin" }: SidebarProps) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [institute, setInstitute] = useState<{
    name: string;
    logoUrl?: string;
    currentSubscription?: {
      status: string;
      planId?: { name: string };
    };
  } | null>(null);

  useEffect(() => {
    // Admins use the admin-auth route; all other roles use the shared route
    const url = userType === "admin"
      ? "/api/v1/admin/institute/profile"
      : "/api/v1/admin/institute/profile/shared";
    AxiosInstance.get(url)
      .then((res) => setInstitute(res.data))
      .catch(() => {}); // silently fail — sidebar still works without it
  }, [userType]);

  const handleLogout = async () => {
    await Logout();
    let redirectUrl = "/Auth/login";
    if (userType === "student") redirectUrl = "/Auth/student";
    if (userType === "trainer") redirectUrl = "/Auth/trainer";
    window.location.href = redirectUrl;
  };

  return (
    <SidebarPrimitive open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 bg-white/20 dark:bg-black/20 backdrop-blur-md border-r border-slate-200 dark:border-white/10 shadow-xl transition-colors duration-300">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <div className="flex flex-col">
            <Link
              href="#"
              className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20 pl-2"
            >
              {/* Logo: image if uploaded, else letter avatar */}
              {institute?.logoUrl ? (
                <img
                  src={institute.logoUrl}
                  alt="Institute Logo"
                  className="h-6 w-6 rounded-md object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-6 w-6 bg-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {institute?.name?.charAt(0)?.toUpperCase() ?? "L"}
                  </span>
                </div>
              )}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="font-semibold text-black dark:text-white whitespace-pre truncate max-w-[120px]"
              >
                {institute?.name ?? "My Institute"}
              </motion.span>
            </Link>
          </div>

          {/* Links */}
          <div className="mt-4 flex flex-col gap-1">
            {links.map((item, idx) => {
              const isActive = pathname === item.href;
              return (
                <SidebarLink
                  key={idx}
                  link={item}
                  className={cn(
                    "pl-2",
                    isActive && "bg-neutral-200 dark:bg-neutral-800 rounded-lg"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Plan Marker + Logout */}
        <div className="space-y-1">
          {/* Only show for admin users once institute is loaded */}
          {userType === "admin" && institute && (() => {
            const sub = institute.currentSubscription;
            const planName = sub?.planId?.name ?? "Trial";
            
            return (
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2 mb-2 w-full">
                <SidebarLink
                  link={{
                    label: `${planName} Plan`,
                    href: "#",
                    icon: <Zap className="text-yellow-500 fill-yellow-500 h-5 w-5 flex-shrink-0" />
                  }}
                  className="cursor-default pl-2"
                  onClick={(e: any) => e.preventDefault()}
                />
              </div>
            );
          })()}

          <SidebarLink
            link={{
              label: "Logout",
              href: "#",
              icon: (
                <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
              ),
            }}
            onClick={(e: any) => {
              e.preventDefault();
              handleLogout();
            }}
          />
        </div>
      </SidebarBody>
    </SidebarPrimitive>
  );
};
