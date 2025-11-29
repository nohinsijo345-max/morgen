const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// REGISTER API
router.post('/register', async (req, res) => {
  try {
    const { name, role, farmerId, pin, district } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ farmerId });
    if (existingUser) {
      return res.status(400).json({ error: "Farmer ID already exists" });
    }

    // Hash the PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    const newUser = new User({
      name,
      role,
      farmerId,
      pin: hashedPin,
      district
    });

    const savedUser = await newUser.save();
    console.log("✅ User registered:", savedUser.farmerId);
    
    // Don't send the hashed PIN back
    const userResponse = {
      name: savedUser.name,
      role: savedUser.role,
      farmerId: savedUser.farmerId,
      district: savedUser.district
    };
    
    res.status(201).json(userResponse);
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ error: "Failed to register user", details: err.message });
  }
});

// LOGIN API
router.post('/login', async (req, res) => {
  try {
    const { farmerId, pin } = req.body;

    if (!farmerId || !pin) {
      return res.status(400).json({ error: "Farmer ID and PIN are required" });
    }

    const user = await User.findOne({ farmerId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare hashed PIN
    const isValidPin = await bcrypt.compare(pin, user.pin);

    if (!isValidPin) {
      return res.status(400).json({ error: "Wrong PIN" });
    }

    console.log("✅ Login successful for:", user.farmerId);
    
    // Return user data without PIN
    res.status(200).json({ 
      role: user.role,
      name: user.name,
      farmerId: user.farmerId,
      district: user.district
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

module.exports = router;
