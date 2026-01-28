import { Request, Response, NextFunction } from "express";
import NotificationModel from "../models/notification.js";
import StudentModel from "../models/student.js";
import TrainerModel from "../models/trainer.js";
import StudentBatchLinkModel from "../models/studentbatchlink.js"; // Based on your previous checks
import { getIO } from "../socketHandler.js";
import mongoose from "mongoose";
import EmailModel from "../models/email.js";
// Send Notification
export const sendNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { title, message, recipientType, recipientIds } = req.body;
    let email = (req.user as any)?.email;
    const senderFromEmail: any = await EmailModel.findOne({ email });
    const sender = senderFromEmail?._id;
    let resolvedRecipientIds: mongoose.Types.ObjectId[] = [];

    // 1. Resolve Recipients
    switch (recipientType) {
      case "All":
        resolvedRecipientIds = [];
        break;

      case "AllTrainers":
        const trainers = await TrainerModel.find({}).select("_id");
        resolvedRecipientIds = trainers.map((t) => t._id);
        break;

      case "AllStudents":
        const students = await StudentModel.find({}).select("_id");
        resolvedRecipientIds = students.map((s) => s._id);
        break;

      case "Batch":
        if (recipientIds && recipientIds.length > 0) {
          const studentLinks = await StudentBatchLinkModel.find({
            batch: { $in: recipientIds },
          }).select("student");
          resolvedRecipientIds = studentLinks.map((link) => link.student);
        }
        break;

      case "Individual":
        resolvedRecipientIds = recipientIds;
        break;
    }

    // 2. Create Notification Record
    const newNotification = await NotificationModel.create({
      title,
      message,
      recipientType,
      recipientIds: resolvedRecipientIds, // Note: For "All", this is empty
      sender,
      readBy: [],
    });

    // 3. Emit Socket Events
    const io = getIO();

    if (recipientType === "All") {
      io.emit("receive_notification", newNotification);
    } else if (recipientType === "AllTrainers") {
      resolvedRecipientIds.forEach((id) => {
        io.to(`user_${id}`).emit("receive_notification", newNotification);
      });
    } else if (recipientType === "AllStudents") {
      resolvedRecipientIds.forEach((id) => {
        io.to(`user_${id}`).emit("receive_notification", newNotification);
      });
    } else if (recipientType === "Batch") {
      if (recipientIds && recipientIds.length > 0) {
        recipientIds.forEach((batchId: string) => {
          io.to(`batch_${batchId}`).emit(
            "receive_notification",
            newNotification,
          );
        });
      }
    } else {
      resolvedRecipientIds.forEach((id) => {
        io.to(`user_${id}`).emit("receive_notification", newNotification);
      });
    }

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      notification: newNotification,
    });
  } catch (error) {
    next(error);
  }
};

// Get Notifications for Logged In User
export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = (req.user as any)?.userId;
    const notifications = await NotificationModel.find({
      $or: [{ recipientType: "All" }, { recipientIds: { $in: [userId] } }],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Mark as Read
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.userId;

    await NotificationModel.findByIdAndUpdate(id, {
      $addToSet: { readBy: userId },
    });

    res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    next(error);
  }
};
