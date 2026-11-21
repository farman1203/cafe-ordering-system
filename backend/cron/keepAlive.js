const cron = require('node-cron');
const env = require('../config/env');

// Pings our own /api/health every 14 minutes (Render free tier sleeps after ~15 min idle).
// NOTE: this runs INSIDE the server. If the instance is already asleep this code is asleep too,
// so it cannot wake it up. Use an external monitor for that.
module.exports = function startKeepAlive() {
  if (!env.KEEP_ALIVE_URL) {
    console.log('[keep-alive] KEEP_ALIVE_URL not set - cron disabled');
    return;
  }
  if (!env.isProduction && !env.KEEP_ALIVE_ENABLED) {
    console.log('[keep-alive] disabled in development (set KEEP_ALIVE_ENABLED=true to test)');
    return;
  }

  cron.schedule('*/14 * * * *', async () => {
    try {
      const res = await fetch(env.KEEP_ALIVE_URL, { signal: AbortSignal.timeout(10000) });
      console.log(`[keep-alive] ${new Date().toISOString()} -> ${res.status}`);
    } catch (err) {
      console.error(`[keep-alive] ping failed: ${err.message}`);
    }
  });
  console.log('[keep-alive] scheduled every 14 minutes');
};
