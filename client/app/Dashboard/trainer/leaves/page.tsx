"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Button } from "@/app/Components/ui/button";
import { Input } from "@/app/Components/ui/input";
import { Textarea } from "@/app/Components/ui/textarea";
import { Label } from "@/app/Components/ui/label";
import { Calendar, Loader2, Plus, History } from "lucide-react";
import { applyLeave, getMyLeaves } from "@/app/Services/Leave";
import { toast } from "sonner";
import moment from "moment";

const TrainerLeavesPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaves, setLeaves] = useState<any[]>([]);

  // Form State
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await getMyLeaves();
      if (res.success) {
        setLeaves(res.leaves);
      }
    } catch (error) {
      console.error("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await applyLeave({ startDate, endDate, reason });
      toast.success("Leave application submitted successfully!");
      setStartDate("");
      setEndDate("");
      setReason("");
      fetchLeaves(); // Refresh list
    } catch (error: any) {
      toast.error(error || "Failed to apply for leave");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-indigo-400" />
            Leave Management
          </h1>
          <p className="text-gray-400">Apply for leaves and track status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Apply Leave Form */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Apply for Leave
            </h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Start Date</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">End Date</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Reason</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for leave..."
                  className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {submitting ? (
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  "Submit Application"
                )}
              </Button>
            </form>
          </GlassCard>
        </div>

        {/* My Leaves List */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6 min-h-[500px]">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              Leave History
            </h2>

            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin w-8 h-8 text-indigo-400" />
              </div>
            ) : leaves.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No leave history found.
              </div>
            ) : (
              <div className="space-y-4">
                {leaves.map((leave, idx) => (
                  <motion.div
                    key={leave._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-white/10 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium 
                                            ${
                                              leave.status === "Approved"
                                                ? "bg-green-500/20 text-green-400"
                                                : leave.status === "Rejected"
                                                  ? "bg-red-500/20 text-red-400"
                                                  : "bg-yellow-500/20 text-yellow-400"
                                            }`}
                        >
                          {leave.status}
                        </span>
                        <span className="text-sm text-gray-400">
                          Applied {moment(leave.createdAt).fromNow()}
                        </span>
                      </div>
                      <h3 className="text-white font-medium">
                        {moment(leave.startDate).format("MMM DD, YYYY")} -{" "}
                        {moment(leave.endDate).format("MMM DD, YYYY")}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                        {leave.reason}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 block">
                        Duration
                      </span>
                      <span className="text-white font-mono">
                        {moment(leave.endDate).diff(
                          moment(leave.startDate),
                          "days",
                        ) + 1}{" "}
                        Days
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default TrainerLeavesPage;
