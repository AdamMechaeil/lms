"use client";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, Loader2, UserPlus, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/app/Components/ui/input";
import { Button } from "@/app/Components/ui/button";
import { getAllStudents } from "@/app/Services/Student";
import { assignBatchToStudent } from "@/app/Services/Batch";

interface AddStudentToBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  batchId: string;
  branchId?: string;
}

interface Student {
  _id: string;
  name: string;
  studentId: string;
  email: { email: string };
  profilePicture?: string;
}

export default function AddStudentToBatchModal({
  isOpen,
  onClose,
  onSuccess,
  batchId,
  branchId,
}: AddStudentToBatchModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
      setSearchTerm("");
    }
  }, [isOpen]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Fetch students, filtering by branch if provided, and limit to 1000
      const data = await getAllStudents({ limit: 1000, branch: branchId });
      setStudents(data.data || []);
    } catch (error) {
      console.error("Failed to fetch students", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (studentId: string) => {
    setAssigningId(studentId);
    try {
      await assignBatchToStudent({ batchId, studentId });
      toast.success("Student added to batch successfully");
      onSuccess();
      // We don't close automatically so user can add multiple students
      // But we could refresh the list or mark this student as assigned
    } catch (error: any) {
      console.error("Failed to assign student", error);
      toast.error(error || "Failed to assign student");
    } finally {
      setAssigningId(null);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
            <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
                  Add Students to Batch
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <Input
                    placeholder="Search by name or ID..."
                    className="pl-9 bg-white dark:bg-neutral-800"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-10 text-neutral-500">
                    No students found.
                  </div>
                ) : (
                  filteredStudents.map((student) => (
                    <div
                      key={student._id}
                      className="flex items-center justify-between p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden flex-shrink-0">
                          {student.profilePicture && (
                            <img
                              src={student.profilePicture}
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800 dark:text-neutral-200">
                            {student.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {student.studentId} •{" "}
                            {student.email?.email || "No Email"}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssign(student._id)}
                        disabled={assigningId === student._id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {assigningId === student._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
