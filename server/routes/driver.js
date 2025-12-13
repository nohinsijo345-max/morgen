const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Driver login
router.post('/login', async (req, res) => {
  try {
    const { driverId, password } = req.body;
    
    const driver = await Driver.findOne({ driverId });
    if (!driver) {
      return res.status(401).json({ error: 'Invalid driver ID or password' });
    }

    const isValidPassword = await bcrypt.compare(password, driver.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid driver ID or password' });
    }

    if (!driver.isActive) {
      return res.status(401).json({ error: 'Driver account is deactivated' });
    }

    res.json({
      message: 'Login successful',
      driver: {
        driverId: driver.driverId,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        district: driver.district,
        rating: driver.rating,
        totalTrips: driver.totalTrips
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get driver dashboard data
router.get('/dashboard/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    
    const driver = await Driver.findOne({ driverId });
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Get driver's vehicles
    const vehicles = await Vehicle.find({ driverId: driverId });
    
    // Get recent bookings
    const recentBookings = await Booking.find({ driverId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get pending bookings count
    const pendingBookings = await Booking.countDocuments({ 
      driverId, 
      status: 'pending' 
    });

    // Calculate total earnings
    const earningsResult = await Booking.aggregate([
      { $match: { driverId, status: 'completed' } },
      { $group: { _id: null, totalEarnings: { $sum: '$finalAmount' } } }
    ]);
    const totalEarnings = earningsResult[0]?.totalEarnings || 0;

    // Get total trips count
    const totalTrips = await Booking.countDocuments({ driverId });

    res.json({
      driver: {
        name: driver.name,
        driverId: driver.driverId,
        email: driver.email,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        district: driver.district,
        rating: driver.rating,
        totalTrips: totalTrips
      },
      vehicles,
      recentBookings,
      stats: {
        pendingBookings,
        totalVehicles: vehicles.length,
        totalTrips: totalTrips,
        totalEarnings: totalEarnings,
        rating: driver.rating
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get driver's vehicles
router.get('/vehicles/:driverId', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ driverId: req.params.driverId });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Add/Update vehicle
router.post('/vehicles', async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json({ message: 'Vehicle added successfully', vehicle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
});

router.put('/vehicles/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ message: 'Vehicle updated successfully', vehicle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Get driver's bookings
router.get('/bookings/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    console.log(`🔍 Fetching bookings for driver: ${driverId}`);
    
    const bookings = await Booking.find({ driverId })
      .populate('vehicleId')
      .sort({ createdAt: -1 });
    
    console.log(`📦 Found ${bookings.length} bookings for driver ${driverId}`);
    bookings.forEach(booking => {
      console.log(`   - ${booking.bookingId}: ${booking.status} (${booking.farmerName})`);
    });
    
    res.json(bookings);
  } catch (error) {
    console.error(`❌ Error fetching bookings for driver ${req.params.driverId}:`, error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Accept booking (driver accepts a booking)
router.patch('/bookings/:bookingId/accept', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { driverId } = req.body;
    
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Assign driver to booking
    booking.driverId = driverId;
    booking.status = 'confirmed';
    
    // Update tracking steps
    const acceptedStep = booking.trackingSteps.find(s => s.step === 'order_accepted');
    if (acceptedStep) {
      acceptedStep.status = 'completed';
      acceptedStep.timestamp = new Date();
      acceptedStep.notes = `Accepted by driver ${driverId}`;
    }
    
    // Set next step as current
    const nextStep = booking.trackingSteps.find(s => s.step === 'pickup_started');
    if (nextStep) {
      nextStep.status = 'current';
    }
    
    await booking.save();
    
    // Create update notification for farmer
    const Update = require('../models/Update');
    const user = await User.findOne({ farmerId: booking.farmerId });
    if (user) {
      const update = new Update({
        userId: user._id,
        title: 'Booking Accepted',
        message: `Your transport booking ${booking.bookingId} has been accepted by a driver.`,
        category: 'transport',
        isActive: true
      });
      await update.save();
    }
    
    res.json({ message: 'Booking accepted successfully', booking });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept booking' });
  }
});

// Update booking status by driver
router.patch('/bookings/:bookingId/update-status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { step, location, notes } = req.body;
    
    console.log(`🔄 Driver updating status for booking ${bookingId}:`, { step, location, notes });
    
    // Validate required fields
    if (!step || typeof step !== 'string' || step.trim() === '') {
      console.log(`❌ Missing or invalid step field`);
      return res.status(400).json({ error: 'Step is required and must be a valid string' });
    }
    
    if (!location || typeof location !== 'string' || location.trim() === '') {
      console.log(`❌ Missing or invalid location field`);
      return res.status(400).json({ error: 'Location is required and must be a valid string' });
    }

    // Validate step value
    const validSteps = ['pickup_started', 'order_picked_up', 'in_transit', 'delivered'];
    if (!validSteps.includes(step.trim())) {
      console.log(`❌ Invalid step: ${step}`);
      return res.status(400).json({ error: `Invalid step. Must be one of: ${validSteps.join(', ')}` });
    }
    
    // Find booking with comprehensive error handling
    let booking;
    try {
      booking = await Booking.findOne({ bookingId: bookingId.trim() });
    } catch (dbError) {
      console.error(`❌ Database error finding booking ${bookingId}:`, dbError);
      return res.status(500).json({ error: 'Database error occurred while finding booking' });
    }
    
    if (!booking) {
      console.log(`❌ Booking ${bookingId} not found`);
      return res.status(404).json({ error: `Booking ${bookingId} not found` });
    }
    
    console.log(`📦 Found booking ${bookingId}, current status: ${booking.status}`);
    
    // Ensure booking has required fields
    if (!booking.fromLocation) {
      booking.fromLocation = { city: 'Unknown', district: 'Unknown', state: 'Unknown' };
    }
    if (!booking.toLocation) {
      booking.toLocation = { city: 'Unknown', district: 'Unknown', state: 'Unknown' };
    }
    
    // Validate and initialize tracking steps
    if (!booking.trackingSteps || !Array.isArray(booking.trackingSteps) || booking.trackingSteps.length === 0) {
      console.log(`❌ Booking ${bookingId} has no tracking steps, initializing...`);
      const fromLocationStr = booking.fromLocation?.city ? 
        `${booking.fromLocation.city}, ${booking.fromLocation.district || 'Unknown'}` : 
        'Unknown Location';
        
      booking.trackingSteps = [
        { 
          step: 'order_placed', 
          status: 'completed', 
          timestamp: new Date(), 
          location: fromLocationStr,
          notes: 'Order has been placed successfully'
        },
        { 
          step: 'order_accepted', 
          status: 'completed', 
          timestamp: new Date(), 
          notes: 'Order accepted by driver'
        },
        { step: 'pickup_started', status: 'pending' },
        { step: 'order_picked_up', status: 'pending' },
        { step: 'in_transit', status: 'pending' },
        { step: 'delivered', status: 'pending' }
      ];
    }
    
    console.log(`📋 Current tracking steps:`, booking.trackingSteps.map(s => `${s.step}: ${s.status}`));
    
    // Validate status progression logic
    const statusProgression = {
      'pickup_started': ['order_processing', 'order_accepted'],
      'order_picked_up': ['pickup_started'],
      'in_transit': ['order_picked_up'],
      'delivered': ['in_transit']
    };
    
    const allowedPreviousStatuses = statusProgression[step];
    if (allowedPreviousStatuses && !allowedPreviousStatuses.includes(booking.status)) {
      console.log(`❌ Invalid status progression: ${booking.status} -> ${step}`);
      return res.status(400).json({ 
        error: `Cannot update to ${step} from current status ${booking.status}. Expected one of: ${allowedPreviousStatuses.join(', ')}` 
      });
    }
    
    // Update the specific tracking step
    const stepIndex = booking.trackingSteps.findIndex(s => s.step === step);
    if (stepIndex !== -1) {
      console.log(`✅ Updating step ${step} at index ${stepIndex}`);
      
      // Check if step is already completed
      if (booking.trackingSteps[stepIndex].status === 'completed') {
        console.log(`⚠️ Step ${step} is already completed`);
        return res.status(400).json({ 
          error: `Step ${step} is already completed`,
          currentStatus: booking.status,
          completedAt: booking.trackingSteps[stepIndex].timestamp
        });
      }
      
      // Validate step object structure
      if (!booking.trackingSteps[stepIndex].step) {
        console.log(`❌ Invalid tracking step structure at index ${stepIndex}`);
        return res.status(500).json({ error: 'Invalid tracking step structure' });
      }
      
      // Update the step
      booking.trackingSteps[stepIndex].status = 'completed';
      booking.trackingSteps[stepIndex].timestamp = new Date();
      booking.trackingSteps[stepIndex].location = location.trim();
      booking.trackingSteps[stepIndex].notes = notes ? notes.trim() : `${step.replace(/_/g, ' ')} completed`;

      // Update next step to current if exists
      if (stepIndex + 1 < booking.trackingSteps.length) {
        booking.trackingSteps[stepIndex + 1].status = 'current';
        console.log(`➡️ Set next step ${booking.trackingSteps[stepIndex + 1].step} to current`);
      }

      // Update booking status based on step with validation
      let newStatus = booking.status;
      switch (step) {
        case 'pickup_started':
          newStatus = 'pickup_started';
          break;
        case 'order_picked_up':
          newStatus = 'order_picked_up';
          break;
        case 'in_transit':
          newStatus = 'in_transit';
          break;
        case 'delivered':
          newStatus = 'delivered';
          booking.actualDeliveryDate = new Date();
          break;
        default:
          console.log(`⚠️ Unknown step for status update: ${step}`);
      }
      
      if (newStatus !== booking.status) {
        console.log(`📊 Updating booking status from ${booking.status} to ${newStatus}`);
        booking.status = newStatus;
      }

      // Save with comprehensive error handling
      try {
        // Validate before saving
        const validationError = booking.validateSync();
        if (validationError) {
          console.error(`❌ Validation error for booking ${bookingId}:`, validationError);
          return res.status(400).json({ 
            error: 'Booking validation failed', 
            details: validationError.message 
          });
        }
        
        await booking.save();
        console.log(`💾 Booking ${bookingId} saved successfully`);
      } catch (saveError) {
        console.error(`❌ Error saving booking ${bookingId}:`, saveError);
        
        // Provide specific error messages based on error type
        if (saveError.name === 'ValidationError') {
          return res.status(400).json({ 
            error: 'Booking validation failed', 
            details: saveError.message 
          });
        } else if (saveError.name === 'MongoError' || saveError.name === 'MongoServerError') {
          return res.status(500).json({ 
            error: 'Database error occurred', 
            details: 'Please try again in a moment' 
          });
        } else {
          return res.status(500).json({ 
            error: 'Failed to save booking changes', 
            details: saveError.message 
          });
        }
      }

      // Create update notification for farmer (non-blocking)
      try {
        const Update = require('../models/Update');
        const stepMessages = {
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
          console.log(`📢 Notification sent to farmer ${booking.farmerId}`);
        } else {
          console.log(`⚠️ Farmer ${booking.farmerId} not found for notification`);
        }
      } catch (notificationError) {
        console.error(`⚠️ Failed to send notification:`, notificationError);
        // Don't fail the request if notification fails
      }
    } else {
      console.log(`❌ Step ${step} not found in tracking steps`);
      console.log(`Available steps:`, booking.trackingSteps.map(s => s.step));
      return res.status(400).json({ error: `Invalid step: ${step}. Available steps: ${booking.trackingSteps.map(s => s.step).join(', ')}` });
    }

    res.json({ 
      message: 'Status updated successfully', 
      booking: {
        bookingId: booking.bookingId,
        status: booking.status,
        trackingSteps: booking.trackingSteps
      }
    });
  } catch (error) {
    console.error(`❌ Error updating status for booking ${req.params.bookingId}:`, error);
    console.error(`Error stack:`, error.stack);
    res.status(500).json({ 
      error: 'Failed to update status', 
      details: error.message,
      bookingId: req.params.bookingId
    });
  }
});

// Update driver profile
router.put('/profile/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    const { name, phone, email } = req.body;
    
    const driver = await Driver.findOneAndUpdate(
      { driverId },
      { name, phone, email },
      { new: true }
    ).select('-password');
    
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }
    
    res.json({ message: 'Profile updated successfully', driver });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update vehicle availability
router.patch('/vehicles/:vehicleId/availability', async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { availability } = req.body;
    
    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { availability },
      { new: true }
    );
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json({ message: 'Vehicle availability updated', vehicle });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vehicle availability' });
  }
});

// Driver: Accept assigned order
router.patch('/orders/:bookingId/accept', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { driverId } = req.body;
    
    console.log(`🔍 Driver ${driverId} attempting to accept order ${bookingId}`);
    
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      console.log(`❌ Booking ${bookingId} not found`);
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if booking is assigned to this driver
    if (booking.driverId !== driverId) {
      console.log(`❌ Booking ${bookingId} not assigned to driver ${driverId}, assigned to: ${booking.driverId}`);
      return res.status(403).json({ error: 'Booking not assigned to you' });
    }

    // Check if booking is in correct status
    if (booking.status !== 'confirmed') {
      console.log(`❌ Booking ${bookingId} status is ${booking.status}, expected 'confirmed'`);
      return res.status(400).json({ error: `Cannot accept order with status: ${booking.status}` });
    }

    booking.status = 'order_processing';
    
    // Update tracking steps
    const processingStep = booking.trackingSteps.find(s => s.step === 'order_accepted');
    if (processingStep) {
      processingStep.status = 'completed';
      processingStep.timestamp = new Date();
      processingStep.notes = `Accepted by driver ${driverId}`;
    }

    await booking.save();
    console.log(`✅ Order ${bookingId} accepted successfully by driver ${driverId}`);

    // Notify farmer
    const Update = require('../models/Update');
    const user = await User.findOne({ farmerId: booking.farmerId });
    if (user) {
      const update = new Update({
        userId: user._id,
        title: 'Order Processing',
        message: `Your transport order ${booking.bookingId} has been accepted by the driver and is now being processed.`,
        category: 'transport',
        isActive: true
      });
      await update.save();
    }

    res.json({ message: 'Order accepted successfully', booking });
  } catch (error) {
    console.error(`❌ Error accepting order ${req.params.bookingId}:`, error);
    res.status(500).json({ error: 'Failed to accept order' });
  }
});

// Driver: Reject assigned order
router.patch('/orders/:bookingId/reject', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { driverId, reason } = req.body;
    
    console.log(`🔍 Driver ${driverId} attempting to reject order ${bookingId} with reason: ${reason}`);
    
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      console.log(`❌ Booking ${bookingId} not found`);
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if booking is assigned to this driver
    if (booking.driverId !== driverId) {
      console.log(`❌ Booking ${bookingId} not assigned to driver ${driverId}, assigned to: ${booking.driverId}`);
      return res.status(403).json({ error: 'Booking not assigned to you' });
    }

    // Check if booking is in correct status
    if (booking.status !== 'confirmed') {
      console.log(`❌ Booking ${bookingId} status is ${booking.status}, expected 'confirmed'`);
      return res.status(400).json({ error: `Cannot reject order with status: ${booking.status}` });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledBy = `Driver ${driverId}`;
    booking.cancelledAt = new Date();
    
    await booking.save();
    console.log(`✅ Order ${bookingId} rejected successfully by driver ${driverId}`);

    // Notify farmer
    const Update = require('../models/Update');
    const user = await User.findOne({ farmerId: booking.farmerId });
    if (user) {
      const update = new Update({
        userId: user._id,
        title: 'Order Cancelled',
        message: `Your transport order ${booking.bookingId} has been cancelled by the driver. Reason: ${reason}`,
        category: 'transport',
        isActive: true
      });
      await update.save();
    }

    res.json({ message: 'Order rejected successfully', booking });
  } catch (error) {
    console.error(`❌ Error rejecting order ${req.params.bookingId}:`, error);
    res.status(500).json({ error: 'Failed to reject order' });
  }
});

// Get single order details for driver
router.get('/orders/:bookingId/details', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ bookingId })
      .populate('vehicleId');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Get cancellation requests for driver
router.get('/cancellation-requests/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    
    const cancellationRequests = await Booking.find({
      driverId,
      status: 'cancellation_requested',
      'cancellationRequest.status': 'pending'
    }).populate('vehicleId').sort({ 'cancellationRequest.requestedAt': -1 });
    
    res.json(cancellationRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cancellation requests' });
  }
});

// Approve/Deny cancellation request (Driver)
router.patch('/cancellation-requests/:bookingId/review', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { action, reviewNotes, driverId } = req.body; // action: 'approved' or 'denied'
    
    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify this driver owns this booking
    if (booking.driverId !== driverId) {
      return res.status(403).json({ error: 'Unauthorized to review this cancellation request' });
    }

    booking.cancellationRequest.status = action;
    booking.cancellationRequest.reviewedBy = `Driver ${driverId}`;
    booking.cancellationRequest.reviewedAt = new Date();
    booking.cancellationRequest.reviewNotes = reviewNotes;

    if (action === 'approved') {
      booking.status = 'cancelled';
    } else {
      booking.status = 'confirmed'; // Reset to confirmed if denied
    }

    await booking.save();

    // Create update notification for farmer
    const Update = require('../models/Update');
    const user = await User.findOne({ farmerId: booking.farmerId });
    if (user) {
      const update = new Update({
        userId: user._id,
        title: `Cancellation Request ${action === 'approved' ? 'Approved' : 'Denied'}`,
        message: `Your cancellation request for booking ${booking.bookingId} has been ${action} by the driver. ${reviewNotes || ''}`,
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

module.exports = router;