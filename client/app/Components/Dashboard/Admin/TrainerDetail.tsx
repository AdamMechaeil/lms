"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Briefcase,
  Mail,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Laptop,
} from "lucide-react";
import { Button } from "@/app/Components/ui/button";
import { GlassCard } from "@/app/Components/ui/glass-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";
import { Input } from "@/app/Components/ui/input";
import { Label } from "@/app/Components/ui/label";
import dynamic from "next/dynamic";

const ConfirmationModal = dynamic(() => import("./ConfirmationModal"), {
  ssr: false,
});
const AddTrainerModal = dynamic(() => import("./AddTrainerModal"), {
  ssr: false,
});
// Assuming AddTrainerModal handles "Edit" mode if passed a trainer object,
// OR we might need to adjust it to support editing.
// For now, I'll assume we might need to modify AddTrainerModal to support edit,
// or I'll implement a separate Edit logic if that's complex.
// Actually, re-using AddTrainerModal for edit is a common pattern. I'll check if it supports it later.
// For now, let's focus on the display and attendance.

import { getTrainerAttendanceHistory } from "@/app/Services/Attendance";
import { deleteTrainer, getTrainerById } from "@/app/Services/Trainer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface Trainer {
  _id: string;
  name: string;
  email: { email: string };
  mobileNumber: string;
  designation: string;
  branch: { _id: string; name: string };
  domain: { _id: string; name: string };
  profilePicture?: string;
}

interface Session {
  _id: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  ipAddress?: string;
  device?: string;
  status: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  status: "Present" | "Absent" | "Half Day";
  totalDuration: number;
  sessionIds: Session[];
}

interface TrainerDetailProps {
  trainerId: string;
}

export default function TrainerDetail({ trainerId }: TrainerDetailProps) {
  const router = useRouter();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [startDate, setStartDate] = useState(
    format(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      "yyyy-MM-dd"
    )
  ); // First day of current month
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [statusFilter, setStatusFilter] = useState("All");

  // Expanded Sessions State
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Edit/Delete Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });

  useEffect(() => {
    fetchData();
  }, [trainerId, startDate, endDate, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attendanceData, trainerData] = await Promise.all([
        getTrainerAttendanceHistory({
          trainerId,
          startDate,
          endDate,
          status: statusFilter,
          limit: 31,
        }),
        getTrainerById(trainerId),
      ]);

      if (trainerData) {
        setTrainer(trainerData);
      }

      if (attendanceData.data) {
        setAttendance(attendanceData.data);
      } else {
        setAttendance([]);
      }
    } catch (error) {
      console.error("Failed to fetch details", error);
      toast.error("Failed to load trainer details");
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const handleDelete = async () => {
    try {
      await deleteTrainer(trainerId);
      toast.success("Trainer deleted successfully");
      router.push("/Dashboard/admin/trainers");
    } catch (error) {
      console.error("Failed to delete", error);
      toast.error("Failed to delete trainer");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
      case "Absent":
        return "text-red-500 bg-red-50 dark:bg-red-900/20";
      case "Half Day":
        return "text-amber-500 bg-amber-50 dark:bg-amber-900/20";
      default:
        return "text-neutral-500 bg-neutral-100";
    }
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Stats
  const totalPresent = attendance.filter((a) => a.status === "Present").length;
  const totalAbsent = attendance.filter((a) => a.status === "Absent").length;
  const totalHalfDay = attendance.filter((a) => a.status === "Half Day").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Profile Header */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative shadow-inner">
              {trainer?.profilePicture ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_DEV_BASE_URL}/assets/profilePicture/${trainer.profilePicture}`}
                  alt={trainer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <User className="w-10 h-10" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
                {trainer?.name || "Loading Trainer..."}
              </h1>
              <div className="flex flex-wrap gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{trainer?.designation}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{trainer?.branch?.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Laptop className="w-4 h-4" />
                  <span>{trainer?.domain?.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>
                    {typeof trainer?.email === "object"
                      ? (trainer.email as any).email
                      : trainer?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
              Edit Profile
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteModal({ isOpen: true })}
            >
              Delete
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* 2. Attendance Filters & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Card */}
        <GlassCard className="p-5 lg:col-span-1 space-y-4 h-fit">
          <h3 className="font-semibold text-lg">Filters</h3>
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Half Day">Half Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </GlassCard>

        {/* Stats & List */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalPresent}
              </span>
              <span className="text-sm text-emerald-800 dark:text-emerald-300">
                Present
              </span>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-xl border border-red-200 dark:border-red-800 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                {totalAbsent}
              </span>
              <span className="text-sm text-red-800 dark:text-red-300">
                Absent
              </span>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {totalHalfDay}
              </span>
              <span className="text-sm text-amber-800 dark:text-amber-300">
                Half Day
              </span>
            </div>
          </div>

          {/* Attendance List */}
          <div className="space-y-3">
            {attendance.map((record) => (
              <div key={record._id} className="group">
                {/* Main Row */}
                <GlassCard className="p-0 overflow-hidden hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors">
                  <div
                    onClick={() => toggleRow(record._id)}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg">
                        <CalendarIcon className="w-5 h-5 text-neutral-500" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800 dark:text-neutral-100">
                          {format(new Date(record.date), "EEE, dd MMM yyyy")}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {record.sessionIds?.length || 0} Sessions
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1 justify-end">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span className="text-sm font-medium">
                            {formatDuration(record.totalDuration)}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                      </div>
                      {expandedRows.has(record._id) ? (
                        <ChevronUp className="w-5 h-5 text-neutral-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedRows.has(record._id) && (
                    <div className="bg-neutral-50/50 dark:bg-black/20 border-t border-neutral-100 dark:border-white/5 p-4 pl-16 animate-in slide-in-from-top-2 duration-200">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-3">
                        Session Log
                      </h4>
                      <div className="space-y-2">
                        {record.sessionIds.map((session) => (
                          <div
                            key={session._id}
                            className="grid grid-cols-4 gap-4 text-sm p-2 rounded hover:bg-white dark:hover:bg-white/5"
                          >
                            <div className="col-span-1 font-mono text-neutral-600 dark:text-neutral-400">
                              {format(new Date(session.startTime), "HH:mm")} -{" "}
                              {session.endTime
                                ? format(new Date(session.endTime), "HH:mm")
                                : "Active"}
                            </div>
                            <div className="col-span-1 text-neutral-500">
                              {session.duration
                                ? formatDuration(session.duration)
                                : "-"}
                            </div>
                            <div
                              className="col-span-1 text-neutral-500 truncate"
                              title={session.device}
                            >
                              {session.device || "Unknown Device"}
                            </div>
                            <div className="col-span-1 text-right">
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  session.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-neutral-100 text-neutral-600"
                                }`}
                              >
                                {session.status}
                              </span>
                            </div>
                          </div>
                        ))}
                        {record.sessionIds.length === 0 && (
                          <p className="text-xs text-neutral-400 italic">
                            No detailed session logs available.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </GlassCard>
              </div>
            ))}
            {attendance.length === 0 && !loading && (
              <div className="text-center py-10 text-neutral-500 bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200">
                No attendance records found for this period.
              </div>
            )}
          </div>
        </div>
      </div>

      <AddTrainerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
        initialData={trainer}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleDelete}
        title="Delete Trainer"
        description="Are you sure you want to delete this trainer? This action cannot be undone."
        confirmText="Delete Trainer"
      />
    </div>
  );
}
