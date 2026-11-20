// Usage:
//   npm run seed              -> creates the admin (from .env) + sample menu (only if menu is empty)
//   npm run seed:reset        -> same, but wipes and re-creates the menu
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('./config/env');
const Admin = require('./models/Admin');
const Menu = require('./models/Menu');
const menuSeed = require('./data/menuSeed');

(async () => {
  try {
    const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    const ADMIN_NAME = process.env.ADMIN_NAME || 'Cafe Admin';
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD === 'change_this_password' || ADMIN_PASSWORD.length < 8) {
      console.error('Set ADMIN_EMAIL and a real ADMIN_PASSWORD (min 8 chars, not the placeholder) in backend/.env first.');
      process.exit(1);
    }

    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Admin: create, or reset the password if the email already exists
    let admin = await Admin.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (admin) {
      admin.name = ADMIN_NAME;
      admin.password = ADMIN_PASSWORD; // re-hashed by the pre-save hook
      await admin.save();
      console.log(`Admin updated: ${admin.email}`);
    } else {
      admin = await Admin.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
      console.log(`Admin created: ${admin.email}`);
    }

    // Menu
    await Menu.init(); // make sure unique index exists
    if (process.argv.includes('--reset-menu')) {
      await Menu.deleteMany({});
      console.log('Existing menu deleted');
    }
    const count = await Menu.countDocuments();
    if (count === 0) {
      await Menu.insertMany(menuSeed);
      console.log(`Inserted ${menuSeed.length} menu items`);
    } else {
      console.log(`Menu already has ${count} items - skipped (use npm run seed:reset to replace)`);
    }
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
