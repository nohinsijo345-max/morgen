const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/profile-images');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: farmerId_timestamp.extension
    const farmerId = req.params.farmerId || req.body.farmerId || 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${farmerId}_${timestamp}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Generate next Farmer ID
const generateFarmerId = async () => {
  try {
    // Find the last farmer by sorting farmerId in descending order
    const lastFarmer = await User.findOne({ 
      farmerId: { $regex: /^MGN\d+$/ } 
    }).sort({ farmerId: -1 });
    
    if (!lastFarmer || !lastFarmer.farmerId) {
      return 'MGN001';
    }
    
    // Extract number from MGN001, MGN002, etc.
    const lastNumber = parseInt(lastFarmer.farmerId.replace('MGN', ''));
    const nextNumber = lastNumber + 1;
    
    // Pad with zeros (MGN001, MGN002, ..., MGN999)
    return `MGN${String(nextNumber).padStart(3, '0')}`;
  } catch (err) {
    console.error('Error generating farmer ID:', err);
    return 'MGN001';
  }
};

// Get next Farmer ID (for frontend to display)
router.get('/next-farmer-id', async (req, res) => {
  try {
    const nextId = await generateFarmerId();
    res.json({ farmerId: nextId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate Farmer ID' });
  }
});

// REGISTER API
router.post('/register', async (req, res) => {
  try {
    const { name, role, pin, phone, email, state, district, city, pinCode, panchayat, landSize, cropTypes, subsidyRequested } = req.body;

    // Validation
    if (!name || !pin || !phone) {
      return res.status(400).json({ error: "Name, PIN, and Phone are required" });
    }

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
    }

    // Validate email format
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate PIN (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: "PIN must be exactly 4 digits" });
    }

    // Phone validation - must be exactly 10 digits
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
    }

    // City validation - must contain at least one letter
    if (city && !/[a-zA-Z]/.test(city)) {
      return res.status(400).json({ error: "City name must contain at least one letter" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ phone }, ...(email ? [{ email }] : [])] 
    });
    
    if (existingUser) {
      if (existingUser.phone === phone) {
        return res.status(400).json({ error: "Phone number already registered" });
      }
      if (email && existingUser.email === email) {
        return res.status(400).json({ error: "Email already registered" });
      }
    }

    // Auto-generate Farmer ID
    const farmerId = await generateFarmerId();

    // Hash the PIN
    const hashedPin = await bcrypt.hash(pin, 10);

    const newUser = new User({
      name,
      role: role || 'farmer',
      farmerId,
      pin: hashedPin,
      phone,
      email,
      state,
      district,
      city,
      pinCode,
      panchayat,
      landSize: landSize || 0,
      cropTypes: cropTypes || [],
      subsidyRequested: subsidyRequested || false,
      subsidyStatus: subsidyRequested ? 'pending' : 'none'
    });

    // If subsidy requested, log notification for government module
    if (subsidyRequested) {
      console.log(`📢 SUBSIDY REQUEST: Farmer ${farmerId} (${name}) has requested subsidy`);
      // TODO: Send notification to government module when implemented
    }

    const savedUser = await newUser.save();
    console.log("✅ User registered:", savedUser.farmerId);
    
    // Don't send the hashed PIN back
    const userResponse = {
      name: savedUser.name,
      role: savedUser.role,
      farmerId: savedUser.farmerId,
      phone: savedUser.phone,
      email: savedUser.email,
      state: savedUser.state,
      district: savedUser.district,
      city: savedUser.city,
      pinCode: savedUser.pinCode,
      panchayat: savedUser.panchayat,
      landSize: savedUser.landSize,
      cropTypes: savedUser.cropTypes
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
      return res.status(404).json({ error: "Invalid Farmer ID" });
    }

    // Compare hashed PIN
    const isValidPin = await bcrypt.compare(pin, user.pin);

    if (!isValidPin) {
      return res.status(400).json({ error: "Invalid PIN" });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    console.log("✅ Login successful for:", user.farmerId);
    
    // Return user data without PIN
    res.status(200).json({ 
      role: user.role,
      name: user.name,
      farmerId: user.farmerId,
      email: user.email,
      phone: user.phone,
      state: user.state,
      district: user.district,
      city: user.city,
      pinCode: user.pinCode,
      panchayat: user.panchayat,
      landSize: user.landSize,
      cropTypes: user.cropTypes || []
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Login failed", details: err.message });
  }
});

