const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Update = require('../models/Update');

// Helper function to create buyer notifications
const createBuyerNotification = async (buyerId, title, message, category = 'general') => {
  try {
    const buyer = await User.findOne({ buyerId });
    if (!buyer) {
      console.error(`Buyer ${buyerId} not found for notification`);
      return null;
    }

    const update = new Update({
      userId: buyer._id,
      title,
      message,
      category,
      isActive: true
    });
    
    await update.save();
    console.log(`📢 Notification sent to buyer ${buyerId}: ${title}`);
    return update;
  } catch (error) {
    console.error(`Failed to create notification for buyer ${buyerId}:`, error);
    return null;
  }
};

// Create order-related notifications
router.post('/order-notification', async (req, res) => {
  try {
    const { buyerId, type, orderDetails } = req.body;
    
    let title, message, category = 'order';
    
    switch (type) {
      case 'order_placed':
        title = 'Order Placed Successfully';
        message = `Your order for ${orderDetails.product} (${orderDetails.quantity}) has been placed successfully. Order ID: ${orderDetails.orderId}`;
        break;
      case 'order_confirmed':
        title = 'Order Confirmed';
        message = `Your order ${orderDetails.orderId} has been confirmed by the farmer. Expected delivery: ${orderDetails.deliveryDate}`;
        break;
      case 'order_shipped':
        title = 'Order Shipped';
        message = `Your order ${orderDetails.orderId} has been shipped and is on its way. Track your order for updates.`;
        break;
      case 'order_delivered':
        title = 'Order Delivered';
        message = `Your order ${orderDetails.orderId} has been delivered successfully. Thank you for your purchase!`;
        break;
      case 'order_cancelled':
        title = 'Order Cancelled';
        message = `Your order ${orderDetails.orderId} has been cancelled. ${orderDetails.reason ? `Reason: ${orderDetails.reason}` : 'Please contact support for more details.'}`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid notification type' });
    }
    
    const notification = await createBuyerNotification(buyerId, title, message, category);
    
    if (notification) {
      res.json({ message: 'Notification created successfully', notification });
    } else {
      res.status(500).json({ error: 'Failed to create notification' });
    }
  } catch (error) {
    console.error('Failed to create order notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Create bidding-related notifications
router.post('/bidding-notification', async (req, res) => {
  try {
    const { buyerId, type, biddingDetails } = req.body;
    
    let title, message, category = 'bidding';
    
    switch (type) {
      case 'bid_placed':
        title = 'Bid Placed Successfully';
        message = `Your bid of ₹${biddingDetails.amount} for ${biddingDetails.product} has been placed successfully.`;
        break;
      case 'bid_won':
        title = '🎉 Congratulations! You Won the Bid';
        message = `You have won the bid for ${biddingDetails.product} with your bid of ₹${biddingDetails.amount}. Please proceed with the purchase.`;
        break;
      case 'bid_outbid':
        title = 'You Have Been Outbid';
        message = `Your bid of ₹${biddingDetails.previousAmount} for ${biddingDetails.product} has been outbid. Current highest bid: ₹${biddingDetails.currentAmount}`;
        break;
      case 'bid_expired':
        title = 'Bid Expired';
        message = `The bidding for ${biddingDetails.product} has ended. ${biddingDetails.won ? 'Congratulations, you won!' : 'Better luck next time!'}`;
        break;
      case 'auction_starting':
        title = 'Auction Starting Soon';
        message = `The auction for ${biddingDetails.product} will start in ${biddingDetails.timeRemaining}. Don't miss out!`;
        break;
      default:
        return res.status(400).json({ error: 'Invalid bidding notification type' });
    }
    
    const notification = await createBuyerNotification(buyerId, title, message, category);
    
    if (notification) {
      res.json({ message: 'Bidding notification created successfully', notification });
    } else {
      res.status(500).json({ error: 'Failed to create notification' });
    }
  } catch (error) {
    console.error('Failed to create bidding notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Create account-related notifications
router.post('/account-notification', async (req, res) => {
  try {
    const { buyerId, type, details } = req.body;
    
    let title, message, category = 'account';
    
    switch (type) {
      case 'welcome':
        title = 'Welcome to Morgen!';
        message = `Welcome to Morgen, ${details.name}! Your buyer account has been created successfully. Start exploring fresh produce from local farmers.`;
        break;
      case 'profile_updated':
        title = 'Profile Updated';
        message = `Your profile has been updated successfully. Changes: ${details.changes}`;
        break;
      case 'profile_rejected':
        title = 'Profile Changes Rejected';
        message = `Your profile change request has been rejected. ${details.reason ? `Reason: ${details.reason}` : 'Please contact support for more details.'}`;
        break;
      case 'password_changed':
        title = 'Password Changed';
        message = 'Your password has been changed successfully. If you did not make this change, please contact support immediately.';
        break;
      case 'limit_increased':
        title = 'Bid Limit Increased';
        message = `Your maximum bid limit has been increased to ₹${details.newLimit}. Happy bidding!`;
        break;
      case 'verification_complete':
        title = 'Account Verified';
        message = 'Your buyer account has been verified successfully. You now have access to all platform features.';
        break;
      default:
        return res.status(400).json({ error: 'Invalid account notification type' });
    }
    
    const notification = await createBuyerNotification(buyerId, title, message, category);
    
    if (notification) {
      res.json({ message: 'Account notification created successfully', notification });
    } else {
      res.status(500).json({ error: 'Failed to create notification' });
    }
  } catch (error) {
    console.error('Failed to create account notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Create system-wide notifications for all buyers
router.post('/system-notification', async (req, res) => {
  try {
    const { title, message, category = 'system' } = req.body;
    
    // Get all active buyers
    const buyers = await User.find({ role: 'buyer', isActive: true });
    
    const notifications = [];
    for (const buyer of buyers) {
      const update = new Update({
        userId: buyer._id,
        title,
        message,
        category,
        isActive: true
      });
      await update.save();
      notifications.push(update);
    }
    
    console.log(`📢 System notification sent to ${buyers.length} buyers: ${title}`);
    res.json({ 
      message: `System notification sent to ${buyers.length} buyers`, 
      count: buyers.length 
    });
  } catch (error) {
    console.error('Failed to create system notification:', error);
    res.status(500).json({ error: 'Failed to create system notification' });
  }
});

// Get notifications for a specific buyer
router.get('/buyer/:buyerId', async (req, res) => {
  try {
    const { buyerId } = req.params;
    const { limit = 20, category } = req.query;
    
    const buyer = await User.findOne({ buyerId });
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }
    
    const query = { userId: buyer._id, isActive: true };
    if (category) {
      query.category = category;
    }
    
    const notifications = await Update.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json(notifications);
  } catch (error) {
    console.error('Failed to fetch buyer notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/mark-read/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Update.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Delete notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Update.findByIdAndUpdate(
      notificationId,
      { isActive: false },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Failed to delete notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = router;