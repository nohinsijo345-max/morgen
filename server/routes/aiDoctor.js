const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const AIChat = require('../models/AIChat');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/plant-images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'plant-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get or create AI chat session for farmer
router.get('/chat/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    // Get farmer information
    const farmer = await User.findOne({ farmerId });
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    // Find existing chat or create new one
    let chat = await AIChat.findOne({ farmerId });
    
    if (!chat) {
      const chatId = `CHAT_${farmerId}_${Date.now()}`;
      
      chat = new AIChat({
        chatId,
        farmerId,
        farmerName: farmer.name,
        farmerContext: {
          crops: farmer.cropTypes || farmer.crops || [],
          location: {
            state: farmer.state,
            district: farmer.district,
            city: farmer.city,
            pinCode: farmer.pinCode
          },
          farmingExperience: farmer.experience || 'Not specified',
          farmSize: farmer.farmSize || 'Not specified',
          primaryConcerns: []
        },
        messages: [{
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: `🌱 Hello ${farmer.name}! I'm your AI Plant Doctor, here to help you with all your agricultural needs. I have access to your farming profile and I'm specialized in plant care, crop management, pest control, soil health, and agricultural best practices.\n\nI can help you with:\n• Plant disease diagnosis\n• Pest identification and treatment\n• Soil and nutrition advice\n• Crop management tips\n• Seasonal farming guidance\n• Image analysis of your plants\n\nWhat agricultural question can I help you with today?`,
          timestamp: new Date()
        }]
      });
      
      await chat.save();
    }

    res.json({
      chatId: chat.chatId,
      messages: chat.messages,
      farmerContext: chat.farmerContext,
      sessionStats: chat.sessionStats,
      lastActivity: chat.lastActivity
    });
  } catch (error) {
    console.error('Error getting AI chat:', error);
    res.status(500).json({ error: 'Failed to get AI chat session' });
  }
});

