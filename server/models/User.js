const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['farmer', 'buyer', 'admin', 'superadmin'], 
    default: 'farmer' 
  },
  farmerId: { type: String, unique: true }, 
  pin: { type: String, required: true },    
  phone: { type: String },
  district: { type: String, default: 'Kerala' },
  landSize: { type: Number },
  points: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);