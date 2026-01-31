"use client";
import React, { useEffect, useState } from "react";
import { getAllTrainers, deleteTrainer } from "@/app/Services/Trainer";
import { getAllBranches } from "@/app/Services/Branch";
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
  Search,
  User,
  GraduationCap,
  Briefcase,
  MapPin,
  Loader2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const AddTrainerModal = dynamic(() => import("./AddTrainerModal"), {
  ssr: false,
});
const ConfirmationModal = dynamic(() => import("./ConfirmationModal"), {
  ssr: false,
});

import { toast } from "sonner";

interface Trainer {
  _id: string;
  name: string;
  email: {
    email: string;
  };
  branch: {
    _id: string;
    name: string;
  };
  domain: {
    _id: string;
    name: string;
  };
  designation: string;
  profilePicture: string;
}

interface Branch {
  _id: string;
  name: string;
}

export default function Trainers() {
  const router = useRouter();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    trainerId: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchTrainers();
  }, [pagination.page, selectedBranch]);

  const fetchBranches = async () => {
    try {
      const data = await getAllBranches();
      setBranches(data);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const branchFilter =
        selectedBranch === "all" ? undefined : selectedBranch;
      const data = await getAllTrainers({
        page: pagination.page,
        limit: 9,
        branch: branchFilter,
      });
      setTrainers(data.data);
      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
      });
    } catch (error) {
      console.error("Failed to fetch trainers:", error);
      toast.error("Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, trainerId: id });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTrainer(deleteModal.trainerId);
      toast.success("Trainer deleted successfully");
      fetchTrainers();
    } catch (error) {
      console.error("Failed to delete trainer:", error);
      toast.error("Failed to delete trainer");
    }
  };

  const handleAddTrainer = () => {
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
            Trainers Management
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedBranch}
            onValueChange={(value) => {
              setSelectedBranch(value);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            <SelectTrigger className="w-[180px] bg-white/50 dark:bg-black/50 backdrop-blur-sm border-neutral-200 dark:border-neutral-800">
              <SelectValue placeholder="Filter by Branch" />
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

          <Button
            onClick={handleAddTrainer}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Trainer
          </Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : trainers.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          No trainers found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((trainer) => (
            <GlassCard
              key={trainer._id}
              className="relative group overflow-hidden cursor-pointer"
              onClick={() =>
                router.push(`/Dashboard/admin/trainers/${trainer._id}`)
              }
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-md border-2 border-white/20">
                  {trainer.profilePicture ? (
                    <img
                      src={trainer.profilePicture}
                      alt={trainer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <User className="w-8 h-8 text-neutral-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-100 truncate">
                    {trainer.name}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium truncate">
                    {trainer.designation}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-1">
                    {trainer.email.email}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                    <Briefcase className="w-4 h-4 text-neutral-400" />
                    <span>{trainer.domain.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                    <MapPin className="w-4 h-4 text-neutral-400" />
                    <span>{trainer.branch.name}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(trainer._id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && trainers.length > 0 && pagination.totalPages > 1 && (
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

      <AddTrainerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchTrainers}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, trainerId: "" })}
        onConfirm={handleConfirmDelete}
        title="Delete Trainer"
        description="Are you sure you want to delete this trainer? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
