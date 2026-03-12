import mongoose, { Document, Schema } from "mongoose";

export interface IActivityLog extends Document {
  action: string;
  description: string;
  metadata?: any;
  actor?: mongoose.Types.ObjectId;
  target?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  institute: mongoose.Types.ObjectId;
}

const ActivityLogSchema: Schema = new Schema(
  {
    action: { type: String, required: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    actor: { type: Schema.Types.ObjectId, ref: "Admin" },
    target: { type: Schema.Types.ObjectId },
    institute: {
      type: Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
