import { Schema, model, Document } from "mongoose";

const HospitalSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  doctors: [Schema.Types.ObjectId]
});

interface IHospitalSchema extends Document {
  name: string;
  address: string;
  phone: string;
  doctors: Schema.Types.ObjectId[];
};

export default model<IHospitalSchema>('Hospital', HospitalSchema);