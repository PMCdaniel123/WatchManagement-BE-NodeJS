import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const brandSchema = new Schema(
  {
    brandName: { type: String, required: true },
  },
  { timestamps: true }
);

export default model("Brand", brandSchema);
