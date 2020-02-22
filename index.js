const fs = require("fs");
const rp = require("request-promise");
const moment = require("moment");

// Initialize rp session
const session = rp.defaults({
  headers: {
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "client-capabilities": "APPLE_PAY",
    "User-Agent": "Turo/20.6.3 (iPhone; iOS 13.3; Scale/3.00)",
    "Accept-Language": "en-US;q=1",
    "X-Mobile-Carrier-Country": "us",
    Authorization: "Bearer 8b69637a-7c06-4cb1-9a25-0afb07d0cdd5"
  },
  gzip: true,
  json: true
});

// Initialize our cars array
let cars = [];

const main = async () => {
  // Get all cars
  const response = await session.get({
    uri:
      "https://api.turo.com/api/search?useDefaultMaximumDistance=1&location=Seattle, WA, USA&businessClass=0&superDeluxeClass=0&instantBook=0&sortType=RELEVANCE&deluxeClass=0&latitude=47.6062095&endTime=10:00&itemsPerPage=200&endDate=04/16/2020&delivery=0&turoGo=0&placeId=ChIJVTPokywQkFQRmtVEaUZlJRA&longitude=-122.3320708&international=1&locationType=City&startDate=04/14/2020&startTime=10:00&allStarHost=0"
  });

  // Loop through all cars
  for (let i = 0; i < response.list.length; i++) {
    const currentVehicle = response.list[i];
    const vehicleId = currentVehicle.vehicle.id;
    const vehicleUrl = `https://turo.com${currentVehicle.vehicle.url}`;

    const unavailabilityResponse = (
      await session.get({
        uri: `https://api.turo.com/api/vehicle/unavailability?endDate=02%2F28%2F2021&vehicleId=${vehicleId}&startDate=02%2F01%2F2020`
      })
    ).unavailableIntervals;

    // Get days booked
    let tripsBooked = 0;
    let daysBooked = 0;

    // Loop through all unavail
    for (let i = 0; i < unavailabilityResponse.length; i++) {
      const currentUnav = unavailabilityResponse[i];

      const startEpoch = moment(currentUnav.start.epochMillis);
      const endEpoch = moment(currentUnav.end.epochMillis);

      // Get days booked from the difference
      const diff = endEpoch.diff(startEpoch, "days");

      // Get todays month
      const currentMonth = moment().month();

      // Only add this months days booked
      if (startEpoch.month() == currentMonth) {
        daysBooked = daysBooked + diff;
      }

      // Add one to trips since an unavilability is a trip
      tripsBooked++;
    }

    const carJson = {
      id: vehicleId,
      url: vehicleUrl,
      vehicle: currentVehicle.vehicle.name,
      price: currentVehicle.rate.averageDailyPrice,
      lifetimeTrips: currentVehicle.renterTripsTaken,
      tripsThisMonth: tripsBooked,
      daysBookedThisMonth: daysBooked,
      estimatedMonthlyEarnings:
        daysBooked * currentVehicle.rate.averageDailyPrice
    };

    console.log(carJson);

    // Push the car to the cars array
    cars.push(carJson);
  }

  // Sort
  cars.sort(sortCarsByHighestMonthlyEarnings);

  // Save all cars array
  fs.writeFileSync("cars.json", JSON.stringify(cars));
};

function sortCarsByHighestMonthlyEarnings(a, b) {
  if (a.estimatedMonthlyEarnings > b.estimatedMonthlyEarnings) {
    return 1;
  } else if (b.estimatedMonthlyEarnings > a.estimatedMonthlyEarnings) {
    return -1;
  } else {
    return 0;
  }
}

main();
