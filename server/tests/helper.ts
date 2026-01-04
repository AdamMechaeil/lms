import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../src/config/config.env") });

export const generateTestToken = (role: "Admin" | "Trainer") => {
  return jwt.sign(
    { email: "test@example.com", role: role },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );
};
