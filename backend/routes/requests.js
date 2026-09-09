const router = require('express').Router();
const Request = require('../models/Request');
const auth = require('../middleware/auth');

// Public: Students can request a checkout
router.post('/', async (req, res) => { /* ... */ });

// Protected: Only authenticated helpers/admins can access portal or change status
router.get('/', auth, async (req, res) => { /* ... */ });
router.patch('/:id/deliver', auth, async (req, res) => { /* ... */ });
router.patch('/:id/complete', auth, async (req, res) => { /* ... */ });

module.exports = router;