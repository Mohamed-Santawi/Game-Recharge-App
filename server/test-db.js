require('dotenv').config();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');

    // Create a test user
    const User = require('./models/User');
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      balance: 100
    });

    return testUser.save();
  })
  .then((user) => {
    console.log('Test user created:', user);
    return mongoose.connection.close();
  })
  .then(() => {
    console.log('Database connection closed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });