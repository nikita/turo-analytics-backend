import express from "express";
import logger from "morgan";
import mongoose from "mongoose";
import * as bodyParser from "body-parser";
import routes from "./routes";
const app = express();

const { MONGODB_URI, NODE_ENV } = process.env;

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(async () => console.log("Connected to DB"))
  .catch(err => {
    if (err.name === "MongooseTimeoutError") {
      console.error(
        "MongoDB connection error. Please make sure MongoDB is running.",
        err
      );
    } else {
      console.error(err);
    }
    process.exit();
  });

const isDevelopment = NODE_ENV !== "production";

// Middlewares
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use("/api", routes);

// Catch errors
app.use(function(err, req, res, next) {
  if (isDevelopment) {
    console.log(err);
    res
      .status(500)
      .json({ status: false, error: err.stack, message: err.message });
  } else {
    res.status(500).json({ status: false, message: err.message });
  }
});

// 404 Fallback
app.use(function(req, res) {
  res
    .status(404)
    .json({ statusCode: 404, error: "Not Found", message: "Not Found" });
});

export default app;
