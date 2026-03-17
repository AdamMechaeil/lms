import mongoose from "mongoose";
import { TenantContext } from "./tenantContext.js";

export const tenantPlugin = (schema: mongoose.Schema) => {
  schema.pre("save", function (next) {
    const instituteId = TenantContext.getInstituteId();

    if (instituteId) {
      if (this.isNew && !this.institute) {
        this.institute = new mongoose.Types.ObjectId(instituteId);
      }
    }
    next();
  });

  schema.pre("insertMany", function (next, docs) {
    const instituteId = TenantContext.getInstituteId();
    if (instituteId) {
      if (Array.isArray(docs)) {
        docs.forEach((doc) => {
          if (!doc.institute) {
            doc.institute = new mongoose.Types.ObjectId(instituteId);
          }
        });
      }
    }
    next();
  });

  const applyTenantFilter = function (
    this: mongoose.Query<any, any>,
    next: mongoose.CallbackWithoutResultAndOptionalError,
  ) {
    const instituteId = TenantContext.getInstituteId();

    if (instituteId) {
      this.where({ institute: new mongoose.Types.ObjectId(instituteId) });
    }
    next();
  };

  schema.pre("find", applyTenantFilter);
  schema.pre("findOne", applyTenantFilter);
  schema.pre("findOneAndUpdate", applyTenantFilter);
  schema.pre("findOneAndDelete", applyTenantFilter);
  schema.pre("findOneAndReplace", applyTenantFilter);
  schema.pre("deleteOne", applyTenantFilter);
  schema.pre("deleteMany", applyTenantFilter);
  schema.pre("updateOne", applyTenantFilter);
  schema.pre("updateMany", applyTenantFilter);
  schema.pre("countDocuments", applyTenantFilter);
  schema.pre("estimatedDocumentCount", applyTenantFilter);
};
