import express from "express";
const router = express.Router();
import Car from "../models/Car";

router.get("/", async (req, res, next) => {
  try {
    const { filter, keyword } = req.query;

    let filterJSON = {};

    if (filter === "vehicleMake") {
      filterJSON = { "vehicle.make": keyword };
    } else if (filter === "state") {
      filterJSON = { "location.state": keyword };
    }

    const data = await Car.find(
      filterJSON,
      "vehicle.model vehicle.make vehicle.id location.longitude location.latitude -_id"
    ).limit(1000);

    console.log(`Found ${data.length} results`);

    res.status(200).json({ status: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
