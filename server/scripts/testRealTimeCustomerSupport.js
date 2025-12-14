const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5050';

async function testRealTimeMessaging() {
  console.log('🧪 Testing Real-Time Customer Support Messaging...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Create a test ticket
    console.log('\n📝 Test 1: Creating test support ticket...');
    const ticketResponse = await axios.post(`${API_URL}/api/support/tickets`, {
      farmerId: 'TEST001',
      farmerName: 'Test Farmer',
      subject: 'Real-time messaging test',
      category: 'technical',
      message: 'Testing real-time messaging functionality'
    });

    const ticketId = ticketResponse.data.ticket.ticketId;
    console.log(`✅ Created ticket: ${ticketId}`);

    // Test 2: Admin sends reply
    console.log('\n💬 Test 2: Admin sending reply...');
    await axios.post(`${API_URL}/api/admin/support/tickets/${ticketId}/reply`, {
      message: 'Hello! We received your message and are here to help.'
    });
    console.log('✅ Admin reply sent');

    // Test 3: Check if farmer can see the reply immediately
    console.log('\n👀 Test 3: Checking if farmer can see admin reply...');
    const farmerTicketsResponse = await axios.get(`${API_URL}/api/support/tickets/farmer/TEST001`);
    const updatedTicket = farmerTicketsResponse.data.find(t => t.ticketId === ticketId);
    
    if (updatedTicket && updatedTicket.messages.length >= 2) {
      console.log('✅ Farmer can see admin reply immediately');
      console.log(`   Messages count: ${updatedTicket.messages.length}`);
      console.log(`   Latest message: "${updatedTicket.messages[updatedTicket.messages.length - 1].message}"`);
    } else {
      console.log('❌ Farmer cannot see admin reply');
    }

    // Test 4: Farmer sends reply
    console.log('\n💬 Test 4: Farmer sending reply...');
    await axios.post(`${API_URL}/api/support/tickets/${ticketId}/messages`, {
      sender: 'farmer',
      message: 'Thank you for the quick response!'
    });
    console.log('✅ Farmer reply sent');

    // Test 5: Check if admin can see the farmer reply immediately
    console.log('\n👀 Test 5: Checking if admin can see farmer reply...');
    const adminTicketsResponse = await axios.get(`${API_URL}/api/admin/support/tickets`);
    const adminUpdatedTicket = adminTicketsResponse.data.find(t => t.ticketId === ticketId);
    
    if (adminUpdatedTicket && adminUpdatedTicket.messages.length >= 3) {
      console.log('✅ Admin can see farmer reply immediately');
      console.log(`   Messages count: ${adminUpdatedTicket.messages.length}`);
      console.log(`   Latest message: "${adminUpdatedTicket.messages[adminUpdatedTicket.messages.length - 1].message}"`);
    } else {
      console.log('❌ Admin cannot see farmer reply');
    }

    // Test 6: Rapid message exchange
    console.log('\n⚡ Test 6: Testing rapid message exchange...');
    
    // Admin sends multiple messages quickly
    await axios.post(`${API_URL}/api/admin/support/tickets/${ticketId}/reply`, {
      message: 'Message 1 from admin'
    });
    
    await axios.post(`${API_URL}/api/admin/support/tickets/${ticketId}/reply`, {
      message: 'Message 2 from admin'
    });
    
    // Farmer replies quickly
    await axios.post(`${API_URL}/api/support/tickets/${ticketId}/messages`, {
      sender: 'farmer',
      message: 'Quick farmer reply 1'
    });
    
    await axios.post(`${API_URL}/api/support/tickets/${ticketId}/messages`, {
      sender: 'farmer',
      message: 'Quick farmer reply 2'
    });

    // Check final state
    const finalFarmerCheck = await axios.get(`${API_URL}/api/support/tickets/farmer/TEST001`);
    const finalAdminCheck = await axios.get(`${API_URL}/api/admin/support/tickets`);
    
    const finalFarmerTicket = finalFarmerCheck.data.find(t => t.ticketId === ticketId);
    const finalAdminTicket = finalAdminCheck.data.find(t => t.ticketId === ticketId);
    
    console.log(`✅ Final farmer view: ${finalFarmerTicket.messages.length} messages`);
    console.log(`✅ Final admin view: ${finalAdminTicket.messages.length} messages`);
    
    if (finalFarmerTicket.messages.length === finalAdminTicket.messages.length) {
      console.log('✅ Both sides have synchronized message counts');
    } else {
      console.log('❌ Message counts are not synchronized');
    }

    // Test 7: Timestamp verification
    console.log('\n⏰ Test 7: Verifying message timestamps...');
    const messages = finalFarmerTicket.messages;
    let timestampsValid = true;
    
    for (let i = 1; i < messages.length; i++) {
      const prevTime = new Date(messages[i-1].timestamp);
      const currTime = new Date(messages[i].timestamp);
      
      if (currTime < prevTime) {
        timestampsValid = false;
        break;
      }
    }
    
    if (timestampsValid) {
      console.log('✅ Message timestamps are in correct order');
    } else {
      console.log('❌ Message timestamps are out of order');
    }

    console.log('\n🎉 Real-time messaging test completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Ticket ID: ${ticketId}`);
    console.log(`   - Total messages: ${finalFarmerTicket.messages.length}`);
    console.log(`   - Farmer messages: ${finalFarmerTicket.messages.filter(m => m.sender === 'farmer').length}`);
    console.log(`   - Admin messages: ${finalFarmerTicket.messages.filter(m => m.sender === 'admin').length}`);
    console.log(`   - Status: ${finalFarmerTicket.status}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the test
testRealTimeMessaging();