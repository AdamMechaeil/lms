import mongoose from "mongoose";

export interface ILeave extends mongoose.Document {
  trainer: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: mongoose.Types.ObjectId;
}

const leaveSchema = new mongoose.Schema<ILeave>(
  {
    trainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // Assuming Admin model exists
    },
  },
  { timestamps: true },
);

const LeaveModel = mongoose.model<ILeave>("Leave", leaveSchema);

export default LeaveModel;
