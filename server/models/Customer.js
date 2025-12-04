const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  farmerId: { type: String, required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  totalPurchases: { type: Number, default: 0 },
  lastPurchaseDate: { type: Date },
  rating: { type: Number, min: 1, max: 5 },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', CustomerSchema, 'Customers');