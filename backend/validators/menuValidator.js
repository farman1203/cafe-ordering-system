const { body, param } = require('express-validator');
const { CATEGORIES, FOOD_TYPES } = require('../utils/constants');

exports.idParam = [param('id').isMongoId().withMessage('Invalid menu item id')];

// isCreate=true  -> name, price, category are required
// isCreate=false -> every field optional (partial update)
const rules = (isCreate) => {
  // On update every field is optional, so we start the chain with .optional()
  const field = (name) => (isCreate ? body(name) : body(name).optional());
  return [
    field('name').exists({ checkFalsy: true }).withMessage('Name is required').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
    body('description').optional({ nullable: true }).trim().isLength({ max: 300 }).withMessage('Description max 300 characters'),
    field('price').exists().withMessage('Price is required').isFloat({ min: 1, max: 100000 }).withMessage('Price must be a number between 1 and 100000').toFloat(),
    field('category').exists().withMessage('Category is required').isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
    body('image').optional({ checkFalsy: true }).trim().isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Image must be a valid http(s) URL'),
    body('isAvailable').optional().isBoolean().withMessage('isAvailable must be true or false').toBoolean(),
    body('isBestseller').optional().isBoolean().withMessage('isBestseller must be true or false').toBoolean(),
    body('foodType').optional().isIn(FOOD_TYPES).withMessage('foodType must be Veg or Non-Veg'),
  ];
};

exports.createMenuRules = rules(true);
exports.updateMenuRules = rules(false);
