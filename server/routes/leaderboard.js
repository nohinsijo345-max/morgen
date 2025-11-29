const router = require('express').Router();
const User = require('../models/User');

// Get panchayat leaderboard
router.get('/panchayat/:panchayat', async (req, res) => {
  try {
    const { panchayat } = req.params;
    
    const farmers = await User.find({ 
      role: 'farmer', 
      panchayat 
    })
    .sort({ reputationScore: -1 })
    .limit(10)
    .select('name farmerId reputationScore totalSales averageRating badge');
    
    // Assign badges to top 3
    if (farmers.length > 0) farmers[0].badge = 'gold';
    if (farmers.length > 1) farmers[1].badge = 'silver';
    if (farmers.length > 2) farmers[2].badge = 'bronze';
    
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get district leaderboard
router.get('/district/:district', async (req, res) => {
  try {
    const { district } = req.params;
    
    const farmers = await User.find({ 
      role: 'farmer', 
      district 
    })
    .sort({ reputationScore: -1 })
    .limit(20)
    .select('name farmerId panchayat reputationScore totalSales averageRating badge');
    
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get state-wide leaderboard
router.get('/state', async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' })
      .sort({ reputationScore: -1 })
      .limit(50)
      .select('name farmerId district panchayat reputationScore totalSales averageRating badge');
    
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update reputation score (called after successful transaction)
router.post('/update-reputation', async (req, res) => {
  try {
    const { farmerId, saleAmount, rating } = req.body;
    
    const farmer = await User.findOne({ farmerId });
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    
    // Calculate new reputation score
    // Formula: (Total Sales / 1000) + (Average Rating * 10)
    farmer.totalSales += saleAmount;
    
    const totalRatings = farmer.averageRating * (farmer.totalSales / saleAmount - 1);
    farmer.averageRating = (totalRatings + rating) / (farmer.totalSales / saleAmount);
    
    farmer.reputationScore = (farmer.totalSales / 1000) + (farmer.averageRating * 10);
    
    await farmer.save();
    
    res.json({ 
      message: 'Reputation updated', 
      newScore: farmer.reputationScore 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
