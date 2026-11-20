const { body, param, query } = require('express-validator');
const { ORDER_STATUSES, PAYMENT_METHODS, PHONE_REGEX, normalizePhone } = require('../utils/constants');

const phoneCheck = (chain) =>
  chain.custom((v) => PHONE_REGEX.test(normalizePhone(v))).withMessage('Enter a valid 10-digit mobile number');

exports.createOrderRules = [
  body('customerName').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  phoneCheck(body('phone')),
  body('tableNumber').trim().matches(/^[A-Za-z0-9-]{1,10}$/).withMessage('Table number is required (letters/numbers, max 10 characters)'),
  body('specialInstructions').optional({ nullable: true }).trim().isLength({ max: 300 }).withMessage('Instructions max 300 characters'),
  body('paymentMethod').optional().isIn(PAYMENT_METHODS).withMessage(`Payment method must be one of: ${PAYMENT_METHODS.join(', ')}`),
  body('items').isArray({ min: 1, max: 50 }).withMessage('Cart is empty. Add at least one item.'),
  body('items.*.menuItem').isMongoId().withMessage('Invalid menu item id in cart'),
  body('items.*.quantity').isInt({ min: 1, max: 20 }).withMessage('Quantity must be between 1 and 20').toInt(),
];

exports.trackOrderRules = [
  param('orderId').trim().isLength({ min: 6, max: 30 }).withMessage('Enter a valid order ID'),
  phoneCheck(query('phone')),
];

exports.orderIdParam = [param('id').isMongoId().withMessage('Invalid order id')];

exports.statusRules = [
  param('id').isMongoId().withMessage('Invalid order id'),
  body('status').isIn(ORDER_STATUSES).withMessage(`Status must be one of: ${ORDER_STATUSES.join(', ')}`),
];
