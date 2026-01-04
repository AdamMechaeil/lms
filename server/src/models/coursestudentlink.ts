import mongoose from "mongoose";

export interface CourseStudentLink extends mongoose.Document {
  course: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
}

const courseStudentLinkSchema = new mongoose.Schema<CourseStudentLink>({
  course: {
    type: mongoose.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  student: {
    type: mongoose.Types.ObjectId,
    ref: "Student",
    required: true,
  },
});

const CourseStudentLinkModel = mongoose.model(
  "CourseStudentLink",
  courseStudentLinkSchema
);

export default CourseStudentLinkModel;
