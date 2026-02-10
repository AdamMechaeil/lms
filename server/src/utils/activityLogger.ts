import ActivityLogModel from "../models/ActivityLog.js";
import { getIO } from "../socketHandler.js";

interface ActivityLogData {
  action: string;
  description: string;
  metadata?: any;
  actor?: any; // ObjectId or string
  target?: any; // ObjectId or string
}

export const logActivity = async (data: ActivityLogData) => {
  try {
    // 1. Save to DB
    const log = await ActivityLogModel.create(data);

    // 2. Emit Socket Event
    try {
      const io = getIO();
      // Broadcast to 'role_Admin' room so only admins see this
      io.to("role_Admin").emit("dashboard:new_activity", log);
    } catch (socketError) {
      // Socket might not be initialized during tests or scripts
      console.warn("Socket emission failed:", socketError);
    }

    return log;
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Non-blocking: We don't want to fail the main request just because logging failed
  }
};
