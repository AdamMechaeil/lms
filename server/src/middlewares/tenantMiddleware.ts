import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { TenantContext } from "../utils/tenantContext.js";
import Institute from "../models/institute.js";

interface JWTPayload extends jwt.JwtPayload {
  email: string;
  role: string;
  instituteId?: string; // We will add this to JWT payloads during login
}

/**
 * Middleware to establish the Tenant Context (instituteId) for the current request.
 * It checks for an authenticated user's JWT first. If not found, it can fallback to
 * checking the subdomain for public routes (like registration or public landing pages).
 */
export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let instituteId: string | undefined;

  // 1. Try to extract instituteId from JWT Token (Authenticated Routes)
  const token =
    req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as JWTPayload;
      if (decoded && decoded.instituteId) {
        instituteId = decoded.instituteId;
      }
    } catch (err) {
      // Token invalid or expired. We don't block here, commonAuthenticator will handle authorization blocking later if needed.
      // We just fail to set the tenant context from token.
    }
  }

  // 2. Fallback: Try to extract from custom header or Subdomain (Public Routes / Login)
  // For example, when a user is on acme.lms-saas.com/login, they aren't authenticated yet,
  // but we might need to load Acme's specific branding or verify Acme exists.
  if (!instituteId) {
    const rawSubdomain = req.headers["x-tenant-subdomain"] as string; // Standard way for frontend to specify

    // OR extract from host if you prefer pure subdomain routing:
    // const host = req.headers.host || "";
    // const subdomain = host.split(".")[0];

    if (rawSubdomain) {
      // Optional: You could look up the Institute ID in the DB here based on the subdomain
      // try {
      //   const institute = await Institute.findOne({ subdomain: rawSubdomain }).select("_id").lean();
      //   if (institute) instituteId = institute._id.toString();
      // } catch(e) {}
    }
  }

  // 3. Run the rest of the request inside the Tenant Context
  if (instituteId) {
    // If we found a tenant, wrap the `next()` call in the context
    TenantContext.run(instituteId, () => {
      next();
    });
  } else {
    // If no tenant found (e.g., hitting a global admin endpoint or public API),
    // just proceed without context context. The plugin will bypass filtering.
    next();
  }
};

/**
 * Restores the Tenant Context explicitly after context-losing middleware like Multer.
 * File uploads stream asynchronously in ways that Node's AsyncLocalStorage sometimes drops.
 */
export const restoreTenantContext = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Authentication middleware sets req.user.instituteId or req.instituteId
  const instituteId = (req as any).user?.instituteId || (req as any).instituteId;
  if (instituteId) {
    TenantContext.run(instituteId, () => {
      next();
    });
  } else {
    next();
  }
};
