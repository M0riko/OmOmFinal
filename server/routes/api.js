const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const User = require('../models/User');
const DailyStat = require('../models/DailyStat');
const Workout = require('../models/Workout');
const Activity = require('../models/Activity');
const HealthMetric = require('../models/HealthMetric');

// New Mongoose Models for stats and new features
const MealLog = require('../models/MealLog');
const WaterLog = require('../models/WaterLog');
const WeightLog = require('../models/WeightLog');
const PlannedWorkout = require('../models/PlannedWorkout');
const CompletedWorkout = require('../models/CompletedWorkout');
const PersonalRecord = require('../models/PersonalRecord');
const WorkoutGoal = require('../models/WorkoutGoal');
const CustomExercise = require('../models/CustomExercise');
const CustomProgram = require('../models/CustomProgram');
const TrainerBooking = require('../models/TrainerBooking');
const TrainerChat = require('../models/TrainerChat');
const UserMusic = require('../models/UserMusic');
const FridgeProduct = require('../models/FridgeProduct');
const ShoppingItem = require('../models/ShoppingItem');

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

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      age: age || 25,
      weight: weight || 70,
      height: height || 170,
      verificationToken,
      isEmailVerified: false
    });

    // Send verification email in the background
    sendVerificationEmail(user.email, verificationToken).catch(console.error);

    const token = jwt.sign({ id: user._id, email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        role: user.role,
        isPremium: user.isPremium,
        onboardingCompleted: user.onboardingCompleted,
        targetWeight: user.targetWeight,
        calculatedCalories: user.calculatedCalories
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
        height: user.height,
        role: user.role,
        isPremium: user.isPremium,
        isEmailVerified: user.isEmailVerified,
        onboardingCompleted: user.onboardingCompleted,
        targetWeight: user.targetWeight,
        calculatedCalories: user.calculatedCalories
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/auth/google
router.post('/auth/google', async (req, res) => {
  try {
    const { email, name, googleId } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      // Create a new user for Google login
      user = await User.create({
        username: name || email.split('@')[0],
        email,
        password: crypto.randomBytes(16).toString('hex'), // Random password since they use Google
        age: 25,
        weight: 70,
        height: 170,
        isEmailVerified: true, // Google emails are already verified
        onboardingCompleted: false
      });
      isNewUser = true;
    }

    const token = jwt.sign({ id: user._id, email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      isNewUser,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        role: user.role,
        isPremium: user.isPremium,
        isEmailVerified: user.isEmailVerified,
        onboardingCompleted: user.onboardingCompleted,
        targetWeight: user.targetWeight,
        calculatedCalories: user.calculatedCalories
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during Google auth' });
  }
});


// POST /api/auth/verify-email
router.post('/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'No token provided' });

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

// POST /api/auth/forgot-password
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during forgot password' });
  }
});

// POST /api/auth/reset-password
router.post('/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during reset password' });
  }
});

