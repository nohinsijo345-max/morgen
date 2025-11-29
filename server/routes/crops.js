const router = require('express').Router();
const Crop = require('../models/Crop');

// 1. ADD A NEW CROP (Farmer Post)
router.post('/add', async (req, res) => {
  try {
    const newCrop = new Crop(req.body);
    const savedCrop = await newCrop.save();
    res.status(200).json(savedCrop);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GET CROPS FOR A SPECIFIC FARMER
router.get('/:farmerId', async (req, res) => {
  try {
    const crops = await Crop.find({ farmerId: req.params.farmerId });
    res.status(200).json(crops);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;