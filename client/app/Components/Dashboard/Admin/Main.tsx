"use client";

import {
  Building2,
  GraduationCap,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";
import { BentoGrid, BentoGridItem } from "../../ui/bento-grid";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getAllBranches } from "@/app/Services/Branch";
import { getAllStudents } from "@/app/Services/Student";
import { getAllTrainers } from "@/app/Services/Trainer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Skeleton } from "../../ui/skeleton";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/app/Components/ui/glass-card";

interface Branch {
  _id: string;
  name: string;
  // add other fields if necessary
}

export function Main() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalStudents: 0,
    totalTrainers: 0,
  });

  const [loading, setLoading] = useState(true);

  // Fetch initial data (Branches)
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await getAllBranches();
        if (Array.isArray(res)) {
          setBranches(res);
          setStats((prev) => ({ ...prev, totalBranches: res.length }));
        } else if (res && Array.isArray(res.data)) {
          setBranches(res.data);
          setStats((prev) => ({ ...prev, totalBranches: res.data.length }));
        }
      } catch (error) {
        console.error("Failed to fetch branches", error);
      }
    };
    fetchBranches();
  }, []);

  // Fetch filtered data (Students & Trainers)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query =
          selectedBranch !== "all" ? { branch: selectedBranch } : {};

        const [studentRes, trainerRes] = await Promise.all([
          getAllStudents(query),
          getAllTrainers(query),
        ]);

        setStats((prev) => ({
          ...prev,
          totalStudents: studentRes?.total || 0,
          totalTrainers: trainerRes?.total || 0,
        }));
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBranch]);

  const statsItems = [
    {
      title: "Branches",
      metric: stats.totalBranches,
      description: "Active Branches",
      icon: <Building2 className="h-5 w-5 text-blue-500" />,
      watermark: <Building2 />,
    },
    {
      title: "Students",
      metric: stats.totalStudents,
      description: "Enrolled Students",
      icon: <GraduationCap className="h-5 w-5 text-emerald-500" />,
      watermark: <GraduationCap />,
    },
    {
      title: "Trainers",
      metric: stats.totalTrainers,
      description: "Certified Trainers",
      icon: <Users className="h-5 w-5 text-violet-500" />,
      watermark: <Users />,
    },
  ];

  const recentActivity = [
    { text: "New Batch 'React-24' created", time: "2 mins ago", type: "batch" },
    { text: "Trainer 'John Doe' joined", time: "1 hour ago", type: "user" },
    { text: "System Audit complete", time: "3 hours ago", type: "system" },
    {
      text: "New Student 'Alice' registered",
      time: "5 hours ago",
      type: "student",
    },
  ];

  const growthData = [40, 65, 80, 50, 90, 120];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-800 dark:text-neutral-200">
            Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Overview of your learning management system.
          </p>
        </div>

        <div className="w-[200px]">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger>
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch: any) => (
                <SelectItem
                  key={branch._id || branch.id}
                  value={branch._id || branch.id}
                >
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <BentoGrid className="mb-8 md:auto-rows-[9rem]">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4",
                  i === 3 || i === 6 ? "md:col-span-2" : ""
                )}
              >
                <Skeleton className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl" />
                <div className="group-hover/bento:translate-x-2 transition duration-200">
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))
          : statsItems.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                icon={item.icon}
                metric={(item as any).metric}
                watermark={(item as any).watermark}
                className={i === 3 || i === 6 ? "md:col-span-2" : ""}
              />
            ))}
      </BentoGrid>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          <>
            <GlassCard>
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                {[1, 2, 3, 4, 5, 6].map((_, i) => (
                  <div
                    key={i}
                    className="w-full flex flex-col gap-2 items-center"
                  >
                    <Skeleton className="w-full h-32 rounded-t-sm" />
                    <Skeleton className="w-8 h-3" />
                  </div>
                ))}
              </div>
            </GlassCard>
            <GlassCard>
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="space-y-6">
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="w-2 h-2 mt-2 rounded-full shrink-0" />
                    <div className="w-full">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </>
        ) : (
          <>
            {/* Student Growth Chart */}
            <GlassCard>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-neutral-500" />
                <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
                  Student Growth
                </h3>
              </div>
              <div className="h-64 flex items-end justify-between gap-2">
                {growthData.map((value, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 w-full group"
                  >
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(value / 120) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="w-full bg-blue-500/80 rounded-t-sm group-hover:bg-blue-600 transition-colors relative"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {value} students
                      </div>
                    </motion.div>
                    <span className="text-xs text-neutral-500">
                      {months[index]}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Recent Activity */}
            <GlassCard>
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-neutral-500" />
                <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
                  Recent Activity
                </h3>
              </div>
              <div className="space-y-6">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        {activity.text}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </>
        )}
      </div>
    </div>
  );
}
