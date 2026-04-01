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
import { Textarea } from "@/app/Components/ui/textarea";
import { toast } from "sonner";
import { createLead } from "@/app/Services/Lead";
import { getAllCourses } from "@/app/Services/CoursesAndTopics";
import { Loader2 } from "lucide-react";

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddLeadModal({
  isOpen,
  onClose,
  onSuccess,
}: AddLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    courseInterested: "none",
    source: "Website",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) fetchRelatedData();
  }, [isOpen]);

  const fetchRelatedData = async () => {
    try {
      const courseData = await getAllCourses();
      setCourses(courseData.data || courseData || []);
    } catch (e) {
      console.error("Failed to fetch courses");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = { ...formData };
      if (payload.courseInterested === "none") {
        delete payload.courseInterested;
      }

      await createLead(payload);
      toast.success("Inquiry logged successfully!");
      setFormData({ name: "", email: "", mobileNumber: "", courseInterested: "none", source: "Website", notes: "" });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to add lead:", error);
      toast.error(error.response?.data?.message || "Failed to add lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
            Log New Inquiry
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Student Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="+1 234 567 890"
                required
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="student@example.com"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Course Interested
              </label>
              <Select
                value={formData.courseInterested}
                onValueChange={(val) => setFormData({ ...formData, courseInterested: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not decided</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Inquiry Source
              </label>
              <Select
                value={formData.source}
                onValueChange={(val) => setFormData({ ...formData, source: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Referral">Referral</SelectItem>
                  <SelectItem value="Walk-in">Walk-in</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
              Counselor Notes
            </label>
            <Textarea
              placeholder="Any specific requirements or background info..."
              className="resize-none h-20 bg-neutral-50 dark:bg-neutral-900/50"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
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
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Log Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
