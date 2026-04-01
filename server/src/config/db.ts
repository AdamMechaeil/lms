import mongoose from "mongoose";
import { tenantPlugin } from "../utils/tenantPlugin.js";

// CRITICAL FIX: Register global multi-tenant plugin immediately at module load time.
// If this is inside connectDB(), it runs too late—after Express has already imported
// and compiled the Student/Branch models, causing silent, massive data leaks!
mongoose.plugin(tenantPlugin);

export async function connectDB() {
  try {
    const uri =
      (process.env.MONGO_URI as string) || "mongodb://localhost:27017/lms_db";
    if (!uri) throw new Error("MONGO_URI not set");
    await mongoose.connect(uri);
    console.log("MongoDB connected with Multi-Tenant Plugin");
  } catch (err) {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  }
}
