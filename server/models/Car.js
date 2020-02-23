import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {},
  {
    timestamps: true,
    // Strict is false for now because we don't know which data
    // Is going to be logged, might add all values later and remove this
    strict: false
  }
);

export default mongoose.model("Car", carSchema);
