"use client";
import React, { useEffect, useState } from "react";
import { getAllBranches, deleteBranch } from "@/app/Services/Branch";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { MapPin, Loader2, Trash2, Plus, Building2 } from "lucide-react";
import { Button } from "@/app/Components/ui/button";
import AddBranchModal from "./AddBranchModal";
import ConfirmationModal from "./ConfirmationModal";

import { toast } from "sonner";

interface Branch {
  _id: string;
  name: string;
  address: string;
}

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    branchId: "",
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await getAllBranches();
      setBranches(data);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, branchId: id });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBranch(deleteModal.branchId);
      toast.success("Branch deleted successfully");
      fetchBranches();
    } catch (error) {
      console.error("Failed to delete branch:", error);
      toast.error("Failed to delete branch");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header logic moved here to align controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
            Branch Management
          </h1>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Branch
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : branches.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          No branches found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <GlassCard
              key={branch._id}
              className="relative group overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-100">
                      {branch.name}
                    </h3>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(branch._id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-white/10">
                <div className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                  <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <span className="leading-relaxed">{branch.address}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <AddBranchModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchBranches}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, branchId: "" })}
        onConfirm={handleConfirmDelete}
        title="Delete Branch"
        description="Are you sure you want to delete this branch? key entities linked to it might optionally face issues."
        confirmText="Delete"
      />
    </div>
  );
}
