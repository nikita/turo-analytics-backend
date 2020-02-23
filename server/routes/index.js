import express from "express";
const router = express.Router();

import search from "./search";
import scrape from "./scrape";

// Routes
router.use("/search", search);
router.use("/scrape", scrape);

export default router;
