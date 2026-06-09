const mongoose = require('mongoose');

const fridgeProductSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  expiryDate: { type: Date },
  addedAt: { type: Date, default: Date.now },
  barcode: { type: String },
  imageUrl: { type: String }
});

module.exports = mongoose.model('FridgeProduct', fridgeProductSchema);
