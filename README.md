# ☕ Brew & Bites — Cafe Menu & Order Management System

A full-stack MERN application where customers scan a **table QR code**, browse the menu, order without registering, and track their order — while the cafe manages everything from a secured admin dashboard.

| | |
|---|---|
| **Live frontend** | `<add your Vercel URL here>` |
| **Live backend** | `<add your Render URL here>` |
| **Swagger docs** | `<your Render URL>/api/docs` |
| **GitHub repo** | `<add your repository URL here>` |

---

## 1. Features

**Customer (no login ever)**
- Premium responsive home page (hero, popular items, categories, bestsellers, about, testimonials)
- Dynamic menu from MongoDB: search, category filter, price sort, veg-only filter, availability + bestseller labels, skeleton loaders, empty/error states
- Cart with Context API + `localStorage` persistence, quantity controls (1–20), live totals, navbar item count
- **QR ordering:** `/menu?source=qr&table=T05` → welcome popup asks for mobile number → table auto-detected and kept across pages → checkout pre-filled
- Checkout validation (name, Indian mobile number, table), duplicate-submit protection, cart cleared only after success
- Order success page with unique order ID, live status tracker; **Track Order** page (order ID + phone)

**Admin**
- JWT login, protected routes, auto-logout when token expires
- Dashboard: total / today / pending / completed orders, today's revenue, total sales, menu count, 7-day chart, status overview, recent orders
- Menu CRUD with validation, availability switch, bestseller toggle, search + filters, delete confirmation
- Orders: search (ID / phone / name / table), status filter, full details, **valid status transitions only**, auto-refresh every 30 s
- **QR code manager:** 1–50 tables + custom tables, per-table QR, PNG download (with table label), copy link

**Backend**
- REST API, express-validator, centralized error handler, ObjectId validation, duplicate handling
- **Prices & totals always calculated on the server** from DB prices; order items store price snapshots
- bcrypt password hashing, JWT, Helmet, CORS allow-list, rate limiting (login / order / tracking)
- Swagger UI at `/api/docs`, `/api/health`, node-cron keep-alive job, seed script

## 2. Tech stack
React 18 + Vite, React Router 6, Axios, Context API, custom CSS (no UI framework), Lucide icons, react-toastify, qrcode.react ·
Node.js, Express 4, MongoDB Atlas + Mongoose 8, JWT, bcryptjs, express-validator, Helmet, cors, express-rate-limit, swagger-jsdoc + swagger-ui-express, node-cron ·
Vercel (frontend), Render (backend), Docker (bonus).

> Why `bcryptjs` and not `bcrypt`? Pure JavaScript — no native compile step, so it installs reliably on Render/Docker.

## 3. Folder structure
```
cafe-ordering-system/
├── backend/
│   ├── config/        env.js (validates env), db.js
│   ├── controllers/   menuController, orderController, adminController
│   ├── models/        Menu, Order, Admin
│   ├── routes/        menuRoutes, orderRoutes, adminRoutes (+ Swagger comments)
│   ├── middleware/    authMiddleware (JWT), errorMiddleware, validationMiddleware
│   ├── validators/    menuValidator, orderValidator, adminValidator
│   ├── utils/         constants, AppError, asyncHandler, generateOrderId
│   ├── swagger/       swagger.js
│   ├── cron/          keepAlive.js
│   ├── data/          menuSeed.js
│   ├── seed.js  server.js  Dockerfile  .env.example
├── frontend/
│   ├── src/components/  Navbar, Footer, MenuCard, Cart, CartItem, Modal, WelcomeModal, QRCodeModal, ...
│   ├── src/pages/       Home, Menu, CartPage, Checkout, OrderSuccess, OrderTracking, Admin*, Manage*
│   ├── src/context/     CartContext, SessionContext (table/phone), AuthContext
│   ├── src/services/    api.js (axios + interceptors), menuService, orderService, adminService
│   ├── src/utils/ src/styles/
│   ├── vercel.json  Dockerfile  nginx.conf  .env.example
├── docs/screenshots/    (add your screenshots here)
├── docker-compose.yml
└── README.md
```

## 4. Prerequisites
Node.js **18+** (20 recommended), npm, a free MongoDB Atlas account, Git. Docker only for the bonus setup.

