"use client";
import React, { useEffect, useState } from "react";
import { getAllBatches } from "@/app/Services/Batch";
import { getAllStudents } from "@/app/Services/Student";
import { useAuth } from "@/app/Context/Authcontext";
import { GlassCard } from "@/app/Components/ui/glass-card";
import {
  Loader2,
  User,
  Search,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/app/Components/ui/input";
import { Button } from "@/app/Components/ui/button";
import { motion } from "framer-motion";

export default function MyStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (
      user &&
      ((user as any)._id || (user as any).id || (user as any).userId)
    ) {
      fetchMyStudents();
    }
  }, [user]);

  const fetchMyStudents = async () => {
    setLoading(true);
    try {
      const trainerId =
        (user as any)._id || (user as any).id || (user as any).userId;
      if (!trainerId) return;

      // 1. Fetch Trainer's Batches
      const batchParams: any = {
        trainer: trainerId,
        limit: 100,
      };
      const batchesData = await getAllBatches(batchParams);
      const myBatchIds = batchesData.data.map((b: any) => b._id);

      // 2. Fetch All Students (Optimized: If API supported batch filter we'd use it. For now, client-side filter)
      // Ideally, the backend should provide getStudentsByTrainer w endpoint.
      // We will fetch all students and filter by enrolled batches.
      const studentParams: any = {
        limit: 1000, // Fetch ample students to filter
      };
      const studentsData = await getAllStudents(studentParams);

      // 3. Filter Unique Students belonging to my batches
      // Assuming student has 'enrolledBatches' array of objects or strings
      const filteredStudents = studentsData.data.filter((student: any) => {
        if (!student.enrolledBatches) return false;
        // Check if any of student's enrolled batches matches my batch IDs
        return student.enrolledBatches.some((b: any) =>
          myBatchIds.includes(typeof b === "string" ? b : b._id),
        );
      });

      setStudents(filteredStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full flex flex-col p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            My Students
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            View students enrolled in your batches
          </p>
        </div>
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-neutral-200 dark:border-white/10 focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredStudents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <div className="p-6 rounded-full bg-neutral-100 dark:bg-white/5 mb-4">
            <User className="w-10 h-10 opacity-50" />
          </div>
          <p className="text-lg font-medium">No students found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
          {filteredStudents.map((student, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={student._id}
            >
              <GlassCard className="relative group p-0 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6 flex flex-col items-center text-center space-y-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white dark:border-neutral-800 shadow-lg">
                      {student.profilePicture ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_DEV_BASE_URL}/assets/profilePicture/${student.profilePicture}`}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                          {student.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 ${
                        student.status === "Active"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1 w-full">
                    <h3 className="font-bold text-lg text-neutral-800 dark:text-neutral-100 truncate">
                      {student.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-full inline-block">
                      {student.studentId}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="w-full space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-sm text-neutral-600 dark:text-neutral-300">
                    <div className="flex items-center gap-2 justify-center">
                      <Mail className="w-3 h-3 text-neutral-400" />
                      <span className="truncate max-w-[150px]">
                        {student.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      <span>{student.mobileNumber}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
