const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const UserMusic = require('../models/UserMusic');

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

// GET /api/music/tracks
router.get('/tracks', async (req, res) => {
  try {
    const tracks = await UserMusic.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ tracks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/music/tracks
router.post('/tracks', async (req, res) => {
  try {
    const { title, artist, url, category } = req.body;
    
    // Check premium limits
    // Note: Assuming we just let them add for now, or we can check the User's isPremium field
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    if (!user.isPremium) {
      const count = await UserMusic.countDocuments({ userId: req.user.id });
      if (count >= 3) {
        return res.status(403).json({ error: 'Free accounts are limited to 3 tracks' });
      }
    }

    const track = new UserMusic({
      userId: req.user.id,
      title,
      artist: artist || 'Unknown Artist',
      url,
      category: category || 'custom'
    });
    
    await track.save();
    res.json({ track });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/music/tracks/:id
router.delete('/tracks/:id', async (req, res) => {
  try {
    const track = await UserMusic.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!track) return res.status(404).json({ error: 'Track not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
