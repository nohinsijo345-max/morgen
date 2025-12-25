const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['farmer', 'buyer', 'admin'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

const customerSupportSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    required: true,
    unique: true
  },
  farmerId: {
    type: String,
    ref: 'User'
  },
  buyerId: {
    type: String,
    ref: 'User'
  },
  userType: {
    type: String,
    enum: ['farmer', 'buyer'],
    required: true
  },
  farmerName: {
    type: String
  },
  buyerName: {
    type: String
  },
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['transport', 'weather', 'crops', 'auction', 'technical', 'billing', 'general', 'bidding', 'orders'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  messages: [messageSchema],
  assignedTo: {
    type: String,
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  }
});

customerSupportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CustomerSupport', customerSupportSchema);