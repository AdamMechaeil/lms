"use client";
import React, { useEffect, useState } from "react";
import { getAllDomains, deleteDomain } from "@/app/Services/Domain";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Loader2, Trash2, Plus, Globe, Layout } from "lucide-react";
import { Button } from "@/app/Components/ui/button";
import AddDomainModal from "./AddDomainModal";
import ConfirmationModal from "./ConfirmationModal";

import { toast } from "sonner";

interface Domain {
  _id: string;
  name: string;
  description: string;
}

export default function Domains() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    domainId: "",
  });

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const data = await getAllDomains();
      setDomains(data);
    } catch (error) {
      console.error("Failed to fetch domains:", error);
      toast.error("Failed to load domains");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, domainId: id });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDomain(deleteModal.domainId);
      toast.success("Domain deleted successfully");
      fetchDomains();
    } catch (error) {
      console.error("Failed to delete domain:", error);
      toast.error("Failed to delete domain");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
            Domain Management
          </h1>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Domain
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : domains.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          No domains found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain) => (
            <GlassCard
              key={domain._id}
              className="relative group overflow-hidden flex flex-col h-full"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Layout className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-100">
                      {domain.name}
                    </h3>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(domain._id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1">
                <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3">
                  {domain.description}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <AddDomainModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchDomains}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, domainId: "" })}
        onConfirm={handleConfirmDelete}
        title="Delete Domain"
        description="Are you sure you want to delete this domain? This could affect linked trainers and courses."
        confirmText="Delete"
      />
    </div>
  );
}
