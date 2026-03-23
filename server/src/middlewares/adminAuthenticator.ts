import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface JWTPayload extends jwt.JwtPayload {
  email: string;
  role: "Admin" | "Trainer";
  instituteId?: string;
}

export async function adminAuthenticator(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Support both HTTP-only Cookies (Prod) and Bearer tokens (Testing)
    const token =
      req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decode = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JWTPayload;
    if (!decode) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (decode.role != "Admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    //@ts-ignore
    req.instituteId = decode.instituteId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