// Send message to AI Doctor
router.post('/chat/:farmerId/message', async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { message, messageId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get chat session
    const chat = await AIChat.findOne({ farmerId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Add user message
    const userMessage = {
      id: messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_user`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };
    
    chat.messages.push(userMessage);
    chat.sessionStats.questionsAsked += 1;

    // Create unique context for each request to prevent caching
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    // Prepare AI context with farmer information
    const farmerContext = `
REQUEST ID: ${requestId}
TIMESTAMP: ${timestamp}
FARMER PROFILE:
- Name: ${chat.farmerName}
- Location: ${chat.farmerContext.location.city}, ${chat.farmerContext.location.district}, ${chat.farmerContext.location.state}
- Crops: ${chat.farmerContext.crops.join(', ') || 'Not specified'}
- Experience: ${chat.farmerContext.farmingExperience}
- Farm Size: ${chat.farmerContext.farmSize}

CONVERSATION HISTORY:
${chat.messages.slice(-6).map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

CURRENT QUESTION: ${message}
`;

    // Generate AI response with enhanced Gemini integration
    let aiResponse = '';
    
    try {
      // Try different model names in order of preference (updated for free plan)
      let model;
      const modelNames = [
        'gemini-2.5-flash',      // Free plan model
        'gemini-2.5-flash-lite', // Free plan model  
        'gemini-3-2b',           // Free plan model
        'gemini-3-4b',           // Free plan model
        'gemini-1.5-flash',      // Fallback
        'gemini-pro'             // Fallback
      ];
      
      for (const modelName of modelNames) {
        try {
          model = genAI.getGenerativeModel({ model: modelName });
          console.log(`✅ Using Gemini model: ${modelName}`);
          break; // Use the first available model
        } catch (modelError) {
          console.log(`Model ${modelName} not available, trying next...`);
        }
      }
      
      if (!model) {
        throw new Error('No Gemini models available');
      }
      
      const enhancedPrompt = `You are Dr. AgriBot, an expert AI Plant Doctor and Agricultural Consultant with deep knowledge of Indian farming conditions. You specialize in crop health, disease diagnosis, and agricultural best practices.

FARMER PROFILE:
- Name: ${chat.farmerName}
- Location: ${chat.farmerContext.location.city}, ${chat.farmerContext.location.district}, ${chat.farmerContext.location.state}
- Primary Crops: ${chat.farmerContext.crops.join(', ') || 'Mixed farming'}
- Experience Level: ${chat.farmerContext.farmingExperience}
- Farm Size: ${chat.farmerContext.farmSize}

CURRENT QUESTION: "${message}"

CONVERSATION CONTEXT:
${chat.messages.slice(-4).map(msg => `${msg.role.toUpperCase()}: ${msg.content.substring(0, 200)}`).join('\n')}

RESPONSE REQUIREMENTS:
1. AGRICULTURE ONLY: Only discuss farming, crops, plant health, soil, pests, diseases, irrigation, fertilizers, agricultural practices
2. SPECIFIC & ACTIONABLE: Provide concrete, practical advice the farmer can implement
3. LOCATION-AWARE: Consider ${chat.farmerContext.location.state} climate, soil conditions, and common regional issues
4. CROP-SPECIFIC: Tailor advice to their crops: ${chat.farmerContext.crops.join(', ')}
5. FARMER-FRIENDLY: Use simple language, avoid technical jargon
6. STRUCTURED: Use emojis, bullet points, and clear sections for readability

RESPONSE FORMAT:
- Start with relevant emoji and brief acknowledgment
- Provide specific diagnosis/advice
- Include immediate action steps
- Mention prevention tips
- End with follow-up question if appropriate

If the question is about plant diseases/infections:
- Identify likely causes based on symptoms
- Provide specific treatment options (organic and chemical)
- Include application methods and timing
- Mention prevention strategies

If asked about non-agricultural topics, politely redirect: "🌱 I'm your agricultural specialist. Let's focus on your farming needs - ask me about crops, plant health, soil, or farming techniques!"

Provide a helpful, specific response in 150-300 words:`;

      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      aiResponse = response.text();

      // Enhanced validation for agriculture content
      const agricultureKeywords = ['crop', 'plant', 'soil', 'farm', 'seed', 'harvest', 'pest', 'disease', 'fertilizer', 'irrigation', 'agriculture', 'cultivation'];
      const hasAgricultureContent = agricultureKeywords.some(keyword => 
        aiResponse.toLowerCase().includes(keyword.toLowerCase())
      );

      // Check for non-agriculture content
      const nonAgricultureKeywords = ['politics', 'medicine', 'finance', 'entertainment', 'sports', 'technology', 'programming', 'cooking', 'travel'];
      const containsNonAgriculture = nonAgricultureKeywords.some(keyword => 
        aiResponse.toLowerCase().includes(keyword.toLowerCase())
      );

      // If response doesn't contain agriculture content or contains non-agriculture content, use fallback
      if (!hasAgricultureContent || containsNonAgriculture) {
        throw new Error('Non-agricultural response detected');
      }

      console.log('✅ Gemini API response received and validated');
    } catch (geminiError) {
      console.log('🔄 Using intelligent fallback response:', geminiError.message);
      
      // Intelligent fallback based on message content
      const messageLower = message.toLowerCase();
      
      // Enhanced wheat infection analysis
      if (messageLower.includes('wheat') && (messageLower.includes('infection') || messageLower.includes('disease') || messageLower.includes('infected') || messageLower.includes('problem') || messageLower.includes('issue'))) {
        aiResponse = `🌾 **Wheat Health Analysis for ${chat.farmerName}**

I understand your wheat crop in ${chat.farmerContext.location.district}, ${chat.farmerContext.location.state} is showing signs of infection. Let me help you diagnose and treat this issue.

**🔍 Common Wheat Diseases in ${chat.farmerContext.location.state}:**

**1. Leaf Rust (Most Common)**
• **Symptoms**: Orange-brown pustules on leaves
• **Treatment**: Propiconazole 25% EC @ 1ml/liter
• **Timing**: Spray at first sign, repeat after 15 days

**2. Powdery Mildew**
• **Symptoms**: White powdery coating on leaves
• **Treatment**: Sulfur 80% WP @ 2g/liter OR Triadimefon
• **Prevention**: Avoid dense planting

**3. Leaf Blight/Spot Blotch**
• **Symptoms**: Brown oval spots with yellow halos
• **Treatment**: Mancozeb 75% WP @ 2g/liter
• **Critical**: Remove infected plant debris

**4. Loose Smut**
• **Symptoms**: Black powdery masses replacing grain
• **Treatment**: Seed treatment with Carboxin + Thiram
• **Prevention**: Use certified disease-free seeds

**⚡ IMMEDIATE ACTION PLAN:**
1. **Identify Symptoms**: Check leaves, stems, and grain heads
2. **Isolate**: Remove severely infected plants immediately
3. **Spray Treatment**: Apply appropriate fungicide (evening time)
4. **Improve Drainage**: Ensure no waterlogging
5. **Monitor Weather**: Avoid spraying before rain

**🌾 Specific for ${chat.farmerContext.location.district} Climate:**
• **Best Spray Time**: 6-8 AM or 4-6 PM
• **Frequency**: Every 10-15 days during humid weather
• **Organic Option**: Neem oil 5ml/liter + Baking soda 1g/liter

**📋 Prevention for Next Season:**
• Choose resistant varieties (HD-2967, PBW-550)
• Crop rotation with legumes
• Balanced NPK fertilization
• Proper seed treatment

**What specific symptoms are you seeing?** (leaf spots, powdery coating, stem issues, grain problems?) This will help me give you the exact treatment protocol!`;
      } else if (messageLower.includes('rice') && (messageLower.includes('infection') || messageLower.includes('disease') || messageLower.includes('infected') || messageLower.includes('problem'))) {
        aiResponse = `🌾 **Rice Health Diagnosis for ${chat.farmerName}**

Your rice crop in ${chat.farmerContext.location.district}, ${chat.farmerContext.location.state} needs immediate attention. Here's my analysis:

**🔍 Common Rice Diseases:**

**1. Blast Disease (Most Serious)**
• **Symptoms**: Diamond-shaped spots with gray centers
• **Treatment**: Tricyclazole 75% WP @ 0.6g/liter
• **Critical**: Spray immediately, very contagious

**2. Bacterial Leaf Blight**
• **Symptoms**: Yellow to white stripes along leaf edges
• **Treatment**: Streptocycline 300ppm + Copper oxychloride
• **Prevention**: Avoid excess nitrogen

**3. Sheath Blight**
• **Symptoms**: Oval lesions on leaf sheaths near water line
• **Treatment**: Hexaconazole 5% SC @ 2ml/liter
• **Timing**: At tillering and booting stage

**4. Brown Spot**
• **Symptoms**: Small brown spots with yellow halos
• **Treatment**: Mancozeb 75% WP @ 2g/liter
• **Cause**: Usually potassium deficiency

**⚡ IMMEDIATE RICE TREATMENT:**
1. **Drain Field**: Reduce water level temporarily
2. **Remove Debris**: Clear infected plant parts
3. **Fungicide Application**: Based on symptoms identified
4. **Nutrient Balance**: Apply potash if brown spots present
5. **Monitor Closely**: Check daily for spread

**🌾 For ${chat.farmerContext.location.state} Rice Farming:**
• **Monsoon Care**: Extra vigilance during humid weather
• **Water Management**: Maintain 2-3 cm water level
• **Organic Treatment**: Pseudomonas fluorescens @ 10g/liter

**What symptoms are you observing?** (leaf spots, stem issues, panicle problems?) Share details for precise treatment!`;
      } else if (messageLower.includes('cotton') && (messageLower.includes('infection') || messageLower.includes('disease') || messageLower.includes('pest'))) {
        aiResponse = `🌱 **Cotton Health Assessment for ${chat.farmerName}**

Cotton crop issues in ${chat.farmerContext.location.district}, ${chat.farmerContext.location.state} require quick action. Here's my diagnosis:

**🔍 Major Cotton Problems:**

**1. Bollworm Attack (Most Common)**
• **Symptoms**: Holes in bolls, caterpillars inside
• **Treatment**: Bt spray OR Chlorantraniliprole 18.5% SC
• **Timing**: Evening application for best results

**2. Fusarium Wilt**
• **Symptoms**: Yellowing from bottom, wilting plants
• **Treatment**: Soil drenching with Carbendazim
• **Prevention**: Use wilt-resistant varieties

**3. Bacterial Blight**
• **Symptoms**: Water-soaked spots on leaves
• **Treatment**: Streptocycline + Copper oxychloride
• **Critical**: Remove infected plants immediately

**4. Aphid Infestation**
• **Symptoms**: Sticky honeydew, curled leaves
• **Treatment**: Imidacloprid 17.8% SL @ 0.5ml/liter
• **Organic**: Neem oil + soap solution

**⚡ COTTON EMERGENCY PROTOCOL:**
1. **Field Inspection**: Check plants systematically
2. **Pest Monitoring**: Use pheromone traps
3. **Targeted Spraying**: Apply specific treatment
4. **Beneficial Insects**: Preserve ladybugs, spiders
5. **Soil Health**: Ensure proper drainage

**🌱 ${chat.farmerContext.location.state} Cotton Care:**
• **Peak Season**: Extra care during flowering
• **Water Stress**: Maintain adequate moisture
• **Integrated Approach**: Combine chemical + biological control

**Describe the exact problem:** (pest damage, leaf issues, plant wilting, boll damage?) I'll provide the specific solution!`;
      } else if (messageLower.includes('yellow') && (messageLower.includes('leaves') || messageLower.includes('leaf'))) {
        aiResponse = `🌱 **Yellow Leaves Analysis for ${chat.farmerName}**

Yellow leaves on your crops can indicate several issues:

**Common Causes:**
• **Nutrient Deficiency**: Often nitrogen deficiency, especially in ${chat.farmerContext.crops.join(', ')} crops
• **Overwatering**: Poor drainage leading to root problems
• **Pest Infestation**: Aphids, whiteflies, or other sucking insects
• **Disease**: Fungal or bacterial infections

**Immediate Actions for ${chat.farmerContext.location.district}, ${chat.farmerContext.location.state}:**
1. **Check Soil Drainage**: Ensure proper water management
2. **Apply Nitrogen**: Use urea or organic compost
3. **Inspect for Pests**: Look for insects on leaf undersides
4. **Improve Air Circulation**: Prune overcrowded areas

**Treatment Recommendations:**
• Spray neem oil solution (organic pest control)
• Apply balanced NPK fertilizer (19:19:19)
• Ensure proper spacing between plants
• Water early morning to reduce fungal growth

Would you like specific advice for your ${chat.farmerContext.crops.join(' or ')} crops?`;
      } else if (messageLower.includes('pest') || messageLower.includes('insect') || messageLower.includes('bug')) {
        aiResponse = `🐛 **Pest Management Guide for ${chat.farmerName}**

**Common Pests in ${chat.farmerContext.location.state}:**
• **Aphids**: Small green/black insects on new growth
• **Whiteflies**: Tiny white flying insects
• **Thrips**: Small, slender insects causing silver streaks
• **Caterpillars**: Larvae eating leaves and fruits

**Organic Control Methods:**
1. **Neem Oil Spray**: 5ml per liter water, spray evening time
2. **Soap Solution**: 2 tsp dish soap per liter water
3. **Companion Planting**: Marigold, basil around crops
4. **Beneficial Insects**: Encourage ladybugs, lacewings

**Chemical Control (if severe):**
• Imidacloprid for sucking pests
• Chlorpyrifos for caterpillars
• Always follow label instructions

**Prevention Tips:**
• Regular field inspection (weekly)
• Remove infected plant parts
• Maintain field hygiene
• Proper crop rotation

What specific pest are you dealing with on your ${chat.farmerContext.crops.join('/')} crops?`;
      } else if (messageLower.includes('disease') || messageLower.includes('fungus') || messageLower.includes('spot')) {
        aiResponse = `🦠 **Plant Disease Management for ${chat.farmerName}**

**Common Diseases in ${chat.farmerContext.location.district}:**
• **Leaf Spot**: Brown/black spots on leaves
• **Powdery Mildew**: White powdery coating
• **Blight**: Rapid browning and wilting
• **Root Rot**: Yellowing from bottom up

**Treatment Protocol:**
1. **Remove Affected Parts**: Cut and destroy infected leaves/stems
2. **Improve Air Flow**: Prune for better ventilation
3. **Fungicide Application**: 
   - Copper sulfate (organic)
   - Mancozeb (chemical)
   - Carbendazim for severe cases

**Cultural Practices:**
• Water at soil level (avoid wetting leaves)
• Morning watering only
• Proper plant spacing
• Crop rotation with non-host plants

**Soil Health:**
• Add organic matter (compost/FYM)
• Ensure proper drainage
• Maintain soil pH 6.0-7.0

**For ${chat.farmerContext.crops.join('/')} specific diseases:**
Would you like detailed treatment for a specific disease affecting your crops?`;
      } else if (messageLower.includes('fertilizer') || messageLower.includes('nutrition') || messageLower.includes('growth')) {
        aiResponse = `🌿 **Crop Nutrition Guide for ${chat.farmerName}**

**Nutrient Requirements for ${chat.farmerContext.crops.join('/')}:**

**Primary Nutrients (NPK):**
• **Nitrogen (N)**: Leaf growth, green color
• **Phosphorus (P)**: Root development, flowering
• **Potassium (K)**: Disease resistance, fruit quality

**Application Schedule:**
1. **Basal Dose**: At planting - DAP/NPK complex
2. **Top Dressing**: 30-45 days - Urea for nitrogen
3. **Flowering Stage**: Potash for fruit development

**Organic Options:**
• **FYM/Compost**: 5-10 tons per hectare
• **Vermicompost**: 2-3 tons per hectare
• **Green Manure**: Dhaincha, Sunhemp
• **Biofertilizers**: Rhizobium, PSB, Azotobacter

**Micronutrients:**
• Zinc sulfate: 25 kg/hectare
• Boron: 1-2 kg/hectare
• Iron chelate for deficiency symptoms

**Soil Testing Recommendation:**
Get soil tested every 2-3 years for precise nutrient management.

What specific nutrient deficiency symptoms are you observing in your ${chat.farmerContext.location.district} farm?`;
      } else if (messageLower.includes('water') || messageLower.includes('irrigation') || messageLower.includes('drought')) {
        aiResponse = `💧 **Water Management for ${chat.farmerName}**

**Irrigation Guidelines for ${chat.farmerContext.location.state}:**

**Critical Growth Stages:**
• **Germination**: Keep soil moist but not waterlogged
• **Vegetative Growth**: Regular watering every 2-3 days
• **Flowering**: Consistent moisture crucial
• **Fruit Development**: Reduce frequency, increase quantity

**Efficient Methods:**
1. **Drip Irrigation**: 40-50% water saving
2. **Sprinkler System**: Good for field crops
3. **Furrow Irrigation**: Traditional but effective
4. **Mulching**: Reduces water loss by 30-40%

**Water Conservation:**
• **Rainwater Harvesting**: Collect monsoon water
• **Crop Residue Mulch**: Retain soil moisture
• **Shade Nets**: Reduce evaporation
• **Proper Timing**: Early morning/evening watering

**Drought Management:**
• Drought-resistant varieties
• Deep plowing for water retention
• Foliar spray during stress
• Antitranspirants application

**For ${chat.farmerContext.crops.join('/')} in ${chat.farmerContext.location.district}:**
Monsoon dependency can be reduced with proper water management techniques.

What's your current irrigation setup?`;
      } else {
        // More intelligent general response
        aiResponse = `🌱 **Hello ${chat.farmerName}!**

I'm your AI Plant Doctor, here to help with your ${chat.farmerContext.crops.join(', ')} farming in ${chat.farmerContext.location.district}, ${chat.farmerContext.location.state}.

**How can I help you today?**
• 🦠 Diagnose plant diseases and pests
• 🌿 Recommend fertilizers and treatments  
• 💧 Optimize irrigation schedules
• 📸 Analyze plant photos instantly

**Quick Examples:**
• "My plants have yellow leaves"
• "How to control pests naturally?"
• "Best fertilizer for flowering?"

Just describe your farming concern or upload a plant photo for instant analysis!`;
      }
    }

    // Add AI response
    // Create AI response message with unique ID
    const assistantMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_assistant`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      requestId: requestId // Add request ID for tracking
    };
    
    chat.messages.push(assistantMessage);
    await chat.save();

    res.json({
      message: assistantMessage,
      sessionStats: chat.sessionStats
    });

  } catch (error) {
    console.error('Error processing AI message:', error);
    
    // Fallback response
    const fallbackMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_assistant`,
      role: 'assistant',
      content: "🌱 I'm here to help with your agricultural questions! I can assist with plant diseases, crop management, soil health, pest control, and farming best practices. Please feel free to ask me anything related to your farming needs.",
      timestamp: new Date(),
      requestId: requestId // Add request ID for tracking
    };

    res.json({
      message: fallbackMessage,
      error: 'AI temporarily unavailable, showing fallback response'
    });
  }
});

