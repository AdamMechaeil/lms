import mongoose from "mongoose";

export interface IAttendanceRecord {
  studentId: mongoose.Types.ObjectId;
  status: "Present" | "Absent" | "Late" | "Excused" | "Half Day";
}

export interface IAttendance extends mongoose.Document {
  batchId: mongoose.Types.ObjectId;
  date: Date;
  records: IAttendanceRecord[];
  trainerId: mongoose.Types.ObjectId;
  trainerStatus: "Present" | "Absent" | "Half Day";
  markedBy: mongoose.Types.ObjectId;
  markedByModel: "Trainer" | "Admin";
}

const attendanceSchema = new mongoose.Schema<IAttendance>(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    records: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        status: {
          type: String,
          enum: ["Present", "Absent", "Late", "Excused", "Half Day"],
          required: true,
        },
      },
    ],
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    trainerStatus: {
      type: String,
      enum: ["Present", "Absent", "Half Day"],
      default: "Present",
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "markedByModel",
    },
    markedByModel: {
      type: String,
      required: true,
      enum: ["Trainer", "Admin"],
    },
  },
  { timestamps: true }
);

// Indexes for performance
attendanceSchema.index({ batchId: 1, date: 1 }, { unique: true }); // One record per batch per day
attendanceSchema.index({ "records.studentId": 1 }); // Fast student history lookup
attendanceSchema.index({ trainerId: 1 }); // Fast trainer history lookup

const AttendanceModel = mongoose.model<IAttendance>(
  "Attendance",
  attendanceSchema
);

export default AttendanceModel;
