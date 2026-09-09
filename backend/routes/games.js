const router = require('express').Router();
const Game = require('../models/Game');
const auth = require('../middleware/auth'); // Import auth middleware

// Public: Anyone can view games
router.get('/', async (req, res) => {
  const games = await Game.find();
  res.json(games);
});

// Protected: Only logged-in Admin/Helpers can add games
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  const newGame = new Game(req.body);
  await newGame.save();
  res.status(201).json(newGame);
});

module.exports = router;