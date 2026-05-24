const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: { type: String, required: true },
  distance: { type: Number, required: true },
  time: { type: Number, required: true },
  calories: { type: Number, required: true },
  date: { type: String, required: true }
});

module.exports = mongoose.model('Activity', activitySchema, 'activities');
