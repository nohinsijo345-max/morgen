const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['weather', 'emergency', 'market', 'scheme', 'system'], 
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  targetAudience: { 
    type: String, 
    enum: ['all', 'farmers', 'buyers', 'specific'], 
    default: 'all' 
  },
  targetUsers: [String], // Specific user IDs if targetAudience is 'specific'
  district: { type: String }, // For location-specific alerts
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', AlertSchema);
