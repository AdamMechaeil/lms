import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Batches = dynamic(
  () => import("@/app/Components/Dashboard/Student/Batches"),
  {
    loading: () => (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
  },
);

export default function BatchesPage() {
  return <Batches />;
}
