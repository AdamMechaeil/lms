import { Request, Response, NextFunction } from "express";
import LeaveModel from "../models/leave.js";
import NotificationModel from "../models/notification.js";
import BatchModel from "../models/batch.js";
import StudentBatchLinkModel from "../models/studentbatchlink.js";
import { getIO } from "../socketHandler.js";
import EmailModel from "../models/email.js";

// Apply for Leave (Trainer)
export const applyLeave = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { startDate, endDate, reason } = req.body;
    const trainerId = (req.user as any)?.userId;

    const leave = await LeaveModel.create({
      trainer: trainerId,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      leave,
    });
  } catch (error) {
    next(error);
  }
};

// Approve/Reject Leave (Admin)
export const updateLeaveStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { leaveId } = req.params;
    const { status } = req.body; // Approved or Rejected
    const adminId = (req.user as any)?.userId;

    const leave = await LeaveModel.findById(leaveId).populate("trainer");
    if (!leave) {
      res.status(404).json({ success: false, message: "Leave not found" });
      return;
    }

    leave.status = status;
    leave.approvedBy = adminId;
    await leave.save();

    // AUTOMATED NOTIFICATION LOGIC
    if (status === "Approved") {
      const trainerId = leave.trainer._id;
      // 1. Find Batches assigned to this Trainer
      const batches = await BatchModel.find({
        trainer: trainerId,
        status: "Running",
      });

      const batchIds = batches.map((b) => b._id.toString());
      if (batchIds.length > 0) {
        const message = `Trainer ${
          (leave.trainer as any).name
        } is on leave from ${new Date(
          leave.startDate,
        ).toLocaleDateString()} to ${new Date(
          leave.endDate,
        ).toLocaleDateString()}.`;

        // Resolve Sender (Admin) ID correctly
        let email = (req.user as any)?.email;
        const senderFromEmail: any = await EmailModel.findOne({ email });
        const sender = senderFromEmail?._id;

        // Create Notification
        const newNotification = await NotificationModel.create({
          title: "Trainer On Leave",
          message: message,
          recipientType: "Batch",
          recipientIds: batchIds, // Array of Batch IDs
          sender: sender,
          readBy: [],
        });

        // Emit Socket Event to Batch Rooms
        const io = getIO();
        batchIds.forEach((batchId) => {
          io.to(`batch_${batchId}`).emit(
            "receive_notification",
            newNotification,
          );
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Leave ${status} successfully`,
      leave,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Leaves (Admin)
export const getAllLeaves = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const leaves = await LeaveModel.find().populate("trainer", "name email");
    res.status(200).json({ success: true, leaves });
  } catch (error) {
    next(error);
  }
};

// Get My Leaves (Trainer)
export const getMyLeaves = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId;
    const leaves = await LeaveModel.find({ trainer: userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, leaves });
  } catch (error) {
    next(error);
  }
};
