const mongoose = require('mongoose');

const trackingStepSchema = new mongoose.Schema({
  step: {
    type: String,
    enum: ['order_placed', 'order_accepted', 'pickup_started', 'order_picked_up', 'in_transit', 'delivered'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'current'],
    default: 'pending'
  },
  timestamp: {
    type: Date
  },
  location: {
    type: String
  },
  notes: {
    type: String
  }
});

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  trackingId: {
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
  driverId: {
    type: String,
    ref: 'Driver'
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  vehicleType: {
    type: String,
    required: true
  },
  priceOption: {
    capacity: String,
    pricePerKm: Number,
    basePrice: Number,
    description: String
  },
  fromLocation: {
    state: String,
    district: String,
    city: String,
    pinCode: String,
    address: String
  },
  toLocation: {
    state: String,
    district: String,
    city: String,
    pinCode: String,
    address: String
  },
  pickupDate: {
    type: Date,
    required: true
  },
  pickupTime: {
    type: String,
    required: true
  },
  expectedDeliveryDate: {
    type: Date,
    required: true
  },
  actualDeliveryDate: {
    type: Date
  },
  distance: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  handlingFee: {
    type: Number,
    default: 14
  },
  finalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'order_accepted', 'order_processing', 'pickup_started', 'order_picked_up', 'in_transit', 'delivered', 'completed', 'cancelled', 'cancellation_requested'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  trackingSteps: [trackingStepSchema],
  cancellationRequest: {
    requestedBy: String, // 'farmer', 'driver', 'admin'
    requestedAt: Date,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied'],
      default: 'pending'
    },
    reviewedBy: String,
    reviewedAt: Date,
    reviewNotes: String
  },
  isOverdue: {
    type: Boolean,
    default: false
  },
  overdueNotificationSent: {
    type: Boolean,
    default: false
  },
  newExpectedDate: {
    type: Date
  },
  notes: String,
  cargoDescription: {
    type: String,
    required: false,
    default: 'No description provided'
  },
  buyerPhoneNumber: {
    type: String,
    required: false,
    default: null
  },
  cancellationReason: String,
  cancelledBy: String,
  cancelledAt: Date,
  currentLocation: {
    latitude: Number,
    longitude: Number,
    address: String,
    updatedAt: Date
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

// Initialize tracking steps when booking is created
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.isNew && this.trackingSteps.length === 0) {
    console.log(`🆕 Initializing tracking steps for new booking: ${this.bookingId}`);
    this.trackingSteps = [
      { 
        step: 'order_placed', 
        status: 'completed', 
        timestamp: new Date(), 
        location: `${this.fromLocation.city}, ${this.fromLocation.district}`,
        notes: 'Order has been placed successfully'
      },
      { step: 'order_accepted', status: 'pending' },
      { step: 'pickup_started', status: 'pending' },
      { step: 'order_picked_up', status: 'pending' },
      { step: 'in_transit', status: 'pending' },
      { step: 'delivered', status: 'pending' }
    ];
    console.log(`✅ Tracking steps initialized for booking: ${this.bookingId}`);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);