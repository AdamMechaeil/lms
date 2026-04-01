import { Request, Response, NextFunction } from "express";
import EmployeeModel from "../models/employee.js";
import RoleModel from "../models/role.js";

/**
 * Middleware to check if the authenticated user has a specific permission.
 * Works for both Top-Level Admins (who bypass permissions) and standard Employees.
 */
export const requirePermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user; 
      const instituteId = (req as any).instituteId;

      if (!user || !instituteId) {
        return res.status(401).json({ message: "Unauthorized: Missing context" });
      }

      // 1. If the user is the Top-Level "Admin" (the one who registered the institute), 
      // they automatically bypass ALL permission checks.
      if (user.role === "Admin") {
        return next();
      }

      // 2. We only need to check permissions for 'Employee' roles (HR, Sales, etc)
      if (user.role === "Employee") {
        const employee = await EmployeeModel.findById(user.userId).populate('role');
        
        if (!employee || !employee.isActive) {
          return res.status(403).json({ message: "Account disabled or not found." });
        }

        const employeeRole = employee.role as any; // Cast for populated field
        
        if (!employeeRole || !employeeRole.permissions.includes(requiredPermission)) {
          return res.status(403).json({ 
            message: `Forbidden: You lack the '${requiredPermission}' permission.` 
          });
        }

        // Permission granted
        return next();
      }

      // If they are a Trainer or Student hitting an endpoint meant for Employees/Admins
      return res.status(403).json({ message: "Forbidden: Invalid role for this action." });

    } catch (error) {
      console.error("Permission Middleware Error:", error);
      return res.status(500).json({ message: "Internal server error during permission check." });
    }
  };
};
