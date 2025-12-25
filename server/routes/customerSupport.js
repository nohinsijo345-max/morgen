const express = require('express');
const router = express.Router();
const CustomerSupport = require('../models/CustomerSupport');

// Send message (unified for both farmers and buyers)
router.post('/send', async (req, res) => {
  try {
    const { farmerId, buyerId, message, userType } = req.body;
    
    if (!message || !userType) {
      return res.status(400).json({ error: 'Message and userType are required' });
    }

    if (userType === 'buyer' && !buyerId) {
      return res.status(400).json({ error: 'BuyerId is required for buyer messages' });
    }

    if (userType === 'farmer' && !farmerId) {
      return res.status(400).json({ error: 'FarmerId is required for farmer messages' });
    }

    // Generate ticket ID based on user type
    const ticketId = userType === 'buyer' 
      ? `BUY-${buyerId}-${Date.now().toString().slice(-6)}`
      : `FAR-${farmerId}-${Date.now().toString().slice(-6)}`;
    
    // Find existing ticket or create new one
    let ticket = await CustomerSupport.findOne({
      $or: [
        { farmerId: farmerId },
        { buyerId: buyerId }
      ]
    });

    if (!ticket) {
      // Create new ticket
      ticket = new CustomerSupport({
        ticketId,
        farmerId: userType === 'farmer' ? farmerId : null,
        buyerId: userType === 'buyer' ? buyerId : null,
        userType,
        subject: 'Customer Support Request',
        category: 'general',
        messages: []
      });
    }

    // Add message
    const newMessage = {
      sender: userType,
      message,
      timestamp: new Date(),
      isRead: false
    };

    ticket.messages.push(newMessage);
    ticket.status = 'in-progress';
    ticket.updatedAt = new Date();
    await ticket.save();

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`ticket-${ticketId}`).emit('new-message', {
        ticketId,
        message: newMessage,
        ticket
      });
      
      // Emit to admin room
      io.to('admin').emit('ticket-updated', {
        ticketId,
        ticket,
        type: 'new-message'
      });
    }

    res.status(201).json({ message: 'Message sent successfully', ticket });
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages for user (unified for both farmers and buyers)
router.get('/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Determine if it's a farmer or buyer based on ID format
    const userType = userId.startsWith('MGB') ? 'buyer' : 'farmer';
    const searchField = userType === 'buyer' ? 'buyerId' : 'farmerId';
    
    const ticket = await CustomerSupport.findOne({ [searchField]: userId });
    
    if (!ticket) {
      return res.json([]); // Return empty array if no messages
    }

    res.json(ticket.messages || []);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create new support ticket
router.post('/tickets', async (req, res) => {
  try {
    const { farmerId, farmerName, subject, category, message } = req.body;
    
    // Generate ticket ID
    const ticketId = 'TKT' + Date.now().toString().slice(-8);
    
    const ticket = new CustomerSupport({
      ticketId,
      farmerId,
      farmerName,
      subject,
      category,
      messages: [{
        sender: 'farmer',
        message,
        timestamp: new Date()
      }]
    });
    
    await ticket.save();
    res.status(201).json({ message: 'Support ticket created', ticket });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

// Get tickets for farmer
router.get('/tickets/farmer/:farmerId', async (req, res) => {
  try {
    const tickets = await CustomerSupport.find({ farmerId: req.params.farmerId })
      .sort({ updatedAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get all tickets (for admin)
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await CustomerSupport.find()
      .sort({ updatedAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get single ticket
router.get('/tickets/:ticketId', async (req, res) => {
  try {
    const ticket = await CustomerSupport.findOne({ ticketId: req.params.ticketId });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Add message to ticket
router.post('/tickets/:ticketId/messages', async (req, res) => {
  try {
    const { sender, message } = req.body;
    const ticket = await CustomerSupport.findOne({ ticketId: req.params.ticketId });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const newMessage = {
      sender,
      message,
      timestamp: new Date(),
      isRead: false
    };
    
    ticket.messages.push(newMessage);
    ticket.status = 'in-progress';
    ticket.updatedAt = new Date(); // Force update timestamp
    await ticket.save();
    
    // Get the updated ticket
    const updatedTicket = await CustomerSupport.findOne({ ticketId: req.params.ticketId });
    
    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Emit to specific ticket room
      io.to(`ticket-${req.params.ticketId}`).emit('new-message', {
        ticketId: req.params.ticketId,
        message: newMessage,
        ticket: updatedTicket
      });
      
      // Emit to admin room if farmer sent message
      if (sender === 'farmer') {
        io.to('admin').emit('ticket-updated', {
          ticketId: req.params.ticketId,
          ticket: updatedTicket,
          type: 'new-message'
        });
      }
      
      // Emit to farmer room if admin sent message
      if (sender === 'admin') {
        if (ticket.farmerId) {
          io.to(`farmer-${ticket.farmerId}`).emit('ticket-updated', {
            ticketId: req.params.ticketId,
            ticket: updatedTicket,
            type: 'new-message'
          });
        }
        
        if (ticket.buyerId) {
          io.to(`buyer-${ticket.buyerId}`).emit('ticket-updated', {
            ticketId: req.params.ticketId,
            ticket: updatedTicket,
            type: 'new-message'
          });
        }
      }
    }
    
    // Send notification to farmer when admin replies
    if (sender === 'admin') {
      const Update = require('../models/Update');
      const User = require('../models/User');
      
      const farmer = await User.findOne({ farmerId: ticket.farmerId });
      if (farmer) {
        const update = new Update({
          userId: farmer._id,
          title: 'Support Reply Received',
          message: `You have received a reply to your support ticket "${ticket.subject}". Check your support tickets for the latest update.`,
          category: 'support',
          isActive: true
        });
        await update.save();
      }
    }
    
    res.json({ message: 'Message added', ticket: updatedTicket });
  } catch (error) {
    console.error('Failed to add message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Update ticket status
router.patch('/tickets/:ticketId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await CustomerSupport.findOneAndUpdate(
      { ticketId: req.params.ticketId },
      { 
        status,
        resolvedAt: status === 'resolved' ? new Date() : undefined
      },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Send notification to farmer when ticket is resolved
    if (status === 'resolved') {
      const Update = require('../models/Update');
      const User = require('../models/User');
      
      const farmer = await User.findOne({ farmerId: ticket.farmerId });
      if (farmer) {
        const update = new Update({
          userId: farmer._id,
          title: 'Support Ticket Resolved',
          message: `Your support ticket "${ticket.subject}" has been resolved. Thank you for contacting our support team!`,
          category: 'support',
          isActive: true
        });
        await update.save();
      }
    }
    
    res.json({ message: 'Ticket status updated', ticket });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// Admin reply to ticket (separate endpoint for admin interface)
router.post('/tickets/:ticketId/reply', async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await CustomerSupport.findOne({ ticketId: req.params.ticketId });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const newMessage = {
      sender: 'admin',
      message,
      timestamp: new Date(),
      isRead: false
    };
    
    ticket.messages.push(newMessage);
    ticket.status = 'in-progress';
    ticket.updatedAt = new Date(); // Force update timestamp
    await ticket.save();
    
    // Get the updated ticket
    const updatedTicket = await CustomerSupport.findOne({ ticketId: req.params.ticketId });
    
    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      // Emit to specific ticket room
      io.to(`ticket-${req.params.ticketId}`).emit('new-message', {
        ticketId: req.params.ticketId,
        message: newMessage,
        ticket: updatedTicket
      });
      
      // Emit to farmer room
      io.to(`farmer-${ticket.farmerId}`).emit('ticket-updated', {
        ticketId: req.params.ticketId,
        ticket: updatedTicket,
        type: 'admin-reply'
      });
      
      // Emit to buyer room if it's a buyer ticket
      if (ticket.buyerId) {
        io.to(`buyer-${ticket.buyerId}`).emit('ticket-updated', {
          ticketId: req.params.ticketId,
          ticket: updatedTicket,
          type: 'admin-reply'
        });
      }
    }
    
    // Send notification to farmer when admin replies
    const Update = require('../models/Update');
    const User = require('../models/User');
    
    if (ticket.farmerId) {
      const farmer = await User.findOne({ farmerId: ticket.farmerId });
      if (farmer) {
        const update = new Update({
          userId: farmer._id,
          title: 'Support Reply Received',
          message: `You have received a reply to your support ticket "${ticket.subject}". Check your support tickets for the latest update.`,
          category: 'support',
          isActive: true
        });
        await update.save();
      }
    }
    
    if (ticket.buyerId) {
      const buyer = await User.findOne({ buyerId: ticket.buyerId });
      if (buyer) {
        const update = new Update({
          userId: buyer._id,
          title: 'Support Reply Received',
          message: `You have received a reply to your support ticket "${ticket.subject}". Check your support tickets for the latest update.`,
          category: 'support',
          isActive: true
        });
        await update.save();
        
        // Also create buyer-specific notification
        try {
          const axios = require('axios');
          const API_URL = process.env.API_URL || 'http://localhost:5050';
          
          await axios.post(`${API_URL}/api/buyer-notifications/system-notification`, {
            buyerId: ticket.buyerId,
            type: 'support_reply',
            details: {
              ticketId: ticket.ticketId,
              subject: ticket.subject
            }
          });
        } catch (notificationError) {
          console.error('Failed to send buyer notification:', notificationError.message);
        }
      }
    }
    
    res.json({ message: 'Reply sent', ticket: updatedTicket });
  } catch (error) {
    console.error('Failed to send reply:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// Mark messages as read
router.patch('/tickets/:ticketId/read', async (req, res) => {
  try {
    const { sender } = req.body; // 'farmer' or 'admin'
    const ticket = await CustomerSupport.findOne({ ticketId: req.params.ticketId });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Mark messages from the other sender as read
    const otherSender = sender === 'farmer' ? 'admin' : 'farmer';
    ticket.messages.forEach(msg => {
      if (msg.sender === otherSender) {
        msg.isRead = true;
      }
    });
    
    await ticket.save();
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get all messages for admin (both farmer and buyer)
router.get('/all-messages', async (req, res) => {
  try {
    const tickets = await CustomerSupport.find()
      .sort({ updatedAt: -1 })
      .limit(100);
    
    // Flatten all messages from all tickets
    const allMessages = [];
    tickets.forEach(ticket => {
      if (ticket.messages && ticket.messages.length > 0) {
        ticket.messages.forEach(message => {
          allMessages.push({
            ...message.toObject(),
            ticketId: ticket.ticketId,
            farmerId: ticket.farmerId,
            buyerId: ticket.buyerId,
            userType: ticket.userType || 'farmer',
            subject: ticket.subject
          });
        });
      }
    });
    
    // Sort by timestamp
    allMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(allMessages);
  } catch (error) {
    console.error('Failed to fetch all messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;