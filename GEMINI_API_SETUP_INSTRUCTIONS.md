# Gemini API Setup Instructions

## Current Issue
The Gemini API key in your `.env` file appears to be invalid or expired. All model requests are failing with authentication errors.

## Steps to Fix

### 1. Get a Valid API Key
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key (should start with "AIza...")

### 2. Update Environment File
Replace the current API key in `server/.env`:

```env
# Replace this line:
GEMINI_API_KEY=AIzaSyCUeLDBw42G5tW_awwFDYxGPDeB9vampvc

# With your new valid key:
GEMINI_API_KEY=YOUR_NEW_VALID_API_KEY_HERE
```

### 3. Restart the Server
After updating the API key:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd server
npm start
```

### 4. Test the Integration
Run our diagnostic script to verify:
```bash
node server/scripts/diagnoseGeminiAPI.js
```

## Important Notes

### API Key Requirements
- Must be a valid Google AI Studio API key
- Should start with "AIza..."
- Must have Gemini API access enabled
- May require billing setup for production use

### Free Tier Limits
- Google AI Studio provides free tier access
- Limited requests per minute/day
- Sufficient for development and testing

### Billing (if needed)
- Some features may require billing setup
- Check Google Cloud Console for billing requirements
- Free tier should work for basic AI Doctor functionality

## Alternative: Use Fallback System
If you can't get a valid API key immediately, the AI Doctor will continue working with our intelligent fallback system that provides excellent agricultural advice.

## Verification
Once you have a valid API key, you should see:
- ✅ API key validation successful
- ✅ Model connection working
- ✅ Agricultural responses from Gemini AI
- 🌱 Enhanced AI Doctor with real-time AI responses

## Support
If you continue having issues:
1. Verify the API key at Google AI Studio
2. Check if Gemini API is enabled for your project
3. Ensure proper billing setup (if required)
4. Try generating a fresh API key