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
    const { message, messageId, language } = req.body; // Add language parameter

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get chat session
    const chat = await AIChat.findOne({ farmerId });
    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Get farmer information for language preference
    const farmer = await User.findOne({ farmerId });
    const userLanguage = language || farmer?.language || 'en'; // Use provided language or farmer's preference

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
- Language: ${userLanguage}

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
      
      // Language-specific response instructions
      const languageInstructions = {
        'en': 'Respond in English.',
        'hi': 'Respond in Hindi (हिंदी). Use Devanagari script.',
        'ta': 'Respond in Tamil (தமிழ்). Use Tamil script.',
        'te': 'Respond in Telugu (తెలుగు). Use Telugu script.',
        'ml': 'Respond in Malayalam (മലയാളം). Use Malayalam script.',
        'kn': 'Respond in Kannada (ಕನ್ನಡ). Use Kannada script.'
      };
      
      const responseLanguage = languageInstructions[userLanguage] || languageInstructions['en'];
      
      const enhancedPrompt = `You are Dr. AgriBot, an expert AI Plant Doctor and Agricultural Consultant with deep knowledge of Indian farming conditions. You specialize in crop health, disease diagnosis, and agricultural best practices.

FARMER PROFILE:
- Name: ${chat.farmerName}
- Location: ${chat.farmerContext.location.city}, ${chat.farmerContext.location.district}, ${chat.farmerContext.location.state}
- Primary Crops: ${chat.farmerContext.crops.join(', ') || 'Mixed farming'}
- Experience Level: ${chat.farmerContext.farmingExperience}
- Farm Size: ${chat.farmerContext.farmSize}
- Preferred Language: ${userLanguage}

CURRENT QUESTION: "${message}"

CONVERSATION CONTEXT:
${chat.messages.slice(-4).map(msg => `${msg.role.toUpperCase()}: ${msg.content.substring(0, 200)}`).join('\n')}

RESPONSE REQUIREMENTS:
1. LANGUAGE: ${responseLanguage}
2. AGRICULTURE ONLY: Only discuss farming, crops, plant health, soil, pests, diseases, irrigation, fertilizers, agricultural practices
3. SPECIFIC & ACTIONABLE: Provide concrete, practical advice the farmer can implement
4. LOCATION-AWARE: Consider ${chat.farmerContext.location.state} climate, soil conditions, and common regional issues
5. CROP-SPECIFIC: Tailor advice to their crops: ${chat.farmerContext.crops.join(', ')}
6. FARMER-FRIENDLY: Use simple language, avoid technical jargon
7. STRUCTURED: Use emojis, bullet points, and clear sections for readability

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
      
      // Intelligent fallback based on message content and language
      const messageLower = message.toLowerCase();
      
      // Language-specific fallback responses
      const fallbackResponses = {
        'en': {
          wheatInfection: `🌾 **Wheat Health Analysis for ${chat.farmerName}**

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

**⚡ IMMEDIATE ACTION PLAN:**
1. **Identify Symptoms**: Check leaves, stems, and grain heads
2. **Isolate**: Remove severely infected plants immediately
3. **Spray Treatment**: Apply appropriate fungicide (evening time)
4. **Improve Drainage**: Ensure no waterlogging
5. **Monitor Weather**: Avoid spraying before rain

**What specific symptoms are you seeing?** (leaf spots, powdery coating, stem issues, grain problems?) This will help me give you the exact treatment protocol!`,
          general: `🌱 **Hello ${chat.farmerName}!**

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

Just describe your farming concern or upload a plant photo for instant analysis!`
        },
        'hi': {
          wheatInfection: `🌾 **${chat.farmerName} के लिए गेहूं स्वास्थ्य विश्लेषण**

मैं समझता हूं कि ${chat.farmerContext.location.district}, ${chat.farmerContext.location.state} में आपकी गेहूं की फसल में संक्रमण के लक्षण दिख रहे हैं। आइए इस समस्या का निदान और उपचार करते हैं।

**🔍 ${chat.farmerContext.location.state} में सामान्य गेहूं रोग:**

**1. पत्ती का जंग (सबसे आम)**
• **लक्षण**: पत्तियों पर नारंगी-भूरे रंग के दाने
• **उपचार**: प्रोपिकोनाजोल 25% EC @ 1ml/लीटर
• **समय**: पहले लक्षण पर छिड़काव, 15 दिन बाद दोहराएं

**2. चूर्णिल आसिता**
• **लक्षण**: पत्तियों पर सफेद पाउडर जैसी परत
• **उपचार**: सल्फर 80% WP @ 2g/लीटर या ट्राइडिमेफॉन
• **रोकथाम**: घने रोपण से बचें

**3. पत्ती झुलसा/धब्बा रोग**
• **लक्षण**: पीले हालो के साथ भूरे अंडाकार धब्बे
• **उपचार**: मैंकोजेब 75% WP @ 2g/लीटर
• **महत्वपूर्ण**: संक्रमित पौधों के अवशेष हटाएं

**⚡ तत्काल कार्य योजना:**
1. **लक्षण पहचानें**: पत्तियों, तनों और दानों की जांच करें
2. **अलग करें**: गंभीर संक्रमित पौधों को तुरंत हटाएं
3. **छिड़काव उपचार**: उपयुक्त कवकनाशी लगाएं (शाम के समय)
4. **जल निकासी सुधारें**: जलभराव न होने दें
5. **मौसम की निगरानी**: बारिश से पहले छिड़काव न करें

**आप कौन से विशिष्ट लक्षण देख रहे हैं?** (पत्ती के धब्बे, पाउडर कोटिंग, तना की समस्याएं, दाने की समस्याएं?) इससे मुझे सटीक उपचार प्रोटोकॉल देने में मदद मिलेगी!`,
          general: `🌱 **नमस्ते ${chat.farmerName}!**

