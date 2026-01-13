"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStudentById } from "@/app/Services/Student";
import { Loader2, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const StudentOverview = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Student/StudentOverview"),
  { ssr: false }
);
const StudentCourses = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Student/StudentCourses"),
  { ssr: false }
);
const StudentBatches = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Student/StudentBatches"),
  { ssr: false }
);
const StudentAttendance = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Student/StudentAttendance"),
  { ssr: false }
);

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "courses", label: "Courses" },
  { id: "batches", label: "Batches" },
  { id: "attendance", label: "Attendance" },
];

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id]);

  const fetchStudent = async () => {
    try {
      const data = await getStudentById(id!);
      setStudent(data);
    } catch (error) {
      console.error("Failed to fetch student", error);
      toast.error("Failed to load student details");
      router.push("/Dashboard/admin/students");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    // ... loading UI
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar / Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard className="p-6 flex flex-col items-center text-center sticky top-8">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-neutral-800 shadow-xl mb-4">
              {student.profilePicture ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_DEV_BASE_URL}/assets/profilePicture/${student.profilePicture}`}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                  {student.name.charAt(0)}
                </div>
              )}
            </div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white break-words w-full">
              {student.name}
            </h1>
            <p className="text-neutral-500 font-mono text-xs mt-1 break-all">
              {student.studentId}
            </p>
            <div
              className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${
                student.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {student.status}
            </div>
          </GlassCard>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap",
                  activeTab === tab.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "overview" && <StudentOverview student={student} />}
            {activeTab === "courses" && (
              <StudentCourses studentId={id as string} />
            )}
            {activeTab === "batches" && (
              <StudentBatches studentId={id as string} />
            )}
            {activeTab === "attendance" && (
              <StudentAttendance studentId={id as string} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
