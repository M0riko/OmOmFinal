const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  heartRate: { type: Number, required: true },
  bloodPressure: { type: String, required: true },
  weight: { type: Number, required: true },
  sleep: { type: Number, required: true },
  date: { type: String, required: true }
});

module.exports = mongoose.model('HealthMetric', healthMetricSchema, 'health_metrics');
