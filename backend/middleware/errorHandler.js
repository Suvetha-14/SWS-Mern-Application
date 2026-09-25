const multer = require('multer');

/**
 * Global API error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode || 500;
  if (statusCode === 200) statusCode = 500;

  let message = err.message || 'An unexpected internal server error occurred.';

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      const maxMb = process.env.MAX_FILE_SIZE_MB || 10;
      message = `Uploaded file exceeds the maximum allowed size limit of ${maxMb}MB.`;
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field '${err.path}': '${err.value}'`;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = `Validation failed: ${errors.join(', ')}`;
  }

  // Handle Malformed JSON request bodies
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body.';
  }

  if (process.env.NODE_ENV !== 'test' && statusCode >= 500) {
    console.error('[ServerError]', err);
  }

  res.status(statusCode).json({
    error: message,
    status: statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
