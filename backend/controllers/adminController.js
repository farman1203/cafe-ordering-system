const jwt = require('jsonwebtoken');
const env = require('../config/env');
const Admin = require('../models/Admin');
const Menu = require('../models/Menu');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { ORDER_STATUSES } = require('../utils/constants');

const signToken = (id) => jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

// POST /api/admin/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // password has select:false, so we ask for it explicitly here
  const admin = await Admin.findOne({ email }).select('+password');
  const ok = admin && (await admin.comparePassword(password));
  if (!ok) throw new AppError('Invalid email or password', 401); // same message for both cases

  res.json({
    success: true,
    message: 'Login successful',
    token: signToken(admin._id),
    admin: { id: admin._id, name: admin.name, email: admin.email },
  });
});

// GET /api/admin/profile
exports.getProfile = asyncHandler(async (req, res) => {
  const { _id, name, email } = req.admin;
  res.json({ success: true, data: { id: _id, name, email } });
});

// "YYYY-MM-DD" for a date in the cafe's timezone
const dayKey = (date) => date.toLocaleDateString('en-CA', { timeZone: env.TIMEZONE });

// GET /api/admin/stats
// Revenue/sales = orders with status Completed (paid at counter).
exports.getStats = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 9 * 24 * 60 * 60 * 1000);

  const [totalOrders, pendingOrders, completedOrders, totalMenuItems, salesAgg, statusAgg, dailyAgg, recentOrders] =
    await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'Pending' }),
      Order.countDocuments({ orderStatus: 'Completed' }),
      Menu.countDocuments(),
      Order.aggregate([{ $match: { orderStatus: 'Completed' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: env.TIMEZONE } },
            orders: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $eq: ['$orderStatus', 'Completed'] }, '$totalAmount', 0] } },
          },
        },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(6),
    ]);

  const dailyMap = Object.fromEntries(dailyAgg.map((d) => [d._id, d]));
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const key = dayKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    const d = dailyMap[key] || { orders: 0, revenue: 0 };
    last7Days.push({ date: key, orders: d.orders, revenue: d.revenue });
  }
  const today = last7Days[last7Days.length - 1];

  const statusBreakdown = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
  statusAgg.forEach((s) => { statusBreakdown[s._id] = s.count; });

  res.json({
    success: true,
    data: {
      totalOrders,
      todayOrders: today.orders,
      pendingOrders,
      completedOrders,
      todayRevenue: today.revenue,
      totalSales: salesAgg[0] ? salesAgg[0].total : 0,
      totalMenuItems,
      statusBreakdown,
      last7Days,
      recentOrders,
    },
  });
});
