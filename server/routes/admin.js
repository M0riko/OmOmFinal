const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const TrainerBooking = require('../models/TrainerBooking');
const UserMusic = require('../models/UserMusic');

const JWT_SECRET = process.env.JWT_SECRET || 'omom-super-secret-key';

// Middleware to verify token and admin role
const adminMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'admin') return res.status(403).json({ error: 'Access denied: Admins only' });
    
    req.user = user;
    next();
  } catch (ex) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.use(adminMiddleware);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumCount = await User.countDocuments({ isPremium: true });
    
    let bookingsCount = 0;
    try { bookingsCount = await TrainerBooking.countDocuments(); } catch(e) {}
    
    let musicCount = 0;
    try { musicCount = await UserMusic.countDocuments(); } catch(e) {}

    res.json({
      stats: {
        totalUsers,
        premiumCount,
        bookingsCount,
        musicCount,
        income: premiumCount * 9.99, // mock calculation
        dbStatus: 'online'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/users/:id
router.patch('/users/:id', async (req, res) => {
  try {
    const { role, isPremium } = req.body;
    const updates = {};
    if (role !== undefined) updates.role = role;
    if (isPremium !== undefined) updates.isPremium = isPremium;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await TrainerBooking.find().sort({ date: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/bookings/:id
router.patch('/bookings/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await TrainerBooking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/bookings/:id
router.delete('/bookings/:id', async (req, res) => {
  try {
    const booking = await TrainerBooking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/music
router.get('/music', async (req, res) => {
  try {
    const tracks = await UserMusic.find().sort({ title: 1 });
    res.json({ tracks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/music/:id
router.delete('/music/:id', async (req, res) => {
  try {
    const track = await UserMusic.findByIdAndDelete(req.params.id);
    if (!track) return res.status(404).json({ error: 'Track not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ARTICLES ---

// GET /api/admin/articles/pending
router.get('/articles/pending', async (req, res) => {
  try {
    const Article = require('../models/Article');
    const articles = await Article.find({ status: 'pending' }).sort({ publishedAt: -1 });
    res.json({ articles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/articles/:id
router.patch('/articles/:id', async (req, res) => {
  try {
    const Article = require('../models/Article');
    const { status } = req.body;
    const article = await Article.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json({ article });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/articles/:id
router.delete('/articles/:id', async (req, res) => {
  try {
    const Article = require('../models/Article');
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
