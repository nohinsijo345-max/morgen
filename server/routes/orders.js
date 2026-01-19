const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Crop = require('../models/Crop');
const User = require('../models/User');
const Update = require('../models/Update');

// Create a new order (purchase request)
router.post('/create', async (req, res) => {
  try {
    const { 
      buyerId, 
      cropId, 
      quantity, 
      message 
    } = req.body;

    // Validate required fields
    if (!buyerId || !cropId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get buyer details
    const buyer = await User.findOne({ buyerId, role: 'buyer' });
    if (!buyer) {
      return res.status(404).json({ error: 'Buyer not found' });
    }

    // Get crop details
    const crop = await Crop.findById(cropId);
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    if (!crop.available) {
      return res.status(400).json({ error: 'Crop is no longer available' });
    }

    if (quantity > crop.quantity) {
      return res.status(400).json({ error: 'Requested quantity exceeds available quantity' });
    }

    // Get farmer details
    const farmer = await User.findOne({ farmerId: crop.farmerId, role: 'farmer' });
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    // For public buyers, check if they are connected to the farmer
    if (buyer.buyerType === 'public') {
      const Connection = require('../models/Connection');
      const connection = await Connection.findOne({
        $or: [
          { requesterId: buyerId, targetId: crop.farmerId, status: 'accepted' },
          { requesterId: crop.farmerId, targetId: buyerId, status: 'accepted' }
        ]
      });

      if (!connection) {
        return res.status(403).json({ 
          error: 'You must be connected to this farmer to purchase their crops. Please send a connection request first.',
          requiresConnection: true,
          farmerId: crop.farmerId,
          farmerName: farmer.name
        });
      }
    }

    // Generate order ID
    const orderId = await Order.generateOrderId();

    // Calculate total amount
    const totalAmount = quantity * crop.pricePerUnit;

    // Create order
    const order = new Order({
      orderId,
      buyerId,
      buyerName: buyer.name,
      buyerType: buyer.buyerType,
      buyerContact: {
        email: buyer.email,
        phone: buyer.phone,
        address: {
          state: buyer.state,
          district: buyer.district,
          city: buyer.city,
          pinCode: buyer.pinCode
        }
      },
      farmerId: crop.farmerId,
      farmerName: farmer.name,
      farmerContact: {
        email: farmer.email,
        phone: farmer.phone,
        address: {
          state: farmer.state,
          district: farmer.district,
          city: farmer.city,
          pinCode: farmer.pinCode
        }
      },
      cropId,
      cropDetails: {
        name: crop.name || crop.cropName,
        category: crop.category,
        quality: crop.quality,
        unit: crop.unit
      },
      quantity,
      pricePerUnit: crop.pricePerUnit,
      totalAmount,
      message: message || `Purchase request for ${crop.name || crop.cropName}`
    });

    await order.save();

    // Send notification to farmer
    const farmerUpdate = new Update({
      userId: farmer._id,
      title: 'New Purchase Request',
      message: `${buyer.name} wants to purchase ${quantity} ${crop.unit} of your ${crop.name || crop.cropName}. Total: ₹${totalAmount.toLocaleString()}`,
      category: 'order',
      isActive: true,
      metadata: {
        orderId: orderId,
        type: 'purchase_request',
        buyerId: buyerId,
        buyerName: buyer.name,
        cropName: crop.name || crop.cropName,
        quantity: quantity,
        totalAmount: totalAmount
      }
    });
    await farmerUpdate.save();

    console.log(`✅ Order created: ${orderId} - ${buyer.name} → ${farmer.name}`);

    res.status(201).json({
      message: 'Purchase request sent successfully',
      order: {
        orderId: order.orderId,
        status: order.status,
        totalAmount: order.totalAmount,
        farmerName: order.farmerName,
        cropName: order.cropDetails.name,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Get orders for a buyer
router.get('/buyer/:buyerId', async (req, res) => {
  try {
    const { buyerId } = req.params;
    const { status = 'all' } = req.query;

    let query = { buyerId };
    if (status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('cropId')
      .sort({ createdAt: -1 });

    res.json({ orders });

  } catch (error) {
    console.error('Error fetching buyer orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get orders for a farmer
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { status = 'all' } = req.query;

    let query = { farmerId };
    if (status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('cropId')
      .sort({ createdAt: -1 });

    res.json({ orders });

  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Farmer responds to order (approve/reject)
router.post('/respond/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { action, message, farmerId } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.farmerId !== farmerId) {
      return res.status(403).json({ error: 'Unauthorized to respond to this order' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Order has already been processed' });
    }

    // Update order status
    order.status = action === 'approve' ? 'approved' : 'rejected';
    order.farmerResponse = {
      message: message || (action === 'approve' ? 'Order approved' : 'Order rejected'),
      respondedAt: new Date()
    };

    if (action === 'approve') {
      // Update crop quantity
      const crop = await Crop.findById(order.cropId);
      if (crop) {
        crop.quantity -= order.quantity;
        if (crop.quantity <= 0) {
          crop.available = false;
          crop.quantity = 0;
        }
        await crop.save();
      }
    }

    await order.save();

    // Send notification to buyer
    const buyer = await User.findOne({ buyerId: order.buyerId });
    if (buyer) {
      const buyerUpdate = new Update({
        userId: buyer._id,
        title: `Order ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: action === 'approve' 
          ? `Great news! ${order.farmerName} approved your order for ${order.cropDetails.name}. Contact them to arrange pickup.`
          : `${order.farmerName} declined your order for ${order.cropDetails.name}. ${message || 'You can try ordering from other farmers.'}`,
        category: 'order',
        isActive: true,
        metadata: {
          orderId: orderId,
          type: action === 'approve' ? 'order_approved' : 'order_rejected',
          farmerId: order.farmerId,
          farmerName: order.farmerName,
          farmerContact: order.farmerContact,
          cropName: order.cropDetails.name,
          totalAmount: order.totalAmount
        }
      });
      await buyerUpdate.save();
    }

    console.log(`✅ Order ${action}d: ${orderId}`);

    res.json({
      message: `Order ${action}d successfully`,
      order: {
        orderId: order.orderId,
        status: order.status,
        farmerResponse: order.farmerResponse
      }
    });

  } catch (error) {
    console.error('Error responding to order:', error);
    res.status(500).json({ error: 'Failed to respond to order', details: error.message });
  }
});

// Get order details
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId }).populate('cropId');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Mark order as completed
router.post('/complete/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, userType } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'approved') {
      return res.status(400).json({ error: 'Order must be approved before completion' });
    }

    // Verify user authorization - only farmers can mark orders as completed
    if (userType !== 'farmer' || order.farmerId !== userId) {
      return res.status(403).json({ error: 'Only the farmer can mark this order as completed' });
    }

    order.status = 'completed';
    order.deliveryDetails.completedDate = new Date();
    await order.save();

    // Send notification to both parties
    const buyer = await User.findOne({ buyerId: order.buyerId });
    const farmer = await User.findOne({ farmerId: order.farmerId });

    if (buyer && farmer) {
      const notifications = [
        {
          userId: buyer._id,
          title: 'Order Completed',
          message: `Your order for ${order.cropDetails.name} from ${order.farmerName} has been completed successfully!`,
          category: 'order'
        },
        {
          userId: farmer._id,
          title: 'Order Completed',
          message: `Order for ${order.cropDetails.name} to ${order.buyerName} has been completed successfully!`,
          category: 'order'
        }
      ];

      for (const notification of notifications) {
        const update = new Update({
          ...notification,
          isActive: true,
          metadata: {
            orderId: orderId,
            type: 'order_completed'
          }
        });
        await update.save();
      }
    }

    console.log(`✅ Order completed: ${orderId}`);

    res.json({
      message: 'Order marked as completed',
      order: {
        orderId: order.orderId,
        status: order.status,
        completedAt: order.completedAt
      }
    });

  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({ error: 'Failed to complete order' });
  }
});

// Get order statistics
router.get('/stats/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const field = userType === 'buyer' ? 'buyerId' : 'farmerId';

    const stats = await Order.aggregate([
      { $match: { [field]: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      totalValue: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
      formattedStats.totalValue += stat.totalAmount;
    });

    res.json(formattedStats);

  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ error: 'Failed to fetch order stats' });
  }
});

module.exports = router;