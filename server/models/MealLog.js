const mongoose = require('mongoose');

const mealLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  type: { type: String, required: true }, // "meal" or "product"
  name: { type: String, required: true },
  time: { type: String },
  mealType: { type: String }, // "breakfast", "lunch", "dinner", "snack"
  foodId: { type: String },
  grams: { type: Number },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  fats: { type: Number, required: true },
  carbs: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

mealLogSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('MealLog', mealLogSchema, 'meal_logs');
