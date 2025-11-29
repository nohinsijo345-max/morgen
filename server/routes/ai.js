const router = require('express').Router();

// AI Plant Doctor - Image analysis
router.post('/plant-doctor', async (req, res) => {
  try {
    const { imageBase64, language } = req.body;
    
    // TODO: Integrate with Google Gemini 1.5 API
    // For now, return mock response
    
    const mockDiagnosis = {
      disease: 'Tomato Late Blight',
      confidence: 0.87,
      description: language === 'malayalam' 
        ? 'തക്കാളി ചെടിയിൽ ലേറ്റ് ബ്ലൈറ്റ് രോഗം കണ്ടെത്തി'
        : 'Late Blight disease detected in tomato plant',
      remedy: language === 'malayalam'
        ? 'വേപ്പെണ്ണ ആഴ്ചയിൽ രണ്ടുതവണ സ്പ്രേ ചെയ്യുക'
        : 'Spray Neem Oil twice a week',
      preventiveMeasures: [
        'Remove infected leaves immediately',
        'Improve air circulation',
        'Avoid overhead watering',
        'Apply copper-based fungicide'
      ]
    };
    
    res.json(mockDiagnosis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Price Forecaster
router.post('/price-forecast', async (req, res) => {
  try {
    const { cropName, currentPrice } = req.body;
    
    // TODO: Implement ML model for price prediction
    // For now, return mock forecast
    
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    const change = Math.random() * 20 - 10; // -10% to +10%
    const nextWeekPrice = Math.round(currentPrice * (1 + change / 100));
    
    const forecast = {
      crop: cropName,
      currentPrice,
      nextWeekPrice,
      trend,
      changePercent: change.toFixed(2),
      confidence: (0.7 + Math.random() * 0.25).toFixed(2),
      recommendation: trend === 'up' 
        ? 'Wait for better prices next week'
        : 'Consider selling now before prices drop',
      factors: [
        'Seasonal demand increase',
        'Weather conditions favorable',
        'Market supply moderate'
      ]
    };
    
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Market price ticker
router.get('/market-prices', async (req, res) => {
  try {
    // Mock market prices
    const prices = [
      { crop: 'Tomato', price: 45, unit: 'kg', change: '+5%' },
      { crop: 'Onion', price: 38, unit: 'kg', change: '-2%' },
      { crop: 'Potato', price: 28, unit: 'kg', change: '+3%' },
      { crop: 'Rice', price: 42, unit: 'kg', change: '0%' },
      { crop: 'Wheat', price: 35, unit: 'kg', change: '+1%' },
      { crop: 'Pepper', price: 520, unit: 'kg', change: '+8%' }
    ];
    
    res.json(prices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
