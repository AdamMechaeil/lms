import mongoose from "mongoose";
import { TenantContext } from "./tenantContext.js";

/**
 * Global Mongoose Plugin for Multi-Tenancy
 * Automatically injects/filters by instituteId using AsyncLocalStorage.
 */
export const tenantPlugin = (schema: mongoose.Schema) => {
  // 1. Inject instituteId on Create / Save
  schema.pre("save", function (next) {
    const instituteId = TenantContext.getInstituteId();

    if (instituteId) {
      // If saving a new document and institute is not already set
      if (this.isNew && !this.institute) {
        this.institute = new mongoose.Types.ObjectId(instituteId);
      }
    }
    next();
  });

  // 1.b Inject instituteId on insertMany
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

  // 2. Filter by instituteId on Queries (Find, Update, Delete)
  const applyTenantFilter = function (
    this: mongoose.Query<any, any>,
    next: mongoose.CallbackWithoutResultAndOptionalError,
  ) {
    const instituteId = TenantContext.getInstituteId();

    if (instituteId) {
      // Append instituteId to the existing query filter
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

  // 3. Prevent populating 'institute' by default to save memory,
  // unless explicitly requested, as the tenant context already knows the institute.
};
