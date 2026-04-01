"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/Components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";
import { Button } from "@/app/Components/ui/button";
import { toast } from "sonner";
import { convertLeadToStudent } from "@/app/Services/Lead";
import { getAllBranches } from "@/app/Services/Branch";
import { Loader2, ArrowRightCircle, ShieldCheck } from "lucide-react";

interface ConvertLeadModalProps {
  isOpen: boolean;
  leadId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ConvertLeadModal({
  isOpen,
  leadId,
  onClose,
  onSuccess,
}: ConvertLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    branch: "",
    gender: "",
    type: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchBranches();
    }
  }, [isOpen]);

  const fetchBranches = async () => {
    try {
      const data = await getAllBranches();
      setBranches(Array.isArray(data) ? data : data.data || []);
    } catch (e) {
      console.error("Failed to fetch branches");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await convertLeadToStudent(leadId, formData);
      toast.success("Lead successfully converted to Official Student!");
      setFormData({ branch: "", gender: "", type: "" });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to convert lead:", error);
      toast.error(error.response?.data?.message || "Failed to convert lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
              Enroll Student
            </DialogTitle>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            This action permanently converts the Lead into an official Student, generates their ID, and emails them their dashboard login credentials.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
              Assign Branch <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.branch}
              onValueChange={(val) => setFormData({ ...formData, branch: val })}
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select primary branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.length === 0 ? (
                  <div className="p-2 text-sm text-neutral-500 text-center">No Branches Found.</div>
                ) : (
                  branches.map((b) => (
                    <SelectItem key={b._id} value={b._id}>
                      {b.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Gender <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.gender}
                onValueChange={(val) => setFormData({ ...formData, gender: val })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Batch Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData({ ...formData, type: val })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Weekdays">Weekdays</SelectItem>
                  <SelectItem value="Weekends">Weekends</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-800 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="bg-white hover:bg-neutral-50 text-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.branch || !formData.gender || !formData.type}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[140px] shadow-lg shadow-green-500/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Convert & Enroll <ArrowRightCircle className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
