"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/Context/Authcontext";
import {
  getStudentById,
  updateStudentProfilePicture,
} from "@/app/Services/Student";
import { Loader2, User, Mail, Phone, Hash, Camera } from "lucide-react";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Input } from "@/app/Components/ui/input";
import { Label } from "@/app/Components/ui/label";
import { toast } from "sonner";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading) return;

      const studentId =
        (user as any)?._id || (user as any)?.id || (user as any)?.userId;

      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getStudentById(studentId);
        setStudent(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Basic validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (!student?._id) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("profilePicture", file);

      await updateStudentProfilePicture(student._id, formData);

      // Refresh profile to show new image
      const updatedData = await getStudentById(student._id);
      setStudent(updatedData);
      toast.success("Profile picture updated successfully!");
    } catch (error: any) {
      console.error("Update failed", error);
      toast.error(error || "Failed to update profile picture");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        Error: Profile not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-6 gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            View your personal information.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <GlassCard className="md:col-span-1 p-6 flex flex-col items-center">
          <div
            className="relative group cursor-pointer mb-4"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-secondary shadow-xl relative">
              {student.profilePicture ? (
                <img
                  src={`/assets/profilePicture/${student.profilePicture}`}
                  alt={student.name}
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/400?text=User";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <User className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </div>

          <h2 className="text-xl font-bold text-center mb-1">{student.name}</h2>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {student.designation || "Student"}
          </p>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              student.status === "Active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {student.status || "Active"}
          </span>
          {uploading && (
            <p className="text-xs text-blue-500 mt-2 animate-pulse">
              Uploading...
            </p>
          )}
        </GlassCard>

        {/* Details Card */}
        <GlassCard className="md:col-span-2 p-6">
          <h3 className="text-xl font-bold mb-6">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-primary" /> Student ID
              </Label>
              <Input
                value={student.studentId}
                disabled
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Full Name
              </Label>
              <Input
                value={student.name}
                disabled
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> Email Address
              </Label>
              <Input
                value={student.email}
                disabled
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" /> Mobile Number
              </Label>
              <Input
                value={student.mobileNumber}
                disabled
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Input
                value={student.gender}
                disabled
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Batch Type</Label>
              <Input
                value={student.type}
                disabled
                className="bg-secondary/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Input
                value={student.branch?.name || "N/A"}
                disabled
                className="bg-secondary/50"
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
