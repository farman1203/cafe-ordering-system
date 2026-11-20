const { body } = require('express-validator');

exports.loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];
