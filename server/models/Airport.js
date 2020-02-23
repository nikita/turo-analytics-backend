import mongoose from "mongoose";

const airportSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    pickupAndReturn: {
      type: String,
      required: true
    },
    searchPath: {
      type: String,
      required: true
    },
    timeZone: {
      type: String,
      required: true
    },
    vehicleCount: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("Airport", airportSchema);
