const mongoose = require('mongoose');

const WeatherSchema = new mongoose.Schema({
  location: { type: String, required: true },
  temperature: { type: Number, required: true },
  condition: { type: String, required: true }, // sunny, cloudy, rainy, etc.
  humidity: { type: Number },
  windSpeed: { type: Number },
  rainChance: { type: Number },
  icon: { type: String }, // weather icon code
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Weather', WeatherSchema, 'Weather');