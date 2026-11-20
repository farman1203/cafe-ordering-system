const CATEGORIES = ['Coffee', 'Tea', 'Cold Beverages', 'Burgers', 'Sandwiches', 'Pizza', 'Desserts', 'Snacks'];
const FOOD_TYPES = ['Veg', 'Non-Veg'];
const ORDER_STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
const PAYMENT_METHODS = ['Pay at Counter', 'Cash on Delivery'];

// Which status can move to which. Completed and Cancelled are final.
const STATUS_TRANSITIONS = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Preparing', 'Cancelled'],
  Preparing: ['Ready', 'Cancelled'],
  Ready: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

// Indian mobile number: 10 digits starting with 6-9
const PHONE_REGEX = /^[6-9]\d{9}$/;

// "+91 98765-43210" / "098765 43210" / "9876543210"  ->  "9876543210"
const normalizePhone = (value) => {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
};

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = {
  CATEGORIES, FOOD_TYPES, ORDER_STATUSES, PAYMENT_METHODS, STATUS_TRANSITIONS,
  PHONE_REGEX, normalizePhone, round2, escapeRegex,
};
