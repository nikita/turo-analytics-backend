const fs = require("fs");
const moment = require("moment");
const qs = require("querystring");
const rp = require("request-promise");

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
    Authorization: "Bearer 1bbc87c0-0f5a-43d3-ab41-778f4e038a02"
  },
  gzip: true,
  json: true
});

// Initialize our cars array
let cars = [];

const main = async () => {
  // Get all cars
  const params = {
    useDefaultMaximumDistance: 1,
    businessClass: 0,
    superDeluxeClass: 0,
    instantBook: 0,
    sortType: "RELEVANCE",
    deluxeClass: 0,
    itemsPerPage: "200",
    delivery: 0,
    turoGo: 0,
    international: 1,
    locationType: "Airport",
    airportCode: "LAX",
    startDate: "04/14/2020",
    startTime: "10:00",
    endDate: "04/16/2020",
    endTime: "10:00",
    allStarHost: 0
  };
  const response = await session.get({
    uri: `https://api.turo.com/api/search?${qs.encode(params)}`
  });

  // Loop through all cars
  for (let i = 0; i < response.list.length; i++) {
    const currentVehicle = response.list[i];
    const vehicleId = currentVehicle.vehicle.id;
    const vehicleUrl = `https://turo.com${currentVehicle.vehicle.url}`;

    const unavailabilityResponse = (
      await session.get({
        uri: `https://api.turo.com/api/vehicle/unavailability?endDate=02/28/2021&vehicleId=${vehicleId}&startDate=02/01/2020`
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
