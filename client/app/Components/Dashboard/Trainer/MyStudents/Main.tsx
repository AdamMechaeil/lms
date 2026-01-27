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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";
import { motion } from "framer-motion";

export default function MyStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (
      user &&
      ((user as any)._id || (user as any).id || (user as any).userId)
    ) {
      fetchInitialData();
    }
  }, [user]);

  useEffect(() => {
    if (
      user &&
      ((user as any)._id || (user as any).id || (user as any).userId)
    ) {
      fetchStudents();
    }
  }, [selectedBatch, user]);

  const fetchInitialData = async () => {
    try {
      const trainerId =
        (user as any)._id || (user as any).id || (user as any).userId;
      if (!trainerId) return;

      // Fetch Trainer's Batches for Filter
      const batchesData = await getAllBatches({
        trainer: trainerId,
        limit: 100,
        status: "Running", // Optional: maybe we want all batches
      });
      setBatches(batchesData.data || []);
    } catch (error) {
      console.error("Failed to fetch batches", error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const trainerId =
        (user as any)._id || (user as any).id || (user as any).userId;
      if (!trainerId) return;

      const params: any = {
        limit: 1000,
        trainer: trainerId, // Always filter by trainer
      };

      if (selectedBatch && selectedBatch !== "all") {
        params.batch = selectedBatch;
      }

      // Fetch Students with backend filter
      const studentsData = await getAllStudents(params);
      setStudents(studentsData.data || []);
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
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <Select value={selectedBatch} onValueChange={setSelectedBatch}>
              <SelectTrigger className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-neutral-200 dark:border-white/10 h-11">
                <SelectValue placeholder="All Batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch._id} value={batch._id}>
                    {batch.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
