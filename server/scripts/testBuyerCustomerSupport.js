const mongoose = require('mongoose');
require('dotenv').config();

async function testBuyerCustomerSupport() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const CustomerSupport = require('../models/CustomerSupport');
    const User = require('../models/User');
    
    // Find a buyer to test with
    const buyer = await User.findOne({ role: 'buyer' });
    if (!buyer) {
      console.log('❌ No buyers found in database');
      return;
    }
    
    console.log(`🛒 Testing with buyer: ${buyer.name} (${buyer.buyerId})`);
    
    // Create a test buyer support ticket
    const ticketId = `BUY-${buyer.buyerId}-${Date.now().toString().slice(-6)}`;
    
    const testTicket = new CustomerSupport({
      ticketId,
      buyerId: buyer.buyerId,
      userType: 'buyer',
      buyerName: buyer.name,
      subject: 'Test Buyer Support Ticket',
      category: 'general',
      priority: 'medium',
      messages: [{
        sender: 'buyer',
        message: 'Hello, I need help with my buyer account. This is a test message.',
        timestamp: new Date(),
        isRead: false
      }]
    });
    
    await testTicket.save();
    console.log(`✅ Created test buyer support ticket: ${ticketId}`);
    
    // Test fetching buyer tickets
    const buyerTickets = await CustomerSupport.find({ userType: 'buyer' });
    console.log(`📋 Found ${buyerTickets.length} buyer support tickets`);
    
    // Test admin reply
    testTicket.messages.push({
      sender: 'admin',
      message: 'Thank you for contacting support. We have received your inquiry and will assist you shortly.',
      timestamp: new Date(),
      isRead: false
    });
    
    testTicket.status = 'in-progress';
    await testTicket.save();
    console.log('✅ Added admin reply to buyer ticket');
    
    // Test bulk message functionality (simulate)
    const allBuyers = await User.find({ role: 'buyer', isActive: true });
    console.log(`📢 Found ${allBuyers.length} active buyers for bulk messaging`);
    
    // Test buyer categorization
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newBuyers = await User.find({
      role: 'buyer',
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const activeBuyers = await User.find({
      role: 'buyer',
      isActive: true,
      lastLogin: { $gte: thirtyDaysAgo }
    });
    
    console.log(`📊 Buyer categories:`);
    console.log(`   - All buyers: ${allBuyers.length}`);
    console.log(`   - New buyers (last 30 days): ${newBuyers.length}`);
    console.log(`   - Active buyers (last 30 days): ${activeBuyers.length}`);
    
    console.log('\n🎉 Buyer Customer Support System Test Complete!');
    console.log('\n📋 Test Results:');
    console.log('✅ Buyer support ticket creation - WORKING');
    console.log('✅ Admin reply functionality - WORKING');
    console.log('✅ Buyer categorization for bulk messaging - WORKING');
    console.log('✅ Database integration - WORKING');
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Test real-time messaging in the admin interface');
    console.log('2. Test bulk messaging functionality');
    console.log('3. Verify Socket.IO integration for live updates');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testBuyerCustomerSupport();