import moment from "moment";
import rp from "request-promise";
import { appUserAgent } from "./state";
import { APP_DEFAULT_BEARER, CENTER_LAT, CENTER_LONG } from "./constants";
import qs from "querystring";

const formatProxy = proxy => {
  if (proxy && ["localhost", ""].indexOf(proxy) < 0) {
    proxy = proxy.replace(" ", "_");
    const proxySplit = proxy.split(":");
    if (proxySplit.length > 3)
      return (
        "http://" +
        proxySplit[2] +
        ":" +
        proxySplit[3] +
        "@" +
        proxySplit[0] +
        ":" +
        proxySplit[1]
      );
    else return "http://" + proxySplit[0] + ":" + proxySplit[1];
  } else return undefined;
};

export default class Request {
  constructor(proxy) {
    this.proxy = formatProxy(proxy);

    this.session = rp.defaults({
      headers: {
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "User-Agent": appUserAgent(),
        "Accept-Language": "en-US;q=1",
        "X-Mobile-Carrier-Country": "us"
      },
      proxy: this.proxy,
      gzip: true,
      json: true
    });

    this.accessToken = null;
    this.requestsMade = 0;

    this.init();
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  init = async () => {
    this.accessToken = await this.getOauthToken();
  };

  getOauthToken = async () => {
    while (true) {
      try {
        console.log(`Getting access token with ${this.accessToken}`);

        // Turo sends back a access_token that is valid for 43199 seconds (12 hrs)
        const response = await this.session.post({
          uri: "https://api.turo.com/oauth/token",
          headers: {
            Authorization: this.accessToken
              ? `Bearer ${this.accessToken}`
              : `Basic ${APP_DEFAULT_BEARER}`
          },
          form: {
            grant_type: "client_credentials"
          }
        });

        console.log(`Got access_token : ${response.access_token}`);

        this.accessToken = response.access_token;

        this.session.defaults({
          headers: {}
        });

        return response.access_token;
      } catch (err) {
        if (err.name == "StatusCodeError") {
          console.log(`getOauthToken: ${err.message}`);
          if (
            err.message.includes("Search results are temporarily unavailable")
          ) {
            this.accessToken = null;
            this.accessToken = await this.getOauthToken();
          }
        }
        // Sleep for 5 seconds
        await this.sleep(5000);
      }
    }
  };

  genMinMax(increments = 50) {
    let arr = [];

    for (let i = 0; i < 250; i = i + increments) {
      let maxPrice = i + increments;

      if (maxPrice > 250) maxPrice = 250;

      arr.push({
        minimumPrice: i,
        maximumPrice: maxPrice
      });
    }

    return arr;
  }

  // Rentalduration is amount of days rental is for
  genDates(rentalDuration = 2) {
    const randomMonth = Math.floor(Math.random() * moment().month() + 3 + 1);
    const randomDay = Math.floor(Math.random() * 7) + 1;

    return {
      startDate: `0${randomMonth}/0${randomDay}/${moment().year()}`,
      startTime: "10:00",
      endDate: `0${randomMonth}/0${randomDay +
        rentalDuration}/${moment().year()}`,
      endTime: "10:00"
    };
  }

  /**
   * Returns all airports in the area.
   * @async
   * @param {number} [maxDistance=7000] - The max distance in miles to look for airports
   * @param {number} [maxResults=500] - The max results of airports to return
   * @param {number} [latitude=CENTER_LAT] - The latitude
   * @param {number} [longitude=CENTER_LONG] - The longitude
   */
  async getAirports(
    maxDistance = 7000,
    maxResults = 500,
    latitude = null,
    longitude = null
  ) {
    while (true) {
      try {
        const params = {
          alphaCountryCode: "US",
          includeVehicleCount: true,
          latitude: latitude ? latitude : CENTER_LAT,
          longitude: longitude ? longitude : CENTER_LONG,
          maxDistanceInMiles: maxDistance,
          maxNumberOfResults: maxResults
        };

        console.log(`https://api.turo.com/api/airports?${qs.encode(params)}`);

        return await this.session.get({
          uri: `https://api.turo.com/api/airports?${qs.encode(params)}`,
          headers: {
            Authorization: this.accessToken
              ? `Bearer ${this.accessToken}`
              : `Basic ${APP_DEFAULT_BEARER}`
          }
        });
      } catch (err) {
        if (err.name == "StatusCodeError") {
          console.log(`getAirports: ${err.message}`);
          if (
            err.message.includes("Search results are temporarily unavailable")
          ) {
            this.accessToken = null;
            this.accessToken = await this.getOauthToken();
          }
        }
        // Sleep for 5 seconds
        await this.sleep(5000);
      }
    }
  }
  /**
   * Returns all vehicles in the area of the airport
   * @async
   * @param {string} airportCode - The airport you're searching for cars around
   * @param {number} [increments=50] - The price increments to search at until $250
   */
  async searchAirport(airportCode, increments = 50) {
    while (true) {
      try {
        let params = {
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
          airportCode: airportCode,
          allStarHost: 0
        };

        let allVehicles = [];

        // Loop through each price point increment and get results for it
        for (const minMax of this.genMinMax(increments)) {
          // Generate our dates & add the min & max price to our params
          params = { ...params, ...this.genDates(), ...minMax };

          // Push the list of vehicles received into our allVehicles array
          allVehicles.push(
            ...(
              await this.session.get({
                uri: `https://api.turo.com/api/search?${qs.encode(params)}`,
                headers: {
                  Authorization: this.accessToken
                    ? `Bearer ${this.accessToken}`
                    : `Basic ${APP_DEFAULT_BEARER}`
                }
              })
            ).list
          );

          this.requestsMade++;
          console.log(`Requests made: ${this.requestsMade}`);

          // Sleep for a second to avoid rate limit
          await this.sleep(1000);
        }

        return allVehicles;
      } catch (err) {
        if (err.name == "StatusCodeError") {
          console.log(`searchAirport: ${err.message}`);
          if (
            err.message.includes("Search results are temporarily unavailable")
          ) {
            this.accessToken = null;
            this.accessToken = await this.getOauthToken();
          }
        }
        // Sleep for 5 seconds
        await this.sleep(5000);
      }
    }
  }
}
