"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sidebar as SidebarPrimitive,
  SidebarBody,
  SidebarLink,
} from "../ui/sidebar";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/app/Utils/cn";
import { Logout } from "@/app/Services/Auth";
import { BRAND_NAME } from "@/app/Utils/Constants/Brandname";

const SIDEBAR_ITEMS = [
  {
    label: "Dashboard",
    href: "/Dashboard/admin",
    icon: (
      <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Trainers",
    href: "/Dashboard/trainers",
    icon: (
      <Users className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Students",
    href: "/Dashboard/students",
    icon: (
      <GraduationCap className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
  {
    label: "Branches",
    href: "/Dashboard/branches",
    icon: (
      <Building2 className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
    ),
  },
];

export const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await Logout();
    window.location.href = "/Auth/admin";
  };

  return (
    <SidebarPrimitive open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <div className="flex flex-col">
            <Link
              href="#"
              className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20 pl-2"
            >
              <div className="h-5 w-5 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="font-medium text-black dark:text-white whitespace-pre"
              >
                {BRAND_NAME}
              </motion.span>
            </Link>
          </div>

          {/* Links */}
          <div className="mt-8 flex flex-col gap-2">
            {SIDEBAR_ITEMS.map((item, idx) => {
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

        {/* Logout */}
        <div>
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
