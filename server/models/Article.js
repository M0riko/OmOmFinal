const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleUk: { type: String, required: true },
  excerpt: { type: String },
  excerptUk: { type: String },
  content: { type: String, required: true },
  contentUk: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: { type: String },
  authorNameUk: { type: String },
  categoryId: { type: String, required: true },
  tags: [{ type: String }],
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  readingTime: { type: Number, default: 5 },
  imageUrl: { type: String },
  imageAlt: { type: String },
  imageAltUk: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  publishedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  saves: { type: Number, default: 0 }
});

module.exports = mongoose.model('Article', articleSchema, 'articles');
