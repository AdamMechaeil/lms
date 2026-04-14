"use client";

import {
  Building2,
  GraduationCap,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";
import { BentoGrid, BentoGridItem } from "../../ui/bento-grid";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
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
import { toast } from "sonner";
import { getDashboardStats, getRecentActivity } from "@/app/Services/Dashboard";
import { useSocket } from "@/app/Context/SocketContext";
import { formatDistanceToNow } from "date-fns";

interface Branch {
  _id: string;
  name: string;
}

export function Main() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [stats, setStats] = useState({
    totalBranches: 0,
    totalStudents: 0,
    totalTrainers: 0,
  });

  // Analytics State
  const [growthData, setGrowthData] = useState<number[]>([]);
  const [growthLabels, setGrowthLabels] = useState<string[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

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
        toast.error("Failed to fetch branches");
      }
    };
    fetchBranches();
  }, []);

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
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBranch]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const statsRes = await getDashboardStats();
        if (statsRes && statsRes.growth) {
          setGrowthData(statsRes.growth.data);
          setGrowthLabels(statsRes.growth.labels);
        }

        const activityRes = await getRecentActivity();
        if (Array.isArray(activityRes)) {
          setRecentActivity(activityRes);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      }
    };
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewActivity = (data: any) => {
      setRecentActivity((prev) => [data, ...prev].slice(0, 10));

      if (data.action === "STUDENT_REGISTERED") {
        setStats((prev) => ({
          ...prev,
          totalStudents: prev.totalStudents + 1,
        }));
        setGrowthData((prev) => {
          const newData = [...prev];
          if (newData.length > 0) {
            newData[newData.length - 1] += 1;
          }
          return newData;
        });
      } else if (data.action === "TRAINER_JOINED") {
        setStats((prev) => ({
          ...prev,
          totalTrainers: prev.totalTrainers + 1,
        }));
      }
    };

    socket.on("dashboard:new_activity", handleNewActivity);

    return () => {
      socket.off("dashboard:new_activity", handleNewActivity);
    };
  }, [socket, selectedBranch]);

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
                  i === 3 || i === 6 ? "md:col-span-2" : "",
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
            {/* Student Growth Chart - Custom SVG Line Graph */}
            <GlassCard className="relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-neutral-500" />
                <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
                  Student Growth
                </h3>
              </div>

              <div className="h-64 w-full relative">
                {growthData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={growthData.map((val, i) => ({
                        name: growthLabels[i],
                        students: val,
                      }))}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorStudents"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(0,0,0,0.8)",
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        itemStyle={{ color: "#fff" }}
                        labelStyle={{ color: "#9ca3af" }}
                      />
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#333"
                        opacity={0.1}
                      />
                      <Area
                        type="monotone"
                        dataKey="students"
                        stroke="#3b82f6"
                        fillOpacity={1}
                        fill="url(#colorStudents)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
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
                        {activity.description}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {activity.createdAt
                          ? formatDistanceToNow(new Date(activity.createdAt), {
                              addSuffix: true,
                            })
                          : "Just now"}
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
