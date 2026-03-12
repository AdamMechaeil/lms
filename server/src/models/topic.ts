import mongoose from "mongoose";

export interface Topic extends mongoose.Document {
  name: string;
  duration: number;
  institute: mongoose.Types.ObjectId;
}

const topicSchema = new mongoose.Schema<Topic>({
  name: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
    required: true,
  },
});

const Topic = mongoose.model("Topic", topicSchema);

export default Topic;
