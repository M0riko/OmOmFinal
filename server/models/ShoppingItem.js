const mongoose = require('mongoose');

const shoppingItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String },
  amount: { type: Number },
  unit: { type: String },
  isBought: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  boughtAt: { type: Date }
});

module.exports = mongoose.model('ShoppingItem', shoppingItemSchema);
