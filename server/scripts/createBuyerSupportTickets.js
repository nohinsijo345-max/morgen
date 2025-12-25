const mongoose = require('mongoose');
require('dotenv').config();

async function createBuyerSupportTickets() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const CustomerSupport = require('../models/CustomerSupport');
    const User = require('../models/User');
    
    // Find buyers to create tickets for
    const buyers = await User.find({ role: 'buyer' }).limit(3);
    
    if (buyers.length === 0) {
      console.log('❌ No buyers found in database');
      return;
    }
    
    console.log(`🛒 Found ${buyers.length} buyers, creating support tickets...`);
    
    // Create sample buyer support tickets
    const sampleTickets = [
      {
        subject: 'Issue with Bidding Process',
        category: 'bidding',
        priority: 'high',
        message: 'I am having trouble placing bids on the platform. The bid button is not responding when I click it.'
      },
      {
        subject: 'Payment Gateway Problem',
        category: 'billing',
        priority: 'urgent',
        message: 'My payment was deducted but the order was not confirmed. Please help me resolve this issue.'
      },
      {
        subject: 'Account Verification Delay',
        category: 'general',
        priority: 'medium',
        message: 'I submitted my documents for verification 3 days ago but my account is still not verified. When will this be completed?'
      }
    ];
    
    for (let i = 0; i < Math.min(buyers.length, sampleTickets.length); i++) {
      const buyer = buyers[i];
      const ticketData = sampleTickets[i];
      
      const ticketId = `BUY-${buyer.buyerId}-${Date.now().toString().slice(-6)}`;
      
      const ticket = new CustomerSupport({
        ticketId,
        buyerId: buyer.buyerId,
        userType: 'buyer',
        buyerName: buyer.name,
        subject: ticketData.subject,
        category: ticketData.category,
        priority: ticketData.priority,
        messages: [{
          sender: 'buyer',
          message: ticketData.message,
          timestamp: new Date(),
          isRead: false
        }]
      });
      
      await ticket.save();
      console.log(`✅ Created buyer support ticket: ${ticketId} for ${buyer.name}`);
    }
    
    // Verify tickets were created
    const buyerTickets = await CustomerSupport.find({ userType: 'buyer' });
    console.log(`📋 Total buyer support tickets in database: ${buyerTickets.length}`);
    
    console.log('\n🎉 Buyer Support Tickets Created Successfully!');
    console.log('\n📋 Summary:');
    buyerTickets.forEach(ticket => {
      console.log(`- ${ticket.ticketId}: ${ticket.subject} (${ticket.priority} priority)`);
    });
    
  } catch (error) {
    console.error('❌ Failed to create buyer support tickets:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createBuyerSupportTickets();