// GET USER PROFILE
router.get('/profile/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const user = await User.findOne({ farmerId }).select('-pin');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('❌ Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// UPDATE USER PROFILE (email, phone, cropTypes only)
router.put('/profile/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { email, phone, cropTypes } = req.body;
    
    // Phone validation if provided
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
    }
    
    // Check if email/phone already exists for another user
    if (email || phone) {
      const existingUser = await User.findOne({
        farmerId: { $ne: farmerId },
        $or: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : [])
        ]
      });
      
      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ error: 'Email already in use' });
        }
        if (existingUser.phone === phone) {
          return res.status(400).json({ error: 'Phone number already in use' });
        }
      }
    }
    
    const updateData = {};
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (cropTypes) updateData.cropTypes = cropTypes;
    
    const updatedUser = await User.findOneAndUpdate(
      { farmerId },
      updateData,
      { new: true }
    ).select('-pin');
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`✅ Profile updated for ${farmerId}`);
    res.json(updatedUser);
  } catch (err) {
    console.error('❌ Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// CHANGE PASSWORD (for logged-in users)
router.post('/change-password', async (req, res) => {
  try {
    const { farmerId, currentPin, newPin } = req.body;

    if (!farmerId || !currentPin || !newPin) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ error: "New PIN must be exactly 4 digits" });
    }

    const user = await User.findOne({ farmerId: farmerId.toUpperCase() });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current PIN
    const isValidPin = await bcrypt.compare(currentPin, user.pin);
    if (!isValidPin) {
      return res.status(400).json({ error: "Current PIN is incorrect" });
    }

    // Hash and update new PIN
    const hashedPin = await bcrypt.hash(newPin, 10);
    user.pin = hashedPin;
    await user.save();

    console.log(`✅ Password changed for ${farmerId}`);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: err.message });
  }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { farmerId, email, phone, newPin } = req.body;

    // Validation
    if (!farmerId || !email || !phone || !newPin) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate PIN (4 digits)
    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ error: "PIN must be exactly 4 digits" });
    }

    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "Phone number must be exactly 10 digits" });
    }

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Find user with matching farmerId, email, and phone
    const user = await User.findOne({ 
      farmerId: farmerId.toUpperCase(),
      email: email,
      phone: phone
    });

    if (!user) {
      return res.status(404).json({ 
        error: "No account found with these details. Please verify your Farmer ID, email, and phone number." 
      });
    }

    // Hash the new PIN
    const hashedPin = await bcrypt.hash(newPin, 10);

    // Update the PIN
    user.pin = hashedPin;
    await user.save();

    console.log(`✅ Password reset successful for ${user.farmerId}`);
    
    res.status(200).json({ 
      message: "Password reset successful",
      farmerId: user.farmerId
    });
  } catch (err) {
    console.error("❌ Password reset error:", err);
    res.status(500).json({ error: "Failed to reset password", details: err.message });
  }
});

// UPLOAD PROFILE IMAGE
router.post('/profile-image/:farmerId', upload.single('profileImage'), async (req, res) => {
  try {
    const { farmerId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Find the user
    const user = await User.findOne({ farmerId: farmerId.toUpperCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete old profile image if exists
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '../uploads/profile-images', path.basename(user.profileImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log('🗑️ Deleted old profile image:', oldImagePath);
      }
    }

    // Update user with new profile image
    const imageUrl = `/uploads/profile-images/${req.file.filename}`;
    user.profileImage = imageUrl;
    user.profileImageUploadedAt = new Date();
    await user.save();

    console.log('📸 Profile image uploaded for:', farmerId, '- URL:', imageUrl);

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      profileImage: imageUrl,
      uploadedAt: user.profileImageUploadedAt
    });

  } catch (error) {
    console.error('❌ Profile image upload error:', error);
    res.status(500).json({ error: 'Failed to upload profile image', details: error.message });
  }
});

// DELETE PROFILE IMAGE
router.delete('/profile-image/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;

    // Find the user
    const user = await User.findOne({ farmerId: farmerId.toUpperCase() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete profile image file if exists
    if (user.profileImage) {
      const imagePath = path.join(__dirname, '../uploads/profile-images', path.basename(user.profileImage));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('🗑️ Deleted profile image file:', imagePath);
      }
    }

    // Update user to remove profile image
    user.profileImage = null;
    user.profileImageUploadedAt = null;
    await user.save();

    console.log('🗑️ Profile image deleted for:', farmerId);

    res.json({
      success: true,
      message: 'Profile image deleted successfully'
    });

  } catch (error) {
    console.error('❌ Profile image deletion error:', error);
    res.status(500).json({ error: 'Failed to delete profile image', details: error.message });
  }
});

module.exports = router;
