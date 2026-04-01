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
import { Input } from "@/app/Components/ui/input";
import { toast } from "sonner";
import { initializeFeeStructure } from "@/app/Services/Fee";
import { getAllCourses } from "@/app/Services/CoursesAndTopics";
import { Loader2 } from "lucide-react";

interface InitializeFeeModalProps {
  isOpen: boolean;
  studentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InitializeFeeModal({
  isOpen,
  studentId,
  onClose,
  onSuccess,
}: InitializeFeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    courseReference: "none",
    totalPackageCost: "",
    upfrontDiscount: "0",
    paymentModeOptions: "EMI",
    numberOfEmiTarget: "3",
  });

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    try {
      const data = await getAllCourses();
      setCourses(data.data || data || []);
    } catch (e) {
      console.error("Failed to fetch courses");
    }
  };

  const netDue = (Number(formData.totalPackageCost) || 0) - (Number(formData.upfrontDiscount) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (netDue < 0) {
      return toast.error("Discount cannot exceed total package cost!");
    }
    
    setLoading(true);

    try {
      const payload: any = {
        student: studentId,
        totalPackageCost: Number(formData.totalPackageCost),
        upfrontDiscount: Number(formData.upfrontDiscount),
        paymentModeOptions: formData.paymentModeOptions,
      };

      if (formData.courseReference !== "none") {
        payload.courseReference = formData.courseReference;
      }
      
      if (formData.paymentModeOptions === "EMI") {
        payload.numberOfEmiTarget = Number(formData.numberOfEmiTarget);
      }

      await initializeFeeStructure(payload);
      toast.success("Fee Package strictly initialized!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to initialize fee:", error);
      toast.error(error.response?.data?.message || "Failed to initialize fee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
            Initialize Fee Package
          </DialogTitle>
          <p className="text-sm text-neutral-500 mt-1">Bind a master fee architecture to this student.</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
              Associated Course
            </label>
            <Select
              value={formData.courseReference}
              onValueChange={(val) => setFormData({ ...formData, courseReference: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">General / Unassigned</SelectItem>
                {courses.map((c: any) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Total Package Price (₹) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                required
                min="0"
                value={formData.totalPackageCost}
                onChange={(e) => setFormData({ ...formData, totalPackageCost: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Upfront Discount (₹)
              </label>
              <Input
                type="number"
                min="0"
                value={formData.upfrontDiscount}
                onChange={(e) => setFormData({ ...formData, upfrontDiscount: e.target.value })}
              />
            </div>
          </div>

          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg flex justify-between items-center border border-neutral-100 dark:border-neutral-800">
            <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">Net Formulated Due:</span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">₹ {netDue.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Payment Tracking <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.paymentModeOptions}
                onValueChange={(val) => setFormData({ ...formData, paymentModeOptions: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upfront">100% Upfront</SelectItem>
                  <SelectItem value="EMI">Monthly EMI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.paymentModeOptions === "EMI" && (
              <div>
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                  Target EMI Months
                </label>
                <Input
                  type="number"
                  min="1"
                  max="36"
                  value={formData.numberOfEmiTarget}
                  onChange={(e) => setFormData({ ...formData, numberOfEmiTarget: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="bg-white hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.totalPackageCost}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Lock Package"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