## 5. MongoDB Atlas setup
1. Create a free **M0** cluster at <https://cloud.mongodb.com>.
2. **Database Access** → add a database user (username + strong password).
3. **Network Access** → add IP `0.0.0.0/0` (needed for Render's changing IPs; keep a strong DB password).
4. **Connect → Drivers** → copy the connection string and add a DB name:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/brewbites?retryWrites=true&w=majority`
   (URL-encode special characters in the password.)

## 6. Local setup

### Backend
```bash
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
# edit .env: MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed                # creates admin + sample menu
npm run dev                 # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev                 # http://localhost:5173
```

### Environment variables

**backend/.env**
| Variable | Purpose |
|---|---|
| `PORT` | Server port (Render sets it automatically) |
| `NODE_ENV` | `development` / `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random secret (≥ 32 chars in production) |
| `JWT_EXPIRES_IN` | Token lifetime, default `1d` |
| `FRONTEND_URL` | Allowed CORS origin(s), comma separated, no trailing `/` |
| `ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD` | Used **only** by `npm run seed` |
| `KEEP_ALIVE_URL` | Backend health URL the cron pings |
| `KEEP_ALIVE_ENABLED` | `true` to run the cron outside production |
| `QR_MENU_URL` | Reference value (the QR URL actually used is the frontend variable) |
| `TIMEZONE` | Timezone for "today" in dashboard (default `Asia/Kolkata`) |

**frontend/.env**
| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL **including `/api`** |
| `VITE_QR_MENU_URL` | Base URL encoded in QR codes — your **deployed** frontend `/menu?source=qr` |

Generate a JWT secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

## 7. Admin account (seed)
There is **no default password in the code**. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` (min 8 chars, not the placeholder) in `backend/.env`, then run `npm run seed`. Re-running updates the admin's password. Sign in at `/admin/login`.
`npm run seed:reset` wipes and re-creates the sample menu (26 items, 8 categories).

## 8. API endpoints
Base: `/api` · 🔒 = `Authorization: Bearer <token>`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server status + timestamp |
| GET | `/menu` | List items. Query: `search, category, sort (price_asc/price_desc/name/newest), available, bestseller, foodType` |
| GET | `/menu/categories` | Categories with item counts |
| GET | `/menu/:id` | One item |
| POST / PUT / DELETE | `/menu`, `/menu/:id` 🔒 | Create / update / delete |
| POST | `/orders` | Place order (public) — send only `menuItem` ids + `quantity` |
| GET | `/orders/track/:orderId?phone=` | Track an order (public, needs both) |
| GET | `/orders` 🔒 | List. Query: `status, search, page, limit` |
| GET | `/orders/:id` 🔒 | One order |
| PATCH | `/orders/:id/status` 🔒 | Update status (validated transitions) |
| POST | `/admin/login` | Returns JWT |
| GET | `/admin/profile` 🔒 | Admin profile |
| GET | `/admin/stats` 🔒 | Dashboard stats |

**Status flow:** Pending → Confirmed → Preparing → Ready → Completed; Cancelled allowed from any non-final state; Completed/Cancelled are final. Completing an order marks payment `Paid`.
**Revenue/sales** = Completed orders only.
Responses: `{ success, message?, data }`; errors: `{ success:false, message, errors? }`.

## 9. Swagger
Open **`http://localhost:5000/api/docs`** (or `<render-url>/api/docs`). Call `POST /admin/login`, copy the `token`, click **Authorize**, paste it, and the 🔒 endpoints become testable.

## 10. QR code ordering
1. Set `VITE_QR_MENU_URL` to your **deployed** frontend, e.g. `https://your-app.vercel.app/menu?source=qr`.
2. Admin → **QR Codes** → choose number of tables → **Download** each PNG → print and place on tables.
3. A table QR encodes `https://your-app.vercel.app/menu?source=qr&table=T05`.
4. On scan: menu opens, table `T05` is saved (survives navigation/refresh), welcome popup asks for mobile number, checkout is pre-filled.
5. **Test locally on a phone:** run `npm run dev` (Vite exposes your LAN IP), set `VITE_QR_MENU_URL=http://<your-LAN-IP>:5173/menu?source=qr`, add that IP origin to backend `FRONTEND_URL`, scan with your phone on the same Wi-Fi. Or just open `/menu?source=qr&table=T05` in a browser.

## 11. Docker (bonus)
```bash
# optional: create a root .env with JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
docker compose up --build
docker compose exec backend node seed.js      # once, to create admin + menu
```
Frontend → http://localhost:5173 · Backend → http://localhost:5000 · Swagger → http://localhost:5000/api/docs.
Uses a local MongoDB container (`mongodb://mongo:27017/brewbites`). Normal `npm` workflow is untouched.

## 12. Deployment

### Backend → Render
1. Push the repo to GitHub.
2. Render → **New Web Service** → select repo → **Root Directory:** `backend` · **Build:** `npm install` · **Start:** `npm start`.
3. Environment variables: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET` (≥32 chars), `FRONTEND_URL=https://<your-vercel-app>.vercel.app`, `KEEP_ALIVE_URL=https://<your-render-app>.onrender.com/api/health`.
4. Health check path: `/api/health`.
5. After first deploy, create the admin: run the seed **once** from your computer with the production `MONGO_URI` in `backend/.env` (`npm run seed`) — or use Render's Shell tab: `npm run seed` with `ADMIN_EMAIL`/`ADMIN_PASSWORD` set temporarily.

### Frontend → Vercel
1. Vercel → **Add New Project** → select repo → **Root Directory:** `frontend` (Vite is auto-detected).
2. Env vars: `VITE_API_URL=https://<your-render-app>.onrender.com/api`, `VITE_QR_MENU_URL=https://<your-vercel-app>.vercel.app/menu?source=qr`.
3. `vercel.json` already rewrites all routes to `index.html`, so direct links like `/menu?table=T05` and `/admin/orders` work.
4. Env vars are baked in at build time — **redeploy** after changing them.
5. Put the final Vercel URL into Render's `FRONTEND_URL` (CORS) and redeploy the backend.

### Keep-alive / cold starts
`cron/keepAlive.js` pings `/api/health` every 14 minutes (production only). **Limitation:** Render's free tier sleeps after ~15 min of inactivity; a cron *inside* the server cannot wake a server that is already asleep, and it stops when the instance is suspended. Free instances therefore may still sleep. For reliable uptime use an **external monitor** (UptimeRobot, cron-job.org, BetterStack) hitting `https://<render-url>/api/health` every 5–10 minutes, or a paid Render instance. Also be aware of Render's monthly free-hours limit.

## 13. GitHub submission checklist
- [ ] `.env` files are **not** committed (`git status` should not list them; `.gitignore` covers them)
- [ ] `.env.example` present in `backend/` and `frontend/`
- [ ] README placeholders (live URLs, repo URL) filled in
- [ ] Screenshots added to `docs/screenshots/` and linked below
- [ ] `npm run build` passes in `frontend/`; backend starts with `npm start`
- [ ] Admin seeded on production DB; admin password is not the example one
- [ ] Place a test order end-to-end on the **deployed** site, and confirm it in the admin panel

## 14. Screenshots
Add images to `docs/screenshots/` using these names, then they render here:

| Page | File |
|---|---|
| Homepage | `docs/screenshots/01-home.png` |
| Menu page / product cards | `docs/screenshots/02-menu.png` |
| Shopping cart | `docs/screenshots/03-cart.png` |
| Checkout | `docs/screenshots/04-checkout.png` |
| QR welcome popup | `docs/screenshots/05-qr-popup.png` |
| Order success | `docs/screenshots/06-order-success.png` |
| Admin dashboard | `docs/screenshots/07-admin-dashboard.png` |
| Menu management | `docs/screenshots/08-admin-menu.png` |
| Order management | `docs/screenshots/09-admin-orders.png` |
| QR management | `docs/screenshots/10-admin-qr.png` |
| Swagger | `docs/screenshots/11-swagger.png` |

```md
![Home](docs/screenshots/01-home.png)
```

## 15. Known limitations
- No online payment — orders are **Pay at Counter** (by design for the assessment).
- Customers are identified only by order ID + phone (no OTP verification); anyone knowing both can view that order.
- Order list is capped at 200 per request in the admin UI (API supports pagination).
- Admin order list refreshes by polling (30 s), not WebSockets.
- Menu images are hotlinked Unsplash URLs; the UI shows a fallback if a link breaks.
- Single admin role; no admin management screen (create admins via seed).
- Render free tier cold starts (see Keep-alive section).

## 16. Future improvements
WebSocket/SSE live order updates, SMS/WhatsApp order notifications, UPI/online payments, image upload (Cloudinary), kitchen display screen, multi-role staff accounts, discount coupons, analytics (top items, peak hours), automated tests (Jest + Supertest, Playwright).
