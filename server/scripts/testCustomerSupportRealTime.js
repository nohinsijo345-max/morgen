const mongoose = require('mongoose');
require('dotenv').config();

async function testRealTimeCustomerSupport() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const CustomerSupport = require('../models/CustomerSupport');
    const User = require('../models/User');
    
    // Find a farmer to test with
    const farmer = await User.findOne({ role: 'farmer' });
    if (!farmer) {
      console.log('❌ No farmer found in database');
      process.exit(1);
    }
    
    console.log(`🧑‍🌾 Testing with farmer: ${farmer.name} (${farmer.farmerId})`);
    
    // Create a test ticket
    const ticketId = 'TKT' + Date.now().toString().slice(-8);
    const testTicket = new CustomerSupport({
      ticketId,
      farmerId: farmer.farmerId,
      farmerName: farmer.name,
      subject: 'Real-time Test Ticket',
      category: 'technical',
      priority: 'medium',
      messages: [{
        sender: 'farmer',
        message: 'This is a test message to verify real-time updates are working.',
        timestamp: new Date()
      }]
    });
    
    await testTicket.save();
    console.log(`📝 Created test ticket: ${ticketId}`);
    
    // Simulate admin reply
    setTimeout(async () => {
      testTicket.messages.push({
        sender: 'admin',
        message: 'Thank you for your message! This is an automated test reply to verify real-time functionality.',
        timestamp: new Date()
      });
      testTicket.status = 'in-progress';
      await testTicket.save();
      console.log('💬 Admin reply added to ticket');
      
      // Simulate farmer response
      setTimeout(async () => {
        testTicket.messages.push({
          sender: 'farmer',
          message: 'Great! The real-time updates are working perfectly.',
          timestamp: new Date()
        });
        await testTicket.save();
        console.log('💬 Farmer response added to ticket');
        
        // Final status update
        setTimeout(async () => {
          testTicket.status = 'resolved';
          testTicket.resolvedAt = new Date();
          await testTicket.save();
          console.log('✅ Ticket marked as resolved');
          
          console.log('\n📊 Final ticket state:');
          console.log(`- Ticket ID: ${testTicket.ticketId}`);
          console.log(`- Status: ${testTicket.status}`);
          console.log(`- Messages: ${testTicket.messages.length}`);
          console.log(`- Last updated: ${testTicket.updatedAt}`);
          
          console.log('\n🎉 Real-time customer support test completed successfully!');
          console.log('💡 Both farmer and admin interfaces should show live updates without refresh.');
          
          process.exit(0);
        }, 2000);
      }, 2000);
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testRealTimeCustomerSupport();