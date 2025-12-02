const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// REGISTER API
router.post('/register', async (req, res) => {
  try {
    const { name, role, farmerId, pin, phone, district, panchayat, landSize } = req.body;

    // Validation
    if (!name || !farmerId || !pin || !phone) {
      return res.status(400).json({ error: "Name, Farmer ID, PIN, and Phone are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ farmerId }, { phone }] 
    });
    
    if (existingUser) {
      if (existingUser.farmerId === farmerId) {
        return res.status(400).json({ error: "Farmer ID already exists" });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({ error: "Phone number already registered" });
      }
    }

    // Hash the PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    const newUser = new User({
      name,
      role: role || 'farmer',
      farmerId,
      pin: hashedPin,
      phone,
      district: district || 'Kerala',
      panchayat,
      landSize: landSize || 0
    });

    const savedUser = await newUser.save();
    console.log("✅ User registered:", savedUser.farmerId);
    
    // Don't send the hashed PIN back
    const userResponse = {
      name: savedUser.name,
      role: savedUser.role,
      farmerId: savedUser.farmerId,
      phone: savedUser.phone,
      district: savedUser.district,
      panchayat: savedUser.panchayat,
      landSize: savedUser.landSize
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
