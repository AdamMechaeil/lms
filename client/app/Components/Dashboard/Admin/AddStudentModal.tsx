"use client";
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, Upload, User, Mail, Phone, Briefcase } from "lucide-react";
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
import { createStudent, updateStudent } from "@/app/Services/Student";
import { getAllBranches } from "@/app/Services/Branch";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

interface StudentFormInputs {
  name: string;
  email: string;
  mobileNumber: string;
  gender: "Male" | "Female" | "Other";
  type: "Weekdays" | "Weekends";
  branch: string;
}

export default function AddStudentModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AddStudentModalProps) {
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StudentFormInputs>({
    defaultValues: {
      name: "",
      email: "",
      mobileNumber: "",
      gender: "Male",
      type: "Weekdays",
      branch: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchBranches();
      if (initialData) {
        reset({
          name: initialData.name,
          email: initialData.email,
          mobileNumber: initialData.mobileNumber,
          gender: initialData.gender,
          type: initialData.type,
          branch: initialData.branch?._id || initialData.branch,
        });
        if (initialData.profilePicture) {
          setPreviewUrl(initialData.profilePicture);
        }
      } else {
        reset({
          name: "",
          email: "",
          mobileNumber: "",
          gender: "Male",
          type: "Weekdays",
          branch: "",
        });
        setProfilePicture(null);
        setPreviewUrl(null);
      }
    }
  }, [isOpen, initialData, reset]);

  const fetchBranches = async () => {
    try {
      const data = await getAllBranches({ limit: 100 });
      // Backend returns array directly for getAllBranches based on server controller
      setBranches(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Failed to fetch branches", error);
      toast.error("Failed to load branches");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = async (data: StudentFormInputs) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("mobileNumber", data.mobileNumber);
      formData.append("gender", data.gender);
      formData.append("type", data.type);
      formData.append("branch", data.branch);

      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      if (initialData) {
        await updateStudent(initialData._id, formData);
        toast.success("Student updated successfully");
      } else {
        await createStudent(formData);
        toast.success("Student created successfully");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving student:", error);
      toast.error(error || "Failed to save student");
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
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                  {initialData ? "Edit Student" : "Add Student"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Form Content */}
              <div className="overflow-y-auto p-6 flex-1">
                <form
                  id="student-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Profile Picture Upload */}
                  <div className="flex flex-col items-center gap-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition-colors relative group"
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload className="w-8 h-8 text-neutral-400 group-hover:text-blue-500 transition-colors" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-xs font-medium">Change</p>
                      </div>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <p className="text-sm text-neutral-500">
                      Upload Profile Picture
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                          {...register("name", {
                            required: "Name is required",
                          })}
                          className="pl-9"
                          placeholder="John Doe"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-xs">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                          {...register("email", {
                            required: "Email is required",
                          })}
                          className="pl-9"
                          placeholder="john@example.com"
                          type="email"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Mobile Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                          {...register("mobileNumber", {
                            required: "Mobile number is required",
                          })}
                          className="pl-9"
                          placeholder="+91 9876543210"
                        />
                      </div>
                      {errors.mobileNumber && (
                        <p className="text-red-500 text-xs">
                          {errors.mobileNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Branch</Label>
                      <Controller
                        control={control}
                        name="branch"
                        rules={{ required: "Branch is required" }}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Branch" />
                            </SelectTrigger>
                            <SelectContent>
                              {branches?.map((branch) => (
                                <SelectItem key={branch._id} value={branch._id}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.branch && (
                        <p className="text-red-500 text-xs">
                          {errors.branch.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Controller
                        control={control}
                        name="gender"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Batch Type Preference</Label>
                      <Controller
                        control={control}
                        name="type"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Weekdays">Weekdays</SelectItem>
                              <SelectItem value="Weekends">Weekends</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
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
                  type="submit"
                  form="student-form"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {initialData ? "Update Student" : "Create Student"}
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
