import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {},
  {
    timestamps: true,
    // Strict is false for now because we don't know which data
    // Is going to be logged, might add all values later and remove this
    strict: false,
    // Add collation so we can search for things without case sensitivity
    // Example: searching for tesla will now find "Tesla" instead of finding none
    collation: { locale: "en_US", strength: 2 }
  }
);

export default mongoose.model("Car", carSchema);
