const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  studentName: { type: String, required: true },
  studentId: { type: String, required: true },
  location: { type: String, required: true },
  timeSlot: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending_delivery', 'delivered', 'pending_return', 'completed'],
    default: 'pending_delivery'
  },
  assignedHelper: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveredAt: { type: Date },
  returnedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);