import mongoose from "mongoose";

interface Domain extends mongoose.Document {
  name: string;
  description: string;
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
});

const DomainModel = mongoose.model("Domain", domainSchema);

export default DomainModel;
