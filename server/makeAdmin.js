const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./db');

connectDB().then(async () => {
    console.log('Connected to MongoDB');
    const User = require('./models/User');
    const result = await User.updateMany({}, { $set: { role: 'admin' } });
    console.log(`Updated ${result.modifiedCount} users to admin role.`);
    mongoose.disconnect();
}).catch(console.error);
