import mongoose from "mongoose";

export interface Email extends mongoose.Document {
  email: string;
  role: "Trainer" | "Admin";
  institute: mongoose.Types.ObjectId;
}

const emailSchema = new mongoose.Schema<Email>(
  {
    email: { type: String, required: true },
    role: { type: String, enum: ["Trainer", "Admin"], required: true },
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
  },
  { timestamps: true },
);

emailSchema.index({ email: 1, institute: 1 }, { unique: true });

const EmailModel = mongoose.model("Email", emailSchema);

export default EmailModel;
