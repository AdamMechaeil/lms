import mongoose from "mongoose";

export interface StudentBatchLink extends mongoose.Document {
  student: mongoose.Types.ObjectId;
  batch: mongoose.Types.ObjectId;
}

const studentBatchLinkSchema = new mongoose.Schema<StudentBatchLink>({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
});

const StudentBatchLinkModel = mongoose.model(
  "StudentBatchLink",
  studentBatchLinkSchema
);

export default StudentBatchLinkModel;
