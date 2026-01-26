import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Profile = dynamic(
  () => import("@/app/Components/Dashboard/Student/Profile"),
  {
    loading: () => (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
  },
);

export default function ProfilePage() {
  return <Profile />;
}
