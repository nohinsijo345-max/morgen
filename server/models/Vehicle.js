const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['autorickshaw', 'tractor', 'bus', 'jeep', 'mini-truck', 'bike', 'car', 'cycle', 'truck']
  },
  icon: {
    type: String,
    required: true
  },
  priceOptions: [{
    capacity: String,
    pricePerKm: Number,
    basePrice: Number,
    description: String
  }],
  availability: {
    type: Boolean,
    default: true
  },
  driverId: {
    type: String,
    ref: 'Driver'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

vehicleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);