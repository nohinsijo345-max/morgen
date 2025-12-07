const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Settings = require('../models/Settings');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Upload image endpoint
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageType = req.body.imageType;
    const imagePath = `/uploads/images/${req.file.filename}`;

    res.json({ 
      success: true,
      message: 'Image uploaded successfully',
      imagePath: imagePath,
      imageType: imageType
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image: ' + error.message });
  }
});

// Get login page image
router.get('/login-image', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: 'loginPageImage' });
    
    if (!setting) {
      // Return default image if not set
      return res.json({
        imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=2070&auto=format&fit=crop'
      });
    }
    
    res.json({ imageUrl: setting.value });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch login image' });
  }
});

// Update login page image (Admin only)
router.put('/login-image', async (req, res) => {
  try {
    const { imageUrl, adminId } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    const setting = await Settings.findOneAndUpdate(
      { key: 'loginPageImage' },
      { 
        value: imageUrl,
        updatedBy: adminId || 'admin',
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    res.json({ 
      success: true, 
      message: 'Login image updated successfully',
      imageUrl: setting.value 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update login image' });
  }
});

// Get all settings (Admin only)
router.get('/all', async (req, res) => {
  try {
    const settings = await Settings.find({});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

module.exports = router;
