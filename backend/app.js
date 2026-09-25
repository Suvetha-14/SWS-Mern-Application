const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const documentRoutes = require('./routes/documentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or swagger) or match allowed
      if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local dev & testing
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Interactive API Documentation (Swagger UI)
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Document Management & AI Assistant - API Documentation',
  })
);

// Machine-readable OpenAPI JSON specification
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Document Management & AI Assistant API',
    version: '1.0.0',
    aiFallbackMode: !process.env.GEMINI_API_KEY,
  });
});

// Mount Routes
app.use('/api/documents', documentRoutes);
app.use('/api/chat', chatRoutes);

// 404 Handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: `Endpoint '${req.originalUrl}' does not exist on this server. Refer to /api-docs for available routes.`,
    status: 404,
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
