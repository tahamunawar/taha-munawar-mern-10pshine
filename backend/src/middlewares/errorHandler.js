const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({
    err,
    req: {
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query
    }
  }, 'Error occurred');

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler; 