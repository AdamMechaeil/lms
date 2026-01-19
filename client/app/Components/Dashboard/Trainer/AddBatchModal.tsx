"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/app/Components/ui/input";
import { Label } from "@/app/Components/ui/label";
import { Button } from "@/app/Components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";
import { getAllBranches } from "@/app/Services/Branch";
import { getAllTrainers, getTrainerById } from "@/app/Services/Trainer";
import { createBatch, updateBatch } from "@/app/Services/Batch";
import { useAuth } from "@/app/Context/Authcontext";

interface AddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

interface Branch {
  _id: string;
  name: string;
}

interface Trainer {
  _id: string;
  name: string;
}

export default function TrainerAddBatchModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}) {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    branch: "",
    trainer: "",
    startDate: "",
    startTime: "",
    endTime: "",
    type: "",
    status: "Running",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setApiError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Reset form for new batch
      if (initialData) {
        setFormData({
          title: initialData.title,
          branch: initialData.branch._id || initialData.branch,
          trainer: initialData.trainer._id || initialData.trainer,
          startDate: initialData.startDate.split("T")[0],
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          type: initialData.type,
          status: initialData.status,
        });
      } else {
        setFormData({
          title: "",
          branch: "",
          trainer: "", // Will be set by user effect
          startDate: "",
          startTime: "",
          endTime: "",
          type: "",
          status: "Running",
        });
      }
      fetchDependencies();
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (
      user &&
      ((user as any)._id || (user as any).id || (user as any).userId)
    ) {
      const fetchTrainerDetails = async () => {
        setInitialLoading(true);
        try {
          const trainerId =
            (user as any)._id || (user as any).id || (user as any).userId;
          setFormData((prev) => ({ ...prev, trainer: trainerId }));

          const trainerData = await getTrainerById(trainerId);
          if (trainerData && trainerData.branch) {
            // trainerData.branch might be an object (populated) or string
            const branchId =
              typeof trainerData.branch === "object"
                ? trainerData.branch._id
                : trainerData.branch;
            setFormData((prev) => ({ ...prev, branch: branchId }));
          }
        } catch (error) {
          console.error("Failed to fetch trainer details", error);
          toast.error("Failed to load your profile details");
        } finally {
          setInitialLoading(false);
        }
      };

      fetchTrainerDetails();
    }
  }, [user]);

  const fetchDependencies = async () => {
    try {
      // Only fetch branches initially. Trainers fetched via effect.
      const branchData = await getAllBranches();
      setBranches(branchData);
    } catch (error) {
      console.error("Failed to fetch dependencies", error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.branch) {
      newErrors.branch = "Branch is required";
      toast.error(
        "Could not verify your branch. Please try refreshing or contact admin.",
      );
    }
    if (!formData.trainer) newErrors.trainer = "Trainer is required";
    if (!formData.startDate) newErrors.startDate = "Start Date is required";
    if (!formData.startTime) newErrors.startTime = "Start Time is required";
    if (!formData.endTime) newErrors.endTime = "End Time is required";
    if (!formData.type) newErrors.type = "Type is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (initialData) {
        await updateBatch(initialData._id, formData);
        toast.success("Batch updated successfully");
      } else {
        await createBatch(formData);
        toast.success("Batch created successfully");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to add/update batch", error);
      const errorMessage =
        typeof error === "string" ? error : "An unexpected error occurred";
      setApiError(errorMessage);
      toast.error(errorMessage);
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
            <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">
                  {initialData ? "Edit Batch" : "Add New Batch"}
                </h2>
                <div className="flex gap-2">
                  {apiError && (
                    <p className="text-sm text-red-500 font-medium self-center">
                      {apiError}
                    </p>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {initialLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">
                        Fetching your profile details...
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="title">
                          Batch Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          placeholder="e.g. MERN Stack Batch 1"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          className={errors.title ? "border-red-500" : ""}
                        />
                        {errors.title && (
                          <p className="text-xs text-red-500">{errors.title}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="startDate">
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startDate: e.target.value,
                            })
                          }
                          className={errors.startDate ? "border-red-500" : ""}
                        />
                        {errors.startDate && (
                          <p className="text-xs text-red-500">
                            {errors.startDate}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>
                          Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) =>
                            setFormData({ ...formData, type: value })
                          }
                        >
                          <SelectTrigger
                            className={
                              errors.type
                                ? "border-red-500 bg-transparent"
                                : "bg-transparent"
                            }
                          >
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Weekdays">Weekdays</SelectItem>
                            <SelectItem value="Weekends">Weekends</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.type && (
                          <p className="text-xs text-red-500">{errors.type}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="startTime">
                          Start Time <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={formData.startTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startTime: e.target.value,
                            })
                          }
                          className={errors.startTime ? "border-red-500" : ""}
                        />
                        {errors.startTime && (
                          <p className="text-xs text-red-500">
                            {errors.startTime}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endTime">
                          End Time <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={formData.endTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              endTime: e.target.value,
                            })
                          }
                          className={errors.endTime ? "border-red-500" : ""}
                        />
                        {errors.endTime && (
                          <p className="text-xs text-red-500">
                            {errors.endTime}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) =>
                            setFormData({ ...formData, status: value })
                          }
                        >
                          <SelectTrigger className="bg-transparent">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Running">Running</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3 bg-neutral-50 dark:bg-neutral-950/50">
                <Button variant="outline" onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || initialLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {initialData ? "Update Batch" : "Create Batch"}
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
