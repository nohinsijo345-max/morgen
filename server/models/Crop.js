const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  farmerId: { type: String, required: true },
  farmerName: { type: String, required: true },
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['vegetables', 'fruits', 'grains', 'spices', 'other'],
    required: true 
  },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['kg', 'quintal', 'ton', 'piece'], default: 'kg' },
  basePrice: { type: Number, required: true },
  pricePerUnit: { type: Number }, // For direct sale listings
  msp: { type: Number }, // Minimum Support Price set by admin
  
  // Direct Sale Fields
  available: { type: Boolean, default: false }, // For direct sale to public buyers
  description: { type: String }, // Description for listings
  
  // Harvest Management
  plantedDate: { type: Date },
  harvestDate: { type: Date, required: true },
  daysToHarvest: { type: Number },
  autoNotified: { type: Boolean, default: false }, // Auto-notify at 3 days
  
  // Status & Availability
  status: { 
    type: String, 
    enum: ['growing', 'ready', 'listed', 'in_auction', 'sold', 'expired'], 
    default: 'growing' 
  },
  
  // Images
  images: [String],
  
  // Location
  location: {
    state: { type: String },
    district: { type: String },
    city: { type: String },
    panchayat: { type: String },
    pinCode: { type: String } // Add pinCode for precise location matching
  },
  
  // Geospatial coordinates (separate from location)
  coordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  
  // Quality & Certification
  organic: { type: Boolean, default: false },
  quality: { type: String, enum: ['A', 'B', 'C'], default: 'A' },
  
  // AI Insights
  aiHealthScore: { type: Number, min: 0, max: 100 },
  aiPricePrediction: {
    nextWeekPrice: Number,
    trend: { type: String, enum: ['up', 'down', 'stable'] },
    confidence: Number
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for geospatial queries
CropSchema.index({ coordinates: '2dsphere' });

// Calculate days to harvest before saving
CropSchema.pre('save', function(next) {
  if (this.harvestDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for accurate calculation
    
    const harvest = new Date(this.harvestDate);
    harvest.setHours(0, 0, 0, 0); // Reset to start of day
    
    this.daysToHarvest = Math.ceil((harvest - today) / (1000 * 60 * 60 * 24));
  }
  this.updatedAt = new Date();
  next();
});

// Virtual field to get real-time days to harvest
CropSchema.virtual('currentDaysToHarvest').get(function() {
  if (!this.harvestDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const harvest = new Date(this.harvestDate);
  harvest.setHours(0, 0, 0, 0);
  
  return Math.ceil((harvest - today) / (1000 * 60 * 60 * 24));
});

// Method to update countdown
CropSchema.methods.updateCountdown = function() {
  if (this.harvestDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const harvest = new Date(this.harvestDate);
    harvest.setHours(0, 0, 0, 0);
    
    const newDaysLeft = Math.ceil((harvest - today) / (1000 * 60 * 60 * 24));
    const changed = this.daysToHarvest !== newDaysLeft;
    
    this.daysToHarvest = newDaysLeft;
    this.updatedAt = new Date();
    
    return { changed, daysLeft: newDaysLeft };
  }
  return { changed: false, daysLeft: null };
};

module.exports = mongoose.model('Crop', CropSchema, 'Crops');