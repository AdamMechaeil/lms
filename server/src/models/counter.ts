import mongoose from "mongoose";

interface Counter {
  id: string;
  seq: number;
  institute: mongoose.Types.ObjectId;
}

const counterSchema = new mongoose.Schema({
  id: { type: String, required: true },
  seq: { type: Number, default: 0 },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
    required: true,
  },
});

// Compound index so each institute can have its own counter for "studentId", "batchId", etc.
counterSchema.index({ id: 1, institute: 1 }, { unique: true });

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;
