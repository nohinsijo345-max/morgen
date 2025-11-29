# Morgen - Agricultural Marketplace Platform

A comprehensive full-stack agricultural marketplace with AI integration, real-time bidding, government oversight, and gamification features.

## 🌟 Overview

Morgen is a next-generation farming platform that connects farmers directly with buyers through an intelligent marketplace. It features AI-powered plant disease diagnosis, price forecasting, real-time auctions, and government scheme management.

## 🎯 Key Features

### 👨‍🌾 Farmer Module
- **Smart PIN Authentication** - Simple 4-digit PIN login (like ATM)
- **Harvest Countdown Timer** - Auto-notify buyers 3 days before harvest
- **AI Plant Doctor** - Image-based disease diagnosis using Google Gemini 1.5
- **AI Price Forecaster** - 7-day price predictions with buy/sell recommendations
- **Live Bidding Console** - Real-time auction management with accept/reject controls

### 🛒 Buyer Module
- **Geo-Fenced Search** - Find crops within specific radius
- **Real-Time Auction Room** - Live bidding with quick increment buttons
- **Auto-Bidder** - Set max limit and let AI bid automatically
- **Digital Ledger** - Complete transaction history
- **Farmer Rating System** - Rate farmers on quality and timeliness

### 👨‍💼 Admin Module (Government)
- **MSP Enforcement** - Set minimum support prices to prevent exploitation
- **Emergency Broadcast** - Send critical alerts to all farmers
- **Market Freeze** - Pause all auctions during emergencies
- **Scheme Management** - Create and manage government subsidies
- **Application Approval** - Review and approve farmer applications

### 🏆 Public & Community
- **Panchayat Leaderboard** - Gamified rankings with Gold/Silver/Bronze badges
- **Live Market Ticker** - Real-time commodity price updates
- **Buy Local Map** - Find nearby farmers with excess stock

## 📁 Project Structure

```
morgen/
├── client/                      # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── farmer/         # Farmer-specific pages
│   │   │   ├── buyer/          # Buyer-specific pages
│   │   │   ├── admin/          # Admin pages
│   │   │   └── public/         # Public pages
│   │   ├── components/         # Reusable components
│   │   └── services/           # API services
│   └── ...
├── server/                      # Express + MongoDB backend
│   ├── models/                 # Database models
│   ├── routes/                 # API routes
│   ├── scripts/                # Utility scripts
│   └── ...
├── PROJECT_ARCHITECTURE.md     # Detailed architecture
├── IMPLEMENTATION_GUIDE.md     # Step-by-step implementation
├── FEATURES_SUMMARY.md         # Complete feature list
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/nohinsijo345-max/morgen.git
cd morgen
```

2. **Server Setup**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
```

3. **Client Setup**
```bash
cd ../client
npm install
cp .env.example .env
```

4. **Seed Test Data**
```bash
cd server
npm run seed
```

5. **Run the Application**

Terminal 1 (Server):
```bash
cd server
npm run dev
```

Terminal 2 (Client):
```bash
cd client
npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5050

### Test Credentials
- **Farmer ID**: `FAR-1001`
- **PIN**: `1234`

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.io** - Real-time communication
- **bcryptjs** - Password hashing

### APIs & Services (To be integrated)
- **Google Gemini 1.5** - AI plant diagnosis
- **Google Maps API** - Geolocation
- **Twilio** - SMS notifications
- **Firebase** - Real-time bidding

## 📊 Database Models

- **User** - Farmers, Buyers, Admins with reputation scoring
- **Crop** - Crop details with geospatial indexing
- **Auction** - Real-time bidding data
- **Rating** - Farmer ratings and reviews
- **Scheme** - Government subsidy programs
- **Alert** - Emergency broadcasts and notifications

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials

### Crops
- `POST /api/crops/add` - Add new crop
- `GET /api/crops/:farmerId` - Get farmer's crops

### Auctions
- `POST /api/auction/create` - Create auction
- `POST /api/auction/:id/bid` - Place bid
- `GET /api/auction/active` - Get active auctions

### AI Features
- `POST /api/ai/plant-doctor` - Diagnose plant disease
- `POST /api/ai/price-forecast` - Get price predictions
- `GET /api/ai/market-prices` - Get live market prices

### Leaderboard
- `GET /api/leaderboard/panchayat/:name` - Panchayat rankings
- `GET /api/leaderboard/district/:name` - District rankings
- `GET /api/leaderboard/state` - State-wide rankings

### Admin
- `POST /api/admin/msp/set` - Set minimum support price
- `POST /api/admin/alert/create` - Create emergency alert
- `POST /api/admin/market/freeze` - Freeze market
- `POST /api/admin/scheme/create` - Create scheme

## 🎨 UI Features

- **Glassmorphic Design** - Modern frosted glass effects
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Layout** - Mobile-first design
- **Dark Mode Ready** - Easy theme switching
- **Loading States** - Skeleton screens and spinners
- **Error Handling** - User-friendly error messages

## 📈 Current Status

- ✅ **Backend**: 70% complete
- ✅ **Frontend**: 40% complete
- 🔄 **Integration**: 30% complete
- 📝 **Testing**: 10% complete
- 📚 **Documentation**: 60% complete

**Overall Progress**: ~45%

## 🔐 Security Features

- bcrypt password hashing
- JWT token authentication (to be implemented)
- Input validation and sanitization
- CORS configuration
- Rate limiting (to be implemented)
- Environment variable protection

## 📝 Documentation

- [Project Architecture](PROJECT_ARCHITECTURE.md) - System design and structure
- [Implementation Guide](IMPLEMENTATION_GUIDE.md) - Step-by-step development guide
- [Features Summary](FEATURES_SUMMARY.md) - Complete feature checklist
- [Quick Start](QUICKSTART.md) - Fast setup guide
- [Changes Log](CHANGES.md) - Recent updates and fixes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Developer**: Nohin Sijo
- **GitHub**: [@nohinsijo345-max](https://github.com/nohinsijo345-max)

## 🙏 Acknowledgments

- Google Gemini AI for plant disease diagnosis
- OpenStreetMap for mapping data
- All open-source contributors

## 📞 Support

For support, email nohinsijo@example.com or open an issue on GitHub.

---

**Made with ❤️ for farmers**
