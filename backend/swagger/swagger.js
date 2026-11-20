const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const { CATEGORIES, ORDER_STATUSES, FOOD_TYPES, PAYMENT_METHODS } = require('../utils/constants');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Brew & Bites API',
      version: '1.0.0',
      description:
        'REST API for the Brew & Bites cafe ordering system.\n\n' +
        '**How to authorize:** call `POST /admin/login`, copy the `token`, click the **Authorize** button and paste it.',
    },
    // Relative URL: works on localhost AND on Render without hardcoding anything
    servers: [{ url: '/api', description: 'Current server' }],
    tags: [
      { name: 'Menu', description: 'Cafe menu items' },
      { name: 'Orders', description: 'Customer orders' },
      { name: 'Admin', description: 'Admin authentication & dashboard' },
      { name: 'System', description: 'Health check' },
    ],
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      schemas: {
        MenuItem: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665f1c2e8b3a4c0012ab34cd' },
            name: { type: 'string', example: 'Caramel Latte' },
            description: { type: 'string', example: 'Espresso with steamed milk and caramel.' },
            price: { type: 'number', example: 180 },
            category: { type: 'string', enum: CATEGORIES },
            image: { type: 'string', example: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085' },
            isAvailable: { type: 'boolean', example: true },
            isBestseller: { type: 'boolean', example: false },
            foodType: { type: 'string', enum: FOOD_TYPES },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        MenuInput: {
          type: 'object',
          required: ['name', 'price', 'category'],
          properties: {
            name: { type: 'string', example: 'Caramel Latte' },
            description: { type: 'string', example: 'Espresso with steamed milk and caramel.' },
            price: { type: 'number', example: 180 },
            category: { type: 'string', enum: CATEGORIES },
            image: { type: 'string', example: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085' },
            isAvailable: { type: 'boolean', default: true },
            isBestseller: { type: 'boolean', default: false },
            foodType: { type: 'string', enum: FOOD_TYPES, default: 'Veg' },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            menuItem: { type: 'string', example: '665f1c2e8b3a4c0012ab34cd' },
            name: { type: 'string', example: 'Caramel Latte' },
            price: { type: 'number', example: 180 },
            quantity: { type: 'integer', example: 2 },
            subtotal: { type: 'number', example: 360 },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            orderId: { type: 'string', example: 'BB-241120-7K2Q' },
            customerName: { type: 'string', example: 'Riya Shah' },
            phone: { type: 'string', example: '9876543210' },
            tableNumber: { type: 'string', example: 'T05' },
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            totalAmount: { type: 'number', example: 360 },
            paymentMethod: { type: 'string', enum: PAYMENT_METHODS },
            paymentStatus: { type: 'string', enum: ['Pending', 'Paid'] },
            orderStatus: { type: 'string', enum: ORDER_STATUSES },
            specialInstructions: { type: 'string', example: 'Less sugar please' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        OrderInput: {
          type: 'object',
          required: ['customerName', 'phone', 'tableNumber', 'items'],
          description: 'Do NOT send prices or totals - the server calculates them from the database.',
          properties: {
            customerName: { type: 'string', example: 'Riya Shah' },
            phone: { type: 'string', example: '9876543210' },
            tableNumber: { type: 'string', example: 'T05' },
            specialInstructions: { type: 'string', example: 'Less sugar please' },
            paymentMethod: { type: 'string', enum: PAYMENT_METHODS, default: 'Pay at Counter' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['menuItem', 'quantity'],
                properties: { menuItem: { type: 'string', example: '665f1c2e8b3a4c0012ab34cd' }, quantity: { type: 'integer', example: 2 } },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong' },
            errors: { type: 'array', items: { type: 'object', properties: { field: { type: 'string' }, message: { type: 'string' } } } },
          },
        },
      },
      responses: {
        Unauthorized: { description: 'Missing, invalid or expired token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example: { success: false, message: 'Not authorized. Please log in.' } } } },
        ValidationError: { description: 'Invalid request data', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example: { success: false, message: 'Name must be 2-80 characters', errors: [{ field: 'name', message: 'Name must be 2-80 characters' }] } } } },
        NotFound: { description: 'Record not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' }, example: { success: false, message: 'Menu item not found' } } } },
      },
    },
  },
  apis: [path.join(__dirname, '../routes/*.js'), path.join(__dirname, '../server.js')],
};

module.exports = swaggerJsdoc(options);
