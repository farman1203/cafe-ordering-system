const mongoose = require('mongoose');
const { CATEGORIES, FOOD_TYPES } = require('../utils/constants');

const menuSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, minlength: 2, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    price: { type: Number, required: [true, 'Price is required'], min: [1, 'Price must be at least 1'], max: 100000 },
    category: { type: String, required: [true, 'Category is required'], enum: { values: CATEGORIES, message: '{VALUE} is not a valid category' } },
    image: { type: String, trim: true, default: '' },
    isAvailable: { type: Boolean, default: true },
    isBestseller: { type: Boolean, default: false },
    foodType: { type: String, enum: FOOD_TYPES, default: 'Veg' },
  },
  { timestamps: true }
);

// Same dish name cannot be added twice (case-insensitive)
menuSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });
menuSchema.index({ category: 1, price: 1 });
menuSchema.index({ isBestseller: 1 });

module.exports = mongoose.model('Menu', menuSchema);
