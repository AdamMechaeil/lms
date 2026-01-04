import mongoose from "mongoose";

export interface ITrainerAttendance extends mongoose.Document {
  trainerId: mongoose.Types.ObjectId;
  date: Date; // Midnight timestamp for the day
  totalDuration: number; // In milliseconds
  status: "Present" | "Half Day" | "Absent";
  sessionIds: mongoose.Types.ObjectId[]; // Refs to sessions used for calculation
}

const trainerAttendanceSchema = new mongoose.Schema<ITrainerAttendance>(
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
    totalDuration: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Present", "Half Day", "Absent"],
      required: true,
    },
    sessionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TrainerSession",
      },
    ],
  },
  { timestamps: true }
);

// Indexes
trainerAttendanceSchema.index({ trainerId: 1, date: 1 }, { unique: true }); // One record per day per trainer
trainerAttendanceSchema.index({ date: 1 }); // For querying by date range

const TrainerAttendanceModel = mongoose.model<ITrainerAttendance>(
  "TrainerAttendance",
  trainerAttendanceSchema
);

export default TrainerAttendanceModel;
