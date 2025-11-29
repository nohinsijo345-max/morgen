# Morgen Server

Backend API for the Morgen farming platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Add your MongoDB connection string to `.env`

4. Seed test user (optional):
```bash
npm run seed
```

This creates a test user:
- Farmer ID: `FAR-1001`
- PIN: `1234`

## Running

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Crops
- `POST /api/crops/add` - Add crop
- `GET /api/crops/:farmerId` - Get farmer's crops

### Dashboard
- `GET /api/dashboard/:type` - Get dashboard data

Available types: summary, weather, updates, leaderboard, doctor, countdown, profit, transport, forecast, bids
