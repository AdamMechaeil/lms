import React from "react";
import Link from "next/link";
import { BRAND_NAME } from "@/app/Utils/Constants/Brandname";

export default function MainFooter() {
  return (
    <footer className="w-full py-12 px-4 border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-sm relative z-10 text-center">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="flex items-center gap-2 mb-6 opacity-80">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-extrabold text-lg">
              {BRAND_NAME.charAt(0)}
            </span>
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {BRAND_NAME}
          </span>
        </div>
        <p className="text-slate-500 dark:text-gray-400 text-sm mb-6 max-w-sm">
          Empowering the modern educator with limitless, scalable architecture.
        </p>
        <div className="flex gap-6 text-sm font-medium text-slate-600 dark:text-gray-400">
          <Link
            href="/Pricing"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/Auth/login"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/Auth/register"
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Register
          </Link>
        </div>
        <div className="mt-12 text-xs text-slate-400 dark:text-gray-600">
          &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
