import { Schema as _Schema, model } from "mongoose";
import { genSalt, hash } from "bcrypt";
const Schema = _Schema;

const currentYear = new Date().getFullYear();
const memberSchema = new Schema(
  {
    membername: { type: String, required: true },
    password: { type: String, required: true },
    previousPassword: {
      type: String,
      default: "",
    },
    isAdmin: { type: Boolean, default: false },
    name: { type: String, required: true },
    YOB: { type: Number, min: 1900, max: currentYear, required: true },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

memberSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  if (
    this.previousPassword &&
    (await bcrypt.compare(this.password, this.previousPassword))
  ) {
    throw new Error({
      message: "New password cannot be the same as the previous password",
    });
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default model("Member", memberSchema);
