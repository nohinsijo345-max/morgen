const mongoose = require('mongoose');

const ProfileChangeRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestType: { 
    type: String, 
    enum: ['profile_update'], 
    default: 'profile_update' 
  },
  changes: {
    name: { type: String },
    state: { type: String },
    district: { type: String },
    city: { type: String },
    landSize: { type: Number },
    cropTypes: [{ type: String }]
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  requestedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewedBy: { type: String },
  reviewNotes: { type: String }
});

module.exports = mongoose.model('ProfileChangeRequest', ProfileChangeRequestSchema);
