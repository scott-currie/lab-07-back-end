'use strict';

const express = require('express');
const cors = require('cors');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.listen(PORT, () => console.log(`App is up on $ PORT`));

app.get('/location', (request, response, next) => {
  try {
    const locationData = searchToLatLong(request.query.data);
    response.send(locationData);
  }
  catch (exception) {
    console.log(new Error());
  }
});

app.get('/weather', (request, response)=>{
  const locationData = searchToLatLong(request.query.data);
  const weatherData = searchWeather(locationData);
  response.send(weatherData);
})

function searchToLatLong(query) {
  const geoData = require('./data/geo.json');
  const location = new Location(geoData.results[0]);
  location.search_query = query;
  return location;
}

function Location(data) {
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

/////weather

function searchWeather(location){
  const darkData = require('./data/darksky.json');
  const dailyWeatherArr = [];

  darkData.daily.data.forEach(daysData => {
    const weather = new Weather(daysData.summary, daysData.time);
    dailyWeatherArr.push(weather);
  })

  return dailyWeatherArr;
}

function convertUnixTime(unixTime) {
  let monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  let dayOfWeekArr = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
  let date = new Date(unixTime*1000);
  let month = monthName[date.getMonth()];
  let year = date.getFullYear();
  let dayOfMonth = date.getDate();
  let dayOfWeek = dayOfWeekArr[date.getDay()];

  return dayOfWeek + ' ' + month + ' ' + dayOfMonth + ' ' + year;
}

function Weather(summary, time) {
  this.forecast = summary;
  this.time = convertUnixTime(time);
}

//////////errors
function Error() {
  this.status = 500;
  this.respoonseText = 'Sorry, something went wrong';
}


// {
//   status: 500,
//   responseText: "Sorry, something went wrong",
//   ...
// }
