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
app.use('/api', require('./routes/api'));

// Serve static assets in production if the dist directory exists
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
