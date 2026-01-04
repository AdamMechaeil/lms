import mongoose from "mongoose";

export interface Student extends mongoose.Document {
  name: string;
  studentId: string;
  password: string;
  branch: mongoose.Types.ObjectId;
  mobileNumber: string;
  profilePicture: string;
  type: "Weekdays" | "Weekends";
  firstLogin: boolean;
  email: string;
  status: "Active" | "Completed";
  gender: string;
}

const studentSchema = new mongoose.Schema<Student>({
  name: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstLogin: {
    type: Boolean,
    default: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  profilePicture: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Other"],
    required: true,
  },
  type: {
    type: String,
    enum: ["Weekdays", "Weekends"],
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Completed"],
    required: true,
    default: "Active",
  },
});

const StudentModel = mongoose.model("Student", studentSchema);

export default StudentModel;
