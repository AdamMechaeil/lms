import { Request, Response, NextFunction } from "express";
import SubscriptionModel from "../models/subscription.js";
import StudentModel from "../models/student.js";

/**
 * Middleware to strictly enforce SaaS Plan limits.
 * Checks the Institute's active Subscription to ensure they haven't exceeded maxStudents.
 */
export const requireStudentLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const instituteId = (req as any).instituteId;

    if (!instituteId) {
       return res.status(401).json({ message: "Unauthorized: Missing context" });
    }

    // 1. Fetch the Active Subscription & its Grandfathered Limits
    const activeSubscription = await SubscriptionModel.findOne({ 
      institute: instituteId, 
      status: "active" 
    });

    if (!activeSubscription) {
      return res.status(403).json({ 
        message: "Forbidden: No active subscription found for this Institute. Please upgrade your plan." 
      });
    }

    const maxStudentsAllowed = activeSubscription.limits.maxStudents;

    // 2. Count current students belonging to this Institute
    // Note: The tenantPlugin dynamically ensures this ONLY counts this specific institute's students
    const currentStudentCount = await StudentModel.countDocuments();

    // 3. Prevent going over the limit
    if (currentStudentCount >= maxStudentsAllowed) {
      return res.status(403).json({ 
        message: `Limit Exceeded: Your current plan only allows ${maxStudentsAllowed} students. You currently have ${currentStudentCount}. Please ask the Institute Admin to upgrade the subscription.` 
      });
    }

    // Limits check passed!
    next();

  } catch (error) {
    console.error("Student Limit Middleware Error:", error);
    return res.status(500).json({ message: "Internal server error during limit verification." });
  }
};
