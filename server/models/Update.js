const mongoose = require('mongoose');

const UpdateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Admin Update' },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['government', 'weather', 'market', 'general'], 
    default: 'government' 
  },
  category: {
    type: String,
    enum: ['general', 'profile', 'transport', 'weather', 'market', 'government', 'auction', 'support', 'order', 'bidding', 'account', 'system'],
    default: 'general'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Update', UpdateSchema, 'Updates');