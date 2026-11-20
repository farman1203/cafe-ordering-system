const env = require('../config/env');

// Unknown route -> 404
exports.notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// One place that turns every error into a clean JSON response.
// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Server error';
  let code = err.code && typeof err.code === 'string' ? err.code : undefined;

  if (err.name === 'CastError') { status = 400; message = `Invalid ${err.path}: ${err.value}`; }
  else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'value';
    message = `Duplicate ${field}. A record with this ${field} already exists.`;
  } else if (err.name === 'TokenExpiredError') { status = 401; message = 'Session expired. Please log in again.'; code = 'TOKEN_EXPIRED'; }
  else if (err.name === 'JsonWebTokenError') { status = 401; message = 'Invalid token. Please log in again.'; code = 'TOKEN_INVALID'; }
  else if (err.type === 'entity.parse.failed') { status = 400; message = 'Invalid JSON in request body'; }
  else if (err.type === 'entity.too.large') { status = 413; message = 'Request body too large'; }

  if (status >= 500) console.error('Server error:', err);

  // Never leak internal details for unexpected errors in production
  if (status >= 500 && env.isProduction && !err.isOperational) message = 'Something went wrong on the server';

  const body = { success: false, message };
  if (code) body.code = code;
  if (!env.isProduction && status >= 500) body.stack = err.stack;
  res.status(status).json(body);
};
