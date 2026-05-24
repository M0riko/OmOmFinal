const mongoose = require('mongoose');

const dailyStatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  steps: { type: Number, default: 0 },
  calories: { type: Number, default: 0 },
  heartRate: { type: Number, default: 0 },
  sleepHours: { type: Number, default: 0 },
  water: { type: Number, default: 0 },
  date: { type: String, required: true }
});

dailyStatSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyStat', dailyStatSchema, 'daily_stats');
