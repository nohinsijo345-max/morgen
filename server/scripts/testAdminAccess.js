const axios = require('axios');

async function testAdminAccess() {
  try {
    console.log('🔍 Testing admin access and creating admin user if needed...\n');

    const API_URL = 'http://localhost:5050';
    
    // Test 1: Check if any users have admin role
    console.log('1. Checking for existing admin users...');
    try {
      const usersResponse = await axios.get(`${API_URL}/api/admin/users`);
      const adminUsers = usersResponse.data.filter(user => user.role === 'admin');
      
      console.log(`📊 Total users: ${usersResponse.data.length}`);
      console.log(`📊 Admin users: ${adminUsers.length}`);
      
      if (adminUsers.length > 0) {
        console.log('\n📋 Existing admin users:');
        adminUsers.forEach((admin, index) => {
          console.log(`${index + 1}. Admin ID: ${admin.farmerId}, Name: ${admin.name}`);
        });
        
        // Test login with first admin
        console.log('\n2. Testing admin login...');
        const firstAdmin = adminUsers[0];
        
        // Try common PINs
        const commonPins = ['1234', 'admin', '0000', '1111'];
        let loginSuccess = false;
        
        for (const pin of commonPins) {
          try {
            const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
              farmerId: firstAdmin.farmerId,
              pin: pin
            });
            
            if (loginResponse.data.role === 'admin') {
              console.log(`✅ Admin login successful with PIN: ${pin}`);
              console.log('📋 Admin data:', loginResponse.data);
              loginSuccess = true;
              
              console.log('\n🎯 ADMIN ACCESS WORKING:');
              console.log('1. Go to: http://localhost:3000/admin-login');
              console.log(`2. Admin ID: ${firstAdmin.farmerId}`);
              console.log(`3. PIN: ${pin}`);
              break;
            }
          } catch (loginError) {
            // Continue trying other PINs
          }
        }
        
        if (!loginSuccess) {
          console.log('❌ Could not login with common PINs');
          console.log('💡 The admin user exists but PIN is unknown');
          console.log('💡 You may need to reset the admin PIN in the database');
        }
        
      } else {
        console.log('❌ No admin users found in database');
        console.log('\n💡 SOLUTION: Create an admin user');
        console.log('You need to:');
        console.log('1. Add an admin user to the database');
        console.log('2. Set role: "admin" in the user document');
        console.log('3. Use a known PIN for login');
        
        // Check if we can create admin via registration
        console.log('\n3. Attempting to create admin user via registration...');
        try {
          const registerResponse = await axios.post(`${API_URL}/api/auth/register`, {
            name: 'System Administrator',
            phone: '9999999999',
            email: 'admin@morgen.com',
            pin: '1234',
            state: 'kerala',
            district: 'ernakulam',
            city: 'Kochi',
            pinCode: '682001',
            panchayat: 'Admin',
            landSize: 0,
            cropTypes: ['rice'],
            subsidyRequested: false,
            role: 'admin'  // Try to set admin role
          });
          
          console.log('✅ Admin user created via registration');
          console.log('📋 New admin:', registerResponse.data);
          
          // Now test login
          const loginTest = await axios.post(`${API_URL}/api/auth/login`, {
            farmerId: registerResponse.data.farmerId,
            pin: '1234'
          });
          
          if (loginTest.data.role === 'admin') {
            console.log('✅ New admin login successful');
            console.log('\n🎯 ADMIN ACCESS CREATED:');
            console.log('1. Go to: http://localhost:3000/admin-login');
            console.log(`2. Admin ID: ${registerResponse.data.farmerId}`);
            console.log('3. PIN: 1234');
          } else {
            console.log('⚠️ User created but role is not admin:', loginTest.data.role);
          }
          
        } catch (registerError) {
          console.log('❌ Failed to create admin via registration');
          console.log('Error:', registerError.response?.data?.error || registerError.message);
        }
      }
      
    } catch (error) {
      console.log('❌ Failed to fetch users:', error.response?.data || error.message);
    }
    
    // Test 2: Check admin login page accessibility
    console.log('\n4. Testing admin login page access...');
    console.log('🌐 Admin login should be accessible at:');
    console.log('   http://localhost:3000/admin-login');
    console.log('   (This should work directly, not through module selector)');

  } catch (error) {
    console.error('❌ Error testing admin access:', error.message);
  }
}

testAdminAccess();