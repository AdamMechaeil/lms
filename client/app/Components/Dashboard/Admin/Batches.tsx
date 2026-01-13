"use client";
import React, { useEffect, useState } from "react";
import { getAllBatches, deleteBatch } from "@/app/Services/Batch";
import { getAllBranches } from "@/app/Services/Branch";
import { getAllTrainers } from "@/app/Services/Trainer";
import { GlassCard } from "@/app/Components/ui/glass-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";
import { Button } from "@/app/Components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Calendar,
  Clock,
  Loader2,
  Trash2,
  Edit,
  MapPin,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const AddBatchModal = dynamic(() => import("./AddBatchModal"), {
  ssr: false,
});
const ConfirmationModal = dynamic(() => import("./ConfirmationModal"), {
  ssr: false,
});

interface Batch {
  _id: string;
  title: string;
  branch: {
    _id: string;
    name: string;
  };
  trainer: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  startDate: string;
  startTime: string;
  endTime: string;
  status: "Running" | "Completed";
  type: "Weekdays" | "Weekends";
}

interface Branch {
  _id: string;
  name: string;
}

interface Trainer {
  _id: string;
  name: string;
}

export default function Batches() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedTrainer, setSelectedTrainer] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    batchId: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    fetchBranches();
    fetchTrainers(); // Initial fetch for all trainers (or limited set)
  }, []);

  // Effect to handle branch change -> fetch related trainers
  useEffect(() => {
    fetchTrainers();
  }, [selectedBranch]);

  useEffect(() => {
    fetchBatches();
  }, [pagination.page, selectedBranch, selectedTrainer, selectedStatus]);

  const fetchBranches = async () => {
    try {
      const branchData = await getAllBranches();
      setBranches(branchData);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const fetchTrainers = async () => {
    try {
      if (selectedBranch === "all") {
        setTrainers([]);
        setSelectedTrainer("all");
        return;
      }

      const params: any = { limit: 100 };
      params.branch = selectedBranch;

      const trainerData = await getAllTrainers(params);
      setTrainers(trainerData.data || []);

      // If the currently selected trainer is not in the new list (and isn't "all"), reset it
      if (selectedTrainer !== "all") {
        const trainerExists = trainerData.data?.some(
          (t: Trainer) => t._id === selectedTrainer
        );
        if (!trainerExists) {
          setSelectedTrainer("all");
        }
      }
    } catch (error) {
      console.error("Failed to fetch trainers:", error);
    }
  };

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: 9,
      };
      if (selectedBranch !== "all") params.branch = selectedBranch;
      if (selectedTrainer !== "all") params.trainer = selectedTrainer;
      if (selectedStatus !== "all") params.status = selectedStatus;

      const data = await getAllBatches(params);
      setBatches(data.data);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (error) {
      console.error("Failed to fetch batches:", error);
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, batchId: id });
  };

  const handleEditClick = (batch: Batch, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBatch(batch);
    setIsAddModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBatch(deleteModal.batchId);
      toast.success("Batch deleted successfully");
      fetchBatches();
    } catch (error) {
      console.error("Failed to delete batch:", error);
      toast.error("Failed to delete batch");
    }
  };

  const handleAddBatch = () => {
    setEditingBatch(null);
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setEditingBatch(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
            Batches Management
          </h1>
          <Button
            onClick={handleAddBatch}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Batch
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500 ml-1">
              Branch
            </label>
            <Select
              value={selectedBranch}
              onValueChange={(value) => {
                setSelectedBranch(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-[180px] bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch._id} value={branch._id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500 ml-1">
              Trainer
            </label>
            <Select
              value={selectedTrainer}
              onValueChange={(value) => {
                setSelectedTrainer(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              disabled={selectedBranch === "all"}
            >
              <SelectTrigger className="w-[180px] bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 disabled:opacity-50">
                <SelectValue
                  placeholder={
                    selectedBranch === "all" ? "Select Branch First" : "Trainer"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trainers</SelectItem>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer._id} value={trainer._id}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-500 ml-1">
              Status
            </label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => {
                setSelectedStatus(value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              <SelectTrigger className="w-[150px] bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Running">Running</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : batches.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          No batches found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch) => (
            <GlassCard
              key={batch._id}
              className="relative group overflow-hidden cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
              onClick={() =>
                router.push(`/Dashboard/admin/batches/${batch._id}`)
              }
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <Users className="w-6 h-6" />
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    batch.status === "Running"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
                  }`}
                >
                  {batch.status}
                </div>
              </div>

              <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-100 mb-2 truncate">
                {batch.title}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                  <User className="w-4 h-4 text-neutral-400" />
                  <span>{batch.trainer.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span>{batch.branch.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span>
                    {new Date(batch.startDate).toLocaleDateString()} •{" "}
                    {batch.type}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span>
                    {batch.startTime} - {batch.endTime}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleEditClick(batch, e)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteClick(batch._id, e)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && batches.length > 0 && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-8">
          <p className="text-sm text-neutral-500">
            Showing {(pagination.page - 1) * 9 + 1} -{" "}
            {Math.min(pagination.page * 9, pagination.total)} of{" "}
            {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="w-10 h-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="w-10 h-10"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <AddBatchModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSuccess={fetchBatches}
        initialData={editingBatch}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, batchId: "" })}
        onConfirm={handleConfirmDelete}
        title="Delete Batch"
        description="Are you sure you want to delete this batch? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
