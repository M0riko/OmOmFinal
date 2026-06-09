const mongoose = require('mongoose');

const trainerBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainerId: { type: String, required: true },
  trainerName: { type: String, required: true },
  trainerSpecialty: { type: String, required: true },
  trainerImage: { type: String },
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  timeSlot: { type: String, required: true }, // '10:00', '14:00', etc.
  status: { type: String, default: 'scheduled' }, // 'scheduled', 'completed', 'cancelled'
  createdAt: { type: Date, default: Date.now }
});

trainerBookingSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model('TrainerBooking', trainerBookingSchema, 'trainer_bookings');
