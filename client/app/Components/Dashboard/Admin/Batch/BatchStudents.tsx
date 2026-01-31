"use client";
import React, { useEffect, useState } from "react";
import { getAllStudents } from "@/app/Services/Student";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Loader2, Search, User, UserPlus, Trash2 } from "lucide-react";
import { Input } from "@/app/Components/ui/input";
import { Button } from "@/app/Components/ui/button";
import dynamic from "next/dynamic";
import { removeStudentFromBatch } from "@/app/Services/Batch";
import { toast } from "sonner";

const AddStudentToBatchModal = dynamic(
  () => import("./AddStudentToBatchModal"),
  { ssr: false },
);

interface BatchStudentsProps {
  batchId: string;
  branchId?: string;
}

interface Student {
  _id: string;
  name: string;
  email: {
    email: string;
  };
  studentId: string;
  profilePicture?: string;
}

export default function BatchStudents({
  batchId,
  branchId,
}: BatchStudentsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [batchId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudents({ batch: batchId, limit: 100 }); // Fetch up to 100 students
      setStudents(data.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (
      !confirm("Are you sure you want to remove this student from the batch?")
    )
      return;

    try {
      await removeStudentFromBatch({ batchId, studentId });
      toast.success("Student removed successfully");
      fetchStudents();
    } catch (error: any) {
      toast.error(error || "Failed to remove student");
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
          Students ({students.length})
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search students..."
              className="pl-9 bg-white/50 dark:bg-neutral-900/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add Student
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-20 text-neutral-500 bg-white/30 dark:bg-neutral-900/30 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700">
          No students found in this batch.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <GlassCard
              key={student._id}
              className="flex items-center gap-4 p-4 hover:bg-white/40 dark:hover:bg-neutral-800/40 transition-colors group relative"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                {student.profilePicture ? (
                  <img
                    src={student.profilePicture}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <User className="w-6 h-6 text-neutral-400" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-neutral-800 dark:text-neutral-100 truncate">
                  {student.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {student.studentId}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 truncate mt-0.5">
                  {student.email?.email || "No Email"}
                </p>
              </div>

              <button
                onClick={() => handleRemoveStudent(student._id)}
                className="absolute top-2 right-2 p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 dark:hover:bg-red-900/50"
                title="Remove from Batch"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </GlassCard>
          ))}
        </div>
      )}

      <AddStudentToBatchModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchStudents}
        batchId={batchId}
        branchId={branchId}
      />
    </div>
  );
}
