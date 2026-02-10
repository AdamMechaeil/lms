import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import path from "path";
// import { fileURLToPath } from "url"; // Removed

import { connectDB } from "./config/db.js";
import branchRouter from "./routes/branch.js";
import trainerRouter from "./routes/trainer.js";
import coursesandtopicsRouter from "./routes/coursesandtopics.js";
import studentRouter from "./routes/student.js";
import batchRouter from "./routes/batch.js";
import materialRouter from "./routes/materials.js";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import authRouter from "./routes/auth.js";
import domainRouter from "./routes/domain.js";
import attendanceRouter from "./routes/attendance.js";
import chatRouter from "./routes/chatRoutes.js";
import notificationRouter from "./routes/notification.js";
import leaveRouter from "./routes/leave.js";
import adminRouter from "./routes/admin.js";

// const __filename = fileURLToPath(import.meta.url); // Removed
// const __dirname = path.dirname(__filename); // Removed

// dotenv.config({ path: path.resolve(process.cwd(), "src/config/config.env") }); // Moved to server.ts

export const app = express();

app.use("/assets", express.static(path.join(process.cwd(), "assets")));

import { initScheduler } from "./utils/scheduler.js";

connectDB();
initScheduler();

// Essential middleware in correct order
import cookieParser from "cookie-parser";

// ... imports

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://192.168.1.21:3000",
      "http://localhost:3001",
      "https://lms-client-jry7.onrender.com",
    ], // Adjust as needed
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(morgan("combined"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Health check
app.get("/health", (req, res) => res.json({ status: "OK" }));

// Swagger UI
// Swagger UI
const swaggerFile = path.join(process.cwd(), "swagger_output.json");
if (fs.existsSync(swaggerFile)) {
  const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFile, "utf8"));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

/////Routes
app.use("/auth", authRouter);
app.use("/api/v1/branch", branchRouter);
app.use("/api/v1/trainer", trainerRouter);
app.use("/api/v1/coursesandtopics", coursesandtopicsRouter);
app.use("/api/v1/student", studentRouter);
app.use("/api/v1/batch", batchRouter);
app.use("/api/v1/material", materialRouter);
app.use("/api/v1/domain", domainRouter);
app.use("/api/v1/attendance", attendanceRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/leave", leaveRouter);
app.use("/api/v1/admin", adminRouter);
