const express = require('express');
const router = express.Router();
const CustomerSupport = require('../models/CustomerSupport');

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
    
    // Return the updated ticket immediately
    const updatedTicket = await CustomerSupport.findOne({ ticketId: req.params.ticketId });
    res.json({ message: 'Message added', ticket: updatedTicket });
  } catch (error) {
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
    
    // Send notification to farmer when admin replies
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
    
    // Return the updated ticket immediately
    const updatedTicket = await CustomerSupport.findOne({ ticketId: req.params.ticketId });
    res.json({ message: 'Reply sent', ticket: updatedTicket });
  } catch (error) {
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

module.exports = router;