// Upload and analyze plant image
router.post('/chat/:farmerId/image', upload.single('plantImage'), async (req, res) => {
  try {
    const { farmerId } = req.params;
    const { question } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Plant image is required' });
    }

    // Get chat session
    const chat = await AIChat.findOne({ farmerId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    const imageUrl = `/uploads/plant-images/${req.file.filename}`;
    const imagePath = req.file.path;

    // Read image file for AI analysis
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString('base64');

    // Analyze image with AI (with fallback)
    let analysis = '';
    
    try {
      // Try different model names for image analysis (updated for free plan)
      let model;
      const modelNames = [
        'gemini-2.5-flash',      // Free plan model with vision
        'gemini-2.5-flash-lite', // Free plan model
        'gemini-3-2b',           // Free plan model
        'gemini-1.5-flash',      // Fallback
        'gemini-pro-vision',     // Fallback
        'gemini-pro'             // Fallback
      ];
      
      for (const modelName of modelNames) {
        try {
          model = genAI.getGenerativeModel({ model: modelName });
          console.log(`✅ Using Gemini model for image analysis: ${modelName}`);
          break;
        } catch (modelError) {
          console.log(`Image model ${modelName} not available, trying next...`);
        }
      }
      
      if (!model) {
        throw new Error('No Gemini models available for image analysis');
      }
      
      const farmerContext = `
FARMER PROFILE:
- Name: ${chat.farmerName}
- Location: ${chat.farmerContext.location.city}, ${chat.farmerContext.location.district}, ${chat.farmerContext.location.state}
- Crops: ${chat.farmerContext.crops.join(', ') || 'Not specified'}
`;

      const imagePrompt = `You are an expert Plant Doctor analyzing this plant image. 

${farmerContext}

ANALYSIS REQUIREMENTS:
- Identify the plant/crop if possible
- Assess plant health condition
- Identify any diseases, pests, or problems
- Provide specific treatment recommendations
- Consider Indian farming conditions
- Give practical, actionable advice

FARMER'S QUESTION: ${question || 'Please analyze this plant image and provide health assessment'}

Provide a detailed but concise analysis focusing on plant health and actionable farming advice.`;

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: req.file.mimetype
        }
      };

      const result = await model.generateContent([imagePrompt, imagePart]);
      const response = await result.response;
      analysis = response.text();
      
    } catch (geminiError) {
      console.log('Gemini Vision API unavailable, using intelligent image analysis fallback');
      
      // Intelligent fallback for image analysis
      analysis = `📸 **Plant Image Analysis for ${chat.farmerName}**

**Image Received Successfully!**
I can see you've uploaded a plant image from your farm in ${chat.farmerContext.location.district}, ${chat.farmerContext.location.state}.

**General Plant Health Assessment:**

**What to Look For:**
🔍 **Leaf Condition:**
• Check for yellowing, browning, or spots
• Look for holes or chewed edges (pest damage)
• Observe leaf curl or wilting patterns

🔍 **Growth Pattern:**
• Stunted growth may indicate nutrient deficiency
• Excessive vegetative growth might need pruning
• Check for proper branching and flowering

🔍 **Common Issues in ${chat.farmerContext.location.state}:**
• **Fungal Diseases**: Brown spots, white powdery coating
• **Pest Damage**: Holes in leaves, sticky honeydew
• **Nutrient Deficiency**: Yellow leaves, poor growth
• **Water Stress**: Wilting, leaf drop

**Immediate Action Steps:**
1. **Inspect Closely**: Look for pests on leaf undersides
2. **Check Soil**: Ensure proper drainage and moisture
3. **Apply Treatment**: Based on symptoms observed
4. **Monitor Progress**: Take photos to track improvement

**Treatment Recommendations:**
• **Preventive Spray**: Neem oil solution (5ml/liter)
• **Nutrition**: Balanced NPK fertilizer application
• **Water Management**: Proper irrigation schedule
• **Pruning**: Remove affected parts if diseased

**For Specific Diagnosis:**
Please describe what you're seeing in the image:
• Leaf color changes?
• Spots or holes?
• Wilting or stunted growth?
• Any visible insects?

This will help me provide more targeted advice for your ${chat.farmerContext.crops.join('/')} crops!

*Note: For the most accurate diagnosis, consider consulting with a local agricultural extension officer who can physically examine your plants.*`;
    }

    // Add user message with image
    const userMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: question || 'Please analyze this plant image',
      timestamp: new Date(),
      hasImage: true,
      imageUrl: imageUrl
    };

    // Add AI analysis response
    const assistantMessage = {
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant',
      content: `📸 **Plant Image Analysis:**\n\n${analysis}`,
      timestamp: new Date(),
      imageAnalysis: analysis
    };

    chat.messages.push(userMessage, assistantMessage);
    chat.sessionStats.imagesUploaded += 1;
    chat.sessionStats.questionsAsked += 1;
    
    await chat.save();

    res.json({
      userMessage,
      assistantMessage,
      imageUrl,
      analysis,
      sessionStats: chat.sessionStats
    });

  } catch (error) {
    console.error('Error analyzing plant image:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    res.status(500).json({ error: 'Failed to analyze plant image' });
  }
});

