import { Schema, model, Document } from "mongoose";

const DoctorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  }
});

interface IDoctorSchema extends Document {
  name: string;
  specialty: string;
};

export default model<IDoctorSchema>('Doctor', DoctorSchema);