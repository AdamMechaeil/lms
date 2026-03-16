import express from "express";
import { createRole, getRoles } from "../controllers/role.js";
import { commonAuthenticator } from "../middlewares/commonAuthenticator.js";
import { adminAuthenticator } from "../middlewares/adminAuthenticator.js";

const roleRouter = express.Router();

roleRouter.post("/create", adminAuthenticator, createRole);
roleRouter.get("/all", adminAuthenticator, getRoles);

export default roleRouter;
