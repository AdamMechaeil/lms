import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface JWTPayload extends jwt.JwtPayload {
  email: string;
  role: "Admin" | "Trainer" | "student" | "Employee";
  instituteId?: string;
}

export const commonAuthenticator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Support both HTTP-only Cookies (Prod) and Bearer tokens (Testing)
  const token =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  try {
    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JWTPayload;
    if (!decode) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (
      decode.role !== "Admin" &&
      decode.role !== "Trainer" &&
      decode.role !== "student" &&
      decode.role !== "Employee"
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    (req as any).user = decode;
    if (decode.role === "Admin" || decode.role === "Employee") {
      (req as any).instituteId = decode.instituteId;
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
