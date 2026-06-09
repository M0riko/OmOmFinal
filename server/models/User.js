const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  gender: { type: String, default: 'male' },
  goal: { type: String, default: 'weight_maintenance' },
  activityLevel: { type: String, default: 'moderate' },
  targetWeight: { type: Number },
  workoutDaysPerWeek: { type: Number, default: 3 },
  workoutDuration: { type: Number, default: 45 },
  calculatedCalories: { type: Number, default: 2000 },
  onboardingCompleted: { type: Boolean, default: false },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  isPremium: { type: Boolean, default: false },
  settings: {
    language: { type: String, default: 'uk' },
    theme: { type: String, default: 'system' },
    units: {
      weight: { type: String, default: 'kg' },
      height: { type: String, default: 'cm' },
      temperature: { type: String, default: 'celsius' }
    }
  },
  createdAt: { type: Date, default: Date.now },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

module.exports = mongoose.model('User', userSchema, 'users');
