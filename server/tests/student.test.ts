import request from "supertest";
import { app } from "../src/app";
import { generateTestToken } from "./helper";
import mongoose from "mongoose";
import { describe, it, beforeAll, afterAll, expect } from "@jest/globals";
describe("Student API", () => {
  let adminToken: string;

  beforeAll(async () => {
    // Wait for DB connection if necessary, or mock it.
    // In integration tests with a real DB, ensure it's connected.
    // For this example, we rely on app.ts calling connectDB().
    adminToken = generateTestToken("Admin");
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a new student (POST /api/v1/student/createStudent)", async () => {
    const res = await request(app)
      .post("/api/v1/student/createStudent")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Student",
        email: "teststudent@example.com",
        branch: new mongoose.Types.ObjectId(), // Fake valid ID
        mobileNumber: "1234567890",
        type: "Weekdays",
      });

    expect(res.status).toBe(201);
    expect(res.text).toBe("Added Student Successfully");
  });

  it("should get all students (GET /api/v1/student/getAllStudents)", async () => {
    const res = await request(app)
      .get("/api/v1/student/getAllStudents")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should fail without token (POST /api/v1/student/createStudent)", async () => {
    const res = await request(app).post("/api/v1/student/createStudent").send({
      name: "Fail Student",
    });

    expect(res.status).toBe(401);
  });
});
