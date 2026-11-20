# Brew & Bites — Interview Guide (Simple Hinglish)

## 1. Project ek line mein
"Ye ek cafe ordering system hai. Customer table ka QR scan karke bina login ke order karta hai, aur admin dashboard se cafe staff menu aur orders manage karta hai. MERN stack mein banaya hai: MongoDB, Express, React, Node."

## 2. Architecture (big picture)
```
Customer phone ──► React (Vercel) ──axios──► Express API (Render) ──mongoose──► MongoDB Atlas
Admin browser  ──► React (Vercel) ──axios + JWT──►        ↑
```
- **Frontend (React)** sirf UI dikhata hai aur API call karta hai.
- **Backend (Express)** business logic, validation, security, aur database ka kaam karta hai.
- **MongoDB** mein 3 collections hain: `menus`, `orders`, `admins`.
- Frontend aur backend **alag deploy** hote hain, isliye backend mein **CORS** set hai.

## 3. Backend folder ka matlab (separation of concerns)
| Folder | Kaam |
|---|---|
| `models/` | Database ka structure (schema) — Menu, Order, Admin |
| `routes/` | URL → controller mapping (+ Swagger docs) |
| `controllers/` | Asli logic (order banana, status badalna) |
| `validators/` | express-validator rules — galat data pehle hi reject |
| `middleware/` | `protect` (JWT check), error handler, validation result |
| `utils/` | helpers: order ID generator, constants, AppError |
| `config/env.js` | .env check karta hai; secret missing ho to server start hi nahi hota |

**Request ka safar:** `route → validator → validate middleware → (protect agar admin) → controller → model → response`. Koi bhi error `next(err)` se **ek hi errorMiddleware** mein jaata hai, wahan se clean JSON milta hai.

## 4. Sabse important concept: Price server par calculate hota hai
Checkout par frontend sirf `[{menuItem: id, quantity}]` bhejta hai — **price nahi**.
Backend:
1. Ids se DB se menu items nikalta hai.
2. Check karta hai item exist karta hai aur `isAvailable` hai.
3. DB wale price se `subtotal` aur `totalAmount` banata hai.
4. Order mein **snapshot** save karta hai (name, price, quantity, subtotal).

**Kyun?** Agar frontend se total aata, to koi DevTools se ₹1 kar sakta tha. Snapshot isliye ki baad mein menu price badle to purane orders na badlein.

## 5. Order place karne ka poora flow
1. Customer menu se "Add" dabata hai → `CartContext` state update + `localStorage` save.
2. Checkout par form validate hota hai (name, phone `^[6-9]\d{9}$`, table).
3. `POST /api/orders` → backend validate + price calculate + `orderId` banata hai (`BB-261120-F5XX`, `crypto.randomInt` se, guess karna mushkil).
4. **Duplicate protection (2 layer):** frontend mein `useRef` lock + button disabled; backend mein same phone+table+total 30 sec ke andar aaye to naya order nahi banta, purana wapas milta hai.
5. Success hone par hi `clearCart()` chalta hai, phir `/order-success/:orderId` page.
6. Success page har 15 sec mein status refresh karta hai (`useOrderPolling` hook) jab tak Completed/Cancelled na ho.

## 6. Order tracking
`GET /api/orders/track/:orderId?phone=...` — **dono match** hone chahiye. Galat ho to same message: "No order found..." (taaki koi guess karke check na kar sake ki ID sahi hai ya nahi). Rate limit bhi laga hai.

## 7. Authentication (JWT) simple language mein
1. Admin email+password bhejta hai → `POST /api/admin/login`.
2. Backend password **bcrypt hash** se compare karta hai (DB mein plain password kabhi nahi; `select:false` se query mein bhi nahi aata).
3. Sahi ho to **JWT token** milta hai (`jwt.sign({id}, JWT_SECRET, {expiresIn:'1d'})`).
4. Frontend token `localStorage` mein rakhta hai; axios **interceptor** har request mein `Authorization: Bearer <token>` laga deta hai.
5. Backend `protect` middleware token verify karta hai, admin DB se load karta hai; fail ho to 401.
6. Token expire ho jaye to 401 aata hai → interceptor token hata deta hai → `AuthContext` logout karke login page par bhejta hai.
7. Frontend `ProtectedRoute` sirf UI protect karta hai; **asli security backend ka `protect` hai.**

Login par **rate limit** (15 min mein 10 attempts) — brute force se bachne ke liye.

