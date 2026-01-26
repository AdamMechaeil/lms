"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Main = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Main").then((mod) => mod.Main),
  {
    loading: () => (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
    ssr: false,
  },
);

export default function Admin() {
  return <Main />;
}
