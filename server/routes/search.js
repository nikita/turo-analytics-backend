import express from "express";
const router = express.Router();
import Car from "../models/Car";

router.get("/", async (req, res, next) => {
  try {
    const { filter, keyword } = req.query;

    const data = await Car.find({});

    res.status(200).json({ status: true, data });
  } catch (err) {
    next(err);
  }
});

export default router;
