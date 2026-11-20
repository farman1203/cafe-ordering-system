const env = require('./config/env'); // loads .env + validates (must be first)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const AppError = require('./utils/AppError');

const connectDB = require('./config/db');
const swaggerSpec = require('./swagger/swagger');
const startKeepAlive = require('./cron/keepAlive');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
app.set('trust proxy', 1); // Render sits behind a proxy; needed for correct client IP (rate limiting)

// ---------- Security ----------
// CSP is off because this server only returns JSON (+ Swagger UI which needs inline scripts)
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = env.FRONTEND_URL.split(',').map((o) => o.trim().replace(/\/$/, ''));
app.use(
  cors((req, cb) => {
    const origin = req.header('Origin');
    // Swagger UI "Try it out" calls the API from the SAME host, and browsers still send an Origin header then.
    let sameHost = false;
    try { sameHost = !!origin && new URL(origin).host === req.headers.host; } catch { /* bad Origin header */ }
    // No Origin = Postman / curl / server-to-server
    const ok = !origin || sameHost || allowedOrigins.includes(origin);
    cb(ok ? null : new AppError(`Origin not allowed: ${origin}`, 403), { origin: ok });
  })
);
app.use(express.json({ limit: '100kb' }));

// ---------- Routes ----------
/**
 * @openapi
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             example: { status: ok, timestamp: '2026-11-20T10:00:00.000Z', uptime: 120.5 }
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: Math.round(process.uptime()) });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'Brew & Bites API Docs' }));
app.get('/', (req, res) => res.json({ name: 'Brew & Bites API', docs: '/api/docs', health: '/api/health' }));

app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// ---------- Errors (always last) ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start ----------
connectDB().then(() => {
  app.listen(env.PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`Swagger docs: /api/docs`);
    startKeepAlive();
  });
});
