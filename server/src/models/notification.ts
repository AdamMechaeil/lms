import mongoose from "mongoose";

export interface INotification extends mongoose.Document {
  title: string;
  message: string;
  recipientType: "All" | "AllTrainers" | "AllStudents" | "Batch" | "Individual";
  recipientIds: mongoose.Types.ObjectId[]; // Array of User IDs or Batch IDs
  sender: mongoose.Types.ObjectId; // Admin ID
  readBy: mongoose.Types.ObjectId[]; // Users who have read the notification
  createdAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipientType: {
      type: String,
      enum: ["All", "AllTrainers", "AllStudents", "Batch", "Individual"],
      required: true,
    },
    recipientIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        // Ref is dynamic based on recipientType, so we might skip strict ref or handle it in logic
        // But for Individual it could be Student or Trainer. For Batch it is Batch.
      },
    ],
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Assuming Admin model exists, if not need to check. Usually 'Admin' or 'User'
      required: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        // No strict ref here as it can be Student or Trainer
      },
    ],
  },
  { timestamps: true },
);

const NotificationModel = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);

export default NotificationModel;
