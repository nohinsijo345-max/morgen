# Morgen - Complete Project Architecture

## Overview
A comprehensive agricultural marketplace platform with AI integration, real-time bidding, and government oversight.

## Module Breakdown

### 1. Farmer Module (Producer)
- Smart PIN Authentication
- Harvest Countdown Dashboard
- AI Plant Doctor (Gemini 1.5)
- AI Price Forecaster
- Live Bidding Console

### 2. Buyer Module (Wholesaler/Retailer)
- Geo-Fenced Smart Search
- Real-Time Auction Room
- Auto-Bidder System
- Digital Ledger
- Farmer Rating System

### 3. Super Admin Module (Government)
- MSP Enforcement
- Emergency Broadcast System
- Digital Subsidy Manager
- Market Freeze Controls

### 4. Public & Community Module
- Panchayat Leaderboard
- Live Market Ticker
- Buy Local Map

## Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS
- Framer Motion
- React Router
- Firebase (Real-time bidding)
- Google Maps API
- Lucide Icons

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io (Real-time features)
- Google Gemini AI API
- Twilio (SMS OTP)
- Firebase Admin SDK

### APIs & Services
- Google Gemini 1.5 (AI Plant Doctor)
- Google Maps API (Geo-location)
- Twilio (SMS)
- Firebase Realtime Database (Bidding)

## Database Schema

### Users Collection
- Farmers
- Buyers
- Admins

### Crops Collection
- Crop details
- Harvest dates
- Pricing
- Status

### Bids Collection
- Real-time bidding data
- Auction history

### Schemes Collection
- Government subsidies
- Applications

### Ratings Collection
- Farmer ratings
- Buyer feedback

## File Structure
```
morgen/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── farmer/
│   │   │   ├── buyer/
│   │   │   ├── admin/
│   │   │   └── public/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   └── ...
├── server/
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   └── ...
└── ...
```
