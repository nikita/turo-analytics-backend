# JSON of each car result

renterTripsTaken - Amount of trips in total the car has (int)
responseRate - the response rate of the owner to rentals/messages? (int)
rating - the rating the car has in total (float)
instantBookDisplayed - if instant book is turned on for this listing (bool)
newListing - if the car is a new listing (not sure the length of time that it is considered new?) (bool)
turoGo - if the car is using the new turo go remote unlock device (bool)

## Owner object

id - the id of the owner (could be useful to identify by owner) (int)
owner -> allStarHost - if the owner is an all star host for turo (bool)

## Rate object

````
"rate": {
"averageDailyPrice": 20,
"averageDailyPriceWithCurrency": {
    "amount": 20,
    "currencyCode": "USD"
},
"daily": 20,
"monthly": 0.3,
"promotionResponse": null,
"weekly": 0.1
},```
````

# Unavilability endpoint (shows how much a car is booked for)

URI: https://api.turo.com/api/vehicle/unavailability?endDate=02%2F28%2F2021&vehicleId=738532&startDate=02%2F01%2F2020

# Interesting

Turo uses java for backend api
