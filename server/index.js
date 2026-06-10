const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/healthcheck', (req, res) => {
  res.json({ status: 'ok', message: 'OmOm Fitness API is running' });
});

// Use routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/trainers', require('./routes/trainers'));
app.use('/api/music', require('./routes/music'));
// app.use('/api/fatsecret', require('./routes/fatsecret'));
app.use('/api/spotify', require('./routes/spotify'));
app.use('/api', require('./routes/api'));

// Serve static assets in production if the dist directory exists
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// Start server only if not running in a serverless environment (like Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel Serverless Functions
module.exports = app;
