"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { Button } from "@/app/Components/ui/button";
import { Loader2, Check, X, Calendar, User } from "lucide-react";
import { getAllLeaves, updateLeaveStatus } from "@/app/Services/Leave";
import { toast } from "sonner";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/Components/ui/dialog";

const AdminLeavesPage = () => {
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // leavingId being processed

  // Confirmation Modal
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await getAllLeaves();
      if (res.success) {
        setLeaves(res.leaves);
      }
    } catch (error) {
      console.error("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (leave: any) => {
    setSelectedLeave(leave);
    setConfirmOpen(true);
  };

  const confirmApproval = async () => {
    if (!selectedLeave) return;
    setActionLoading(selectedLeave._id);
    setConfirmOpen(false); // Close modal immediately

    try {
      // Status is always "Approved" if coming from the modal flow for now
      // Or we can check which button triggered it.
      // For now, let's assume the modal is only for Approval.
      // Rejection can be direct or separate modal.

      await updateLeaveStatus(selectedLeave._id, "Approved");

      toast.success("Leave Approved", {
        description: "Automated notification sent to students.",
      });
      fetchLeaves();
    } catch (error: any) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
      setSelectedLeave(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to REJECT this leave?")) return;
    setActionLoading(id);
    try {
      await updateLeaveStatus(id, "Rejected");
      toast.success("Leave Rejected");
      fetchLeaves();
    } catch (error) {
      toast.error("Failed to reject leave");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter pending first
  const sortedLeaves = [...leaves].sort((a, b) => {
    if (a.status === "Pending" && b.status !== "Pending") return -1;
    if (a.status !== "Pending" && b.status === "Pending") return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-indigo-400" />
            Trainer Leave Requests
          </h1>
          <p className="text-gray-400">
            Manage leave applications. Approving will notify students
            automatically.
          </p>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-10 h-10 text-indigo-400" />
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No leave requests found.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-white/5 font-medium text-gray-300 text-sm">
              <div className="col-span-3">Trainer</div>
              <div className="col-span-3">Duration</div>
              <div className="col-span-3">Reason</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Rows */}
            {sortedLeaves.map((leave) => (
              <div
                key={leave._id}
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors text-sm"
              >
                {/* Trainer Info */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                    {leave.trainer?.name?.[0] || "U"}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {leave.trainer?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {leave.trainer?.email}
                    </p>
                  </div>
                </div>

                {/* Duration */}
                <div className="col-span-3">
                  <p className="text-white">
                    {moment(leave.startDate).format("MMM DD")} -{" "}
                    {moment(leave.endDate).format("MMM DD, YYYY")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {moment(leave.endDate).diff(
                      moment(leave.startDate),
                      "days",
                    ) + 1}{" "}
                    Days
                  </p>
                </div>

                {/* Reason */}
                <div
                  className="col-span-3 text-gray-400 truncate pr-4"
                  title={leave.reason}
                >
                  {leave.reason}
                </div>

                {/* Status */}
                <div className="col-span-1 flex justify-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium 
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
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-end gap-2">
                  {leave.status === "Pending" && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                        onClick={() => handleActionClick(leave)}
                        disabled={!!actionLoading}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => handleReject(leave._id)}
                        disabled={!!actionLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {actionLoading === leave._id && (
                    <Loader2 className="animate-spin w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Confirmation Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-neutral-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Approve Leave Request?</DialogTitle>
            <DialogDescription className="text-gray-400">
              This will mark the leave as approved.
              <br />
              <br />
              <span className="text-yellow-400 font-medium">
                ⚠ An automated notification will be sent to all students in{" "}
                {selectedLeave?.trainer?.name}'s batches.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              className="text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApproval}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeavesPage;
