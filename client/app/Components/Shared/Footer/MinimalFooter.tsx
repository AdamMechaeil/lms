import React from "react";
import { BRAND_NAME } from "@/app/Utils/Constants/Brandname";

export default function MinimalFooter() {
  return (
    <footer className="w-full py-4 text-center mt-auto">
      <div className="text-xs text-slate-400 dark:text-gray-500 font-medium">
        &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
