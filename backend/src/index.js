const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const config = require('./config/config');

// Initialize express app
const app = express();

// Add HTTP request logging
const httpLogger = pinoHttp({
  logger,
  autoLogging: true,
});
app.use(httpLogger);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Error Handler (must be after all routes)
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    // Start the server
    app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`);
    });
  })
  .catch((error) => {
    logger.error(error, 'Failed to connect to MongoDB');
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(err, 'Unhandled Promise Rejection');
  process.exit(1);
}); 