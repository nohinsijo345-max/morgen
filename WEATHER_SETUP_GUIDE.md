# Weather Data Setup Guide

## Current Status
✅ **Weather System**: Fully implemented with premium UI elements
✅ **Fallback System**: Smart mock data based on time of day and location
⚠️ **Live Data**: Requires OpenWeatherMap API key

## How to Enable Live Weather Data

### Step 1: Get OpenWeatherMap API Key
1. Go to [OpenWeatherMap API](https://openweathermap.org/api)
2. Click "Sign Up" (it's free!)
3. Create an account
4. Go to "API Keys" section
5. Copy your API key

### Step 2: Add API Key to Environment
1. Open `server/.env` file
2. Replace `your_api_key_here` with your actual API key:
   ```
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

### Step 3: Restart Server
```bash
# Stop current server (Ctrl+C)
# Then restart:
cd server
npm start
```

## Features

### Live Weather Data (when API key is configured)
- **Real-time data** from OpenWeatherMap
- **Accurate conditions**: sunny, cloudy, rainy, thunderstorm, etc.
- **Precise temperature** and humidity
- **Actual sunrise/sunset times**
- **Live wind speed and pressure**
- **Location-based data** for each farmer's district

### Smart Fallback System (when no API key)
- **Time-based conditions**: Different weather based on hour of day
- **Realistic temperatures**: Cooler at night, warmer during day
- **Seasonal variations**: Temperature ranges based on time
- **Location awareness**: Uses farmer's district name

### Premium UI Elements
- **3D Sun**: Animated rays, corona effects, realistic gradients
- **Detailed Moon**: Craters, glow effects, night-time ambiance
- **Fluffy Clouds**: Multi-layer 3D clouds with highlights
- **Animated Rain**: Realistic droplets with motion
- **Lightning Effects**: For thunderstorm conditions
- **Dynamic Themes**: Background changes based on weather/time

## Weather Conditions Supported

| Condition | Description | Visual Elements |
|-----------|-------------|-----------------|
| Sunny | Clear day | Animated sun with rays |
| Clear | Clear night | Moon with craters |
| Cloudy | Partly cloudy | 3D clouds |
| Overcast | Fully cloudy | Dense cloud cover |
| Rainy | Rain/drizzle | Clouds with animated rain |
| Thunderstorm | Storm with lightning | Dark clouds with lightning |
| Foggy | Misty conditions | Soft cloud effects |

## Testing

### Check Current Status
```bash
cd server
node scripts/checkFarmers.js
```

Look for `isLiveData: true` in the output to confirm live data is working.

### Test Different Locations
The system fetches weather for each farmer's district:
- Ernakulam, Kerala
- Dakshina Kannada, Karnataka  
- Thiruvananthapuram, Kerala

## API Limits
- **Free Tier**: 1,000 calls/day, 60 calls/minute
- **Usage**: ~1 call per farmer dashboard load
- **Caching**: Weather data is fetched fresh each time (can be optimized)

## Troubleshooting

### Weather Shows Mock Data
- Check if `OPENWEATHER_API_KEY` is set in `.env`
- Verify API key is valid (not expired)
- Check server logs for API errors
- Ensure internet connection is available

### API Key Issues
- Make sure API key is activated (can take up to 2 hours)
- Check OpenWeatherMap dashboard for usage limits
- Verify the key has permissions for Current Weather API

### Location Not Found
- OpenWeatherMap uses city names
- Indian districts are usually recognized
- Fallback to mock data if location not found

## Future Enhancements
- **Weather Caching**: Cache data for 10-15 minutes to reduce API calls
- **5-Day Forecast**: Extended forecast for planning
- **Weather Alerts**: Notifications for severe weather
- **Crop-Specific Advice**: Weather-based farming recommendations