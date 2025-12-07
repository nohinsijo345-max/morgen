const mongoose = require('mongoose');
const Update = require('../models/Update');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://admin:morgen123@cluster0.qmcd0d4.mongodb.net/morgenDB?retryWrites=true&w=majority&appName=Cluster0';

async function deleteAllMessages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all messages/updates
    const result = await Update.deleteMany({});
    
    console.log(`✅ Deleted ${result.deletedCount} messages from the database`);
    console.log('All previous messages have been removed.');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
deleteAllMessages();
