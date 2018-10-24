'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.listen(PORT, () => console.log(`App is up on $ PORT`));

app.get('/location', (request, response, next) => {
  getLocation(request.query.data)
    .then(locationData => response.send(locationData))
    .catch(error => handleError(error, response));

});

function getLocation(query) {
  console.log('This is happeing.');
  const _URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(_URL)
    .then(data => {
      if (! data.body.results.length) {throw 'No data'}
      else {
        let location = new Location(data.body.results[0]);
        location.search_query = query;
        console.log(location);
        return location;
      }
    });
}

function handleError(err, res) {
  console.error('ERR', err);
  if (res) res.status(500).send('Sorry, something went wrong.');
}


app.get('/weather', getWeather);

function getWeather(request, response) {
  const _URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${request.query.data.latitude},${request.query.data.longitude}`;
  return superagent.get(_URL)
    .then(result => {
      const weatherSummaries = [];
      result.body.daily.data.forEach(day => {
        // console.log('day', day);
        const summary = new Weather(day);
        // console.log('summary', summary);
        weatherSummaries.push(summary);
      });
      response.send(weatherSummaries);
    })
    .catch(error => handleError(error ,response));
}


function Location(data) {
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}


function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0, 15);
}
