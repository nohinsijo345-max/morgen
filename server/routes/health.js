const express = require('express');
const router = express.Router();

// Health check endpoint for deployment verification
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Agricultural Platform API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Test database connection
router.get('/db-test', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isConnected = mongoose.connection.readyState === 1;
    
    res.json({
      database: isConnected ? 'Connected' : 'Disconnected',
      status: isConnected ? 'OK' : 'ERROR',
      connection: mongoose.connection.name || 'Unknown'
    });
  } catch (error) {
    res.status(500).json({
      database: 'Error',
      status: 'ERROR',
      error: error.message
    });
  }
});

module.exports = router;