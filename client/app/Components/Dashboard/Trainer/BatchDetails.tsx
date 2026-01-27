"use client";

import React, { useEffect, useState } from "react";
import {
  getBatchById,
  updateBatch,
  createBatchMeetLink,
  assignBatchToStudent,
} from "@/app/Services/Batch";
import { GlassCard } from "../../ui/glass-card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Loader2,
  ArrowLeft,
  Edit2,
  Check,
  Zap,
  Copy,
  ExternalLink,
  ChevronDown,
  UserCheck,
  MessageCircle,
} from "lucide-react";
import BatchAttendance from "./BatchAttendance";
import BatchChat from "../../Shared/BatchChat";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { motion } from "framer-motion";
import { useAuth } from "@/app/Context/Authcontext";

interface Batch {
  _id: string;
  title: string;
  branch: {
    _id: string;
    name: string;
  };
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  status: "Running" | "Completed";
  type: "Weekdays" | "Weekends";
  googleMeetLink?: string;
}

export default function BatchDetails({ batchId }: { batchId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);

  // Edit Time State
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [savingTime, setSavingTime] = useState(false);

  // Meet Link State
  const [generatingLink, setGeneratingLink] = useState(false);

  // Add Student State
  const [studentIdInput, setStudentIdInput] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);

  // Attendance Section State
  const [isAttendanceExpanded, setIsAttendanceExpanded] = useState(false);

  // Chat Section State
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  const handleAddStudent = async () => {
    if (!studentIdInput.trim()) {
      toast.error("Please enter a Student ID");
      return;
    }
    try {
      setAddingStudent(true);
      await assignBatchToStudent({
        batchId: batchId,
        studentId: studentIdInput.trim(),
      });
      toast.success("Student added successfully");
      setStudentIdInput("");
    } catch (error: any) {
      console.error("Failed to add student", error);
      toast.error(typeof error === "string" ? error : "Failed to add student");
    } finally {
      setAddingStudent(false);
    }
  };

  useEffect(() => {
    fetchBatchDetails();
  }, [batchId]);

  const fetchBatchDetails = async () => {
    try {
      setLoading(true);
      const data = await getBatchById(batchId);
      setBatch(data);
      setNewStartTime(data.startTime);
      setNewEndTime(data.endTime);
    } catch (error) {
      console.error("Failed to fetch batch:", error);
      toast.error("Could not load batch details");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: "Running" | "Completed") => {
    if (!batch) return;
    try {
      // Optimistic update
      setBatch({ ...batch, status: newStatus });
      await updateBatch(batchId, { status: newStatus });
      toast.success(`Batch marked as ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update status");
      fetchBatchDetails(); // Revert on error
    }
  };

  const handleTimeUpdate = async () => {
    if (!batch) return;
    try {
      setSavingTime(true);
      await updateBatch(batchId, {
        startTime: newStartTime,
        endTime: newEndTime,
      });
      toast.success("Batch timing updated");
      setBatch({ ...batch, startTime: newStartTime, endTime: newEndTime });
      setIsTimeModalOpen(false);
    } catch (error) {
      console.error("Failed to update time", error);
      toast.error("Failed to update time");
    } finally {
      setSavingTime(false);
    }
  };

  const handleCreateMeetLink = async () => {
    if (!batch || !user) return;
    try {
      setGeneratingLink(true);
      const trainerId =
        (user as any)._id || (user as any).id || (user as any).userId;

      await createBatchMeetLink({
        batchId: batch._id,
        trainerId: trainerId,
      });

      toast.success("Meeting link generated successfully");
      fetchBatchDetails(); // Refresh to get the new link
    } catch (error) {
      console.error("Failed to create meet link", error);
      toast.error("Failed to generate meeting link");
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        Batch not found
        <Button variant="link" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground pl-0 gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Batches
      </Button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 mb-2">
            {batch.title}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{batch.branch.name}</span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-white/10 text-xs font-medium">
              {batch.type}
            </span>
          </div>
        </div>

        <GlassCard className="p-1.5 flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5">
          <button
            onClick={() => handleStatusChange("Running")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
              batch.status === "Running"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Running
          </button>
          <button
            onClick={() => handleStatusChange("Completed")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
              batch.status === "Completed"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Completed
          </button>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          <GlassCard className="p-6 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" /> Schedule & Timing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5">
                <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2 block">
                  Date
                </label>
                <div className="text-lg font-medium flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  {new Date(batch.startDate).toLocaleDateString()}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5 relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Dialog
                    open={isTimeModalOpen}
                    onOpenChange={setIsTimeModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Batch Timing</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input
                              type="time"
                              value={newStartTime}
                              onChange={(e) => setNewStartTime(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input
                              type="time"
                              value={newEndTime}
                              onChange={(e) => setNewEndTime(e.target.value)}
                            />
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={handleTimeUpdate}
                          disabled={savingTime}
                        >
                          {savingTime ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <label className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2 block">
                  Time
                </label>
                <div className="text-lg font-medium flex items-center gap-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  {batch.startTime} - {batch.endTime}
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Video className="w-5 h-5 text-primary" /> Class Link
            </h2>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10">
              {batch.googleMeetLink ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 overflow-hidden w-full">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      Google Meet Link Active
                    </p>
                    <div className="flex items-center gap-2 w-full">
                      <code className="px-2 py-1 bg-white/50 dark:bg-black/20 rounded text-xs text-muted-foreground truncate flex-1 block">
                        {batch.googleMeetLink}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => copyToClipboard(batch.googleMeetLink!)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      className="gap-2 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      onClick={() =>
                        window.open(batch.googleMeetLink, "_blank")
                      }
                    >
                      <ExternalLink className="w-4 h-4" /> Join
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCreateMeetLink}
                      disabled={generatingLink}
                    >
                      {generatingLink ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-3 text-blue-600 dark:text-blue-400">
                    <Video className="w-6 h-6" />
                  </div>
                  <h3 className="font-medium mb-1">No Meeting Link</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generate a Google Meet link for this batch
                  </p>
                  <Button
                    onClick={handleCreateMeetLink}
                    disabled={generatingLink}
                  >
                    {generatingLink ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" /> Generate Meet Link
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold mb-4">Batch Info</h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground block">
                  Branch
                </span>
                <span className="font-medium">{batch.branch.name}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground block">
                  Status
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    batch.status === "Running"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400"
                  }`}
                >
                  {batch.status}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold mb-4">Add Student</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="studentId"
                    placeholder="e.g. STU12345"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                  />
                  <Button
                    onClick={handleAddStudent}
                    disabled={addingStudent}
                    size="sm"
                  >
                    {addingStudent ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Add"
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the unique Student ID to add them to this batch
                  directly.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Attendance Section - Full Width */}
      <GlassCard className="overflow-hidden">
        <button
          onClick={() => setIsAttendanceExpanded(!isAttendanceExpanded)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Attendance</h2>
              <p className="text-sm text-muted-foreground">
                Mark attendance for all students in this batch
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
              isAttendanceExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <motion.div
          initial={false}
          animate={{
            height: isAttendanceExpanded ? "auto" : 0,
            opacity: isAttendanceExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="p-6 pt-0 border-t border-neutral-100 dark:border-white/5 mt-2">
            <div className="pt-6">
              <BatchAttendance batchId={batchId} />
            </div>
          </div>
        </motion.div>
      </GlassCard>

      {/* Chat Section - Full Width */}
      <GlassCard className="overflow-hidden">
        <button
          onClick={() => setIsChatExpanded(!isChatExpanded)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Batch Chat</h2>
              <p className="text-sm text-muted-foreground">
                Ask doubts, share updates, and discuss with students
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
              isChatExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <motion.div
          initial={false}
          animate={{
            height: isChatExpanded ? "auto" : 0,
            opacity: isChatExpanded ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="p-6 pt-0 border-t border-neutral-100 dark:border-white/5 mt-2">
            <div className="pt-6">
              <BatchChat batchId={batchId} />
            </div>
          </div>
        </motion.div>
      </GlassCard>
    </div>
  );
}
