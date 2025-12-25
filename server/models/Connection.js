const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  requesterType: {
    type: String,
    enum: ['farmer', 'buyer'],
    required: true
  },
  requesterId: {
    type: String,
    required: true
  },
  requesterName: {
    type: String,
    required: true
  },
  targetType: {
    type: String,
    enum: ['farmer', 'buyer'],
    required: true
  },
  targetId: {
    type: String,
    required: true
  },
  targetName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  },
  connectionType: {
    type: String,
    enum: ['business', 'partnership', 'supplier', 'customer'],
    default: 'business'
  },
  metadata: {
    requesterLocation: {
      state: String,
      district: String,
      city: String
    },
    targetLocation: {
      state: String,
      district: String,
      city: String
    },
    requesterProfile: {
      email: String,
      phone: String,
      profileImage: String
    },
    targetProfile: {
      email: String,
      phone: String,
      profileImage: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
});

connectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.status !== 'pending' && !this.respondedAt) {
    this.respondedAt = Date.now();
  }
  next();
});

// Index for efficient queries
connectionSchema.index({ requesterId: 1, status: 1 });
connectionSchema.index({ targetId: 1, status: 1 });
connectionSchema.index({ requesterType: 1, targetType: 1 });

module.exports = mongoose.model('Connection', connectionSchema);