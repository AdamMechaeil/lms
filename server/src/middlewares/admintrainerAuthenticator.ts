import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface JWTPayload extends jwt.JwtPayload {
  email: string;
  role: "Admin" | "Trainer";
}

export const admintrainerAuthenticator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JWTPayload;
    if (!decode) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (decode.role !== "Admin" && decode.role !== "Trainer") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    (req as any).user = decode;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
