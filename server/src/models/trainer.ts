import mongoose from "mongoose";

export interface Trainer extends mongoose.Document {
  name: string;
  email: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  domain: mongoose.Types.ObjectId;
  mobileNumber: string;
  designation: string;
  profilePicture: string;
  gender: string;
  googleRefreshToken?: string;
  firstLogin: boolean;
}

const trainerSchema = new mongoose.Schema<Trainer>(
  {
    name: { type: String, required: true },
    email: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Email",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    domain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      required: true,
    },
    mobileNumber: { type: String, required: true },
    designation: { type: String, required: true },
    profilePicture: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    googleRefreshToken: { type: String, select: false },
    firstLogin: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const TrainerModel = mongoose.model("Trainer", trainerSchema);

export default TrainerModel;
