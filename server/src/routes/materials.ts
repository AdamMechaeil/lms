import express from "express";
import {
  assignMaterialsToBatch,
  createMaterial,
  deleteMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
  getMaterialsByBatch,
} from "../controllers/materials.js";
import { admintrainerAuthenticator } from "../middlewares/admintrainerAuthenticator.js";

import { upload } from "../middlewares/multer.js";
import { restoreTenantContext } from "../middlewares/tenantMiddleware.js";

const materialRouter = express.Router();

materialRouter.post(
  "/createMaterial",
  admintrainerAuthenticator,
  upload.array("files"),
  restoreTenantContext,
  createMaterial
);
materialRouter.get(
  "/getAllMaterials",
  admintrainerAuthenticator,
  getAllMaterials
);
materialRouter.get(
  "/getMaterialById/:id",
  admintrainerAuthenticator,
  getMaterialById
);
materialRouter.put(
  "/updateMaterial/:id",
  admintrainerAuthenticator,
  updateMaterial
);
materialRouter.delete(
  "/deleteMaterial/:id",
  admintrainerAuthenticator,
  deleteMaterial
);

materialRouter.post(
  "/assignMaterialsToBatch",
  admintrainerAuthenticator,
  assignMaterialsToBatch
);

materialRouter.get(
  "/getMaterialsByBatch/:batchId",
  admintrainerAuthenticator,
  getMaterialsByBatch
);

export default materialRouter;
