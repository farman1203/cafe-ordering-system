const Menu = require('../models/Menu');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const generateOrderId = require('../utils/generateOrderId');
const { STATUS_TRANSITIONS, ORDER_STATUSES, normalizePhone, round2, escapeRegex } = require('../utils/constants');

// POST /api/orders   (public - no login)
// IMPORTANT: prices and total come from the DATABASE, never from the browser.
exports.createOrder = asyncHandler(async (req, res) => {
  const { customerName, specialInstructions = '', paymentMethod } = req.body;
  const phone = normalizePhone(req.body.phone);
  const tableNumber = String(req.body.tableNumber).trim().toUpperCase();

  // Merge the same item sent twice -> one line with summed quantity
  const qtyById = new Map();
  req.body.items.forEach((it) => {
    const id = String(it.menuItem);
    qtyById.set(id, (qtyById.get(id) || 0) + Number(it.quantity));
  });
  for (const qty of qtyById.values()) {
    if (qty > 20) throw new AppError('You can order at most 20 of one item', 400);
  }

  const menuDocs = await Menu.find({ _id: { $in: [...qtyById.keys()] } });
  if (menuDocs.length !== qtyById.size) {
    throw new AppError('Some items in your cart are no longer on the menu. Please refresh the menu.', 404);
  }
  const unavailable = menuDocs.filter((m) => !m.isAvailable);
  if (unavailable.length) {
    throw new AppError(`Currently unavailable: ${unavailable.map((m) => m.name).join(', ')}. Please remove from cart.`, 409);
  }

  const items = menuDocs.map((m) => {
    const quantity = qtyById.get(String(m._id));
    return { menuItem: m._id, name: m.name, price: m.price, quantity, subtotal: round2(m.price * quantity) };
  });
  const totalAmount = round2(items.reduce((sum, i) => sum + i.subtotal, 0));

  // Duplicate protection: same customer + table + total within 30s = same order (double tap / retry)
  const recent = await Order.findOne({
    phone, tableNumber, totalAmount, createdAt: { $gte: new Date(Date.now() - 30 * 1000) },
  });
  if (recent) {
    return res.status(200).json({ success: true, duplicate: true, message: 'Order already received', data: recent });
  }

  let order = null;
  for (let attempt = 0; attempt < 5 && !order; attempt++) {
    try {
      order = await Order.create({
        orderId: generateOrderId(), customerName, phone, tableNumber, items, totalAmount,
        specialInstructions, ...(paymentMethod && { paymentMethod }),
      });
    } catch (err) {
      // orderId collision is very rare; try a new id
      if (!(err.code === 11000 && err.keyPattern && err.keyPattern.orderId)) throw err;
    }
  }
  if (!order) throw new AppError('Could not generate an order ID. Please try again.', 500);

  res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
});

// GET /api/orders/track/:orderId?phone=9876543210   (public, needs BOTH id and phone)
exports.trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    orderId: req.params.orderId.trim().toUpperCase(),
    phone: normalizePhone(req.query.phone),
  });
  // Same message whether id or phone is wrong, so nobody can probe for valid ids
  if (!order) throw new AppError('No order found for this order ID and phone number', 404);
  res.json({ success: true, data: order });
});

// GET /api/orders?status=&search=&page=&limit=   (admin)
exports.getOrders = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);

  const filter = {};
  if (status && ORDER_STATUSES.includes(status)) filter.orderStatus = status;
  if (search) {
    const rx = { $regex: escapeRegex(search.trim()), $options: 'i' };
    filter.$or = [{ orderId: rx }, { phone: rx }, { customerName: rx }, { tableNumber: rx }];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, count: orders.length, total, page, data: orders });
});

// GET /api/orders/:id   (admin)
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  res.json({ success: true, data: order });
});

// PATCH /api/orders/:id/status   (admin)
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);

  const next = req.body.status;
  const allowed = STATUS_TRANSITIONS[order.orderStatus] || [];
  if (!allowed.includes(next)) {
    const hint = allowed.length ? `Allowed: ${allowed.join(', ')}` : 'This order is already final';
    throw new AppError(`Cannot change status from ${order.orderStatus} to ${next}. ${hint}.`, 400);
  }

  order.orderStatus = next;
  if (next === 'Completed') order.paymentStatus = 'Paid'; // paid at counter
  await order.save();
  res.json({ success: true, message: `Order marked as ${next}`, data: order });
});
