const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const TrainerBooking = require('../models/TrainerBooking');
const TrainerChat = require('../models/TrainerChat');

const JWT_SECRET = process.env.JWT_SECRET || 'omom-super-secret-key';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (ex) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.use(authMiddleware);

// GET /api/trainers/bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await TrainerBooking.find({ userId: req.user.id }).sort({ date: 1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trainers/bookings
router.post('/bookings', async (req, res) => {
  try {
    const { trainerId, trainerName, trainerSpecialty, trainerImage, date, timeSlot } = req.body;
    
    // Check for duplicate booking at the same time
    const existing = await TrainerBooking.findOne({
      trainerId,
      date,
      timeSlot,
      status: { $ne: 'cancelled' }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'This time slot is already booked.' });
    }

    const booking = new TrainerBooking({
      userId: req.user.id,
      trainerId,
      trainerName,
      trainerSpecialty,
      trainerImage,
      date,
      timeSlot,
      status: 'scheduled'
    });
    await booking.save();
    
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/trainers/bookings/:id
router.delete('/bookings/:id', async (req, res) => {
  try {
    const booking = await TrainerBooking.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/trainers/chats
router.get('/chats', async (req, res) => {
  try {
    const { trainerId } = req.query;
    if (!trainerId) return res.status(400).json({ error: 'trainerId is required' });

    const chats = await TrainerChat.find({ userId: req.user.id, trainerId }).sort({ timestamp: 1 });
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/trainers/chats
router.post('/chats', async (req, res) => {
  try {
    const { trainerId, message, sender } = req.body;
    
    const chat = new TrainerChat({
      userId: req.user.id,
      trainerId,
      message,
      sender: sender || 'user'
    });
    
    await chat.save();
    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
