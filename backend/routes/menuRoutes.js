const router = require('express').Router();
const c = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validationMiddleware');
const { idParam, createMenuRules, updateMenuRules } = require('../validators/menuValidator');

/**
 * @openapi
 * /menu:
 *   get:
 *     tags: [Menu]
 *     summary: Get all menu items (public)
 *     parameters:
 *       - { in: query, name: search, schema: { type: string }, description: Search by name }
 *       - { in: query, name: category, schema: { type: string }, description: Filter by category }
 *       - { in: query, name: sort, schema: { type: string, enum: [price_asc, price_desc, name, newest] } }
 *       - { in: query, name: available, schema: { type: boolean }, description: Only available items }
 *       - { in: query, name: bestseller, schema: { type: boolean } }
 *       - { in: query, name: foodType, schema: { type: string, enum: [Veg, Non-Veg] } }
 *     responses:
 *       200:
 *         description: List of menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: integer, example: 24 }
 *                 data: { type: array, items: { $ref: '#/components/schemas/MenuItem' } }
 *   post:
 *     tags: [Menu]
 *     summary: Create a menu item (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/MenuInput' } } }
 *     responses:
 *       201: { description: Created }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       409: { description: A menu item with this name already exists }
 */
router.get('/', c.getMenu);
router.post('/', protect, createMenuRules, validate, c.createMenuItem);

/**
 * @openapi
 * /menu/categories:
 *   get:
 *     tags: [Menu]
 *     summary: Get all categories with item counts (public)
 *     responses:
 *       200:
 *         description: Categories
 *         content:
 *           application/json:
 *             example: { success: true, data: [{ name: Coffee, count: 5 }, { name: Tea, count: 3 }] }
 */
router.get('/categories', c.getCategories); // must be BEFORE '/:id'

/**
 * @openapi
 * /menu/{id}:
 *   get:
 *     tags: [Menu]
 *     summary: Get one menu item (public)
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string }, description: MongoDB ObjectId }
 *     responses:
 *       200: { description: The menu item }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   put:
 *     tags: [Menu]
 *     summary: Update a menu item (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/MenuInput' } } }
 *     responses:
 *       200: { description: Updated }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *   delete:
 *     tags: [Menu]
 *     summary: Delete a menu item (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Deleted }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
router.get('/:id', idParam, validate, c.getMenuItem);
router.put('/:id', protect, idParam, updateMenuRules, validate, c.updateMenuItem);
router.delete('/:id', protect, idParam, validate, c.deleteMenuItem);

module.exports = router;
