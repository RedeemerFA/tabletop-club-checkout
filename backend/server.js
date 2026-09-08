const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Enable CORS for frontend deployment origin or allow all for development
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));

// Environment Variables
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// Database Connection & Auto-Admin Seeding
if (!MONGO_URI) {
  console.error('CRITICAL ERROR: MONGO_URI is not defined in environment variables.');
} else {
  mongoose.connect(MONGO_URI)
    .then(async () => {
      console.log('MongoDB Atlas Connected Successfully');
      await ensureAdminExists();
    })
    .catch(err => console.error('MongoDB Atlas Connection Error:', err));
}

// Automatic Admin Seeding Function
async function ensureAdminExists() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';

    const existingAdmin = await User.findOne({ username: adminUsername });
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const newAdmin = new User({
        username: adminUsername,
        password: hashedPassword,
        role: 'admin'
      });

      await newAdmin.save();
      console.log(`[Auto-Init] Default admin account ready: "${adminUsername}"`);
    }
  } catch (err) {
    console.error('Error during auto-admin initialization:', err.message);
  }
}

// API Routes
app.use('/api/games', require('./routes/games'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/users', require('./routes/users'));

// Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Online', message: 'Tabletop Club API operational.' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});