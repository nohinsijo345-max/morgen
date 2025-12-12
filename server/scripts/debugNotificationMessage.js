const axios = require('axios');

const API_URL = 'http://localhost:5050';

async function debugNotificationMessage() {
  console.log('🔍 Debugging Notification Message Issue');
  console.log('=' .repeat(50));

  try {
    // Step 1: Submit a PIN code only change request
    console.log('\n1️⃣ Submitting PIN code only change request...');
    
    try {
      const pinChangeResponse = await axios.post(`${API_URL}/api/profile/request-change`, {
        farmerId: 'FAR-369',
        changes: { pinCode: '123321' }
      });
      
      console.log('✅ PIN code change request submitted');
      const requestId = pinChangeResponse.data.request._id;
      console.log(`📝 Request ID: ${requestId}`);
      console.log(`🔍 Submitted changes:`, JSON.stringify(pinChangeResponse.data.request.changes, null, 2));
      
      // Step 2: Check what the admin panel sees
      console.log('\n2️⃣ Checking admin panel request details...');
      const adminResponse = await axios.get(`${API_URL}/api/admin/profile-requests`);
      const newRequest = adminResponse.data.find(req => req._id === requestId);
      
      if (newRequest) {
        console.log('📋 Admin panel sees:');
        console.log(`   Changes object:`, JSON.stringify(newRequest.changes, null, 2));
        console.log(`   Changes keys:`, Object.keys(newRequest.changes));
        
        // Check what fields would be included in notification
        const changedFields = Object.keys(newRequest.changes).filter(field => {
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
        
        console.log(`📝 Notification would show: "${changesList}"`);
        
        // Step 3: Get current user profile to see what might be getting added
        console.log('\n3️⃣ Checking current user profile...');
        const profileResponse = await axios.get(`${API_URL}/api/auth/profile/FAR-369`);
        const currentProfile = profileResponse.data;
        
        console.log('👤 Current profile fields:');
        console.log(`   Name: ${currentProfile.name}`);
        console.log(`   State: ${currentProfile.state}`);
        console.log(`   District: ${currentProfile.district}`);
        console.log(`   City: ${currentProfile.city}`);
        console.log(`   PIN Code: ${currentProfile.pinCode}`);
        console.log(`   Land Size: ${currentProfile.landSize}`);
        console.log(`   Crop Types: ${JSON.stringify(currentProfile.cropTypes)}`);
        
        // Step 4: Approve and see what happens
        console.log('\n4️⃣ Approving request and checking notification...');
        
        const approvalResponse = await axios.post(`${API_URL}/api/admin/profile-requests/${requestId}/approve`);
        console.log('✅ Request approved');
        
        // Check the notification that was created
        const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/farmer/FAR-369`);
        const updates = dashboardResponse.data.updates || [];
        const latestProfileUpdate = updates.find(u => u.category === 'profile' && u.title === 'Profile Changes Approved');
        
        if (latestProfileUpdate) {
          console.log('📢 Notification created:');
          console.log(`   Title: ${latestProfileUpdate.title}`);
          console.log(`   Message: ${latestProfileUpdate.message}`);
          console.log(`   Created: ${new Date(latestProfileUpdate.createdAt).toLocaleString()}`);
        } else {
          console.log('❌ No profile approval notification found');
        }
        
      } else {
        console.log('❌ Request not found in admin panel');
      }
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('already have a pending')) {
        console.log('⚠️  Farmer already has a pending request - this is expected');
        
        // Get the existing request
        const adminResponse = await axios.get(`${API_URL}/api/admin/profile-requests`);
        const existingRequest = adminResponse.data.find(req => req.farmer?.farmerId === 'FAR-369');
        
        if (existingRequest) {
          console.log('📋 Existing request details:');
          console.log(`   Changes:`, JSON.stringify(existingRequest.changes, null, 2));
          console.log(`   Request ID: ${existingRequest._id}`);
          
          // Approve the existing request
          console.log('\n🔄 Approving existing request...');
          try {
            await axios.post(`${API_URL}/api/admin/profile-requests/${existingRequest._id}/approve`);
            console.log('✅ Existing request approved');
            
            // Check notification
            const dashboardResponse = await axios.get(`${API_URL}/api/dashboard/farmer/FAR-369`);
            const updates = dashboardResponse.data.updates || [];
            const latestProfileUpdate = updates.find(u => u.category === 'profile' && u.title === 'Profile Changes Approved');
            
            if (latestProfileUpdate) {
              console.log('📢 Latest notification:');
              console.log(`   Message: ${latestProfileUpdate.message}`);
            }
          } catch (approvalError) {
            console.log('❌ Approval failed:', approvalError.response?.data?.error || approvalError.message);
          }
        }
      } else {
        console.log('❌ Request submission failed:', error.response?.data?.error || error.message);
      }
    }

    console.log('\n🎯 Analysis Complete');
    console.log('The issue is likely that the notification message is showing all fields in the changes object,');
    console.log('not just the fields that were originally requested by the farmer.');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugNotificationMessage();