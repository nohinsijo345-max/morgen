const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  farmerId: { type: String, required: true }, // Links crop to the farmer (e.g., FAR-1001)
  name: { type: String, required: true },     // e.g., "Pepper"
  quantity: { type: Number, required: true }, // e.g., 50 (kg)
  basePrice: { type: Number, required: true },// e.g., 400 (₹/kg)
  harvestDate: { type: Date },                // For the Countdown Timer
  status: { type: String, default: 'Available' }, // Available, Sold
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Crop', CropSchema);