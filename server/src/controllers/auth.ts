import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import EmailModel from "../models/email.js";
import StudentModel from "../models/student.js";
import bcrypt from "bcrypt";
import { google } from "googleapis";
import TrainerModel from "../models/trainer.js";
import AdminModel from "../models/admin.js";
import InstituteModel from "../models/institute.js";
import EmployeeModel from "../models/employee.js";

export async function adminGoogleRegister(req: Request, res: Response) {
  try {
    const { token, instituteName, subdomain } = req.body;
    if (!instituteName || !subdomain) {
      return res
        .status(400)
        .json({ message: "Institute name and subdomain are required." });
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

    // Check if email already exists (Auth routes must bypass tenant filter to search globally)
    const isEmailExist = await EmailModel.findOne({ email }).setOptions({
      bypassTenantFilter: true,
    });
    if (isEmailExist) {
      return res
        .status(400)
        .json({ message: "User already registered! Please login." });
    }

    // Check if subdomain is taken
    const isDomainExist = await InstituteModel.findOne({
      subdomain,
    }).setOptions({ bypassTenantFilter: true });
    if (isDomainExist) {
      return res
        .status(400)
        .json({ message: "Subdomain already taken. Choose another." });
    }

    // Create Institute
    const institute = await InstituteModel.create({
      name: instituteName,
      subdomain,
      adminName: name || "Admin",
      adminEmail: email,
      isActive: true,
    });

    const newEmail = await EmailModel.create({
      email,
      role: "Admin",
      institute: institute._id,
    });

    const admin = await AdminModel.create({
      name: name || "Admin",
      email: newEmail._id,
      institute: institute._id,
    });

    // Generate JWT
    const jwtToken = jwt.sign(
      { email, role: "Admin", userId: admin._id, instituteId: institute._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "9h" },
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
      token: jwtToken,
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
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ message: "Invalid Google Token" });
    }

    const { email } = payload;
    const isEmailExist = await EmailModel.findOne({ email }).setOptions({
      bypassTenantFilter: true,
    });
    if (isEmailExist) {
      if (isEmailExist.role !== "Admin") {
        return res
          .status(401)
          .json({ message: "Unauthorized! You are not an Admin." });
      }
      const admin = await AdminModel.findOne({
        email: isEmailExist._id,
      }).setOptions({ bypassTenantFilter: true });

      const instituteExists = await InstituteModel.findById(
        isEmailExist.institute,
      );
      if (!instituteExists) {
        await AdminModel.deleteMany({ email: isEmailExist._id });
        await EmailModel.deleteOne({ _id: isEmailExist._id });
        return res.status(404).json({
          message:
            "Your institute was deleted from the database. We have wiped your orphaned account. Please go back and Register freshly!",
        });
      }

      const jwtToken = jwt.sign(
        {
          email,
          role: isEmailExist.role,
          userId: admin?._id,
          instituteId: isEmailExist.institute,
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
        token: jwtToken,
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
    const isEmailExist = await EmailModel.findOne({ email }).setOptions({
      bypassTenantFilter: true,
    });
    if (isEmailExist) {
      if (isEmailExist.role !== "Trainer") {
        return res
          .status(401)
          .json({ message: "Unauthorized! You are not a Trainer." });
      }
      const trainer = await TrainerModel.findOne({
        email: isEmailExist._id,
      }).setOptions({ bypassTenantFilter: true });
      const jwtToken = jwt.sign(
        {
          email,
          role: isEmailExist.role,
          userId: trainer?._id,
          instituteId: isEmailExist.institute,
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
        token: jwtToken,
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
    const { studentId, password, instituteId } = req.body;
    
    if (!instituteId) {
      return res.status(400).json({ message: "Institute selection is required." });
    }

    const student = await StudentModel.findOne({ studentId, institute: instituteId }).setOptions({
      bypassTenantFilter: true,
    });
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
          instituteId: student.institute,
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
    const { studentId, oldPassword, newPassword, instituteId } = req.body;
    
    if (!instituteId) {
      return res.status(400).json({ message: "Institute selection is required." });
    }

    const student = await StudentModel.findOne({ studentId, institute: instituteId }).setOptions({
      bypassTenantFilter: true,
    });
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
        instituteId: student.institute,
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
    const token = req.cookies.accessToken;
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

export async function employeeGoogleLogin(req: Request, res: Response) {
  try {
    const { token } = req.body;
    const client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ message: "Invalid Google Token" });
    }

    const { email } = payload;

    // Check if email exists in EmailModel as Employee globally
    const userEmail = await EmailModel.findOne({
      email,
      role: "Employee",
    }).setOptions({ bypassTenantFilter: true });

    if (!userEmail) {
      return res.status(404).json({
        message:
          "Employee not found. Please contact your Institute Admin to invite you first.",
      });
    }

    // Find Employee record
    const employee = await EmployeeModel.findOne({ email: userEmail._id })
      .populate("role", "name")
      .setOptions({ bypassTenantFilter: true });

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found." });
    }

    if (!employee.isActive) {
      return res
        .status(403)
        .json({ message: "Your account is temporarily suspended." });
    }

    const jwtToken = jwt.sign(
      {
        email,
        role: "Employee",
        userId: employee._id,
        instituteId: employee.institute,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "9h" },
    );

    res.cookie("accessToken", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 9 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      role: "Employee",
      userId: employee._id,
      instituteId: employee.institute,
      email: email,
      verified: true,
      token: jwtToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function searchInstitutes(req: Request, res: Response) {
  try {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Search query is required." });
    }

    // Must bypass tenant filter to search globally
    const institutes = await InstituteModel.find({
      name: { $regex: query, $options: "i" },
      isActive: true,
    })
      .select("_id name logoUrl subdomain primaryColor")
      .limit(10)
      .setOptions({ bypassTenantFilter: true });

    return res.status(200).json(institutes);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
