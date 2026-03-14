import mongoose, { Document, Schema } from "mongoose";

export interface IRole extends Document {
  institute: mongoose.Types.ObjectId;
  name: string; // e.g., 'Counsellor', 'Sales Executive', 'HR Head'
  description?: string;
  
  // Specific permission flags (can be expanded later)
  permissions: string[]; // e.g., ['view_leads', 'edit_leads', 'view_students', 'collect_fees']
  
  isSystemDefault: boolean; // Protect certain basic roles from deletion
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
  {
    institute: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    permissions: [{ type: String }],
    isSystemDefault: { type: Boolean, default: false }
  },
  { timestamps: true },
);

// Ensure role names are unique per institute
RoleSchema.index({ institute: 1, name: 1 }, { unique: true });

export default mongoose.model<IRole>("Role", RoleSchema);
