import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const commentSchema = new Schema(
  {
    rating: { type: Number, min: 1, max: 3, required: true },
    content: { type: String, required: true },
    author: {
      type: _Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
  },
  { timestamps: true }
);

const watchSchema = new Schema(
  {
    watchName: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, min: 0, required: true },
    automatic: { type: Boolean, default: false },
    watchDescription: { type: String, required: true },
    comments: [commentSchema],
    brand: {
      type: _Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
  },
  { timestamps: true }
);

export default model("Watch", watchSchema);
