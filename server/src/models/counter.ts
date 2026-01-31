import mongoose from "mongoose";

interface Counter {
  id: string;
  seq: number;
}

const counterSchema = new mongoose.Schema({
  id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;