// PATCH /api/user/onboarding
router.patch('/user/onboarding', authMiddleware, async (req, res) => {
  try {
    const {
      username, age, weight, height, gender, goal, activityLevel,
      targetWeight, workoutDaysPerWeek, workoutDuration, calculatedCalories, settings
    } = req.body;

    const updates = {
      username: username || req.user.username,
      gender,
      goal,
      activityLevel,
      settings,
      onboardingCompleted: true
    };
    
    if (age) updates.age = Number(age) || undefined;
    if (weight) updates.weight = Number(weight) || undefined;
    if (height) updates.height = Number(height) || undefined;
    if (targetWeight) updates.targetWeight = Number(targetWeight) || undefined;
    if (workoutDaysPerWeek) updates.workoutDaysPerWeek = Number(workoutDaysPerWeek) || undefined;
    if (workoutDuration) updates.workoutDuration = Number(workoutDuration) || undefined;
    if (calculatedCalories) updates.calculatedCalories = Number(calculatedCalories) || undefined;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');

    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      height: user.height,
      role: user.role,
      isPremium: user.isPremium,
      onboardingCompleted: user.onboardingCompleted,
      targetWeight: user.targetWeight,
      calculatedCalories: user.calculatedCalories
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
      height: user.height,
      role: user.role,
      isPremium: user.isPremium,
      onboardingCompleted: user.onboardingCompleted,
      targetWeight: user.targetWeight,
      calculatedCalories: user.calculatedCalories
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

    // Fetch daily stat, workouts, activities, health metrics
    const [dailyStat, workouts, activities, healthMetric] = await Promise.all([
      DailyStat.findOne({ userId, date }),
      Workout.find({ userId, date }),
      Activity.find({ userId, date }),
      HealthMetric.findOne({ userId, date })
    ]);

    // Aggregate meal calories and water from the database for the given date
    const [meals, waterLogs] = await Promise.all([
      MealLog.find({ userId, date }),
      WaterLog.find({ userId, date })
    ]);

    const mealCalories = meals.reduce((acc, m) => acc + (m.calories || 0), 0);
    const waterTotal = waterLogs.reduce((acc, w) => acc + (w.amount || 0), 0);

    // Merge database meal calories and water into the returned dailyStat
    let finalDailyStatObj = null;
    if (dailyStat) {
      finalDailyStatObj = dailyStat.toObject();
      finalDailyStatObj.calories = mealCalories || dailyStat.calories || 0;
      finalDailyStatObj.water = waterTotal || dailyStat.water || 0;
    } else {
      finalDailyStatObj = {
        userId,
        date,
        steps: 0,
        calories: mealCalories,
        heartRate: 0,
        sleepHours: 0,
        water: waterTotal
      };
    }

    // Also fetch historical data for charts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];

    const [allMeals, allWater, allWeights, allDailyStats] = await Promise.all([
      MealLog.find({ userId, date: { $gte: startDateStr } }),
      WaterLog.find({ userId, date: { $gte: startDateStr } }),
      WeightLog.find({ userId, date: { $gte: startDateStr } }),
      DailyStat.find({ userId, date: { $gte: startDateStr } })
    ]);

    // Group historical stats by date
    const dateMap = {};
    for (let i = 30; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      dateMap[dateKey] = {
        date: dateKey,
        steps: 0,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        heartRate: 0,
        sleepHours: 0,
        water: 0,
        weight: 0
      };
    }

    allDailyStats.forEach(ds => {
      if (dateMap[ds.date]) {
        dateMap[ds.date].steps = ds.steps || 0;
        dateMap[ds.date].heartRate = ds.heartRate || 0;
        dateMap[ds.date].sleepHours = ds.sleepHours || 0;
      }
    });

    allMeals.forEach(m => {
      if (dateMap[m.date]) {
        dateMap[m.date].calories += m.calories || 0;
        dateMap[m.date].protein += m.protein || 0;
        dateMap[m.date].carbs += m.carbs || 0;
        dateMap[m.date].fat += m.fats || 0;
      }
    });

    allWater.forEach(w => {
      if (dateMap[w.date]) {
        dateMap[w.date].water += w.amount || 0;
      }
    });

    allWeights.forEach(w => {
      if (dateMap[w.date]) {
        dateMap[w.date].weight = w.weight;
      }
    });

    const historyStats = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

    // Completed workouts history
    const completedWorkouts = await CompletedWorkout.find({
      userId,
      startTime: { $gte: startDateStr }
    }).sort({ startTime: 1 });

    const historyWorkouts = completedWorkouts.map(w => ({
      _id: w._id,
      userId: w.userId,
      workoutType: w.name,
      duration: w.duration,
      caloriesBurned: w.duration * 5,
      calories: w.duration * 5,
      date: w.startTime.split('T')[0]
    }));

    res.json({
      date,
      dailyStat: finalDailyStatObj,
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

// --- ONBOARDING & PROGRAM AUTO-ASSIGNMENT ---
router.patch('/user/onboarding', authMiddleware, async (req, res) => {
  const {
    username, age, weight, height, gender, goal,
    activityLevel, targetWeight, workoutDaysPerWeek,
    workoutDuration, calculatedCalories, settings
  } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          username, age, weight, height, gender, goal,
          activityLevel, targetWeight, workoutDaysPerWeek,
          workoutDuration, calculatedCalories,
          onboardingCompleted: true,
          settings
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Clear existing planned workouts (if they restart onboarding)
    await PlannedWorkout.deleteMany({ userId: user._id, isCompleted: false });

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during onboarding setup' });
  }
});

// --- MEAL LOGS ROUTES ---
router.get('/meals', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { userId: req.user.id };
    if (date) filter.date = date;
    const meals = await MealLog.find(filter).sort({ createdAt: -1 });
    res.json({ meals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/meals', authMiddleware, async (req, res) => {
  try {
    const meal = await MealLog.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ meal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/meals/:id', authMiddleware, async (req, res) => {
  try {
    await MealLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- WATER LOGS ROUTES ---
router.get('/water', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { userId: req.user.id };
    if (date) filter.date = date;
    const waterLogs = await WaterLog.find(filter).sort({ time: 1 });
    res.json({ waterLogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/water', authMiddleware, async (req, res) => {
  try {
    const waterLog = await WaterLog.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ waterLog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/water/:id', authMiddleware, async (req, res) => {
  try {
    await WaterLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- FRIDGE ROUTES ---
router.get('/fridge', authMiddleware, async (req, res) => {
  try {
    const products = await FridgeProduct.find({ userId: req.user.id }).sort({ addedAt: -1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/fridge', authMiddleware, async (req, res) => {
  try {
    const product = await FridgeProduct.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/fridge/:id', authMiddleware, async (req, res) => {
  try {
    await FridgeProduct.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/fridge/:id', authMiddleware, async (req, res) => {
  try {
    const product = await FridgeProduct.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SHOPPING LIST ROUTES ---
router.get('/shopping', authMiddleware, async (req, res) => {
  try {
    const items = await ShoppingItem.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/shopping', authMiddleware, async (req, res) => {
  try {
    const item = await ShoppingItem.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/shopping/:id', authMiddleware, async (req, res) => {
  try {
    await ShoppingItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/shopping/:id', authMiddleware, async (req, res) => {
  try {
    const item = await ShoppingItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    res.json({ item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- WEIGHT LOGS ROUTES ---
router.get('/weight-logs', authMiddleware, async (req, res) => {
  try {
    const logs = await WeightLog.find({ userId: req.user.id }).sort({ date: -1, time: -1 });
    res.json({ weightLogs: logs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/weight-logs', authMiddleware, async (req, res) => {
  try {
    const weightLog = await WeightLog.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ weightLog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/weight-logs/:id', authMiddleware, async (req, res) => {
  try {
    await WeightLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PLANNED WORKOUTS ROUTES ---
router.get('/workouts/planned', authMiddleware, async (req, res) => {
  try {
    const planned = await PlannedWorkout.find({ userId: req.user.id }).sort({ scheduledDate: 1 });
    res.json({ planned });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/workouts/planned', authMiddleware, async (req, res) => {
  try {
    const planned = await PlannedWorkout.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ planned });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/workouts/planned/:id', authMiddleware, async (req, res) => {
  try {
    const planned = await PlannedWorkout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    res.json({ planned });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/workouts/planned/:id', authMiddleware, async (req, res) => {
  try {
    await PlannedWorkout.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- COMPLETED WORKOUTS ROUTES ---
router.get('/workouts/completed', authMiddleware, async (req, res) => {
  try {
    const completed = await CompletedWorkout.find({ userId: req.user.id }).sort({ endTime: -1 });
    res.json({ completed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/workouts/completed', authMiddleware, async (req, res) => {
  try {
    const completed = await CompletedWorkout.create({
      userId: req.user.id,
      ...req.body
    });

    // Save basic Workout model for compatibility
    await Workout.create({
      userId: req.user.id,
      workoutType: completed.name,
      duration: completed.duration,
      caloriesBurned: completed.duration * 5,
      date: completed.startTime.split('T')[0]
    });

    res.status(201).json({ completed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/workouts/completed/:id', authMiddleware, async (req, res) => {
  try {
    const completed = await CompletedWorkout.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (completed) {
      await Workout.findOneAndDelete({
        userId: req.user.id,
        workoutType: completed.name,
        date: completed.startTime.split('T')[0]
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- PERSONAL RECORDS ROUTES ---
router.get('/workouts/records', authMiddleware, async (req, res) => {
  try {
    const records = await PersonalRecord.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({ records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/workouts/records', authMiddleware, async (req, res) => {
  try {
    const record = await PersonalRecord.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- WORKOUT GOALS ROUTES ---
router.get('/workouts/goals', authMiddleware, async (req, res) => {
  try {
    const goals = await WorkoutGoal.find({ userId: req.user.id }).sort({ targetDate: 1 });
    res.json({ goals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/workouts/goals', authMiddleware, async (req, res) => {
  try {
    const goal = await WorkoutGoal.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ goal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/workouts/goals/:id', authMiddleware, async (req, res) => {
  try {
    const goal = await WorkoutGoal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );
    res.json({ goal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/workouts/goals/:id', authMiddleware, async (req, res) => {
  try {
    await WorkoutGoal.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CUSTOM EXERCISES ROUTES ---
router.get('/workouts/exercises', authMiddleware, async (req, res) => {
  try {
    const exercises = await CustomExercise.find({ userId: req.user.id }).sort({ nameUk: 1 });
    res.json({ exercises });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/workouts/exercises', authMiddleware, async (req, res) => {
  try {
    const exercise = await CustomExercise.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ exercise });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/workouts/exercises/:id', authMiddleware, async (req, res) => {
  try {
    await CustomExercise.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CUSTOM PROGRAMS ROUTES ---
router.get('/workouts/programs', authMiddleware, async (req, res) => {
  try {
    const programs = await CustomProgram.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ programs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/workouts/programs', authMiddleware, async (req, res) => {
  try {
    const program = await CustomProgram.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ program });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/workouts/programs/:id', authMiddleware, async (req, res) => {
  try {
    await CustomProgram.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- TRAINER BOOKINGS ROUTES ---
router.get('/trainers/bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await TrainerBooking.find({ userId: req.user.id }).sort({ date: 1, timeSlot: 1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/trainers/bookings', authMiddleware, async (req, res) => {
  try {
    const booking = await TrainerBooking.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/trainers/bookings/:id', authMiddleware, async (req, res) => {
  try {
    await TrainerBooking.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- TRAINER CHATS ROUTES ---
router.get('/trainers/chats', authMiddleware, async (req, res) => {
  try {
    const { trainerId } = req.query;
    if (!trainerId) return res.status(400).json({ error: 'trainerId is required' });
    const chats = await TrainerChat.find({ userId: req.user.id, trainerId }).sort({ timestamp: 1 });
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/trainers/chats', authMiddleware, async (req, res) => {
  try {
    const { trainerId, message, sender } = req.body;
    if (!trainerId || !message || !sender) {
      return res.status(400).json({ error: 'trainerId, message, and sender are required' });
    }

    const chat = await TrainerChat.create({
      userId: req.user.id,
      trainerId,
      sender,
      message,
      timestamp: new Date()
    });

    // Auto-respond if message is from the user
    if (sender === 'user') {
      // Trainer Personas & Responses
      const responses = {
        alex: [
          "Привіт! Для набору маси раджу фокусуватися на базових вправах і профіциті калорій. Готовий обговорити деталі на нашому тренуванні!",
          "Чудове питання! Головне в тренуваннях — регулярність та прогресія навантажень. Продовжуй у тому ж дусі!",
          "Я переглянув твої показники. Давай додамо трохи більше ваги на наступному занятті."
        ],
        elena: [
          "Вітаю! Звісно, на першому занятті ми сфокусуємось на диханні та м'якому розігріві. Не хвилюйтесь, все пройде чудово!",
          "Пам'ятайте про розтяжку після кожного тренування. Це покращує відновлення м'язів та гнучкість.",
          "Прекрасна робота сьогодні! Гнучкість приходить з часом, продовжуйте дихати глибоко."
        ],
        dmitry: [
          "Привіт! Чудово, що ти хочеш покращити витривалість. Давай розберемо твій пульс і складемо план бігу. Готовий почати?",
          "Для схуднення важливо підтримувати дефіцит калорій та тримати пульс у жироспалювальній зоні (120-140 уд/хв).",
          "Пам'ятай пити достатньо води під час кардіо-сесій!"
        ]
      };

      const trainerKey = trainerId.toLowerCase();
      const trainerAnswers = responses[trainerKey] || [
        "Привіт! Я отримав твоє повідомлення. Давай обговоримо деталі на нашому тренуванні!",
        "Чудовий прогрес! Продовжуй виконувати програму."
      ];

      // Select random answer
      const replyMessage = trainerAnswers[Math.floor(Math.random() * trainerAnswers.length)];

      // Save trainer answer (simulating live chat response)
      setTimeout(async () => {
        try {
          await TrainerChat.create({
            userId: chat.userId,
            trainerId,
            sender: 'trainer',
            message: replyMessage,
            timestamp: new Date()
          });
        } catch (e) {
          console.error('Failed to create trainer auto response:', e);
        }
      }, 1500);
    }

    res.status(201).json({ chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- USER MUSIC TRACKS ROUTES ---
router.get('/music/tracks', authMiddleware, async (req, res) => {
  try {
    const tracks = await UserMusic.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ tracks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/music/tracks', authMiddleware, async (req, res) => {
  try {
    const track = await UserMusic.create({
      userId: req.user.id,
      ...req.body
    });
    res.status(201).json({ track });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/music/tracks/:id', authMiddleware, async (req, res) => {
  try {
    await UserMusic.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// --- PREMIUM STATUS ACTIVATION ---
router.post('/user/premium/activate', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { isPremium: true } },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        role: user.role,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/user/premium/activate
router.post('/user/premium/activate', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { isPremium: true } },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        role: user.role,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- DEV TESTING ROLE TOGGLE ---
router.post('/user/dev/toggle-role', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Toggle role and premium
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const newPremium = !user.isPremium;
    
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { role: newRole, isPremium: newPremium } },
      { new: true }
    ).select('-password');

    res.json({
      user: {
        id: updated._id,
        username: updated.username,
        email: updated.email,
        age: updated.age,
        weight: updated.weight,
        height: updated.height,
        role: updated.role,
        isPremium: updated.isPremium
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ADMIN PORTAL API ---
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error verifying admin status' });
  }
};

// GET /api/admin/stats
router.get('/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [totalUsers, premiumCount, bookingsCount, musicCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isPremium: true }),
      TrainerBooking.countDocuments(),
      UserMusic.countDocuments()
    ]);
    
    const dbConnected = mongoose.connection.readyState === 1;

    res.json({
      stats: {
        totalUsers,
        premiumCount,
        bookingsCount,
        musicCount,
        income: (premiumCount * 49.99) + (bookingsCount * 25), // Mock revenue
        dbStatus: dbConnected ? 'online' : 'offline'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users
router.get('/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/users/:id
router.patch('/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role, isPremium } = req.body;
    const updates = {};
    if (role !== undefined) updates.role = role;
    if (isPremium !== undefined) updates.isPremium = isPremium;

    const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true }).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/admin/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/bookings
router.get('/api/admin/bookings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const bookings = await TrainerBooking.find().sort({ date: 1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/admin/bookings/:id
router.patch('/api/admin/bookings/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await TrainerBooking.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
    res.json({ booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/bookings/:id
router.delete('/api/admin/bookings/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await TrainerBooking.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/music
router.get('/api/admin/music', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tracks = await UserMusic.find().sort({ createdAt: -1 });
    res.json({ tracks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/music/:id
router.delete('/api/admin/music/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await UserMusic.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ARTICLES ---

// POST /api/articles (Submit for review)
router.post('/articles', authMiddleware, async (req, res) => {
  try {
    const Article = require('../models/Article');
    const User = require('../models/User'); // ensure it's loaded
    const { title, titleUk, excerpt, excerptUk, content, contentUk, categoryId, tags, difficulty, readingTime, imageUrl, imageAlt, imageAltUk } = req.body;
    
    // get user details
    const user = await User.findById(req.user.id);
    const authorNameStr = user ? user.username : 'User';

    const article = new Article({
      title, titleUk, excerpt, excerptUk, content, contentUk, categoryId, tags, difficulty, readingTime, imageUrl, imageAlt, imageAltUk,
      authorId: req.user.id,
      authorName: authorNameStr,
      authorNameUk: authorNameStr, // Using username as fallback
      status: 'pending'
    });

    await article.save();
    res.status(201).json({ success: true, article });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/articles (Get approved articles)
router.get('/articles', async (req, res) => {
  try {
    const Article = require('../models/Article');
    const articles = await Article.find({ status: 'approved' }).sort({ publishedAt: -1 });
    res.json({ articles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/articles/:id (Delete user's own article)
router.delete('/articles/:id', authMiddleware, async (req, res) => {
  try {
    const Article = require('../models/Article');
    const article = await Article.findById(req.params.id);
    
    if (!article) return res.status(404).json({ error: 'Article not found' });
    
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    
    // Allow deletion if user is admin OR if user is the author
    if (user.role !== 'admin' && article.authorId?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this article' });
    }
    
    await Article.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
