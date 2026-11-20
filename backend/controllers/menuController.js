const Menu = require('../models/Menu');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { CATEGORIES, escapeRegex } = require('../utils/constants');

const SORTS = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name: { name: 1 },
  newest: { createdAt: -1 },
};
const ALLOWED_FIELDS = ['name', 'description', 'price', 'category', 'image', 'isAvailable', 'isBestseller', 'foodType'];
// Only copy known fields from req.body (stops people sending random fields)
const pick = (body) => Object.fromEntries(ALLOWED_FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));

// GET /api/menu?search=&category=&sort=&available=&bestseller=&foodType=
exports.getMenu = asyncHandler(async (req, res) => {
  const { search, category, sort, available, bestseller, foodType } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: escapeRegex(search.trim()), $options: 'i' };
  if (category && category !== 'All') filter.category = category;
  if (available === 'true') filter.isAvailable = true;
  if (bestseller === 'true') filter.isBestseller = true;
  if (foodType === 'Veg' || foodType === 'Non-Veg') filter.foodType = foodType;

  const items = await Menu.find(filter).sort(SORTS[sort] || { category: 1, name: 1 }).limit(300);
  res.json({ success: true, count: items.length, data: items });
});

// GET /api/menu/categories
exports.getCategories = asyncHandler(async (req, res) => {
  const counts = await Menu.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  const data = CATEGORIES.map((name) => ({ name, count: countMap[name] || 0 }));
  res.json({ success: true, data });
});

// GET /api/menu/:id
exports.getMenuItem = asyncHandler(async (req, res) => {
  const item = await Menu.findById(req.params.id);
  if (!item) throw new AppError('Menu item not found', 404);
  res.json({ success: true, data: item });
});

// POST /api/menu   (admin)
exports.createMenuItem = asyncHandler(async (req, res) => {
  const item = await Menu.create(pick(req.body));
  res.status(201).json({ success: true, message: 'Menu item created', data: item });
});

// PUT /api/menu/:id   (admin)
exports.updateMenuItem = asyncHandler(async (req, res) => {
  const item = await Menu.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!item) throw new AppError('Menu item not found', 404);
  res.json({ success: true, message: 'Menu item updated', data: item });
});

// DELETE /api/menu/:id   (admin)
exports.deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await Menu.findByIdAndDelete(req.params.id);
  if (!item) throw new AppError('Menu item not found', 404);
  res.json({ success: true, message: 'Menu item deleted', data: { _id: item._id } });
});
