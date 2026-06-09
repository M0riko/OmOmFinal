const mongoose = require('mongoose');

const customExerciseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  nameUk: { type: String, required: true },
  description: { type: String },
  descriptionUk: { type: String },
  videoUrl: { type: String },
  gifUrl: { type: String },
  imageUrl: { type: String },
  primaryMuscleGroup: { type: String, required: true },
  secondaryMuscleGroups: { type: [String], default: [] },
  equipment: { type: String, required: true },
  exerciseType: { type: String, required: true },
  difficulty: { type: String, required: true },
  instructions: { type: [String], default: [] },
  instructionsUk: { type: [String], default: [] },
  tips: { type: [String], default: [] },
  tipsUk: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  isCustom: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

customExerciseSchema.index({ userId: 1 });

module.exports = mongoose.model('CustomExercise', customExerciseSchema, 'custom_exercises');
