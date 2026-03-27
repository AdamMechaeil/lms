"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/Components/ui/dialog";
import { Button } from "@/app/Components/ui/button";
import { Input } from "@/app/Components/ui/input";
import { toast } from "sonner";
import { createRole } from "@/app/Services/Role";
import { Checkbox } from "@/app/Components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AVAILABLE_PERMISSIONS = [
  { id: "manage_leads", label: "Manage Leads (Admissions)" },
  { id: "manage_fees", label: "Manage Fees & EMIs" },
  { id: "manage_students", label: "Manage Full Students" },
  { id: "manage_trainers", label: "Manage Trainers" },
  { id: "manage_materials", label: "Manage Course Materials" },
  { id: "manage_employees", label: "Manage HR / Employees" },
];

export default function AddRoleModal({
  isOpen,
  onClose,
  onSuccess,
}: AddRoleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const togglePermission = (permId: string) => {
    setFormData((prev) => {
      if (prev.permissions.includes(permId)) {
        return { ...prev, permissions: prev.permissions.filter((p) => p !== permId) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createRole({
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      });

      toast.success("Role created successfully!");
      setFormData({ name: "", description: "", permissions: [] });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to create role:", error);
      toast.error(error.response?.data?.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
            Create Custom Role
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Role Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Senior Counselor"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-neutral-50 dark:bg-neutral-900/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1 block">
                Description
              </label>
              <Input
                placeholder="e.g. Can manage full admission flows..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-neutral-50 dark:bg-neutral-900/50"
              />
            </div>
            
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <label className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3 block">
                Access Permissions
              </label>
              <div className="grid grid-cols-1 gap-3">
                {AVAILABLE_PERMISSIONS.map((perm) => (
                  <div key={perm.id} className="flex items-center space-x-3 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-lg transition-colors cursor-pointer">
                    <Checkbox 
                      id={perm.id} 
                      checked={formData.permissions.includes(perm.id)}
                      onCheckedChange={() => togglePermission(perm.id)}
                    />
                    <label
                      htmlFor={perm.id}
                      className="text-sm font-medium leading-none cursor-pointer text-neutral-700 dark:text-neutral-300 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {perm.label}
                    </label>
                  </div>
                ))}
              </div>
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
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Role"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
