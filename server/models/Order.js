const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  buyerId: {
    type: String,
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  buyerType: {
    type: String,
    enum: ['public', 'commercial'],
    required: true
  },
  buyerContact: {
    email: String,
    phone: String,
    address: {
      state: String,
      district: String,
      city: String,
      pinCode: String
    }
  },
  farmerId: {
    type: String,
    required: true
  },
  farmerName: {
    type: String,
    required: true
  },
  farmerContact: {
    email: String,
    phone: String,
    address: {
      state: String,
      district: String,
      city: String,
      pinCode: String
    }
  },
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  cropDetails: {
    name: String,
    category: String,
    quality: String,
    unit: String
  },
  quantity: {
    type: Number,
    required: true
  },
  pricePerUnit: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  },
  farmerResponse: {
    message: String,
    respondedAt: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  deliveryDetails: {
    method: {
      type: String,
      enum: ['pickup', 'delivery'],
      default: 'pickup'
    },
    address: String,
    scheduledDate: Date,
    completedDate: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  completedAt: Date
});

orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.status === 'approved' && !this.approvedAt) {
    this.approvedAt = Date.now();
  }
  
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = Date.now();
  }
  
  next();
});

// Generate next Order ID
orderSchema.statics.generateOrderId = async function() {
  try {
    const lastOrder = await this.findOne({ 
      orderId: { $regex: /^ORD\d+$/ } 
    }).sort({ orderId: -1 });
    
    if (!lastOrder || !lastOrder.orderId) {
      return 'ORD001';
    }
    
    const lastNumber = parseInt(lastOrder.orderId.replace('ORD', ''));
    const nextNumber = lastNumber + 1;
    
    return `ORD${String(nextNumber).padStart(3, '0')}`;
  } catch (err) {
    console.error('Error generating order ID:', err);
    return 'ORD001';
  }
};

// Index for efficient queries
orderSchema.index({ buyerId: 1, status: 1 });
orderSchema.index({ farmerId: 1, status: 1 });
orderSchema.index({ cropId: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);