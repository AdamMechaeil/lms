"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/Context/Authcontext";
import { getAllBatches } from "@/app/Services/Batch";
import { getAllStudents } from "@/app/Services/Student";
import { Loader2, Layers, CalendarCheck, Users } from "lucide-react";
import { GlassCard } from "@/app/Components/ui/glass-card";
import { GoogleConnectModal } from "@/app/Components/ui/google-connect-modal";
import { Button } from "@/app/Components/ui/button";

export default function Main() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeBatches: 0,
    todaysBatches: 0,
    totalStudents: 0, // Placeholder
  });
  const [loading, setLoading] = useState(true);
  const [showGoogleConnect, setShowGoogleConnect] = useState(false);

  console.log("Trainer Main Rendered. User:", user);

  useEffect(() => {
    console.log("Trainer Main Effect Triggered. User:", user);
    if (
      user &&
      ((user as any)._id || (user as any).id || (user as any).userId)
    ) {
      console.log(
        "Calling fetchStats with ID:",
        (user as any)._id || (user as any).id || (user as any).userId,
      );
      fetchStats();
    } else {
      console.log("User condition failed in Effect");
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const trainerId =
        (user as any)._id || (user as any).id || (user as any).userId;
      if (!trainerId) return;

      // Fetch all batches for the trainer
      const params: any = {
        trainer: trainerId,
        limit: 100, // Fetch enough to calculate stats
      };

      const data = await getAllBatches(params);
      const batches: any[] = data.data || [];

      // Calculate stats
      const activeBatches = batches.filter(
        (b) => b.status === "Running",
      ).length;

      // Today's Batches Logic
      const today = new Date();
      const day = today.getDay(); // 0 = Sunday, 6 = Saturday
      const isWeekend = day === 0 || day === 6;

      const todaysBatches = batches.filter((b) => {
        if (b.status !== "Running") return false;
        if (isWeekend && b.type === "Weekends") return true;
        if (!isWeekend && b.type === "Weekdays") return true;
        return false;
      }).length;

      // Fetch Total Students
      let totalStudents = 0;
      try {
        const studentData = await getAllStudents({
          trainer: trainerId,
          limit: 1, // We only need the total count
        });
        totalStudents = studentData.total || 0;
      } catch (err) {
        console.error("Failed to fetch student count", err);
      }

      setStats({
        activeBatches,
        todaysBatches,
        totalStudents,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-6 gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trainer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {(user as any)?.name}. Here is an overview of your
            activity.
          </p>
        </div>
        <Button
          onClick={() => setShowGoogleConnect(true)}
          variant="outline"
          className="gap-2"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-4 h-4"
          />
          Connect Google (Dev)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Layers className="w-20 h-20 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
            Active Batches
          </h3>
          <p className="text-4xl font-bold text-primary">
            {stats.activeBatches}
          </p>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarCheck className="w-20 h-20 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
            Today's Batches
          </h3>
          <p className="text-4xl font-bold text-green-500">
            {stats.todaysBatches}
          </p>
        </GlassCard>

        {/* Optional: Total Students (Placeholder) */}
        <GlassCard className="p-6 relative overflow-hidden group opacity-50">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-20 h-20 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
            Total Students
          </h3>
          <p className="text-4xl font-bold text-blue-500">
            {stats.totalStudents}
          </p>
        </GlassCard>
      </div>

      <GoogleConnectModal
        isOpen={showGoogleConnect}
        onClose={() => setShowGoogleConnect(false)}
        trainerId={
          (user as any)?._id || (user as any)?.id || (user as any)?.userId
        }
        onSuccess={() => {
          // Optional: Refresh stats or show success message if needed
          console.log("Google Connected Successfully");
        }}
      />
    </div>
  );
}
