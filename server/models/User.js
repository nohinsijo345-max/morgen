const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['farmer', 'buyer', 'admin', 'superadmin'], 
    default: 'farmer' 
  },
  farmerId: { type: String, unique: true, sparse: true }, 
  buyerId: { type: String, unique: true, sparse: true },
  pin: { type: String, required: true },    
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  state: { type: String },
  district: { type: String },
  city: { type: String },
  panchayat: { type: String },
  
  // Farmer specific
  landSize: { type: Number },
  crops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Crop' }],
  cropTypes: [{ type: String }], // Array of crop type strings
  subsidyRequested: { type: Boolean, default: false },
  subsidyStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'none'], default: 'none' },
  
  // Reputation & Gamification
  reputationScore: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  badge: { 
    type: String, 
    enum: ['none', 'bronze', 'silver', 'gold'], 
    default: 'none' 
  },
  
  // Buyer specific
  totalPurchases: { type: Number, default: 0 },
  maxBidLimit: { type: Number, default: 10000 },
  
  // Location
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  
  // Settings
  language: { type: String, enum: ['english', 'malayalam', 'hindi'], default: 'english' },
  voiceAssist: { type: Boolean, default: false },
  notifications: { type: Boolean, default: true },
  
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Index for geospatial queries
UserSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', UserSchema, 'Users');