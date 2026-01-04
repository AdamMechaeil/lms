import mongoose from "mongoose";

export interface ITrainerSession extends mongoose.Document {
  trainerId: mongoose.Types.ObjectId;
  date: Date; // Stores the date part only (normalized to midnight) for easy querying
  startTime: Date;
  endTime?: Date;
  lastActiveAt: Date;
  status: "Active" | "Completed" | "Auto-Closed";
  ipAddress?: string;
  device?: string;
  duration?: number; // In milliseconds
}

const trainerSessionSchema = new mongoose.Schema<ITrainerSession>(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
    },
    lastActiveAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Auto-Closed"],
      default: "Active",
    },
    ipAddress: {
      type: String,
    },
    device: {
      type: String,
    },
    duration: {
      type: Number, // Stored in milliseconds
    },
  },
  { timestamps: true }
);

// Indexes
trainerSessionSchema.index({ trainerId: 1, date: 1 }); // Find usage by date
trainerSessionSchema.index({ status: 1 }); // Find Active sessions to auto-close

const TrainerSessionModel = mongoose.model<ITrainerSession>(
  "TrainerSession",
  trainerSessionSchema
);

export default TrainerSessionModel;
