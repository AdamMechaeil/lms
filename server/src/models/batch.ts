import mongoose from "mongoose";

export interface Batch extends mongoose.Document {
  title: string;
  branch: mongoose.Types.ObjectId;
  trainer: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
  status: "Running" | "Completed";
  currentTopic: string;
  type: "Weekdays" | "Weekends";
  googleMeetLink: string;
}

const batchSchema = new mongoose.Schema<Batch>({
  title: {
    type: String,
    required: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trainer",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Running", "Completed"],
    default: "Running",
  },
  currentTopic: {
    type: String,
  },
  type: {
    type: String,
    enum: ["Weekdays", "Weekends"],
    required: true,
  },
  googleMeetLink: {
    type: String,
  },
});

const BatchModel = mongoose.model("Batch", batchSchema);

export default BatchModel;