## 8. QR ordering kaise kaam karta hai
- Admin → QR Codes page → har table ke liye URL banta hai: `https://<site>/menu?source=qr&table=T05`.
- `qrcode.react` is URL ko QR image bana deta hai, PNG download hoti hai.
- Customer scan kare → `SessionContext` URL se `table` aur `source` padhkar **localStorage** mein save karta hai. Isliye navigate/refresh ke baad bhi table yaad rehta hai.
- `source=qr` ho aur phone saved na ho to **Welcome popup** aata hai (phone validate hota hai).
- Checkout par table auto-fill (locked, "Change" ka option). Agar QR se na aaye to customer manually table daal sakta hai.
- QR ka base URL `VITE_QR_MENU_URL` env variable se aata hai (hardcode nahi).

## 9. Admin status transitions
Backend mein map hai:
`Pending→[Confirmed,Cancelled]`, `Confirmed→[Preparing,Cancelled]`, `Preparing→[Ready,Cancelled]`, `Ready→[Completed,Cancelled]`, `Completed/Cancelled→[]`.
Galat jump (Pending→Completed) par 400 error. Frontend sirf allowed buttons dikhata hai, lekin **final check backend karta hai.**

## 10. Security checklist (interview mein bolne ke liye)
- bcrypt password hashing · JWT auth · protected admin routes
- Server-side validation (express-validator) + Mongoose schema validation
- Backend price calculation · price snapshot
- Helmet headers · CORS allow-list · rate limiting (login, orders, tracking)
- `.env` secrets git mein nahi; `env.js` startup par check karta hai
- Production mein error ka internal detail hide hota hai
- Regex search mein user input `escapeRegex` se safe kiya (ReDoS/injection se bachne ke liye)
- Request body limit 100kb; `pick()` se sirf allowed fields save hote hain

## 11. Deployment samjho
- **MongoDB Atlas:** cloud DB. Connection string `MONGO_URI` mein.
- **Render (backend):** root `backend`, start `npm start`. Env variables Render dashboard mein.
- **Vercel (frontend):** root `frontend`. `VITE_*` variables **build time** par bundle mein jaate hain — change karo to redeploy.
- `vercel.json` ka rewrite SPA routing ke liye: direct `/menu?table=T05` kholne par 404 nahi aata.
- **CORS:** Render par `FRONTEND_URL` = Vercel URL.
- **Cron:** `node-cron` har 14 min `/api/health` ping karta hai. **Honest limitation:** free Render sleep ho jaye to andar ka cron bhi so jaata hai, isliye external monitor (UptimeRobot) behtar hai. Ye interview mein bolna — samajhdari dikhti hai.

## 11b. Swagger
`swagger-jsdoc` routes ke upar likhe `@openapi` comments se OpenAPI spec banata hai; `swagger-ui-express` use `/api/docs` par dikhata hai. `servers: [{url:'/api'}]` relative hai, isliye local aur Render dono par chalta hai.

## 12. Common interview questions
**Q: Frontend se total kyun nahi bheja?** Tamper ho sakta hai; backend DB price pe trust karta hai.
**Q: Cart kahan store hai?** React Context + `localStorage` (refresh pe bhi bacha rehta hai). Order ke baad clear.
**Q: Login bina customer ko track kaise karte ho?** Order ID + phone dono match.
**Q: JWT aur session mein fark?** JWT stateless hai, server session store nahi karta; token mein admin id hai aur signature se verify hota hai.
**Q: localStorage mein JWT risky nahi?** XSS ka risk hota hai. Behtar option httpOnly cookie hai (future improvement). Is assessment ke liye localStorage common hai; React default escaping se XSS kam hota hai.
**Q: Duplicate order kaise roka?** Frontend lock + backend 30-sec same-order check.
**Q: Menu item delete ho jaye to purane orders?** Order mein snapshot hai, to safe.
**Q: Search kaise implement kiya?** Frontend debounce (350ms) → backend `?search=` regex (case-insensitive, escaped).
**Q: Kya improve karoge?** WebSockets live orders, OTP verification, online payment, tests, image upload.

## 13. Demo script (2 minute)
1. Home page dikhao → Menu → search/filter/sort.
2. Browser mein `/menu?source=qr&table=T05` kholo → popup → phone → table chip navbar mein.
3. Cart → Checkout (table auto-filled) → order place → order ID.
4. Admin login → Dashboard → Orders mein naya order → status Confirmed→Preparing...
5. Customer page par status badalta dikhao (auto-refresh).
6. QR Codes page → download.
7. `/api/docs` Swagger dikhao.
