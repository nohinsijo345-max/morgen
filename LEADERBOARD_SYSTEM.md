# Premium Leaderboard System

## Overview
A luxury leaderboard system that tracks farmer sales performance with premium UI/UX and real database integration.

## Features Implemented

### 1. **LeaderboardCard Component** (`client/src/components/LeaderboardCard.jsx`)
- Premium card for FarmerDashboard
- Shows top 5 farmers by sales
- Real-time data from backend
- Animated shine effects
- Medal/trophy icons for top 3
- Click to navigate to full leaderboard

### 2. **Full Leaderboard Page** (`client/src/pages/Leaderboard.jsx`)
- **Top 3 Podium Display:**
  - 1st place: Gold with crown icon, animated glow
  - 2nd place: Silver with medal icon
  - 3rd place: Bronze with award icon
  - Animated floating effects

- **Complete Rankings Table:**
  - All farmers ranked by sales performance
  - Shows: Rank, Name, Total Sales, Revenue, Avg Rating, Status Badge
  - Hover effects and animations
  - Click row to view detailed stats

- **Stats Summary:**
  - Total sales across all farmers
  - Total revenue generated
  - Average rating

- **Farmer Detail Modal:**
  - Click any farmer to see detailed stats
  - Shows sales count, revenue, rating

### 3. **Backend API** (`server/routes/leaderboard.js`)
- **GET `/api/leaderboard/top`** - Get top farmers
  - Query param: `limit` (default: 10)
  - Aggregates sales data by farmer
  - Returns: farmerId, name, totalSales, totalRevenue, avgRating, rank, badge
  - Sorted by total sales (descending)

### 4. **Sales Tracking**
- Uses existing `Sale` model
- Tracks: farmerId, farmerName, cropName, quantity, price, totalAmount, rating
- Automatically aggregated for leaderboard rankings

### 5. **Seed Script** (`server/scripts/seedSalesData.js`)
- Generates sample sales data for testing
- Creates 1-20 random sales per farmer
- Random crops, quantities, prices, dates
- Ratings between 4-5 stars

## Design Features

### Premium UI Elements:
- ✨ Animated background gradients
- 🏆 Gold/Silver/Bronze medal system
- 👑 Crown icon for #1 farmer
- ⭐ Star ratings display
- 💎 Glassmorphism effects
- 🌟 Sparkle animations for top 3
- 📊 Gradient stat cards
- 🎨 Smooth hover transitions

### Color Scheme:
- Primary: `#082829` (Dark teal)
- Background: `#fbfbef` (Cream)
- Gold: `#FFD700` gradient
- Silver: `#C0C0C0` gradient
- Bronze: `#CD7F32` gradient

## Usage

### 1. Seed Sample Sales Data:
```bash
cd server
npm run seed:sales
```

### 2. View Leaderboard:
- Dashboard card shows top 5 farmers
- Click card to open full leaderboard page
- Click any farmer row for detailed stats

### 3. API Endpoints:
```javascript
// Get top 10 farmers
GET /api/leaderboard/top

// Get top 20 farmers
GET /api/leaderboard/top?limit=20
```

## Database Schema

### Sale Model:
```javascript
{
  farmerId: String,
  farmerName: String,
  cropName: String,
  quantity: Number,
  pricePerUnit: Number,
  totalAmount: Number,
  buyerId: String,
  buyerName: String,
  saleDate: Date,
  rating: Number (1-5),
  review: String
}
```

## Future Enhancements (for Buyer Module)
- Real-time updates when sales occur
- Filter by date range (daily/weekly/monthly)
- District/region-wise leaderboards
- Achievement badges system
- Sales trend graphs
- Export leaderboard data

## Files Modified/Created

### Created:
- `client/src/components/LeaderboardCard.jsx`
- `client/src/pages/Leaderboard.jsx` (completely rewritten)
- `server/scripts/seedSalesData.js`

### Modified:
- `client/src/pages/FarmerDashboard.jsx` - Uses new LeaderboardCard
- `server/routes/leaderboard.js` - Added `/top` endpoint
- `server/package.json` - Added `seed:sales` script

## Testing

1. **Seed data:**
   ```bash
   cd server
   npm run seed:sales
   ```

2. **Start servers:**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

3. **View leaderboard:**
   - Navigate to Farmer Dashboard
   - See LeaderboardCard with top 5 farmers
   - Click card to open full leaderboard page
   - Click any farmer to see detailed stats

## Notes
- Leaderboard updates automatically when new sales are added
- Rankings based on total number of sales (primary) and revenue (secondary)
- Average rating calculated from all sales with ratings
- Top 3 farmers get special badges: CHAMPION, ELITE, MASTER
