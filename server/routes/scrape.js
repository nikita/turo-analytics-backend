import express from "express";
const router = express.Router();
import Car from "../models/Car";
import fs from "fs";
import Request from "../../api/request";
const API = new Request(
  "us.reserve.unknownproxies.com:10000:unverified:8ONdTChr1Mad"
);

router.get("/start", async (req, res, next) => {
  try {
    let allResults = [];
    let allVehicleIds = [];
    let duplicateVehicles = 0;

    // Get all airports from Turo API
    const allAirports = await API.getAirports();

    // Loop through each airport
    for (let i = 0; i < allAirports.length; i++) {
      const currentAirport = allAirports[i];
      const airportCode = currentAirport.code;
      const airportVehicles = Number(currentAirport.vehicleCount);
      let increments = 250 / (airportVehicles / 200 + 1);

      if (airportVehicles > 1000) {
        increments = increments / 2;
      }

      console.log(`Starting airport code ${airportCode}`);

      // Get cars for the current airport
      const cars = await API.searchAirport(airportCode, increments);

      // Loop through all our cars
      for (let x = 0; x < cars.length; x++) {
        const currentCar = cars[x];

        // If vehicle id already is not in the array then we continue
        if (!allVehicleIds.includes(currentCar.vehicle.id)) {
          currentCar.airport_code = airportCode;

          // Push the car to the array of all cars
          allResults.push(currentCar);
          // Add the vehicle id so we can check for duplicates
          allVehicleIds.push(currentCar.vehicle.id);
          // checkKeys is false because we parse keys with dots in them
          await new Car(currentCar).save({ checkKeys: false });
        }
        // Car is duplicate
        else {
          duplicateVehicles++;
        }
      }

      console.log(
        `${airportCode} - ${i + 1}/${allAirports.length} - ${
          allResults.length
        } Vehicles found - ${duplicateVehicles} duplicate vehicles - ${increments} increments`
      );
    }

    res.status(200).json({
      status: true,
      message: `Scrapped ${allAirports.length} airports - ${allResults.length} Total Vehicles found - ${duplicateVehicles} Total Duplicate Vehicles`
    });
  } catch (err) {
    next(err);
  }
});

export default router;
