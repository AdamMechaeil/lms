"use client";
import React, { useEffect, useState } from "react";
import { getAllBatches, updateBatch } from "@/app/Services/Batch";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { useAuth } from "@/app/Context/Authcontext";
import {
  Users,
  Calendar,
  Clock,
  Loader2,
  MapPin,
  ChevronRight,
  Search,
  Plus,
  MoreVertical,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/app/Components/ui/button";
import { Input } from "../../ui/input";
import TrainerAddBatchModal from "./AddBatchModal";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/Components/ui/select";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Batch {
  _id: string;
  title: string;
  branch: {
    _id: string;
    name: string;
  };
  startDate: string;
  startTime: string;
  endTime: string;
  status: "Running" | "Completed";
  type: "Weekdays" | "Weekends";
}

export default function Batches() {
  const { user } = useAuth();
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (
      user &&
      ((user as any)._id || (user as any).id || (user as any).userId)
    ) {
      fetchBatches();
    }
  }, [user]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const trainerId =
        (user as any)._id || (user as any).id || (user as any).userId;
      if (!trainerId) return;

      const params: any = {
        trainer: trainerId,
        limit: 100,
      };
      const data = await getAllBatches(params);
      setBatches(data.data);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter((batch) =>
    batch.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusChange = async (
    e: React.MouseEvent,
    batchId: string,
    newStatus: string
  ) => {
    e.stopPropagation(); // Prevent card click
    try {
      setUpdatingId(batchId);
      await updateBatch(batchId, { status: newStatus });
      toast.success("Batch status updated");
      fetchBatches();
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const navigateToDetails = (batchId: string) => {
    router.push(`/Dashboard/trainer/batches/${batchId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 h-full flex flex-col p-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            My Batches
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your assigned batches and schedules
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-neutral-200 dark:border-white/10 focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 shrink-0 h-11 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            <Plus className="w-5 h-5" /> New Batch
          </Button>
        </div>
      </div>

      {/* Batches Grid */}
      {filteredBatches.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <div className="p-6 rounded-full bg-neutral-100 dark:bg-white/5 mb-4">
            <Users className="w-10 h-10 opacity-50" />
          </div>
          <p className="text-lg font-medium">No batches found</p>
          <p className="text-sm">Create a new batch to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
          {filteredBatches.map((batch, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={batch._id}
            >
              <GlassCard
                className="relative group overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border border-white/10 dark:border-white/5 cursor-pointer"
                onClick={() => navigateToDetails(batch._id)}
              >
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 p-1">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                      <Users className="w-6 h-6" />
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <Select
                        defaultValue={batch.status}
                        onValueChange={(val) =>
                          handleStatusChange(
                            { stopPropagation: () => {} } as any,
                            batch._id,
                            val
                          )
                        }
                        disabled={updatingId === batch._id}
                      >
                        <SelectTrigger
                          className={`h-8 w-[110px] text-xs font-medium border-0 shadow-none transition-colors ${
                            batch.status === "Running"
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20"
                              : "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-500/20"
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Running">Running</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-xl mb-1 truncate group-hover:text-primary transition-colors">
                        {batch.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{batch.branch.name}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-neutral-50/50 dark:bg-white/5 border border-neutral-100 dark:border-white/5">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Date
                        </div>
                        <div className="font-semibold text-sm">
                          {new Date(batch.startDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-50/50 dark:bg-white/5 border border-neutral-100 dark:border-white/5">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Time
                        </div>
                        <div className="font-semibold text-sm">
                          {batch.startTime}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-white/5 flex justify-between items-center">
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-neutral-100 dark:bg-white/10 text-muted-foreground">
                      {batch.type}
                    </span>
                    <div className="text-primary text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                      View Details <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      <TrainerAddBatchModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchBatches}
      />
    </div>
  );
}
