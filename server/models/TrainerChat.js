const mongoose = require('mongoose');

const trainerChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainerId: { type: String, required: true },
  sender: { type: String, required: true }, // 'user' or 'trainer'
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

trainerChatSchema.index({ userId: 1, trainerId: 1, timestamp: 1 });

module.exports = mongoose.model('TrainerChat', trainerChatSchema, 'trainer_chats');
