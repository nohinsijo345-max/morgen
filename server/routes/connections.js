const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');
const User = require('../models/User');
const Update = require('../models/Update');

// Send connection request
router.post('/request', async (req, res) => {
  try {
    const { 
      requesterType, 
      requesterId, 
      targetType, 
      targetId, 
      message, 
      connectionType 
    } = req.body;

    // Validate required fields
    if (!requesterType || !requesterId || !targetType || !targetId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if connection already exists
    const existingConnection = await Connection.findOne({
      $or: [
        { requesterId, targetId, status: { $in: ['pending', 'accepted'] } },
        { requesterId: targetId, targetId: requesterId, status: { $in: ['pending', 'accepted'] } }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({ 
        error: 'Connection already exists or is pending',
        existingConnection 
      });
    }

    // Get requester and target details
    const requesterField = requesterType === 'farmer' ? 'farmerId' : 'buyerId';
    const targetField = targetType === 'farmer' ? 'farmerId' : 'buyerId';

    const requester = await User.findOne({ [requesterField]: requesterId });
    const target = await User.findOne({ [targetField]: targetId });

    if (!requester || !target) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate unique request ID
    const requestId = `CON-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create connection request
    const connection = new Connection({
      requestId,
      requesterType,
      requesterId,
      requesterName: requester.name,
      targetType,
      targetId,
      targetName: target.name,
      message: message || `${requester.name} would like to connect with you for business opportunities.`,
      connectionType: connectionType || 'business',
      metadata: {
        requesterLocation: {
          state: requester.state,
          district: requester.district,
          city: requester.city
        },
        targetLocation: {
          state: target.state,
          district: target.district,
          city: target.city
        },
        requesterProfile: {
          email: requester.email,
          phone: requester.phone,
          profileImage: requester.profileImage
        },
        targetProfile: {
          email: target.email,
          phone: target.phone,
          profileImage: target.profileImage
        }
      }
    });

    await connection.save();

    // Send notification to target user
    const update = new Update({
      userId: target._id,
      title: 'New Connection Request',
      message: `${requester.name} wants to connect with you. Check your connection requests to respond.`,
      category: 'general',
      isActive: true
    });
    await update.save();

    // Send buyer-specific notification if target is buyer
    if (targetType === 'buyer') {
      try {
        const axios = require('axios');
        const API_URL = process.env.API_URL || 'http://localhost:5050';
        
        await axios.post(`${API_URL}/api/buyer-notifications/system-notification`, {
          buyerId: targetId,
          type: 'connection_request',
          details: {
            requesterName: requester.name,
            requesterType: requesterType,
            requestId: requestId
          }
        });
      } catch (notificationError) {
        console.error('Failed to send buyer notification:', notificationError.message);
      }
    }

    console.log(`✅ Connection request sent: ${requesterId} → ${targetId}`);

    res.status(201).json({
      message: 'Connection request sent successfully',
      connection: {
        requestId: connection.requestId,
        status: connection.status,
        targetName: connection.targetName,
        createdAt: connection.createdAt
      }
    });

  } catch (error) {
    console.error('Failed to send connection request:', error);
    res.status(500).json({ error: 'Failed to send connection request' });
  }
});

// Get connection requests (received)
router.get('/requests/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const { status = 'pending' } = req.query;

    const connections = await Connection.find({
      targetId: userId,
      targetType: userType,
      ...(status !== 'all' && { status })
    }).sort({ createdAt: -1 });

    res.json(connections);

  } catch (error) {
    console.error('Failed to fetch connection requests:', error);
    res.status(500).json({ error: 'Failed to fetch connection requests' });
  }
});

// Get sent connection requests
router.get('/sent/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const { status = 'all' } = req.query;

    const connections = await Connection.find({
      requesterId: userId,
      requesterType: userType,
      ...(status !== 'all' && { status })
    }).sort({ createdAt: -1 });

    res.json(connections);

  } catch (error) {
    console.error('Failed to fetch sent requests:', error);
    res.status(500).json({ error: 'Failed to fetch sent requests' });
  }
});

// Get connected users (accepted connections)
router.get('/connected/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;

    const connections = await Connection.find({
      $or: [
        { requesterId: userId, requesterType: userType, status: 'accepted' },
        { targetId: userId, targetType: userType, status: 'accepted' }
      ]
    }).sort({ updatedAt: -1 });

    // Format response to show the connected user details
    const connectedUsers = connections.map(conn => {
      const isRequester = conn.requesterId === userId;
      return {
        connectionId: conn.requestId,
        connectedUser: {
          id: isRequester ? conn.targetId : conn.requesterId,
          name: isRequester ? conn.targetName : conn.requesterName,
          type: isRequester ? conn.targetType : conn.requesterType,
          profile: isRequester ? conn.metadata.targetProfile : conn.metadata.requesterProfile,
          location: isRequester ? conn.metadata.targetLocation : conn.metadata.requesterLocation
        },
        connectionType: conn.connectionType,
        connectedAt: conn.respondedAt,
        createdAt: conn.createdAt
      };
    });

    res.json(connectedUsers);

  } catch (error) {
    console.error('Failed to fetch connected users:', error);
    res.status(500).json({ error: 'Failed to fetch connected users' });
  }
});

// Respond to connection request
router.post('/respond/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, message } = req.body; // action: 'accept' or 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use "accept" or "reject"' });
    }

    const connection = await Connection.findOne({ requestId });
    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ error: 'Connection request already processed' });
    }

    // Update connection status
    connection.status = action === 'accept' ? 'accepted' : 'rejected';
    connection.respondedAt = new Date();
    if (message) {
      connection.message = message;
    }
    await connection.save();

    // Get requester details for notification
    const requesterField = connection.requesterType === 'farmer' ? 'farmerId' : 'buyerId';
    const requester = await User.findOne({ [requesterField]: connection.requesterId });

    if (requester) {
      // Send notification to requester
      const update = new Update({
        userId: requester._id,
        title: `Connection Request ${action === 'accept' ? 'Accepted' : 'Rejected'}`,
        message: action === 'accept' 
          ? `${connection.targetName} accepted your connection request! You can now connect and do business together.`
          : `${connection.targetName} declined your connection request. ${message || 'You can try connecting with other users.'}`,
        category: 'general',
        isActive: true
      });
      await update.save();

      // Send buyer-specific notification if requester is buyer
      if (connection.requesterType === 'buyer') {
        try {
          const axios = require('axios');
          const API_URL = process.env.API_URL || 'http://localhost:5050';
          
          await axios.post(`${API_URL}/api/buyer-notifications/system-notification`, {
            buyerId: connection.requesterId,
            type: action === 'accept' ? 'connection_accepted' : 'connection_rejected',
            details: {
              targetName: connection.targetName,
              targetType: connection.targetType,
              requestId: requestId,
              message: message
            }
          });
        } catch (notificationError) {
          console.error('Failed to send buyer notification:', notificationError.message);
        }
      }
    }

    console.log(`✅ Connection request ${action}ed: ${requestId}`);

    res.json({
      message: `Connection request ${action}ed successfully`,
      connection: {
        requestId: connection.requestId,
        status: connection.status,
        respondedAt: connection.respondedAt
      }
    });

  } catch (error) {
    console.error('Failed to respond to connection request:', error);
    res.status(500).json({ error: 'Failed to respond to connection request' });
  }
});

// Cancel connection request (by requester)
router.delete('/cancel/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    const connection = await Connection.findOne({ requestId });
    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    if (connection.status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending requests' });
    }

    connection.status = 'cancelled';
    await connection.save();

    console.log(`✅ Connection request cancelled: ${requestId}`);

    res.json({
      message: 'Connection request cancelled successfully',
      requestId
    });

  } catch (error) {
    console.error('Failed to cancel connection request:', error);
    res.status(500).json({ error: 'Failed to cancel connection request' });
  }
});

// Get all available users for connection (excluding already connected)
router.get('/available/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const { targetType, state, district, search, limit = 20 } = req.query;

    // Determine target user type (opposite of current user)
    const searchUserType = targetType || (userType === 'farmer' ? 'buyer' : 'farmer');
    const searchField = searchUserType === 'farmer' ? 'farmerId' : 'buyerId';

    // Get existing connections to exclude
    const existingConnections = await Connection.find({
      $or: [
        { requesterId: userId, status: { $in: ['pending', 'accepted'] } },
        { targetId: userId, status: { $in: ['pending', 'accepted'] } }
      ]
    });

    const excludeIds = new Set();
    existingConnections.forEach(conn => {
      if (conn.requesterId === userId) {
        excludeIds.add(conn.targetId);
      } else {
        excludeIds.add(conn.requesterId);
      }
    });
    excludeIds.add(userId); // Exclude self

    // Build query
    let query = { 
      role: searchUserType,
      [searchField]: { $exists: true, $ne: null },
      [searchField]: { $nin: Array.from(excludeIds) }
    };

    // Add location filters
    if (state) query.state = new RegExp(state, 'i');
    if (district) query.district = new RegExp(district, 'i');

    // Add search filter
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { [searchField]: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('name email phone state district city profileImage farmerId buyerId role createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Add mock data for better display
    const enhancedUsers = users.map(user => ({
      ...user.toObject(),
      rating: (Math.random() * 2 + 3).toFixed(1),
      totalConnections: Math.floor(Math.random() * 50) + 5,
      responseRate: Math.floor(Math.random() * 30) + 70,
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    }));

    res.json(enhancedUsers);

  } catch (error) {
    console.error('Failed to fetch available users:', error);
    res.status(500).json({ error: 'Failed to fetch available users' });
  }
});

// Get connection statistics
router.get('/stats/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;

    const stats = await Connection.aggregate([
      {
        $match: {
          $or: [
            { requesterId: userId, requesterType: userType },
            { targetId: userId, targetType: userType }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    res.json(formattedStats);

  } catch (error) {
    console.error('Failed to fetch connection stats:', error);
    res.status(500).json({ error: 'Failed to fetch connection stats' });
  }
});

module.exports = router;