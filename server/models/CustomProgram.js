const mongoose = require('mongoose');

const customProgramSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  nameUk: { type: String, required: true },
  description: { type: String },
  descriptionUk: { type: String },
  duration: { type: Number, default: 4 }, // weeks
  frequency: { type: Number, default: 3 }, // workouts per week
  difficulty: { type: String, default: 'beginner' },
  days: { type: mongoose.Schema.Types.Mixed, default: [] }, // WorkoutDay array
  isCustom: { type: Boolean, default: true },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

customProgramSchema.index({ userId: 1 });

module.exports = mongoose.model('CustomProgram', customProgramSchema, 'custom_programs');
