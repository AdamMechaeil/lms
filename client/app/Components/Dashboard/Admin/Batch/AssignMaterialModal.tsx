"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Loader2,
  Check,
  Search,
  FileText,
  Video,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/app/Components/ui/input";
import { Button } from "@/app/Components/ui/button";
import {
  getAllMaterials,
  assignMaterialsToBatch,
} from "@/app/Services/Materials";
import { GlassCard } from "@/app/Components/ui/glass-card";

interface AssignMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  batchId: string;
}

interface Material {
  _id: string;
  title: string;
  type: "Video" | "Document" | "Image";
  description: string;
}

export default function AssignMaterialModal({
  isOpen,
  onClose,
  onSuccess,
  batchId,
}: AssignMaterialModalProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMaterials();
      setSearchTerm("");
      setSelectedMaterials([]);
    }
  }, [isOpen]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await getAllMaterials({ limit: 1000 }); // Fetch all for selection
      setMaterials(data.data);
    } catch (error) {
      console.error("Failed to fetch materials", error);
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedMaterials.length === 0) return;

    setAssigning(true);
    try {
      await assignMaterialsToBatch({
        batchId,
        materials: selectedMaterials,
      });
      toast.success("Materials assigned successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to assign materials", error);
      toast.error(error || "Failed to assign materials");
    } finally {
      setAssigning(false);
    }
  };

  const filteredMaterials = materials.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case "Video":
        return <Video className="w-4 h-4 text-blue-500" />;
      case "Image":
        return <ImageIcon className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-green-500" />;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
          >
            <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                  Assign Materials
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    placeholder="Search materials..."
                    className="pl-9 bg-white dark:bg-neutral-800"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : filteredMaterials.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500">
                    No materials found.
                  </div>
                ) : (
                  filteredMaterials.map((material) => {
                    const isSelected = selectedMaterials.includes(material._id);
                    return (
                      <div
                        key={material._id}
                        onClick={() => toggleSelection(material._id)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white dark:bg-neutral-700 rounded-md">
                            {getIcon(material.type)}
                          </div>
                          <div>
                            <p
                              className={`font-medium text-sm ${
                                isSelected
                                  ? "text-blue-700 dark:text-blue-300"
                                  : "text-neutral-800 dark:text-neutral-200"
                              }`}
                            >
                              {material.title}
                            </p>
                            <p className="text-xs text-neutral-500 line-clamp-1">
                              {material.description}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-950/50">
                <p className="text-sm text-neutral-500">
                  {selectedMaterials.length} selected
                </p>
                <Button
                  onClick={handleAssign}
                  disabled={assigning || selectedMaterials.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {assigning && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Assign to Batch
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
