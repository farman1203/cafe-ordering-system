const jwt = require('jsonwebtoken');
const env = require('../config/env');
const Admin = require('../models/Admin');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Put this before any route that only the admin may use.
// Expects header:  Authorization: Bearer <token>
exports.protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new AppError('Not authorized. Please log in.', 401);

  // jwt.verify throws JsonWebTokenError / TokenExpiredError -> handled in errorMiddleware
  const decoded = jwt.verify(token, env.JWT_SECRET);
  const admin = await Admin.findById(decoded.id);
  if (!admin) throw new AppError('Admin account no longer exists.', 401);

  req.admin = admin;
  next();
});
