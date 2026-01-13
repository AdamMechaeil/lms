"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, Upload } from "lucide-react";
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
import { getAllDomains } from "@/app/Services/Domain";
import { addTrainer, updateTrainer } from "@/app/Services/Trainer";

interface AddTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any; // To support edit mode
}

interface Branch {
  _id: string;
  name: string;
}

interface Domain {
  _id: string;
  name: string;
}

export default function AddTrainerModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AddTrainerModalProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    designation: "",
    gender: "",
    branch: "",
    domain: "",
    profilePicture: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setApiError(""); // Clear error on open
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          email: initialData.email?.email || initialData.email || "",
          mobileNumber: initialData.mobileNumber || "",
          designation: initialData.designation || "",
          gender: initialData.gender || "",
          branch: initialData.branch?._id || initialData.branch || "",
          domain: initialData.domain?._id || initialData.domain || "",
          profilePicture: null,
        });
      } else {
        setFormData({
          name: "",
          email: "",
          mobileNumber: "",
          designation: "",
          gender: "",
          branch: "",
          domain: "",
          profilePicture: null,
        });
      }
      fetchDependencies();
    }
  }, [isOpen, initialData]);

  const fetchDependencies = async () => {
    try {
      const [branchData, domainData] = await Promise.all([
        getAllBranches(),
        getAllDomains(),
      ]);
      setBranches(branchData);
      setDomains(domainData);
    } catch (error) {
      console.error("Failed to fetch dependencies", error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.mobileNumber)
      newErrors.mobileNumber = "Mobile number is required";
    if (!formData.designation)
      newErrors.designation = "Designation is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.branch) newErrors.branch = "Branch is required";
    if (!formData.domain) newErrors.domain = "Domain is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          data.append(key, value);
        }
      });

      if (initialData) {
        await updateTrainer(initialData._id, data);
        toast.success("Trainer updated successfully");
      } else {
        await addTrainer(data);
        toast.success("Trainer added successfully");
      }
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: "",
        email: "",
        mobileNumber: "",
        designation: "",
        gender: "",
        branch: "",
        domain: "",
        profilePicture: null,
      });
    } catch (error: any) {
      console.error("Failed to add/update trainer", error);
      const errorMessage =
        typeof error === "string" ? error : "An unexpected error occurred";
      setApiError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, profilePicture: e.target.files[0] });
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
                  {initialData ? "Edit Trainer" : "Add New Trainer"}
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
                  {/* File Upload - Centered */}
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 group cursor-pointer">
                      {formData.profilePicture ? (
                        <img
                          src={URL.createObjectURL(formData.profilePicture)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400">
                          <Upload className="w-8 h-8 mb-2" />
                          <span className="text-xs">Upload Photo</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <Label className="text-xs text-neutral-500">
                      Profile Picture (Optional)
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-500">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobile">
                        Mobile Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={formData.mobileNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mobileNumber: e.target.value,
                          })
                        }
                        className={errors.mobileNumber ? "border-red-500" : ""}
                      />
                      {errors.mobileNumber && (
                        <p className="text-xs text-red-500">
                          {errors.mobileNumber}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="designation">
                        Designation <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="designation"
                        placeholder="Senior Trainer"
                        value={formData.designation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            designation: e.target.value,
                          })
                        }
                        className={errors.designation ? "border-red-500" : ""}
                      />
                      {errors.designation && (
                        <p className="text-xs text-red-500">
                          {errors.designation}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          setFormData({ ...formData, gender: value })
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.gender
                              ? "border-red-500 bg-transparent"
                              : "bg-transparent"
                          }
                        >
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && (
                        <p className="text-xs text-red-500">{errors.gender}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Branch <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.branch}
                        onValueChange={(value) =>
                          setFormData({ ...formData, branch: value })
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.branch
                              ? "border-red-500 bg-transparent"
                              : "bg-transparent"
                          }
                        >
                          <SelectValue placeholder="Select Branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch._id} value={branch._id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.branch && (
                        <p className="text-xs text-red-500">{errors.branch}</p>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>
                        Domain <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.domain}
                        onValueChange={(value) =>
                          setFormData({ ...formData, domain: value })
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.domain
                              ? "border-red-500 bg-transparent"
                              : "bg-transparent"
                          }
                        >
                          <SelectValue placeholder="Select Domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.map((domain) => (
                            <SelectItem key={domain._id} value={domain._id}>
                              {domain.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.domain && (
                        <p className="text-xs text-red-500">{errors.domain}</p>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3 bg-neutral-50 dark:bg-neutral-950/50">
                <Button variant="outline" onClick={onClose} type="button">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {initialData ? "Update Trainer" : "Add Trainer"}
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
