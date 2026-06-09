const mongoose = require('mongoose');

const personalRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exerciseId: { type: String, required: true },
  exerciseName: { type: String, required: true },
  recordType: { type: String, required: true }, // 'max_weight' | 'max_reps' | 'max_volume' | 'best_time'
  value: { type: Number, required: true },
  unit: { type: String, required: true },
  date: { type: String, required: true },
  workoutId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

personalRecordSchema.index({ userId: 1, exerciseId: 1, recordType: 1 });

module.exports = mongoose.model('PersonalRecord', personalRecordSchema, 'personal_records');
