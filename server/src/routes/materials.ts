import express from "express";
import {
  assignMaterialsToBatch,
  createMaterial,
  deleteMaterial,
  getAllMaterials,
  getMaterialById,
  updateMaterial,
} from "../controllers/materials.js";
import { admintrainerAuthenticator } from "../middlewares/admintrainerAuthenticator.js";

import { upload } from "../middlewares/multer.js";

const materialRouter = express.Router();

materialRouter.post(
  "/createMaterial",
  admintrainerAuthenticator,
  upload.array("files"),
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

export default materialRouter;
