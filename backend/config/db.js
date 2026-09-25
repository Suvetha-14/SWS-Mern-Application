const mongoose = require('mongoose');

const connectDB = async (uri) => {
  const mongoURI = uri || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/document_management';
  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
