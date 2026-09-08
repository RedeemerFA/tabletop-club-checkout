const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['available', 'checked_out'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);