const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const Update = require('../models/Update');
const User = require('../models/User');

// Get all vehicles with lowest prices
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ availability: true }).sort({ 'priceOptions.basePrice': 1 });
    
    const vehiclesWithLowestPrice = vehicles.map(vehicle => {
      const lowestPrice = vehicle.priceOptions.reduce((min, option) => 
        option.basePrice < min ? option.basePrice : min, 
        vehicle.priceOptions[0]?.basePrice || 0
      );
      
      return {
        ...vehicle.toObject(),
        lowestPrice
      };
    });
    
    res.json(vehiclesWithLowestPrice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get vehicle by ID with all price options
router.get('/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicle details' });
  }
});

// Enhanced AI-based delivery estimation using Gemini
const estimateDeliveryTime = async (fromLocation, toLocation, vehicleType, cargoDescription = '', pickupDate = null) => {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Get current date and time for context
    const currentDate = new Date();
    const scheduledDate = pickupDate ? new Date(pickupDate) : currentDate;
    const dayOfWeek = scheduledDate.toLocaleDateString('en-US', { weekday: 'long' });
    const timeOfDay = scheduledDate.getHours();
    
    // Determine if it's peak/off-peak hours
    const isPeakHours = (timeOfDay >= 7 && timeOfDay <= 10) || (timeOfDay >= 17 && timeOfDay <= 20);
    const isWeekend = scheduledDate.getDay() === 0 || scheduledDate.getDay() === 6;

    const prompt = `
    You are an expert logistics AI specializing in Indian transport routes. Calculate precise delivery time for agricultural transport.

    ROUTE DETAILS:
    - From: ${fromLocation.city}, ${fromLocation.district}, ${fromLocation.state} (PIN: ${fromLocation.pinCode || 'N/A'})
    - To: ${toLocation.city}, ${toLocation.district}, ${toLocation.state} (PIN: ${toLocation.pinCode || 'N/A'})
    - Vehicle: ${vehicleType}
    - Cargo: ${cargoDescription || 'Agricultural goods'}
    - Pickup Day: ${dayOfWeek}
    - Pickup Time: ${timeOfDay}:00 hours
    - Peak Hours: ${isPeakHours ? 'Yes' : 'No'}
    - Weekend: ${isWeekend ? 'Yes' : 'No'}

    VEHICLE SPECIFICATIONS:
    - Truck: 40-60 km/h avg, 2-4 hours loading/unloading, mandatory rest every 4 hours
    - Mini-truck: 45-65 km/h avg, 1-2 hours loading/unloading, rest every 6 hours
    - Tractor: 25-35 km/h avg, 1-3 hours loading/unloading, frequent stops
    - Auto-rickshaw: 30-45 km/h avg, 30 min loading/unloading, city traffic delays
    - Jeep/Car: 50-70 km/h avg, 30-60 min loading/unloading
    - Bike: 40-60 km/h avg, 15-30 min loading/unloading
    - Cycle: 15-25 km/h avg, 10-20 min loading/unloading

    FACTORS TO CONSIDER:
    1. Actual road distance (not straight-line) between locations
    2. Road quality: National highways vs state roads vs rural roads
    3. Traffic conditions: Peak hours add 30-50% time, weekends reduce by 20%
    4. Weather impact: Monsoon season (June-September) adds 25% time
    5. Loading/unloading time based on cargo type and vehicle
    6. Mandatory driver rest periods for long journeys
    7. Fuel stops and meal breaks
    8. Agricultural goods may require careful handling (extra time)
    9. Rural pickup/delivery points may have access challenges
    10. Interstate transport may have check-post delays

    CALCULATION METHOD:
    1. Estimate actual road distance
    2. Calculate base travel time considering vehicle speed
    3. Add loading/unloading time
    4. Add traffic/peak hour delays
    5. Add mandatory rest periods for long journeys
    6. Add buffer for unexpected delays (10-15%)

    Provide ONLY the total estimated hours as a whole number (minimum 2 hours, maximum 168 hours).
    Consider this is for agricultural transport in India with real-world conditions.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let estimatedHours = parseInt(response.text().match(/\d+/)?.[0] || '24');
    
    // Validation and safety checks
    if (estimatedHours < 2) estimatedHours = 2; // Minimum 2 hours
    if (estimatedHours > 168) estimatedHours = 168; // Maximum 1 week
    
    // Add seasonal adjustments
    const currentMonth = currentDate.getMonth() + 1;
    const isMonsoon = currentMonth >= 6 && currentMonth <= 9;
    if (isMonsoon) {
      estimatedHours = Math.ceil(estimatedHours * 1.2); // 20% extra for monsoon
    }
    
    // Add festival season buffer (October-November, March-April)
    const isFestivalSeason = (currentMonth >= 10 && currentMonth <= 11) || (currentMonth >= 3 && currentMonth <= 4);
    if (isFestivalSeason) {
      estimatedHours = Math.ceil(estimatedHours * 1.1); // 10% extra for festivals
    }

    console.log(`AI Delivery Estimation: ${fromLocation.city} to ${toLocation.city} via ${vehicleType} = ${estimatedHours} hours`);
    return estimatedHours;
    
  } catch (error) {
    console.error('AI estimation error:', error);
    
    // Enhanced fallback estimation with distance-based calculation
    const getDistanceBasedEstimate = () => {
      // Rough distance estimation based on location differences
      const sameDistrict = fromLocation.district === toLocation.district;
      const sameState = fromLocation.state === toLocation.state;
      
      let baseHours;
      if (sameDistrict) {
        baseHours = 4; // Within district
      } else if (sameState) {
        baseHours = 12; // Within state
      } else {
        baseHours = 24; // Interstate
      }
      
      // Vehicle-specific multipliers
      const vehicleMultipliers = {
        'truck': 1.5,
        'mini-truck': 1.2,
        'tractor': 2.0,
        'autorickshaw': 0.8,
        'jeep': 1.0,
        'car': 0.9,
        'bike': 0.7,
        'cycle': 0.5
      };
      
      const multiplier = vehicleMultipliers[vehicleType] || 1.2;
      return Math.ceil(baseHours * multiplier);
    };
    
    return getDistanceBasedEstimate();
  }
};

// Get AI-powered delivery estimation
router.post('/estimate-delivery', async (req, res) => {
  try {
    const { fromLocation, toLocation, vehicleType, cargoDescription, pickupDate } = req.body;
    
    if (!fromLocation || !toLocation || !vehicleType) {
      return res.status(400).json({ error: 'Missing required fields: fromLocation, toLocation, vehicleType' });
    }
    
    const estimatedHours = await estimateDeliveryTime(fromLocation, toLocation, vehicleType, cargoDescription, pickupDate);
    const estimatedDate = new Date();
    if (pickupDate) {
      estimatedDate.setTime(new Date(pickupDate).getTime());
    }
    estimatedDate.setHours(estimatedDate.getHours() + estimatedHours);
    
    // Calculate confidence level based on data completeness
    let confidence = 'Medium';
    if (cargoDescription && pickupDate && fromLocation.pinCode && toLocation.pinCode) {
      confidence = 'High';
    } else if (!cargoDescription && !pickupDate) {
      confidence = 'Low';
    }
    
    res.json({
      estimatedHours,
      estimatedDate,
      confidence,
      breakdown: {
        baseTransitTime: Math.ceil(estimatedHours * 0.7),
        loadingUnloadingTime: Math.ceil(estimatedHours * 0.15),
        bufferTime: Math.ceil(estimatedHours * 0.15)
      }
    });
  } catch (error) {
    console.error('Delivery estimation error:', error);
    res.status(500).json({ error: 'Failed to estimate delivery time' });
  }
});

// Create booking
router.post('/bookings', async (req, res) => {
  try {
    const {
      farmerId,
      farmerName,
      vehicleId,
      vehicleType,
      priceOption,
      fromLocation,
      toLocation,
      pickupDate,
      pickupTime,
      distance,
      notes,
      cargoDescription
    } = req.body;

    console.log('Booking request received:', {
      farmerId,
      farmerName,
      vehicleId,
      vehicleType,
      fromLocation,
      toLocation,
      pickupDate,
      pickupTime,
      distance
    });

    // Validation
    if (!farmerId || !farmerName || !vehicleId || !vehicleType || !priceOption) {
      return res.status(400).json({ error: 'Missing required fields: farmerId, farmerName, vehicleId, vehicleType, priceOption' });
    }

    if (!fromLocation || !toLocation) {
      return res.status(400).json({ error: 'Missing location information' });
    }

    if (!fromLocation.state || !fromLocation.district || !fromLocation.city) {
      return res.status(400).json({ error: 'Incomplete pickup location information' });
    }

    if (!toLocation.state || !toLocation.district || !toLocation.city || !toLocation.pinCode) {
      return res.status(400).json({ error: 'Incomplete destination information. PIN code is required.' });
    }

    if (!pickupDate || !pickupTime) {
      return res.status(400).json({ error: 'Pickup date and time are required' });
    }

    if (!distance || distance <= 0) {
      return res.status(400).json({ error: 'Valid distance is required' });
    }

    if (!cargoDescription || cargoDescription.trim() === '') {
      return res.status(400).json({ error: 'Cargo description is required' });
    }

    // Calculate total amount
    const baseAmount = priceOption.basePrice + (priceOption.pricePerKm * distance);
    const handlingFee = 14;
    const finalAmount = baseAmount + handlingFee;

    // Generate booking ID and tracking ID
    const bookingId = `BK${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const trackingId = 'TRK' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4).toUpperCase();

    // Calculate expected delivery date using AI with enhanced parameters
    const estimatedHours = await estimateDeliveryTime(fromLocation, toLocation, vehicleType, cargoDescription, pickupDate);
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setHours(expectedDeliveryDate.getHours() + estimatedHours);

    const booking = new Booking({
      bookingId,
      trackingId,
      farmerId,
      farmerName,
      vehicleId,
      vehicleType,
      priceOption,
      fromLocation,
      toLocation,
      pickupDate,
      pickupTime,
      expectedDeliveryDate,
      distance,
      totalAmount: baseAmount,
      handlingFee,
      finalAmount,
      notes,
      cargoDescription
    });

    console.log('Attempting to save booking...');
    await booking.save();
    console.log('Booking saved successfully:', bookingId);

    // Create update notification for farmer
    console.log('Looking for user with farmerId:', farmerId);
    const user = await User.findOne({ farmerId });
    console.log('User found:', user ? user._id : 'Not found');
    if (user) {
      console.log('Creating update with userId:', user._id);
      const update = new Update({
        userId: user._id,
        title: 'Transport Booking Confirmed',
        message: `Your transport booking ${bookingId} has been placed successfully. Tracking ID: ${trackingId}. Expected delivery: ${expectedDeliveryDate.toLocaleDateString()}`,
        category: 'transport',
        isActive: true
      });
      await update.save();
      console.log('Update saved successfully');
    } else {
      console.log('User not found, skipping notification');
    }

    res.status(201).json({ 
      message: 'Booking created successfully', 
      booking,
      trackingId,
      expectedDeliveryDate
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to create booking', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get bookings for farmer
router.get('/bookings/farmer/:farmerId', async (req, res) => {
  try {
    const bookings = await Booking.find({ farmerId: req.params.farmerId })
      .populate('vehicleId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get all bookings (for admin)
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicleId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Admin specific route for transport bookings
router.get('/admin/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicleId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin bookings' });
  }
});

// Update booking status
router.patch('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Update tracking step
router.patch('/bookings/:id/tracking', async (req, res) => {
  try {
    const { step, location, notes } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update the specific tracking step
    const stepIndex = booking.trackingSteps.findIndex(s => s.step === step);
    if (stepIndex !== -1) {
      booking.trackingSteps[stepIndex].status = 'completed';
      booking.trackingSteps[stepIndex].timestamp = new Date();
      booking.trackingSteps[stepIndex].location = location;
      booking.trackingSteps[stepIndex].notes = notes;

      // Update next step to current if exists
      if (stepIndex + 1 < booking.trackingSteps.length) {
        booking.trackingSteps[stepIndex + 1].status = 'current';
      }

      // Update booking status based on step
      if (step === 'order_accepted') booking.status = 'confirmed';
      if (step === 'pickup_started' || step === 'order_picked_up') booking.status = 'in-progress';
      if (step === 'delivered') {
        booking.status = 'completed';
        booking.actualDeliveryDate = new Date();
      }

      await booking.save();

      // Create update notification for farmer
      const stepMessages = {
        'order_accepted': 'Your order has been accepted by the driver',
        'pickup_started': 'Driver is on the way to pickup location',
        'order_picked_up': 'Your order has been picked up',
        'in_transit': 'Your order is in transit',
        'delivered': 'Your order has been delivered successfully'
      };

      const user = await User.findOne({ farmerId: booking.farmerId });
      if (user) {
        const update = new Update({
          userId: user._id,
          title: 'Transport Update',
          message: `${stepMessages[step]}. Tracking ID: ${booking.trackingId}`,
          category: 'transport',
          isActive: true
        });
        await update.save();
      }
    }

    res.json(booking);
  } catch (error) {
    console.error('Tracking update error:', error);
    res.status(500).json({ error: 'Failed to update tracking' });
  }
});

// Get booking by tracking ID
router.get('/track/:trackingId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ trackingId: req.params.trackingId })
      .populate('vehicleId');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracking information' });
  }
});

// Request cancellation
router.post('/bookings/:id/cancel-request', async (req, res) => {
  try {
    const { reason, requestedBy } = req.body;
    console.log('Cancellation request:', { bookingId: req.params.id, reason, requestedBy });
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      console.log('Booking not found:', req.params.id);
      return res.status(404).json({ error: 'Booking not found' });
    }

    console.log('Current booking status:', booking.status);
    console.log('Tracking steps:', booking.trackingSteps);

    // Check if cancellation is allowed (not if picked up)
    const pickedUpStep = booking.trackingSteps?.find(s => s.step === 'order_picked_up');
    if (pickedUpStep && pickedUpStep.status === 'completed') {
      console.log('Cannot cancel - order already picked up');
      return res.status(400).json({ error: 'Cannot cancel order after pickup' });
    }

    // Check if already cancelled or cancellation requested
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' });
    }

    if (booking.status === 'cancellation_requested') {
      return res.status(400).json({ error: 'Cancellation request already submitted' });
    }

    booking.status = 'cancellation_requested';
    booking.cancellationRequest = {
      requestedBy: requestedBy || 'farmer',
      requestedAt: new Date(),
      reason: reason,
      status: 'pending'
    };

    console.log('Saving booking with cancellation request...');
    await booking.save();
    console.log('Booking saved successfully');

    // Create update notification
    try {
      const user = await User.findOne({ farmerId: booking.farmerId });
      if (user) {
        const update = new Update({
          userId: user._id,
          title: 'Cancellation Request Submitted',
          message: `Your cancellation request for booking ${booking.bookingId} has been submitted and is under review.`,
          category: 'transport',
          isActive: true
        });
        await update.save();
        console.log('Update notification created');
      }
    } catch (updateError) {
      console.error('Failed to create update notification:', updateError);
      // Don't fail the request if notification fails
    }

    res.json({ message: 'Cancellation request submitted successfully', booking });
  } catch (error) {
    console.error('Cancellation request error:', error);
    res.status(500).json({ error: 'Failed to submit cancellation request: ' + error.message });
  }
});

