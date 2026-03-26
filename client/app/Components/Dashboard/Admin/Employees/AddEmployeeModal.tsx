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
import { addEmployee } from "@/app/Services/Employee";
import { getAllRoles } from "@/app/Services/Role";
import { Loader2 } from "lucide-react";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
}: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    contactNumber: "",
  });

  useEffect(() => {
    if (isOpen) fetchRoles();
  }, [isOpen]);

  const fetchRoles = async () => {
    try {
      const data = await getAllRoles();
      setRoles(data);
    } catch (e) {
      console.error("Failed to fetch roles");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addEmployee(formData);
      toast.success("Employee invited successfully!");
      setFormData({ name: "", email: "", role: "", contactNumber: "" });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to add employee:", error);
      toast.error(error.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
            Invite Staff Member
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. John Doe"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Google Work Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="john@yourinstitute.com"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <p className="text-xs text-neutral-500 mt-1">
                They will use this email to "Sign in with Google".
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Assign Role <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val })}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a permission role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.length === 0 ? (
                    <div className="p-2 text-sm text-neutral-500 text-center">No Roles Found. Create a role first.</div>
                  ) : (
                    roles.map((r) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Contact Number
              </label>
              <Input
                placeholder="Optional CRM contact info"
                value={formData.contactNumber}
                onChange={(e) =>
                  setFormData({ ...formData, contactNumber: e.target.value })
                }
              />
            </div>
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
              disabled={loading || !formData.role}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
