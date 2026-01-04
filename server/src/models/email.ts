import mongoose from "mongoose";

export interface Email {
  email: string;
  role: "Trainer" | "Admin";
}

const emailSchema = new mongoose.Schema<Email>(
  {
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["Trainer", "Admin"], required: true },
  },
  { timestamps: true }
);

const EmailModel = mongoose.model("Email", emailSchema);

export default EmailModel;