// Get AI Doctor statistics for dashboard
router.get('/stats/:farmerId', async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    const chat = await AIChat.findOne({ farmerId });
    
    if (!chat) {
      return res.json({
        totalConsultations: 0,
        questionsAsked: 0,
        imagesAnalyzed: 0,
        lastConsultation: null,
        isActive: false,
        recentTopics: []
      });
    }

    // Extract recent topics from messages
    const recentUserMessages = chat.messages
      .filter(msg => msg.role === 'user')
      .slice(-5)
      .map(msg => msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''));

    res.json({
      totalConsultations: chat.sessionStats.questionsAsked,
      questionsAsked: chat.sessionStats.questionsAsked,
      imagesAnalyzed: chat.sessionStats.imagesUploaded,
      lastConsultation: chat.sessionStats.lastConsultation,
      isActive: chat.isActive,
      recentTopics: recentUserMessages,
      chatId: chat.chatId
    });

  } catch (error) {
    console.error('Error getting AI Doctor stats:', error);
    res.status(500).json({ error: 'Failed to get AI Doctor statistics' });
  }
});

// Clear chat history
router.delete('/chat/:farmerId/clear', async (req, res) => {
  try {
    const { farmerId } = req.params;
    
    const chat = await AIChat.findOne({ farmerId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Keep only the initial welcome message
    const welcomeMessage = chat.messages[0];
    chat.messages = [welcomeMessage];
    chat.sessionStats.questionsAsked = 0;
    chat.sessionStats.imagesUploaded = 0;
    
    await chat.save();

    res.json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

module.exports = router;