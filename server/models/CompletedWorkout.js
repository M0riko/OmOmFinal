const mongoose = require('mongoose');

const completedWorkoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plannedWorkoutId: { type: String },
  name: { type: String, required: true },
  exercises: { type: mongoose.Schema.Types.Mixed, default: [] },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, required: true },
  totalVolume: { type: Number, default: 0 },
  personalRecords: { type: mongoose.Schema.Types.Mixed, default: [] },
  notes: { type: String },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

completedWorkoutSchema.index({ userId: 1, endTime: -1 });

module.exports = mongoose.model('CompletedWorkout', completedWorkoutSchema, 'completed_workouts');
