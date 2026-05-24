const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const DailyStat = require('../models/DailyStat');
const Workout = require('../models/Workout');
const Activity = require('../models/Activity');
const HealthMetric = require('../models/HealthMetric');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'omom-super-secret-key';

// Middleware to verify token for protected routes
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

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// POST /api/register
router.post('/register', async (req, res) => {
  const { username, email, password, age, weight, height } = req.body;
  
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'Please provide username, email and password' });
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Prevent duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      age: age || 25,
      weight: weight || 70,
      height: height || 170
    });

    const token = jwt.sign({ id: user._id, email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// GET /api/user/me
router.get('/user/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: {
      id: user._id,
      username: user.username,
      email: user.email,
      age: user.age,
      weight: user.weight,
      height: user.height
    } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// PATCH /api/user/me - update user profile
router.patch('/user/me', authMiddleware, async (req, res) => {
  try {
    const { username, age, weight, height } = req.body;
    const updates = {};
    if (username !== undefined) updates.username = username;
    if (age !== undefined) updates.age = age;
    if (weight !== undefined) updates.weight = weight;
    if (height !== undefined) updates.height = height;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: {
      id: user._id,
      username: user.username,
      email: user.email,
      age: user.age,
      weight: user.weight,
      height: user.height
    } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});


// GET /api/user/:id
router.get('/user/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check authorization (users can only access their own profile)
    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching user' });
  }
});

// POST /api/workout
router.post('/workout', authMiddleware, async (req, res) => {
  const { workoutType, duration, caloriesBurned, date } = req.body;
  
  if (!workoutType || !duration || !caloriesBurned || !date) {
    return res.status(400).json({ error: 'Please provide workoutType, duration, caloriesBurned, and date' });
  }

  try {
    const workout = await Workout.create({
      userId: req.user.id,
      workoutType,
      duration,
      caloriesBurned,
      date
    });

    res.status(201).json({ workout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error saving workout' });
  }
});

// GET /api/stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const userId = req.user.id;

    // Fetch all stats for the given date and user
    const [dailyStat, workouts, activities, healthMetric] = await Promise.all([
      DailyStat.findOne({ userId, date }),
      Workout.find({ userId, date }),
      Activity.find({ userId, date }),
      HealthMetric.findOne({ userId, date })
    ]);

    // Also fetch historical data for charts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const historyStats = await DailyStat.find({ 
      userId, 
      date: { $gte: thirtyDaysAgo.toISOString().split('T')[0] } 
    }).sort({ date: 1 });

    const historyWorkouts = await Workout.find({
      userId,
      date: { $gte: thirtyDaysAgo.toISOString().split('T')[0] }
    }).sort({ date: 1 });

    res.json({
      date,
      dailyStat: dailyStat || null,
      workouts: workouts || [],
      activities: activities || [],
      healthMetric: healthMetric || null,
      history: {
        stats: historyStats,
        workouts: historyWorkouts
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

// POST /api/stats
router.post('/stats', authMiddleware, async (req, res) => {
  const { date, steps, calories, heartRate, sleepHours, water } = req.body;
  
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  try {
    // Upsert the daily stat record for the user and date
    const stat = await DailyStat.findOneAndUpdate(
      { userId: req.user.id, date },
      { 
        $set: { 
          ...(steps !== undefined && { steps }),
          ...(calories !== undefined && { calories }),
          ...(heartRate !== undefined && { heartRate }),
          ...(sleepHours !== undefined && { sleepHours }),
          ...(water !== undefined && { water })
        } 
      },
      { new: true, upsert: true }
    );

    res.json({ stat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error saving daily stats' });
  }
});

// FatSecret API credentials
const FATSECRET_CLIENT_ID = process.env.FATSECRET_CLIENT_ID || "64e762751e134d2193adae8b47740c7c";
const FATSECRET_CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET || "c09fe9f970f94835ba1a355241eecc77";
const FATSECRET_BASE_URL = 'https://platform.fatsecret.com/rest/server.api';

// OAuth 1.0 utilities
function generateNonce() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateTimestamp() {
  return Math.floor(Date.now() / 1000).toString();
}

function createSignatureBaseString(method, url, params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  return `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
}

function createSignature(signatureBaseString, consumerSecret) {
  return crypto
    .createHmac('sha1', consumerSecret + '&')
    .update(signatureBaseString)
    .digest('base64');
}

// POST /api/fatsecret
router.post('/fatsecret', async (req, res) => {
  try {
    const { method, ...params } = req.body;
    
    if (!method) {
      return res.status(400).json({ error: 'Method parameter is required' });
    }

    const oauthParams = {
      oauth_consumer_key: FATSECRET_CLIENT_ID,
      oauth_nonce: generateNonce(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: generateTimestamp(),
      oauth_version: '1.0'
    };

    const allParams = {
      ...oauthParams,
      method: method,
      format: 'json',
      ...params
    };

    const signatureBaseString = createSignatureBaseString('POST', FATSECRET_BASE_URL, allParams);
    const signature = createSignature(signatureBaseString, FATSECRET_CLIENT_SECRET);
    allParams.oauth_signature = signature;

    const formData = new URLSearchParams(allParams);
    const response = await fetch(FATSECRET_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('FatSecret API error:', error.message);
    res.status(500).json({ error: 'FatSecret API error', message: error.message });
  }
});

// POST /api/translate
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage = 'en' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    const isCyrillic = /[а-яёіїєґ]/i.test(text);
    
    if (!isCyrillic) {
      return res.json({
        originalText: text,
        translatedText: text,
        sourceLanguage: 'en',
        targetLanguage,
        provider: 'No translation needed'
      });
    }
    
    const translations = {
      'курятина': 'chicken',
      'паста': 'pasta',
      'салат': 'salad',
      'суп': 'soup',
      'десерт': 'dessert',
      'хліб': 'bread',
      'овочі': 'vegetables',
      'м\'ясо': 'meat',
      'риба': 'fish',
      'рис': 'rice',
      'картопля': 'potato',
      'помидор': 'tomato',
      'цибуля': 'onion',
      'часник': 'garlic',
      'морква': 'carrot',
      'огірок': 'cucumber',
      'капуста': 'cabbage',
      'перець': 'pepper',
      'сіль': 'salt',
      'цукор': 'sugar',
      'олія': 'oil',
      'молоко': 'milk',
      'сир': 'cheese',
      'яйця': 'eggs',
      'масло': 'butter'
    };
    
    const translatedText = translations[text.toLowerCase()] || text;
    
    return res.json({
      originalText: text,
      translatedText: translatedText,
      sourceLanguage: 'uk',
      targetLanguage,
      provider: 'Dictionary fallback'
    });
    
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({ error: 'Translation error', message: error.message });
  }
});

module.exports = router;
