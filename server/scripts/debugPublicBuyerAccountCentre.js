#!/usr/bin/env node

/**
 * Debug Public Buyer Account Centre Issue
 * 
 * This script tests the specific scenario where:
 * 1. Commercial buyer is logged in tab 1
 * 2. Public buyer is logged in tab 2
 * 3. Public buyer tries to access Account Centre
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5050';

async function debugPublicBuyerIssue() {
  console.log('🔍 Debugging Public Buyer Account Centre Issue...\n');
  
  try {
    // Step 1: Test commercial buyer login
    console.log('1️⃣ Testing commercial buyer login...');
    const commercialResponse = await axios.post(`${API_URL}/api/auth/buyer/login`, {
      buyerId: 'MGB002',
      pin: '1234'
    });
    
    console.log('✅ Commercial buyer login successful:', {
      buyerId: commercialResponse.data.buyerId,
      buyerType: commercialResponse.data.buyerType,
      name: commercialResponse.data.name
    });
    
    // Step 2: Test public buyer login
    console.log('\n2️⃣ Testing public buyer login...');
    const publicResponse = await axios.post(`${API_URL}/api/auth/buyer/login`, {
      buyerId: 'MGPB001',
      pin: '1234'
    });
    
    console.log('✅ Public buyer login successful:', {
      buyerId: publicResponse.data.buyerId,
      buyerType: publicResponse.data.buyerType,
      name: publicResponse.data.name
    });
    
    // Step 3: Test public buyer profile access
    console.log('\n3️⃣ Testing public buyer profile access...');
    try {
      const profileResponse = await axios.get(`${API_URL}/api/auth/profile/${publicResponse.data.buyerId}`);
      console.log('✅ Public buyer profile access successful:', {
        buyerId: profileResponse.data.buyerId,
        name: profileResponse.data.name,
        buyerType: profileResponse.data.buyerType,
        hasProfileImage: !!profileResponse.data.profileImage
      });
    } catch (profileError) {
      console.error('❌ Public buyer profile access failed:', {
        status: profileError.response?.status,
        error: profileError.response?.data?.error || profileError.message,
        buyerId: publicResponse.data.buyerId
      });
      
      // Let's check if the user exists in the database
      console.log('\n4️⃣ Checking if public buyer exists in database...');
      try {
        const checkResponse = await axios.get(`${API_URL}/api/admin/buyers`);
        const publicBuyer = checkResponse.data.find(buyer => buyer.buyerId === 'MGPB001');
        
        if (publicBuyer) {
          console.log('✅ Public buyer found in database:', {
            buyerId: publicBuyer.buyerId,
            name: publicBuyer.name,
            buyerType: publicBuyer.buyerType,
            _id: publicBuyer._id
          });
        } else {
          console.log('❌ Public buyer NOT found in database');
          console.log('Available buyers:', checkResponse.data.map(b => ({
            buyerId: b.buyerId,
            name: b.name,
            buyerType: b.buyerType
          })));
        }
      } catch (dbError) {
        console.error('❌ Failed to check database:', dbError.response?.data || dbError.message);
      }
    }
    
    // Step 4: Test pending request check for public buyer
    console.log('\n5️⃣ Testing pending request check for public buyer...');
    try {
      const pendingResponse = await axios.get(`${API_URL}/api/profile/pending-request/${publicResponse.data.buyerId}`);
      console.log('✅ Pending request check successful:', {
        hasPendingRequest: !!pendingResponse.data.pendingRequest,
        pendingRequest: pendingResponse.data.pendingRequest
      });
    } catch (pendingError) {
      console.error('❌ Pending request check failed:', {
        status: pendingError.response?.status,
        error: pendingError.response?.data?.error || pendingError.message
      });
    }
    
    // Step 5: Compare commercial vs public buyer data structure
    console.log('\n6️⃣ Comparing buyer data structures...');
    console.log('Commercial buyer data keys:', Object.keys(commercialResponse.data));
    console.log('Public buyer data keys:', Object.keys(publicResponse.data));
    
    const commercialKeys = Object.keys(commercialResponse.data);
    const publicKeys = Object.keys(publicResponse.data);
    const missingInPublic = commercialKeys.filter(key => !publicKeys.includes(key));
    const missingInCommercial = publicKeys.filter(key => !commercialKeys.includes(key));
    
    if (missingInPublic.length > 0) {
      console.log('⚠️ Keys missing in public buyer:', missingInPublic);
    }
    if (missingInCommercial.length > 0) {
      console.log('⚠️ Keys missing in commercial buyer:', missingInCommercial);
    }
    
    console.log('\n📊 Summary:');
    console.log('- Commercial buyer login: ✅');
    console.log('- Public buyer login: ✅');
    console.log('- Public buyer profile access: ❌ (This is the issue)');
    console.log('\n🔧 Next steps:');
    console.log('1. Check if MGPB001 exists in the correct collection');
    console.log('2. Verify the profile API endpoint handles public buyers correctly');
    console.log('3. Check if there are any differences in data structure');
    
  } catch (error) {
    console.error('❌ Debug script failed:', error.response?.data || error.message);
  }
}

// Run the debug
debugPublicBuyerIssue().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});