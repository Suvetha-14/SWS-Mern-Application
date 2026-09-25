require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start HTTP server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🚀 Server running on: http://localhost:${PORT}`);
      console.log(`📑 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`📡 OpenAPI Spec: http://localhost:${PORT}/api-docs.json`);
      console.log(`💡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`===================================================`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