// Approve/Deny cancellation
router.patch('/bookings/:id/cancel-review', async (req, res) => {
  try {
    const { action, reviewNotes, reviewedBy } = req.body; // action: 'approved' or 'denied'
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.cancellationRequest.status = action;
    booking.cancellationRequest.reviewedBy = reviewedBy;
    booking.cancellationRequest.reviewedAt = new Date();
    booking.cancellationRequest.reviewNotes = reviewNotes;

    if (action === 'approved') {
      booking.status = 'cancelled';
    } else {
      booking.status = 'confirmed'; // Reset to confirmed if denied
    }

    await booking.save();

    // Create update notification for farmer
    const user = await User.findOne({ farmerId: booking.farmerId });
    if (user) {
      const update = new Update({
        userId: user._id,
        title: `Cancellation Request ${action === 'approved' ? 'Approved' : 'Denied'}`,
        message: `Your cancellation request for booking ${booking.bookingId} has been ${action}. ${reviewNotes || ''}`,
        category: 'transport',
        isActive: true
      });
      await update.save();
    }

    res.json({ message: `Cancellation request ${action}`, booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to review cancellation request' });
  }
});

// Check and handle overdue deliveries (to be called by a cron job)
router.post('/check-overdue', async (req, res) => {
  try {
    const now = new Date();
    const overdueBookings = await Booking.find({
      expectedDeliveryDate: { $lt: now },
      status: { $in: ['confirmed', 'in-progress'] },
      isOverdue: false
    });

    for (const booking of overdueBookings) {
      booking.isOverdue = true;
      
      // Set new expected date (2 days from now)
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 2);
      booking.newExpectedDate = newDate;

      await booking.save();

      // Send apology update to farmer
      const user = await User.findOne({ farmerId: booking.farmerId });
      if (user) {
        const update = new Update({
          userId: user._id,
          title: 'Delivery Delay - Apology',
          message: `We apologize for the delay in your delivery (${booking.trackingId}). New expected delivery date: ${newDate.toLocaleDateString()}`,
          category: 'transport',
          isActive: true
        });
        await update.save();
      }
    }

    res.json({ message: `Processed ${overdueBookings.length} overdue bookings` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check overdue deliveries' });
  }
});

// Assign driver to booking (Admin Driver accepts order)
router.patch('/bookings/:id/assign-driver', async (req, res) => {
  try {
    const { driverId } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { driverId },
      { new: true }
    ).populate('vehicleId');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Update first tracking step to accepted
    if (booking.trackingSteps.length > 0) {
      booking.trackingSteps[0].status = 'completed';
      booking.trackingSteps[0].timestamp = new Date();
      
      if (booking.trackingSteps.length > 1) {
        booking.trackingSteps[1].status = 'current';
      }
      
      booking.status = 'confirmed';
      await booking.save();
    }

    // Send notification to the assigned driver
    const Update = require('../models/Update');
    const Driver = require('../models/Driver');
    const driver = await Driver.findOne({ driverId });
    
    if (driver) {
      const driverUpdate = new Update({
        userId: driver._id,
        title: 'New Order Assignment',
        message: `You have been assigned a new transport order ${booking.bookingId}. Please review and accept/reject the order.`,
        category: 'transport',
        isActive: true,
        metadata: {
          bookingId: booking.bookingId,
          orderId: booking._id,
          actionRequired: 'accept_reject'
        }
      });
      await driverUpdate.save();
    }
    
    res.json({ message: 'Driver assigned successfully', booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign driver' });
  }
});

// Get bookings for driver
router.get('/bookings/driver/:driverId', async (req, res) => {
  try {
    const bookings = await Booking.find({ driverId: req.params.driverId })
      .populate('vehicleId')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch driver bookings' });
  }
});

// Update booking location (for real-time tracking)
router.patch('/bookings/:id/location', async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        currentLocation: {
          latitude,
          longitude,
          address,
          updatedAt: new Date()
        }
      },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ message: 'Location updated', booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get single booking details
router.get('/bookings/details/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.bookingId })
      .populate('vehicleId');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booking details' });
  }
});

// Admin Driver: Accept order (change status from confirmed to order_accepted)
router.patch('/bookings/:bookingId/admin-accept', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ bookingId });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update tracking steps
    const acceptedStep = booking.trackingSteps.find(s => s.step === 'order_accepted');
    if (acceptedStep) {
      acceptedStep.status = 'completed';
      acceptedStep.timestamp = new Date();
      acceptedStep.notes = 'Order accepted by admin driver';
    }

    // Set next step as current
    const nextStep = booking.trackingSteps.find(s => s.step === 'pickup_started');
    if (nextStep) {
      nextStep.status = 'current';
    }

    booking.status = 'order_accepted';
    await booking.save();

    // Notify farmer
    const Update = require('../models/Update');
    const User = require('../models/User');
    const user = await User.findOne({ farmerId: booking.farmerId });
    if (user) {
      const update = new Update({
        userId: user._id,
        title: 'Order Accepted',
        message: `Your transport order ${booking.bookingId} has been accepted and is being processed.`,
        category: 'transport',
        isActive: true
      });
      await update.save();
    }

    res.json({ message: 'Order accepted successfully', booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept order' });
  }
});

module.exports = router;