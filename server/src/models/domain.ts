import mongoose from "mongoose";

interface Domain extends mongoose.Document {
  name: string;
  description: string;
  institute: mongoose.Types.ObjectId;
}

const domainSchema = new mongoose.Schema<Domain>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  institute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institute",
    required: true,
  },
});

const DomainModel = mongoose.model("Domain", domainSchema);

export default DomainModel;
