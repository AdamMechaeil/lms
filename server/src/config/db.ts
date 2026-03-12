import mongoose from "mongoose";
import { tenantPlugin } from "../utils/tenantPlugin.js";

export async function connectDB() {
  try {
    const uri =
      (process.env.MONGO_URI as string) || "mongodb://localhost:27017/lms_db";
    if (!uri) throw new Error("MONGO_URI not set");

    // Apply global multi-tenant plugin
    mongoose.plugin(tenantPlugin);

    await mongoose.connect(uri);
    console.log("MongoDB connected with Multi-Tenant Plugin");
  } catch (err) {
    console.error("MongoDB connection failed", err);
    process.exit(1);
  }
}
