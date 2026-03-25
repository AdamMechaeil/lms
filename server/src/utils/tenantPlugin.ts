import mongoose from "mongoose";
import { TenantContext } from "./tenantContext.js";

export const tenantPlugin = (schema: mongoose.Schema) => {
  const hasInstituteField = !!schema.path("institute");

  schema.pre("validate", function () {
    if (!hasInstituteField) return;

    const instituteId = TenantContext.getInstituteId();
    if (instituteId) {
      if (this.isNew && !this.institute) {
        this.institute = new mongoose.Types.ObjectId(instituteId);
      }
    } else if (!this.institute) {
      // Only throw if context is missing AND the document doesn't already have an explicitly provided institute
      throw new Error("Tenant context missing during save of tenant-scoped model.");
    }
  });

  schema.pre("insertMany", function (docs: any[]) {
    if (!hasInstituteField) return;
    
    const instituteId = TenantContext.getInstituteId();
    if (Array.isArray(docs)) {
      for (const doc of docs) {
        if (instituteId && !doc.institute) {
          doc.institute = new mongoose.Types.ObjectId(instituteId);
        } else if (!instituteId && !doc.institute) {
          throw new Error("Tenant context missing during insertMany of tenant-scoped model.");
        }
      }
    }
  });

  const applyTenantFilter = function (this: mongoose.Query<any, any>) {
    if (!hasInstituteField) return;
    if (this.options?.bypassTenantFilter) return;

    const instituteId = TenantContext.getInstituteId();

    if (instituteId) {
      this.where({ institute: new mongoose.Types.ObjectId(instituteId) });
    } else {
      this.where({ institute: new mongoose.Types.ObjectId("000000000000000000000000") });
    }
  };

  schema.pre("aggregate", function () {
    if (!hasInstituteField) return;
    if (this.options?.bypassTenantFilter) return;

    const instituteId = TenantContext.getInstituteId();
    const matchStage = instituteId
      ? { institute: new mongoose.Types.ObjectId(instituteId) }
      : { institute: new mongoose.Types.ObjectId("000000000000000000000000") };

    this.pipeline().unshift({ $match: matchStage });
  });

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
