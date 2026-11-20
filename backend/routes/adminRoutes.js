const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { loginRules } = require('../validators/adminValidator');

// Brute-force protection: 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

/**
 * @openapi
 * /admin/login:
 *   post:
 *     tags: [Admin]
 *     summary: Admin login - returns a JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: admin@example.com }
 *               password: { type: string, example: your_password }
 *     responses:
 *       200:
 *         description: Logged in
 *         content:
 *           application/json:
 *             example: { success: true, message: Login successful, token: eyJhbGciOi..., admin: { id: 665f..., name: Cafe Admin, email: admin@example.com } }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { description: Invalid email or password }
 *       429: { description: Too many attempts }
 */
router.post('/login', loginLimiter, loginRules, validate, c.login);

/**
 * @openapi
 * /admin/profile:
 *   get:
 *     tags: [Admin]
 *     summary: Get the logged-in admin's profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Admin profile (never includes password) }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/profile', protect, c.getProfile);

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Dashboard statistics
 *     description: Totals, today's numbers, status breakdown, last 7 days and recent orders. Revenue counts Completed orders only.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Stats
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data: { totalOrders: 42, todayOrders: 6, pendingOrders: 2, completedOrders: 30, todayRevenue: 1850, totalSales: 24500, totalMenuItems: 24, statusBreakdown: { Pending: 2, Completed: 30 }, last7Days: [], recentOrders: [] }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get('/stats', protect, c.getStats);

module.exports = router;
