import { Request, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import EmailModel from "../models/email.js";
import StudentModel from "../models/student.js";
import bcrypt from "bcrypt";
import { google } from "googleapis";
import TrainerModel from "../models/trainer.js";
import AdminModel from "../models/admin.js";
import InstituteModel from "../models/institute.js";
import SubscriptionModel from "../models/subscription.js";
import PlanModel from "../models/plan.js";

export async function adminGoogleRegister(req: Request, res: Response) {
  try {
    const { token, instituteName, subdomain } = req.body;
    if (!instituteName || !subdomain) {
      return res.status(400).json({ message: "Institute name and subdomain are required." });
    }

    const client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ message: "Invalid Google Token" });
    }

    const { email, name } = payload;
    
    // Check if email already exists
    const isEmailExist = await EmailModel.findOne({ email });
    if (isEmailExist) {
       return res.status(400).json({ message: "User already registered! Please login." });
    }

    // Check if subdomain is taken
    const isDomainExist = await InstituteModel.findOne({ subdomain });
    if (isDomainExist) {
       return res.status(400).json({ message: "Subdomain already taken. Choose another." });
    }

    // Create Free Plan if not exists
    let freePlan = await PlanModel.findOne({ name: "Free Trial" });
    if (!freePlan) {
      freePlan = await PlanModel.create({
        name: "Free Trial",
        description: "Default free trial plan",
        price: 0,
        currency: "INR",
        billingCycle: "monthly",
        features: {
          maxStudents: 50,
          maxStorageGB: 5,
          customDomain: false,
        }
      });
    }

    // Create Institute
    const institute = await InstituteModel.create({
      name: instituteName,
      subdomain,
      adminName: name || "Admin",
      adminEmail: email,
      isActive: true,
    });

    // Create Subscription
    const subscription = await SubscriptionModel.create({
      institute: institute._id,
      plan: freePlan._id,
      status: "active",
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year free trial
      limitsSnapshot: freePlan.features,
    });

    // Update Institute with subscription
    institute.currentSubscription = subscription._id as any;
    await institute.save();

    // Create Email (Role: Admin)
    const newEmail = await EmailModel.create({
      email,
      role: "Admin",
      institute: institute._id,
    });

    // Create Admin Profile
    const admin = await AdminModel.create({
      name: name || "Admin",
      email: newEmail._id,
      institute: institute._id,
    });

    // Generate JWT
    const jwtToken = jwt.sign(
      { email, role: "Admin", userId: admin._id, instituteId: institute._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "9h" }
    );

    res.cookie("accessToken", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 9 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "Registration successful",
      role: "Admin",
      userId: admin._id,
      instituteId: institute._id,
      email: email,
      verified: true,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function adminGoogleLogin(req: Request, res: Response) {
  try {
    const { token } = req.body;
    const client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID);

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ message: "Invalid Google Token" });
    }

    const { email } = payload;
    const isEmailExist = await EmailModel.findOne({ email });
    if (isEmailExist) {
      if (isEmailExist.role !== "Admin") {
        return res
          .status(401)
          .json({ message: "Unauthorized! You are not an Admin." });
      }
      const admin = await AdminModel.findOne({ email: isEmailExist._id });
      const jwtToken = jwt.sign(
        { 
          email, 
          role: isEmailExist.role, 
          userId: admin?._id,
          instituteId: isEmailExist.institute 
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "9h",
        },
      );

      res.cookie("accessToken", jwtToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 9 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Login successful",
        role: isEmailExist.role,
        userId: admin?._id,
        email: email,
        verified: true,
      });
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function trainerGoogleLogin(req: Request, res: Response) {
  try {
    const { token } = req.body;
    const client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID);

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ message: "Invalid Google Token" });
    }

    const { email } = payload;
    const isEmailExist = await EmailModel.findOne({ email });
    if (isEmailExist) {
      if (isEmailExist.role !== "Trainer") {
        return res
          .status(401)
          .json({ message: "Unauthorized! You are not a Trainer." });
      }
      const trainer = await TrainerModel.findOne({ email: isEmailExist._id });
      const jwtToken = jwt.sign(
        { 
          email, 
          role: isEmailExist.role, 
          userId: trainer?._id,
          instituteId: isEmailExist.institute
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "9h",
        },
      );

      res.cookie("accessToken", jwtToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 9 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Login successful",
        firstLogin: trainer?.firstLogin,
        trainerId: trainer?._id,
        userId: trainer?._id, // Alias for consistency
        email: email,
        role: isEmailExist.role,
        verified: true,
      });
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function connectGoogle(req: Request, res: Response) {
  try {
    const { code, trainerId } = req.body;
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      await TrainerModel.findByIdAndUpdate(trainerId, {
        googleRefreshToken: tokens.refresh_token,
        firstLogin: false,
      });
      res
        .status(200)
        .json({ message: "Google account connected successfully" });
    } else {
      res
        .status(400)
        .json({ error: "Failed to retrieve refresh token. Try again." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to connect Google account" });
  }
}

export async function studentLogin(req: Request, res: Response) {
  try {
    const { studentId, password } = req.body;
    const student = await StudentModel.findOne({ studentId });
    if (!student) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (student.firstLogin) {
      const isPasswordMatch = await bcrypt.compare(password, student.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      return res
        .status(200)
        .json({ message: "First Login! Update your password" });
    } else {
      const isPasswordMatch = await bcrypt.compare(password, student.password);
      if (!isPasswordMatch) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const token = jwt.sign(
        { 
          email: student.email, 
          role: "student", 
          userId: student._id,
          instituteId: student.institute 
        },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "9h",
        },
      );

      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 9 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        message: "Login successful",
        role: "student",
        userId: student._id,
        name: student.name,
        email: student.email,
        verified: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateStudentPassword(req: Request, res: Response) {
  try {
    const { studentId, oldPassword, newPassword } = req.body;
    const student = await StudentModel.findOne({ studentId });
    if (!student) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const isPasswordMatch = await bcrypt.compare(oldPassword, student.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    student.password = await bcrypt.hash(newPassword, 10);
    student.firstLogin = false;
    await student.save();
    const token = jwt.sign(
      { 
        email: student.email, 
        role: "student", 
        userId: student._id,
        instituteId: student.institute
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "9h",
      },
    );
    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function verifyToken(req: Request, res: Response) {
  try {
    // const { token } = req.body; // Removed
    const token = req.cookies.accessToken;
    // ... existing code ...
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized! No token provided." });
    }

    const decodedToken: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    );
    return res.status(200).json({
      role: decodedToken.role,
      verified: true,
      userId: decodedToken.userId,
      email: decodedToken.email,
      instituteId: decodedToken.instituteId,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .json({ message: "Unauthorized! Please Signin Again!" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
