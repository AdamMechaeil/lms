import mongoose from "mongoose";

export async function connectDB() {
  try {
    const uri =
      (process.env.MONGO_URI as string) || "mongodb://localhost:27017/lms_db";
    if (!uri) throw new Error("MONGO_URI not set");
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  }
}
