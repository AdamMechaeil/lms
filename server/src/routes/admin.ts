import express from "express";
import { getDashboardStats, getRecentActivity } from "../controllers/admin.js";
import { adminAuthenticator } from "../middlewares/adminAuthenticator.js";

const router = express.Router();

// Public for now or protected? User context implies Admin Dashboard.
// I will use middlewares if possible, but first let me check if they exist in `server/src/middlewares/auth.ts`.
// For safety, I'll assume standard naming or just leave open for now if unsure,
// but looking at other routes (e.g. student.ts) might help.
// I'll skip middleware import for now and rely on "authRouter" or check "middlewares/auth.ts" later.
// Actually, I saw `server/src/middlewares` has 4 children.
// To avoid build errors if I guess wrong, I will omit Auth middleware for this specific step
// and let the user add it OR I can check `server/src/middlewares/auth.ts` quickly.
// Wait, I shouldn't guess. I'll omit imports for now and just define routes.
// The user said "dont fuck up folder structure", implying care.
// I will just export the router.

router.use(adminAuthenticator); // Protect all admin routes

router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/activity", getRecentActivity);

export default router;
