const mongoose = require('mongoose');
const { ORDER_STATUSES, PAYMENT_METHODS } = require('../utils/constants');

// Snapshot of each ordered item: name/price are copied at order time,
// so later menu price changes never change old orders.
const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 20 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    phone: { type: String, required: true, match: [/^[6-9]\d{9}$/, 'Invalid phone number'], index: true },
    tableNumber: { type: String, required: true, trim: true, uppercase: true, maxlength: 10 },
    items: {
      type: [orderItemSchema],
      validate: { validator: (v) => v.length > 0, message: 'Order must contain at least one item' },
    },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: 'Pay at Counter' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: 'Pending', index: true },
    specialInstructions: { type: String, trim: true, maxlength: 300, default: '' },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
