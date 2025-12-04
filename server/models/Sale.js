const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  farmerId: { type: String, required: true },
  farmerName: { type: String, required: true },
  cropName: { type: String, required: true },
  quantity: { type: Number, required: true },
  pricePerUnit: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  buyerId: { type: String },
  buyerName: { type: String },
  saleDate: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String }
});

module.exports = mongoose.model('Sale', SaleSchema, 'Sales');