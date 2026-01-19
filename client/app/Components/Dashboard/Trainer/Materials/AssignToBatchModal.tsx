"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/app/Components/ui/input";
import { Button } from "@/app/Components/ui/button";
import { Label } from "@/app/Components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";
import { assignMaterialsToBatch } from "@/app/Services/Materials";
import { getAllBatches } from "@/app/Services/Batch";
import { useAuth } from "@/app/Context/Authcontext";

interface AssignToBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialId: string;
  materialTitle: string;
}

export default function AssignToBatchModal({
  isOpen,
  onClose,
  materialId,
  materialTitle,
}: AssignToBatchModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchMyBatches();
      setSelectedBatch("");
      setDescription("");
    }
  }, [isOpen]);

  const fetchMyBatches = async () => {
    try {
      const trainerId =
        (user as any)._id || (user as any).id || (user as any).userId;
      if (!trainerId) return;
      const params: any = { trainer: trainerId, limit: 100 };
      const data = await getAllBatches(params);
      setBatches(data.data);
    } catch (error) {
      console.error("Failed to fetch batches", error);
      toast.error("Failed to load batches");
    }
  };

  const handleAssign = async () => {
    if (!selectedBatch) return;

    setLoading(true);
    try {
      await assignMaterialsToBatch({
        batchId: selectedBatch,
        materials: [materialId], // Array of one
        description: description,
        date: new Date().toISOString(),
      });
      toast.success("Material assigned successfully");
      onClose();
    } catch (error: any) {
      console.error("Failed to assign material", error);
      toast.error(error || "Failed to assign material");
    } finally {
      setLoading(false);
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
            <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-neutral-200 dark:border-neutral-800 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 truncate pr-4">
                  Assign "{materialTitle}"
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Select Batch</Label>
                  <Select
                    value={selectedBatch}
                    onValueChange={setSelectedBatch}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch._id} value={batch._id}>
                          {batch.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Assignment Note (Optional)</Label>
                  <Input
                    placeholder="e.g. Please review before next class"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3 bg-neutral-50 dark:bg-neutral-950/50">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={loading || !selectedBatch}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Assign
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
