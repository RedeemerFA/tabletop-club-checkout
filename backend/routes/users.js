const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. LOGIN ENDPOINT (MongoDB Atlas Verification)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verify user exists in Atlas database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Compare hash with submitted password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Sign JWT using secret key from environment
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key';
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET ALL HELPERS (For Admin Dashboard)
router.get('/helpers', async (req, res) => {
  try {
    const helpers = await User.find({ role: 'helper' }).select('-password');
    res.json(helpers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. CREATE HELPER ACCOUNT (Hashes password and saves to Atlas)
router.post('/helper', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const helper = new User({
      username,
      password: hashedPassword,
      role: 'helper'
    });

    await helper.save();
    res.status(201).json({ message: 'Helper account created', id: helper._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. DELETE HELPER ACCOUNT
router.delete('/helper/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Helper account deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;