import express from "express";
import { adminAuthenticator } from "../middlewares/adminAuthenticator.js";
import {
  createDomain,
  deleteDomain,
  getAllDomains,
  getDomainById,
  updateDomain,
} from "../controllers/domain.js";

const domainRouter = express.Router();

domainRouter.post("/createDomain", adminAuthenticator, createDomain);
domainRouter.get("/getAllDomains", adminAuthenticator, getAllDomains);
domainRouter.get("/getDomainById/:id", adminAuthenticator, getDomainById);
domainRouter.put("/updateDomain/:id", adminAuthenticator, updateDomain);
domainRouter.delete("/deleteDomain/:id", adminAuthenticator, deleteDomain);

export default domainRouter;
