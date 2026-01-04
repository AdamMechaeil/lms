import TrainerSessionModel from "../models/trainerSession.js";

// Run every 15 minutes
const CHECK_INTERVAL = 15 * 60 * 1000;

// Safety Net: If a session is "Active" but hasn't had activity for > 1 hour, assume server crashed/socket failed.
const CRASH_TIMEOUT = 60 * 60 * 1000;

export const initScheduler = () => {
  console.log(
    "Scheduler initialized: Monitoring Trainer Sessions (Safety Net)..."
  );

  setInterval(async () => {
    try {
      const now = new Date();
      const crashThreshold = new Date(now.getTime() - CRASH_TIMEOUT);

      const abandonedSessions = await TrainerSessionModel.find({
        status: "Active",
        lastActiveAt: { $lt: crashThreshold },
      });

      for (const session of abandonedSessions) {
        console.log(
          `Safety Net: Auto-closing crashed session for Trainer ${session.trainerId}`
        );

        session.endTime = session.lastActiveAt;
        session.status = "Auto-Closed";

        // Calculate duration based on when we LAST heard from them
        if (session.startTime) {
          session.duration =
            session.lastActiveAt.getTime() - session.startTime.getTime();
        }

        await session.save();
      }

      if (abandonedSessions.length > 0) {
        console.log(
          `Processed ${abandonedSessions.length} abandoned sessions.`
        );
      }
    } catch (error) {
      console.error("Scheduler Error:", error);
    }
  }, CHECK_INTERVAL);

  // Daily Attendance Calculation (Runs every 24 hours)
  // In a real production app, use 'node-cron' for precise timing (e.g., "0 1 * * *").
  // Since we are using setInterval, we'll just run this check periodically or set a separate long interval.
  // For simplicity here, we'll assume this server runs 24/7 and we check once a day.
  // Better approach here: Check periodically (e.g., every hour) if "yesterday's" attendance is calculated.
  // But to keep it simple for this user request without adding dependencies:

  const DAILY_CHECK_INTERVAL = 60 * 60 * 1000; // Check every hour

  setInterval(async () => {
    try {
      await calculateDailyAttendance();
    } catch (e) {
      console.error("Daily Calculation Error", e);
    }
  }, DAILY_CHECK_INTERVAL);
};

import TrainerModel from "../models/trainer.js";
import TrainerAttendanceModel from "../models/trainerAttendance.js";

const calculateDailyAttendance = async () => {
  // Target: Yesterday (since today is not over)
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const nextDay = new Date(yesterday);
  nextDay.setDate(nextDay.getDate() + 1);

  // 1. Get all trainers
  const trainers = await TrainerModel.find({});

  for (const trainer of trainers) {
    // Check if already calculated for yesterday
    const exists = await TrainerAttendanceModel.findOne({
      trainerId: trainer._id,
      date: yesterday,
    });

    if (exists) continue; // Already processed

    // 2. Aggregate sessions
    const sessions = await TrainerSessionModel.find({
      trainerId: trainer._id,
      startTime: { $gte: yesterday, $lt: nextDay },
      status: { $in: ["Completed", "Auto-Closed"] }, // Only finished sessions
    });

    const totalDurationMs = sessions.reduce(
      (acc, curr) => acc + (curr.duration || 0),
      0
    );
    const totalHours = totalDurationMs / (1000 * 60 * 60);

    let status: "Present" | "Half Day" | "Absent" = "Absent";

    if (totalHours > 5) {
      // > 5 hours (implies <= 8 also counts as Present, >8 is also Present)
      status = "Present";
    } else if (totalHours > 0) {
      // < 5 hours but > 0
      status = "Half Day";
    } else {
      status = "Absent";
    }

    // 3. Save Record
    await TrainerAttendanceModel.create({
      trainerId: trainer._id,
      date: yesterday,
      totalDuration: totalDurationMs,
      status,
      sessionIds: sessions.map((s) => s._id),
    });

    console.log(
      `Calculated Attendance for ${
        trainer.name
      }: ${status} (${totalHours.toFixed(2)} hrs)`
    );
  }
};
