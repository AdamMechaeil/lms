import mongoose from "mongoose";

export interface Message extends mongoose.Document {
  batchId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderModel: "Student" | "Trainer" | "Admin";
  senderName: string;
  content: string;
  type: "text" | "image" | "video" | "audio" | "file";
  fileUrl?: string;
  createdAt: Date;
}

const messageSchema = new mongoose.Schema<Message>(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["Student", "Trainer", "Admin"],
    },
    senderName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "file"],
      default: "text",
    },
    fileUrl: {
      type: String,
    },
  },
  { timestamps: true },
);

const MessageModel = mongoose.model("Message", messageSchema);

export default MessageModel;
