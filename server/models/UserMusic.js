const mongoose = require('mongoose');

const userMusicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  artist: { type: String, required: true },
  url: { type: String, required: true },
  category: { type: String, default: 'Lifting' }, // 'Lifting', 'Running', 'Yoga', 'Stretching', 'General'
  createdAt: { type: Date, default: Date.now }
});

userMusicSchema.index({ userId: 1 });

module.exports = mongoose.model('UserMusic', userMusicSchema, 'user_musics');
