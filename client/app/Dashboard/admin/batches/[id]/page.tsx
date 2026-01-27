"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  LayoutDashboard,
  Users,
  CalendarCheck,
  Video,
  Edit,
  Trash2,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import { getBatchById, deleteBatch } from "@/app/Services/Batch";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/app/Components/ui/button";

// Dynamic Imports for Performance
const BatchOverview = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Batch/BatchOverview"),
  { ssr: false },
);
const BatchStudents = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Batch/BatchStudents"),
  { ssr: false },
);
const BatchAttendance = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Batch/BatchAttendance"),
  { ssr: false },
);
const BatchRecordings = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Batch/BatchRecordings"),
  { ssr: false },
);
const BatchMaterials = dynamic(
  () => import("@/app/Components/Dashboard/Admin/Batch/BatchMaterials"),
  { ssr: false },
);
const AddBatchModal = dynamic(
  () => import("@/app/Components/Dashboard/Admin/AddBatchModal"),
  { ssr: false },
);
const BatchChat = dynamic(() => import("@/app/Components/Shared/BatchChat"), {
  ssr: false,
});
const ConfirmationModal = dynamic(
  () => import("@/app/Components/Dashboard/Admin/ConfirmationModal"),
  { ssr: false },
);

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Modules State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) fetchBatchDetails();
  }, [id]);

  const fetchBatchDetails = async () => {
    try {
      setLoading(true); // Keep loading true for full refresh or manage differently if partial
      const data = await getBatchById(id!);
      setBatch(data);
    } catch (error) {
      console.error("Failed to fetch batch details:", error);
      toast.error("Failed to load batch details");
      router.push("/Dashboard/admin/batches");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBatch = async () => {
    try {
      await deleteBatch(id!);
      toast.success("Batch deleted successfully");
      router.push("/Dashboard/admin/batches");
    } catch (error) {
      console.error("Failed to delete batch", error);
      toast.error("Failed to delete batch");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!batch) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users },
    { id: "attendance", label: "Attendance", icon: CalendarCheck },
    { id: "materials", label: "Materials", icon: BookOpen },
    { id: "recordings", label: "Recordings", icon: Video },
    { id: "chat", label: "Chat", icon: MessageCircle },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Batches
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
              {batch.title}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              {batch.branch?.name} • {batch.type}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" /> Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                        relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-t-lg
                        ${
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                        }
                    `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BatchOverview batch={batch} onRefresh={fetchBatchDetails} />
          </motion.div>
        )}
        {activeTab === "students" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BatchStudents batchId={batch._id} branchId={batch.branch?._id} />
          </motion.div>
        )}
        {activeTab === "attendance" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BatchAttendance
              batchId={batch._id}
              trainerId={batch.trainer._id}
            />
          </motion.div>
        )}
        {activeTab === "materials" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BatchMaterials batchId={batch._id} />
          </motion.div>
        )}
        {activeTab === "recordings" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BatchRecordings batchId={batch._id} />
          </motion.div>
        )}
        {activeTab === "chat" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BatchChat batchId={batch._id} />
          </motion.div>
        )}
      </div>
      <AddBatchModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchBatchDetails}
        initialData={batch}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteBatch}
        title="Delete Batch"
        description="Are you sure you want to delete this batch? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
