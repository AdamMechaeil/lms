import { Request, Response } from "express";
import StudentModel from "../models/student.js";
import TrainerModel from "../models/trainer.js";
import BatchModel from "../models/batch.js";
import ActivityLogModel from "../models/ActivityLog.js";
import mongoose from "mongoose";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalStudents, totalTrainers, totalBatches] = await Promise.all([
      StudentModel.countDocuments(),
      TrainerModel.countDocuments(),
      BatchModel.countDocuments(),
    ]);

    // Student Growth (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Include current month
    sixMonthsAgo.setDate(1); // Start from beginning of that month

    const growthAgg = await StudentModel.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format aggregation result into arrays
    const growthData: number[] = [];
    const growthLabels: string[] = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Create a map for easy lookup
    const growthMap = new Map();
    growthAgg.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`;
      growthMap.set(key, item.count);
    });

    // Generate last 6 months labels and data (filling 0s)
    let currentDate = new Date(sixMonthsAgo);
    const now = new Date();

    while (currentDate <= now || growthLabels.length < 6) {
      if (growthLabels.length >= 6) break; // Ensure exactly 6

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // 1-based
      const key = `${year}-${month}`;

      growthLabels.push(monthNames[month - 1]);
      growthData.push(growthMap.get(key) || 0);

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.status(200).json({
      stats: {
        totalStudents,
        totalTrainers,
        totalBatches,
      },
      growth: {
        data: growthData, // [10, 20, ...]
        labels: growthLabels, // ['Jan', 'Feb', ...]
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// Fix imports if necessary
import ActivityLogModel from "../models/ActivityLog.js";

export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const logs = await ActivityLogModel.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ message: "Failed to fetch recent activity" });
  }
};
