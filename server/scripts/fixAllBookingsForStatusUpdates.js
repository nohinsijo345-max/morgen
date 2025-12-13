const mongoose = require('mongoose');
require('dotenv').config();

async function fixAllBookingsForStatusUpdates() {
  try {
    console.log('🔧 Fixing All Bookings for Status Updates');
    console.log('=' .repeat(60));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/morgen');
    console.log('📊 Connected to MongoDB');

    const Booking = require('../models/Booking');
    
    // Find all bookings that might have issues
    console.log('🔍 Finding bookings that need fixing...');
    
    const allBookings = await Booking.find({});
    console.log(`📦 Found ${allBookings.length} total bookings`);
    
    let fixedCount = 0;
    let alreadyGoodCount = 0;
    
    for (const booking of allBookings) {
      let needsFix = false;
      let fixDetails = [];
      
      // Check 1: Missing or empty tracking steps
      if (!booking.trackingSteps || !Array.isArray(booking.trackingSteps) || booking.trackingSteps.length === 0) {
        needsFix = true;
        fixDetails.push('Missing tracking steps');
      }
      
      // Check 2: Missing fromLocation
      if (!booking.fromLocation || !booking.fromLocation.city) {
        needsFix = true;
        fixDetails.push('Missing fromLocation');
      }
      
      // Check 3: Missing toLocation
      if (!booking.toLocation || !booking.toLocation.city) {
        needsFix = true;
        fixDetails.push('Missing toLocation');
      }
      
      // Check 4: Invalid tracking steps structure
      if (booking.trackingSteps && booking.trackingSteps.length > 0) {
        const requiredSteps = ['order_placed', 'order_accepted', 'pickup_started', 'order_picked_up', 'in_transit', 'delivered'];
        const existingSteps = booking.trackingSteps.map(s => s.step);
        const missingSteps = requiredSteps.filter(step => !existingSteps.includes(step));
        
        if (missingSteps.length > 0) {
          needsFix = true;
          fixDetails.push(`Missing steps: ${missingSteps.join(', ')}`);
        }
      }
      
      if (needsFix) {
        console.log(`\n🔧 Fixing booking: ${booking.bookingId}`);
        console.log(`   Issues: ${fixDetails.join(', ')}`);
        
        // Fix fromLocation
        if (!booking.fromLocation || !booking.fromLocation.city) {
          booking.fromLocation = {
            city: 'Unknown City',
            district: 'Unknown District',
            state: 'Unknown State',
            pinCode: '000000',
            address: 'Address not provided'
          };
          console.log(`   ✅ Fixed fromLocation`);
        }
        
        // Fix toLocation
        if (!booking.toLocation || !booking.toLocation.city) {
          booking.toLocation = {
            city: 'Unknown Destination',
            district: 'Unknown District',
            state: 'Unknown State',
            pinCode: '000000',
            address: 'Address not provided'
          };
          console.log(`   ✅ Fixed toLocation`);
        }
        
        // Fix tracking steps
        const fromLocationStr = `${booking.fromLocation.city}, ${booking.fromLocation.district}`;
        
        booking.trackingSteps = [
          { 
            step: 'order_placed', 
            status: 'completed', 
            timestamp: booking.createdAt || new Date(), 
            location: fromLocationStr,
            notes: 'Order has been placed successfully'
          },
          { 
            step: 'order_accepted', 
            status: booking.status === 'pending' ? 'pending' : 'completed', 
            timestamp: booking.status === 'pending' ? null : (booking.createdAt || new Date()),
            notes: booking.status === 'pending' ? null : 'Order accepted by driver'
          },
          { 
            step: 'pickup_started', 
            status: ['pickup_started', 'order_picked_up', 'in_transit', 'delivered'].includes(booking.status) ? 'completed' : 'pending',
            timestamp: ['pickup_started', 'order_picked_up', 'in_transit', 'delivered'].includes(booking.status) ? (booking.updatedAt || booking.createdAt) : null,
            location: ['pickup_started', 'order_picked_up', 'in_transit', 'delivered'].includes(booking.status) ? fromLocationStr : null,
            notes: ['pickup_started', 'order_picked_up', 'in_transit', 'delivered'].includes(booking.status) ? 'Pickup started' : null
          },
          { 
            step: 'order_picked_up', 
            status: ['order_picked_up', 'in_transit', 'delivered'].includes(booking.status) ? 'completed' : 'pending',
            timestamp: ['order_picked_up', 'in_transit', 'delivered'].includes(booking.status) ? (booking.updatedAt || booking.createdAt) : null,
            location: ['order_picked_up', 'in_transit', 'delivered'].includes(booking.status) ? fromLocationStr : null,
            notes: ['order_picked_up', 'in_transit', 'delivered'].includes(booking.status) ? 'Order picked up' : null
          },
          { 
            step: 'in_transit', 
            status: ['in_transit', 'delivered'].includes(booking.status) ? 'completed' : 'pending',
            timestamp: ['in_transit', 'delivered'].includes(booking.status) ? (booking.updatedAt || booking.createdAt) : null,
            location: ['in_transit', 'delivered'].includes(booking.status) ? 'En route' : null,
            notes: ['in_transit', 'delivered'].includes(booking.status) ? 'In transit' : null
          },
          { 
            step: 'delivered', 
            status: booking.status === 'delivered' ? 'completed' : 'pending',
            timestamp: booking.status === 'delivered' ? (booking.actualDeliveryDate || booking.updatedAt || booking.createdAt) : null,
            location: booking.status === 'delivered' ? `${booking.toLocation.city}, ${booking.toLocation.district}` : null,
            notes: booking.status === 'delivered' ? 'Delivered successfully' : null
          }
        ];
        
        console.log(`   ✅ Fixed tracking steps`);
        
        // Ensure required fields exist
        if (!booking.cargoDescription) {
          booking.cargoDescription = 'No description provided';
        }
        
        if (!booking.trackingId) {
          booking.trackingId = `TRK-${booking.bookingId}`;
        }
        
        // Save the fixed booking
        try {
          await booking.save();
          fixedCount++;
          console.log(`   ✅ Booking ${booking.bookingId} fixed and saved`);
        } catch (saveError) {
          console.error(`   ❌ Failed to save booking ${booking.bookingId}:`, saveError.message);
        }
      } else {
        alreadyGoodCount++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Fixed bookings: ${fixedCount}`);
    console.log(`✅ Already good bookings: ${alreadyGoodCount}`);
    console.log(`📦 Total bookings processed: ${allBookings.length}`);
    
    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const problematicBookings = await Booking.find({
      $or: [
        { trackingSteps: { $exists: false } },
        { trackingSteps: { $size: 0 } },
        { 'fromLocation.city': { $exists: false } },
        { 'toLocation.city': { $exists: false } }
      ]
    });
    
    if (problematicBookings.length === 0) {
      console.log('✅ All bookings are now properly structured!');
    } else {
      console.log(`⚠️ Still found ${problematicBookings.length} problematic bookings`);
      problematicBookings.forEach(booking => {
        console.log(`   - ${booking.bookingId}: Still has issues`);
      });
    }
    
    console.log('\n🎉 Database migration completed!');
    console.log('✅ All bookings should now work with status updates');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  fixAllBookingsForStatusUpdates();
}

module.exports = fixAllBookingsForStatusUpdates;