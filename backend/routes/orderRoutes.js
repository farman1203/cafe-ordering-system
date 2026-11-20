const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { createOrderRules, trackOrderRules, orderIdParam, statusRules } = require('../validators/orderValidator');

const limiter = (max, message) =>
  rateLimit({ windowMs: 15 * 60 * 1000, max, standardHeaders: true, legacyHeaders: false, message: { success: false, message } });
// Limits are generous because many customers in one cafe share the same Wi-Fi IP
const createLimiter = limiter(60, 'Too many orders from this network. Please try again later.');
const trackLimiter = limiter(60, 'Too many tracking attempts. Please try again later.');

/**
 * @openapi
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Place a new order (public, no login)
 *     description: Total is calculated on the server from current database prices.
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/OrderInput' } } }
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Order placed successfully }
 *                 data: { $ref: '#/components/schemas/Order' }
 *       200: { description: Same order was just placed (duplicate submit) - existing order returned }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { description: A cart item no longer exists }
 *       409: { description: A cart item is unavailable }
 *       429: { description: Too many requests }
 *   get:
 *     tags: [Orders]
 *     summary: List all orders (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: status, schema: { type: string, enum: [Pending, Confirmed, Preparing, Ready, Completed, Cancelled] } }
 *       - { in: query, name: search, schema: { type: string }, description: "Order ID, phone, name or table" }
 *       - { in: query, name: page, schema: { type: integer, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, default: 100 } }
 *     responses:
 *       200: { description: Orders, newest first }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.post('/', createLimiter, createOrderRules, validate, c.createOrder);
router.get('/', protect, c.getOrders);

/**
 * @openapi
 * /orders/track/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: Track an order using order ID + phone number (public)
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string }, example: BB-241120-7K2Q }
 *       - { in: query, name: phone, required: true, schema: { type: string }, example: '9876543210' }
 *     responses:
 *       200: { description: The order }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { description: No order matches this ID and phone }
 */
router.get('/track/:orderId', trackLimiter, trackOrderRules, validate, c.trackOrder); // BEFORE '/:id'

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get one order by its database id (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: The order }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', protect, orderIdParam, validate, c.getOrderById);

/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status (admin)
 *     description: |
 *       Allowed transitions: Pending → Confirmed/Cancelled, Confirmed → Preparing/Cancelled,
 *       Preparing → Ready/Cancelled, Ready → Completed/Cancelled. Completed and Cancelled are final.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties: { status: { type: string, enum: [Pending, Confirmed, Preparing, Ready, Completed, Cancelled], example: Confirmed } }
 *     responses:
 *       200: { description: Status updated }
 *       400: { description: Invalid status or invalid transition }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.patch('/:id/status', protect, statusRules, validate, c.updateOrderStatus);

module.exports = router;