मैं आपका AI प्लांट डॉक्टर हूं, ${chat.farmerContext.location.district}, ${chat.farmerContext.location.state} में आपकी ${chat.farmerContext.crops.join(', ')} खेती में मदद के लिए यहां हूं।

**आज मैं आपकी कैसे मदद कर सकता हूं?**
• 🦠 पौधों की बीमारियों और कीटों का निदान
• 🌿 उर्वरक और उपचार की सिफारिश
• 💧 सिंचाई कार्यक्रम अनुकूलित करें
• 📸 पौधों की तस्वीरों का तुरंत विश्लेषण

**त्वरित उदाहरण:**
• "मेरे पौधों की पत्तियां पीली हैं"
• "प्राकृतिक रूप से कीटों को कैसे नियंत्रित करें?"
• "फूल आने के लिए सबसे अच्छा उर्वरक?"

बस अपनी खेती की समस्या बताएं या तुरंत विश्लेषण के लिए पौधे की तस्वीर अपलोड करें!`
        }
        // Add other languages as needed...
      };
      
      // Enhanced wheat infection analysis
      if (messageLower.includes('wheat') && (messageLower.includes('infection') || messageLower.includes('disease') || messageLower.includes('infected') || messageLower.includes('problem') || messageLower.includes('issue'))) {
        aiResponse = fallbackResponses[userLanguage]?.wheatInfection || fallbackResponses['en'].wheatInfection;
      } else {
        // More intelligent general response
        aiResponse = fallbackResponses[userLanguage]?.general || fallbackResponses['en'].general;
      }
    }

    // Add AI response
    // Create AI response message with unique ID
    const assistantMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_assistant`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      requestId: requestId, // Add request ID for tracking
      language: userLanguage // Add language for tracking
    };
    
    chat.messages.push(assistantMessage);
    await chat.save();

    res.json({
      message: assistantMessage,
      sessionStats: chat.sessionStats
    });

  } catch (error) {
    console.error('Error processing AI message:', error);
    
    // Language-specific fallback response
    const fallbackMessages = {
      'en': "🌱 I'm here to help with your agricultural questions! I can assist with plant diseases, crop management, soil health, pest control, and farming best practices. Please feel free to ask me anything related to your farming needs.",
      'hi': "🌱 मैं आपके कृषि प्रश्नों में मदद के लिए यहाँ हूँ! मैं पौधों की बीमारियों, फसल प्रबंधन, मिट्टी के स्वास्थ्य, कीट नियंत्रण और खेती की सर्वोत्तम प्रथाओं में सहायता कर सकता हूँ। कृपया अपनी खेती की जरूरतों से संबंधित कुछ भी पूछने में संकोच न करें।",
      'ta': "🌱 உங்கள் விவசாய கேள்விகளுக்கு உதவ நான் இங்கே இருக்கிறேன்! தாவர நோய்கள், பயிர் மேலாண்மை, மண் ஆரோக்கியம், பூச்சி கட்டுப்பாடு மற்றும் விவசாய சிறந்த நடைமுறைகளில் என்னால் உதவ முடியும். உங்கள் விவசாய தேவைகள் தொடர்பான எதையும் என்னிடம் கேட்க தயங்க வேண்டாம்।",
      'te': "🌱 మీ వ్యవసాయ ప్రశ్నలతో సహాయం చేయడానికి నేను ఇక్కడ ఉన్నాను! మొక్కల వ్యాధులు, పంట నిర్వహణ, మట్టి ఆరోగ్యం, కీటక నియంత్రణ మరియు వ్యవసాయ ఉత్తమ పద్ధతులలో నేను సహాయం చేయగలను. మీ వ్యవసాయ అవసరాలకు సంబంధించిన ఏదైనా నన్ను అడగడానికి సంకోచించకండి।",
      'ml': "🌱 നിങ്ങളുടെ കാർഷിക ചോദ്യങ്ങളിൽ സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്! സസ്യ രോഗങ്ങൾ, വിള പരിപാലനം, മണ്ണിന്റെ ആരോഗ്യം, കീട നിയന്ത്രണം, കാർഷിക മികച്ച രീതികൾ എന്നിവയിൽ എനിക്ക് സഹായിക്കാൻ കഴിയും. നിങ്ങളുടെ കൃഷി ആവശ്യങ്ങളുമായി ബന്ധപ്പെട്ട എന്തും എന്നോട് ചോദിക്കാൻ മടിക്കരുത്।",
      'kn': "🌱 ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳಿಗೆ ಸಹಾಯ ಮಾಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ! ಸಸ್ಯ ರೋಗಗಳು, ಬೆಳೆ ನಿರ್ವಹಣೆ, ಮಣ್ಣಿನ ಆರೋಗ್ಯ, ಕೀಟ ನಿಯಂತ್ರಣೆ ಮತ್ತು ಕೃಷಿ ಉತ್ತಮ ಅಭ್ಯಾಸಗಳಲ್ಲಿ ನಾನು ಸಹಾಯ ಮಾಡಬಹುದು. ನಿಮ್ಮ ಕೃಷಿ ಅಗತ್ಯಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ಯಾವುದನ್ನಾದರೂ ನನ್ನನ್ನು ಕೇಳಲು ಹಿಂಜರಿಯಬೇಡಿ।"
    };
    
    const userLanguage = req.body.language || 'en';
    const fallbackMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_assistant`,
      role: 'assistant',
      content: fallbackMessages[userLanguage] || fallbackMessages['en'],
      timestamp: new Date(),
      requestId: requestId, // Add request ID for tracking
      language: userLanguage
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