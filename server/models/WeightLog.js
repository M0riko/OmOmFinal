const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  weight: { type: Number, required: true }, // in kg
  time: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

weightLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WeightLog', weightLogSchema, 'weight_logs');
