# Morgen - Farming Platform

A full-stack farming management platform with farmer dashboard, authentication, and crop management.

## Project Structure

```
morgen/
├── client/          # React + Vite frontend
├── server/          # Express + MongoDB backend
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd morgen
```

### 2. Server Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your MongoDB connection string:

```
MONGO_URI=your_mongodb_connection_string
PORT=5050
```

### 3. Client Setup

```bash
cd ../client
npm install
```

Create a `.env` file in the `client` directory:

```bash
cp .env.example .env
```

The default configuration should work:

```
VITE_API_URL=http://localhost:5050
```

## Running the Application

### Start the Server (Terminal 1)

```bash
cd server
npm run dev
```

Server will run on `http://localhost:5050`

### Start the Client (Terminal 2)

```bash
cd client
npm run dev
```

Client will run on `http://localhost:5173`

## Features

- **Authentication**: Secure login with Farmer ID and PIN
- **Dashboard**: Real-time farming data including:
  - Weather alerts
  - Harvest countdown
  - Profit calculator
  - Transport options
  - Price forecasting
  - Bidding system
  - Leaderboard
  - AI crop doctor

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with farmerId and PIN

### Crops
- `POST /api/crops/add` - Add new crop
- `GET /api/crops/:farmerId` - Get crops for a farmer

### Dashboard
- `GET /api/dashboard/:type` - Get dashboard data (summary, weather, etc.)

## Tech Stack

### Frontend
- React 18
- Vite
- TailwindCSS
- Framer Motion
- Lucide React (icons)
- Axios
- React Router

### Backend
- Node.js
- Express
- MongoDB + Mongoose
- CORS
- dotenv

## Default Test User

For testing, you can register a user or use the login system with:
- Farmer ID: `FAR-1001`
- PIN: `1234`

(You'll need to register this user first via the API or database)

## Development Notes

- The server includes mock data for dashboard endpoints
- MongoDB connection is optional for basic dashboard functionality
- All sensitive data should be in `.env` files (not committed to git)

## Security

⚠️ **Important**: Never commit `.env` files to version control. They contain sensitive credentials.

## License

MIT
