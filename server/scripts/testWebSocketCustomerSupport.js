const mongoose = require('mongoose');
const axios = require('axios');
const io = require('socket.io-client');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5050';

async function testWebSocketMessaging() {
  console.log('🧪 Testing WebSocket-Based Real-Time Customer Support...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create Socket.IO clients for farmer and admin
    const farmerSocket = io(API_URL, { transports: ['websocket', 'polling'] });
    const adminSocket = io(API_URL, { transports: ['websocket', 'polling'] });

    // Wait for connections
    await new Promise((resolve) => {
      let connections = 0;
      
      farmerSocket.on('connect', () => {
        console.log('🔌 Farmer socket connected:', farmerSocket.id);
        connections++;
        if (connections === 2) resolve();
      });
      
      adminSocket.on('connect', () => {
        console.log('🔌 Admin socket connected:', adminSocket.id);
        connections++;
        if (connections === 2) resolve();
      });
    });

    // Test 1: Create a test ticket
    console.log('\n📝 Test 1: Creating test support ticket...');
    const ticketResponse = await axios.post(`${API_URL}/api/support/tickets`, {
      farmerId: 'WSTEST001',
      farmerName: 'WebSocket Test Farmer',
      subject: 'WebSocket real-time messaging test',
      category: 'technical',
      message: 'Testing WebSocket-based real-time messaging functionality'
    });

    const ticketId = ticketResponse.data.ticket.ticketId;
    console.log(`✅ Created ticket: ${ticketId}`);

    // Join rooms
    farmerSocket.emit('join-farmer', 'WSTEST001');
    farmerSocket.emit('join-ticket', ticketId);
    adminSocket.emit('join-admin');
    adminSocket.emit('join-ticket', ticketId);

    console.log('🏠 Joined Socket.IO rooms');

    // Set up message listeners
    let farmerReceivedMessages = [];
    let adminReceivedMessages = [];

    farmerSocket.on('new-message', (data) => {
      console.log('📨 Farmer received new message:', data.message.message);
      farmerReceivedMessages.push(data);
    });

    farmerSocket.on('ticket-updated', (data) => {
      console.log('🎫 Farmer received ticket update:', data.type);
    });

    adminSocket.on('new-message', (data) => {
      console.log('📨 Admin received new message:', data.message.message);
      adminReceivedMessages.push(data);
    });

    adminSocket.on('ticket-updated', (data) => {
      console.log('🎫 Admin received ticket update:', data.type);
    });

    // Test 2: Admin sends reply via WebSocket
    console.log('\n💬 Test 2: Admin sending reply...');
    await axios.post(`${API_URL}/api/admin/support/tickets/${ticketId}/reply`, {
      message: 'Hello! This is a WebSocket test reply from admin.'
    });

    // Wait for WebSocket message
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (farmerReceivedMessages.length > 0) {
      console.log('✅ Farmer received admin reply via WebSocket');
    } else {
      console.log('❌ Farmer did not receive admin reply via WebSocket');
    }

    // Test 3: Farmer sends reply via WebSocket
    console.log('\n💬 Test 3: Farmer sending reply...');
    await axios.post(`${API_URL}/api/support/tickets/${ticketId}/messages`, {
      sender: 'farmer',
      message: 'Thank you! This is a WebSocket test reply from farmer.'
    });

    // Wait for WebSocket message
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (adminReceivedMessages.length > 0) {
      console.log('✅ Admin received farmer reply via WebSocket');
    } else {
      console.log('❌ Admin did not receive farmer reply via WebSocket');
    }

    // Test 4: Rapid message exchange
    console.log('\n⚡ Test 4: Testing rapid WebSocket message exchange...');
    
    let rapidMessages = 0;
    const targetMessages = 4;

    // Reset counters
    farmerReceivedMessages = [];
    adminReceivedMessages = [];

    // Send multiple messages rapidly
    await Promise.all([
      axios.post(`${API_URL}/api/admin/support/tickets/${ticketId}/reply`, {
        message: 'Rapid message 1 from admin'
      }),
      axios.post(`${API_URL}/api/admin/support/tickets/${ticketId}/reply`, {
        message: 'Rapid message 2 from admin'
      }),
      axios.post(`${API_URL}/api/support/tickets/${ticketId}/messages`, {
        sender: 'farmer',
        message: 'Rapid reply 1 from farmer'
      }),
      axios.post(`${API_URL}/api/support/tickets/${ticketId}/messages`, {
        sender: 'farmer',
        message: 'Rapid reply 2 from farmer'
      })
    ]);

    // Wait for all WebSocket messages
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log(`📊 Farmer received ${farmerReceivedMessages.length} WebSocket messages`);
    console.log(`📊 Admin received ${adminReceivedMessages.length} WebSocket messages`);

    // Test 5: Connection resilience
    console.log('\n🔄 Test 5: Testing connection resilience...');
    
    // Disconnect and reconnect farmer
    farmerSocket.disconnect();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    farmerSocket.connect();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Rejoin rooms
    farmerSocket.emit('join-farmer', 'WSTEST001');
    farmerSocket.emit('join-ticket', ticketId);
    
    // Send message after reconnection
    await axios.post(`${API_URL}/api/admin/support/tickets/${ticketId}/reply`, {
      message: 'Message after farmer reconnection'
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Connection resilience test completed');

    // Final verification
    console.log('\n🔍 Final verification: Checking database consistency...');
    const finalTicketResponse = await axios.get(`${API_URL}/api/support/tickets/${ticketId}`);
    const finalTicket = finalTicketResponse.data;
    
    console.log(`📊 Final ticket has ${finalTicket.messages.length} messages in database`);
    console.log(`📊 Messages from farmer: ${finalTicket.messages.filter(m => m.sender === 'farmer').length}`);
    console.log(`📊 Messages from admin: ${finalTicket.messages.filter(m => m.sender === 'admin').length}`);

    // Cleanup
    farmerSocket.disconnect();
    adminSocket.disconnect();
    
    console.log('\n🎉 WebSocket real-time messaging test completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Ticket ID: ${ticketId}`);
    console.log(`   - Total messages in DB: ${finalTicket.messages.length}`);
    console.log(`   - WebSocket messages received by farmer: ${farmerReceivedMessages.length}`);
    console.log(`   - WebSocket messages received by admin: ${adminReceivedMessages.length}`);
    console.log(`   - Status: ${finalTicket.status}`);

    if (farmerReceivedMessages.length > 0 && adminReceivedMessages.length > 0) {
      console.log('\n✅ SUCCESS: WebSocket real-time messaging is working!');
    } else {
      console.log('\n❌ FAILURE: WebSocket real-time messaging needs debugging');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the test
testWebSocketMessaging();