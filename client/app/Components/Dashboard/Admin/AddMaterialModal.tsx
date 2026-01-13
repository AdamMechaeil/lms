"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Loader2,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/app/Components/ui/input";
import { Label } from "@/app/Components/ui/label";
import { Button } from "@/app/Components/ui/button";
import { Textarea } from "@/app/Components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";
import { createMaterial } from "@/app/Services/Materials";

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMaterialModal({
  isOpen,
  onClose,
  onSuccess,
}: AddMaterialModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Document",
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setFormData({ title: "", description: "", type: "Document" });
      setFile(null);
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!file) newErrors.file = "File is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("type", formData.type);
      if (file) {
        data.append("files", file); // Backend expects "files" array, but handling single for now works if we send as array or single key depending on backend config.
        // Controller uses: const files = req.files as Express.Multer.File[];
        // So 'files' field name is critical.
      }

      await createMaterial(data);
      toast.success("Material created successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to create material", error);
      toast.error(error || "Failed to create material");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (formData.type) {
      case "Video":
        return <Video className="w-5 h-5 text-blue-500" />;
      case "Image":
        return <ImageIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-green-500" />;
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
            <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    {getIcon()}
                  </div>
                  <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                    Add Material
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g. React Fundamentals PDF"
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
                    <Label htmlFor="type">
                      Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Document">Document</SelectItem>
                        <SelectItem value="Video">Video</SelectItem>
                        <SelectItem value="Image">Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the material..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className={`min-h-[100px] ${
                        errors.description ? "border-red-500" : ""
                      }`}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">
                      File <span className="text-red-500">*</span>
                    </Label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                        file
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                          : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600"
                      }`}
                    >
                      <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="file"
                        className="cursor-pointer w-full flex flex-col items-center"
                      >
                        {file ? (
                          <>
                            <FileText className="w-8 h-8 text-blue-500 mb-2" />
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {file.name}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-blue-500 mt-2 hover:underline">
                              Click to change
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                              PDF, MP4, PNG, JPG up to 100MB
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                    {errors.file && (
                      <p className="text-xs text-red-500">{errors.file}</p>
                    )}
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
                  Upload Material
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
