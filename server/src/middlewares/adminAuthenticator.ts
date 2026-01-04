import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface JWTPayload extends jwt.JwtPayload {
  email: string;
  role: "Admin" | "Trainer";
}

export async function adminAuthenticator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JWTPayload;
    if (!decode) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (decode.role != "Admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
