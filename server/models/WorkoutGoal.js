const mongoose = require('mongoose');

const workoutGoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  nameUk: { type: String },
  description: { type: String },
  descriptionUk: { type: String },
  targetValue: { type: Number, required: true },
  currentValue: { type: Number, default: 0 },
  unit: { type: String, required: true },
  exerciseId: { type: String },
  exerciseName: { type: String },
  targetDate: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedDate: { type: String },
  priority: { type: String, default: 'medium' }, // 'low' | 'medium' | 'high'
  createdAt: { type: Date, default: Date.now }
});

workoutGoalSchema.index({ userId: 1, targetDate: 1 });

module.exports = mongoose.model('WorkoutGoal', workoutGoalSchema, 'workout_goals');
