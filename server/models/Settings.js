const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true 
  },
  value: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  description: { 
    type: String 
  },
  updatedBy: { 
    type: String 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Settings', SettingsSchema, 'Settings');
