const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tabletop_club';

async function seedAdmin() {
  await mongoose.connect(MONGO_URI);
  
  const existingAdmin = await User.findOne({ username: 'admin' });
  if (existingAdmin) {
    console.log('Admin account already exists.');
    process.exit(0);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  const admin = new User({
    username: 'admin',
    password: hashedPassword,
    role: 'admin'
  });

  await admin.save();
  console.log('Admin account created! Username: admin | Password: admin123');
  process.exit(0);
}

seedAdmin();