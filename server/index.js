const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-app.vercel.app', 'https://*.vercel.app'] 
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  }
});

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
app.use('/api/modules', require('./routes/modules'));
app.use('/api/ai-doctor', require('./routes/aiDoctor'));
app.use('/api/buyer-notifications', require('./routes/buyerNotifications'));

// Test route to verify server is working
app.get('/api/test-connections', (req, res) => {
  res.json({ message: 'Connections route test working', timestamp: new Date() });
});

// Load connections route
try {
  const connectionsRoute = require('./routes/connections');
  app.use('/api/connections', connectionsRoute);
  console.log('✅ Connections route loaded successfully');
} catch (error) {
  console.error('❌ Failed to load connections route:', error.message);
}

app.use('/api', require('./routes/health'));

// Serve client in production if present
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (process.env.NODE_ENV === 'production') {
	app.use(express.static(clientDist));
	app.get('*', (req, res) => {
		res.sendFile(path.join(clientDist, 'index.html'));
	});
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  
  // Join room for specific ticket
  socket.on('join-ticket', (ticketId) => {
    socket.join(`ticket-${ticketId}`);
    console.log(`👥 User ${socket.id} joined ticket room: ${ticketId}`);
  });
  
  // Leave room for specific ticket
  socket.on('leave-ticket', (ticketId) => {
    socket.leave(`ticket-${ticketId}`);
    console.log(`👋 User ${socket.id} left ticket room: ${ticketId}`);
  });
  
  // Join farmer room for notifications
  socket.on('join-farmer', (farmerId) => {
    socket.join(`farmer-${farmerId}`);
    console.log(`🌾 Farmer ${farmerId} connected: ${socket.id}`);
  });
  
  // Join buyer room for notifications
  socket.on('join-buyer', (buyerId) => {
    socket.join(`buyer-${buyerId}`);
    console.log(`🛒 Buyer ${buyerId} connected: ${socket.id}`);
  });
  
  // Join admin room for notifications
  socket.on('join-admin', () => {
    socket.join('admin');
    console.log(`👨‍💼 Admin connected: ${socket.id}`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Connect to MongoDB then start server
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');
		server.listen(PORT, () => console.log(`Server with Socket.IO listening on port ${PORT}`));
	})
	.catch((err) => {
		console.error('Failed to connect to MongoDB:', err.message);
		// Start server anyway so dashboard mock routes work without DB
		server.listen(PORT, () => console.log(`Server (no DB) with Socket.IO listening on port ${PORT}`));
	});