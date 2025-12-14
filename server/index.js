const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app.vercel.app', 'https://*.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/auction', require('./routes/auction'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/updates', require('./routes/updates'));
app.use('/api/harvest', require('./routes/harvest'));
app.use('/api/price-forecast', require('./routes/priceForecast'));
app.use('/api/transport', require('./routes/transport'));
app.use('/api/driver', require('./routes/driver'));
app.use('/api/support', require('./routes/customerSupport'));
app.use('/api/ai-doctor', require('./routes/aiDoctor'));
app.use('/api', require('./routes/health'));

// Serve client in production if present
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(clientDist));
	app.get('*', (req, res) => {
		res.sendFile(path.join(clientDist, 'index.html'));
	});
}

// Connect to MongoDB then start server
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');
		app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
	})
	.catch((err) => {
		console.error('Failed to connect to MongoDB:', err.message);
		// Start server anyway so dashboard mock routes work without DB
		app.listen(PORT, () => console.log(`Server (no DB) listening on port ${PORT}`));
	});