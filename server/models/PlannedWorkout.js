const mongoose = require('mongoose');

const plannedWorkoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  programId: { type: String },
  dayId: { type: String },
  exercises: { type: mongoose.Schema.Types.Mixed, default: [] },
  scheduledDate: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedDate: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

plannedWorkoutSchema.index({ userId: 1, scheduledDate: 1 });

module.exports = mongoose.model('PlannedWorkout', plannedWorkoutSchema, 'planned_workouts');
