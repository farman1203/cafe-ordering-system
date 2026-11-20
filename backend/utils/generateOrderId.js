const crypto = require('crypto');

// Example: BB-241120-7K2Q  (BB + date + 4 random chars). Hard to guess, easy to read.
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I, O, 0, 1 (confusing)

module.exports = function generateOrderId() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  let rand = '';
  for (let i = 0; i < 4; i++) rand += CHARS[crypto.randomInt(CHARS.length)];
  return `BB-${yy}${mm}${dd}-${rand}`;
};
