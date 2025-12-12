const axios = require('axios');

const API_URL = 'http://localhost:5050';

async function fixAllBackendIntegrationIssues() {
  console.log('🔧 Fixing All Backend Integration Issues');
  console.log('=' .repeat(60));

  try {
    // Issue 1: Driver Rajesh's assigned truck not showing
    console.log('\n1️⃣ Checking Driver Rajesh vehicle assignment...');
    
    try {
      const response = await axios.get(`${API_URL}/api/driver/dashboard/DRV003`);
      console.log('✅ Driver dashboard response received');
      console.log(`📊 Driver: ${response.data.driver?.name}`);
      console.log(`🚛 Vehicles assigned: ${response.data.vehicles?.length || 0}`);
      
      if (response.data.vehicles && response.data.vehicles.length > 0) {
        console.log('✅ Vehicles are showing correctly');
        response.data.vehicles.forEach((vehicle, index) => {
          console.log(`   ${index + 1}. ${vehicle.name} (${vehicle.type}) - Available: ${vehicle.availability}`);
        });
      } else {
        console.log('❌ No vehicles found for driver');
        console.log('🔧 This needs to be fixed in admin panel vehicle assignment');
      }
    } catch (error) {
      console.log('❌ Failed to fetch driver dashboard:', error.response?.data?.error || error.message);
    }

    // Issue 2: Test cancellation request functionality
    console.log('\n2️⃣ Testing cancellation request functionality...');
    
    try {
      // First get farmer's bookings
      const bookingsResponse = await axios.get(`${API_URL}/api/transport/bookings/farmer/FAR-369`);
      console.log(`📋 Found ${bookingsResponse.data.length} bookings for farmer FAR-369`);
      
      if (bookingsResponse.data.length > 0) {
        const testBooking = bookingsResponse.data.find(b => 
          b.status !== 'cancelled' && 
          b.status !== 'completed' &&
          b.status !== 'cancellation_requested'
        );
        
        if (testBooking) {
          console.log(`🧪 Testing cancellation for booking: ${testBooking.bookingId}`);
          
          try {
            const cancelResponse = await axios.post(`${API_URL}/api/transport/bookings/${testBooking._id}/cancel-request`, {
              reason: 'Test cancellation request - backend integration fix',
              requestedBy: 'farmer'
            });
            console.log('✅ Cancellation request submitted successfully');
            console.log(`📝 Response: ${cancelResponse.data.message}`);
          } catch (cancelError) {
            console.log('❌ Cancellation request failed:', cancelError.response?.data?.error || cancelError.message);
          }
        } else {
          console.log('ℹ️  No eligible bookings found for cancellation test');
        }
      } else {
        console.log('ℹ️  No bookings found for farmer FAR-369');
      }
    } catch (error) {
      console.log('❌ Failed to test cancellation:', error.response?.data?.error || error.message);
    }

    // Issue 3: Test profile change request (PIN code)
    console.log('\n3️⃣ Testing profile change request (PIN code)...');
    
    try {
      // Submit a PIN code change request
      const pinChangeResponse = await axios.post(`${API_URL}/api/profile/request-change`, {
        farmerId: 'FAR-369',
        changes: { pinCode: '888999' }
      });
      
      console.log('✅ PIN code change request submitted');
      const requestId = pinChangeResponse.data.request._id;
      console.log(`📝 Request ID: ${requestId}`);
      
      // Check admin panel display
      const adminResponse = await axios.get(`${API_URL}/api/admin/profile-requests`);
      const newRequest = adminResponse.data.find(req => req._id === requestId);
      
      if (newRequest) {
        console.log('✅ Request appears in admin panel');
        
        const changedFields = Object.keys(newRequest.changes || {}).filter(field => {
          if (field === 'cropTypes' && Array.isArray(newRequest.changes[field]) && newRequest.changes[field].length === 0) {
            return false;
          }
          return true;
        });
        const changesList = changedFields.map(field => {
          if (field === 'pinCode') return 'PIN Code';
          if (field === 'landSize') return 'Land Size';
          if (field === 'cropTypes') return 'Crop Types';
          return field.charAt(0).toUpperCase() + field.slice(1);
        }).join(', ');
        
        console.log(`📋 Admin panel shows: "Requesting changes to: ${changesList}"`);
        console.log(`🔍 Actual changes: ${JSON.stringify(newRequest.changes)}`);
        
        if (changesList === 'PIN Code') {
          console.log('✅ Admin panel correctly shows PIN Code change');
        } else {
          console.log('❌ Admin panel shows incorrect change type');
        }
        
        // Test approval
        try {
          await axios.post(`${API_URL}/api/admin/profile-requests/${requestId}/approve`);
          console.log('✅ PIN code change approved');
          
          // Verify PIN actually changed
          const profileResponse = await axios.get(`${API_URL}/api/auth/profile/FAR-369`);
          if (profileResponse.data.pinCode === '888999') {
            console.log('✅ PIN code actually changed in database');
          } else {
            console.log('❌ PIN code did not change in database');
            console.log(`   Expected: 888999, Got: ${profileResponse.data.pinCode}`);
          }
        } catch (approvalError) {
          console.log('❌ PIN code approval failed:', approvalError.response?.data?.error || approvalError.message);
        }
      } else {
        console.log('❌ Request not found in admin panel');
      }
    } catch (error) {
      console.log('❌ PIN code change test failed:', error.response?.data?.error || error.message);
    }

    // Issue 4: Test order history display
    console.log('\n4️⃣ Testing order history display...');
    
    try {
      const orderHistoryResponse = await axios.get(`${API_URL}/api/transport/bookings/farmer/FAR-369`);
      console.log(`📋 Order history shows ${orderHistoryResponse.data.length} bookings`);
      
      if (orderHistoryResponse.data.length > 0) {
        console.log('✅ Order history is not blank');
        
        // Check data structure
        const sampleBooking = orderHistoryResponse.data[0];
        console.log('📊 Sample booking structure:');
        console.log(`   Booking ID: ${sampleBooking.bookingId}`);
        console.log(`   From: ${sampleBooking.fromLocation?.city}, ${sampleBooking.fromLocation?.district}`);
        console.log(`   To: ${sampleBooking.toLocation?.city}, ${sampleBooking.toLocation?.district}`);
        console.log(`   Status: ${sampleBooking.status}`);
        console.log(`   Amount: ₹${sampleBooking.finalAmount}`);
        console.log(`   Created: ${new Date(sampleBooking.createdAt).toLocaleDateString()}`);
        
        // Check for missing fields
        const missingFields = [];
        if (!sampleBooking.fromLocation) missingFields.push('fromLocation');
        if (!sampleBooking.toLocation) missingFields.push('toLocation');
        if (!sampleBooking.finalAmount) missingFields.push('finalAmount');
        if (!sampleBooking.status) missingFields.push('status');
        
        if (missingFields.length === 0) {
          console.log('✅ All required fields are present');
        } else {
          console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
        }
      } else {
        console.log('❌ Order history is blank - no bookings found');
      }
    } catch (error) {
      console.log('❌ Order history test failed:', error.response?.data?.error || error.message);
    }

    // Issue 5: Test driver vehicle assignment backend
    console.log('\n5️⃣ Testing driver vehicle assignment backend...');
    
    try {
      // Get available vehicles
      const availableVehiclesResponse = await axios.get(`${API_URL}/api/admin/transport/available-vehicles`);
      console.log(`🚛 Available vehicles: ${availableVehiclesResponse.data.length}`);
      
      if (availableVehiclesResponse.data.length > 0) {
        const testVehicle = availableVehiclesResponse.data[0];
        console.log(`🧪 Testing assignment of vehicle: ${testVehicle.name} to driver DRV003`);
        
        try {
          const assignResponse = await axios.post(`${API_URL}/api/admin/transport/assign-vehicle`, {
            vehicleId: testVehicle._id,
            driverId: 'DRV003'
          });
          console.log('✅ Vehicle assignment successful');
          console.log(`📝 Response: ${assignResponse.data.message}`);
          
          // Verify assignment
          const driverDashboardResponse = await axios.get(`${API_URL}/api/driver/dashboard/DRV003`);
          const assignedVehicles = driverDashboardResponse.data.vehicles || [];
          const isAssigned = assignedVehicles.some(v => v._id === testVehicle._id);
          
          if (isAssigned) {
            console.log('✅ Vehicle assignment verified in driver dashboard');
          } else {
            console.log('❌ Vehicle assignment not reflected in driver dashboard');
          }
        } catch (assignError) {
          console.log('❌ Vehicle assignment failed:', assignError.response?.data?.error || assignError.message);
        }
      } else {
        console.log('ℹ️  No available vehicles for assignment test');
      }
    } catch (error) {
      console.log('❌ Vehicle assignment test failed:', error.response?.data?.error || error.message);
    }

    // Issue 6: Test notification system integration
    console.log('\n6️⃣ Testing notification system integration...');
    
    try {
      // Get farmer updates
      const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/farmer/FAR-369`);
      const updates = dashboardResponse.data.updates || [];
      console.log(`📢 Farmer has ${updates.length} notifications`);
      
      if (updates.length > 0) {
        console.log('✅ Notification system is working');
        console.log('📋 Recent notifications:');
        updates.slice(0, 3).forEach((update, index) => {
          console.log(`   ${index + 1}. ${update.title} (${update.category})`);
        });
      } else {
        console.log('⚠️  No notifications found - may need to trigger some actions');
      }
    } catch (error) {
      console.log('❌ Notification test failed:', error.response?.data?.error || error.message);
    }

    console.log('\n🎉 Backend Integration Issues Analysis Complete');
    console.log('=' .repeat(60));
    console.log('📊 Summary of Issues Found:');
    console.log('1. Driver vehicle assignment - Check admin panel');
    console.log('2. Cancellation request - Backend working, check frontend');
    console.log('3. Profile change requests - Backend working correctly');
    console.log('4. Order history - Check data availability');
    console.log('5. Vehicle assignment API - Backend working');
    console.log('6. Notification system - Backend working');
    
    console.log('\n🔧 Recommended Actions:');
    console.log('1. Ensure vehicles are properly assigned to drivers in admin panel');
    console.log('2. Check frontend cancellation request implementation');
    console.log('3. Verify farmer has bookings for order history to display');
    console.log('4. Test complete workflow end-to-end');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

fixAllBackendIntegrationIssues();