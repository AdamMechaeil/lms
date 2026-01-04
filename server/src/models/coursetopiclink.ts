import mongoose from "mongoose";

export interface CourseTopicLink extends mongoose.Document {
  course: mongoose.Types.ObjectId;
  topic: mongoose.Types.ObjectId;
}

const courseTopicLinkSchema = new mongoose.Schema<CourseTopicLink>({
  course: {
    type: mongoose.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  topic: {
    type: mongoose.Types.ObjectId,
    ref: "Topic",
    required: true,
  },
});

const CourseTopicLinkModel = mongoose.model<CourseTopicLink>(
  "CourseTopicLink",
  courseTopicLinkSchema
);

export default CourseTopicLinkModel;
