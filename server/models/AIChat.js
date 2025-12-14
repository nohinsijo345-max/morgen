const mongoose = require('mongoose');

const aiChatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true
  },
  farmerId: {
    type: String,
    required: true,
    ref: 'User'
  },
  farmerName: {
    type: String,
    required: true
  },
  messages: [{
    id: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    hasImage: {
      type: Boolean,
      default: false
    },
    imageUrl: {
      type: String
    },
    imageAnalysis: {
      type: String
    }
  }],
  totalMessages: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  farmerContext: {
    crops: [String],
    location: {
      state: String,
      district: String,
      city: String,
      pinCode: String
    },
    farmingExperience: String,
    farmSize: String,
    primaryConcerns: [String]
  },
  sessionStats: {
    questionsAsked: {
      type: Number,
      default: 0
    },
    imagesUploaded: {
      type: Number,
      default: 0
    },
    problemsSolved: {
      type: Number,
      default: 0
    },
    lastConsultation: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
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

// Update timestamps on save
aiChatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.lastActivity = Date.now();
  this.totalMessages = this.messages.length;
  next();
});

module.exports = mongoose.model('AIChat', aiChatSchema);