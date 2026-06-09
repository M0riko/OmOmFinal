const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  amount: { type: Number, required: true }, // in liters
  time: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

waterLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('WaterLog', waterLogSchema, 'water_logs');
