const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shop');
    console.log('MongoDB Connected');
  } catch (err) {
    console.error(`Error in DB Connection: ${err.message}`);
  }
};

module.exports = connectDB;

