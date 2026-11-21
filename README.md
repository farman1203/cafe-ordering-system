# ☕ Brew & Bites: Cafe Menu & Order Management System

A full-stack cafe ordering app built with the **MERN stack**. Customers scan a QR code on their table, enter a phone number (no login), browse the menu, build a cart and place an order. Cafe staff manage the menu and orders through REST APIs documented with Swagger.

## 🔗 Live Links

| | Link |
|---|---|
| **Frontend (Vercel)** | https://cafe-ordering-system-three.vercel.app |
| **Backend API (Render)** | https://cafe-ordering-system-n7t9.onrender.com |
| **API Docs (Swagger)** | https://cafe-ordering-system-n7t9.onrender.com/api/docs/ |
| **Health check** | https://cafe-ordering-system-n7t9.onrender.com/api/health |
| **GitHub** | https://github.com/farman1203/cafe-ordering-system/ |

> ⏳ The backend runs on Render's free tier. If it was idle, the very first request can take 30-50 seconds. A cron job pings it every 10 minutes to reduce this (see [Keep-Alive Cron](#-keep-alive-cron-job)).

## 📸 Screenshots

| Phone number pop-up | Menu |
|---|---|
| ![Phone modal](docs/screenshots/01-phone-modal.jpeg) | ![Menu](docs/screenshots/02-menu.png) |

| Search / filter / sort | Cart |
|---|---|
| ![Filters](docs/screenshots/03-filters.png) | ![Cart](docs/screenshots/04-cart.png) |

| Checkout | Order success |
|---|---|
| ![Checkout](docs/screenshots/05-checkout.png) | ![Success](docs/screenshots/06-order-success.png) |

| QR codes | Swagger docs |
|---|---|
| ![QR](docs/screenshots/07-qr.png) | ![Swagger](docs/screenshots/08-swagger.png) |

| MongoDB Atlas data |
|---|
| ![Atlas](docs/screenshots/09-atlas.png) |

## ✨ Features

**Customer**
- Scan a table QR code and the menu opens with the table pre-selected
- Phone number pop-up on first visit, **no login or signup**; the number is remembered and pre-filled at checkout
- Responsive, mobile-first menu UI
- Search (debounced), category filter and price sorting (low to high / high to low)
- Cart with quantity update, item removal and automatic total; cart survives page refresh
- Checkout form with validation
- Loading skeletons, success messages and error messages with retry
- Order confirmation page and order history by phone number

**Backend**
- Full CRUD for menu items
- Place and retrieve orders (by id, by phone, all orders), update order status
- **Order total is calculated on the server** from database prices (the client cannot tamper with prices)
- **Price snapshot** stored with each order item, so later menu price changes don't alter old orders
- Request validation (`express-validator`) and centralized error handling with a consistent error format
- Swagger documentation at `/api/docs`
- Security basics: `helmet`, CORS whitelist, rate limiting, request size limit

**DevOps**
- Frontend on Vercel, backend on Render, database on MongoDB Atlas
- Keep-alive cron job for the Render backend
- Docker Compose setup to run everything locally with one command

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Axios, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Validation | express-validator |
| Deployment | Vercel (frontend), Render (backend) |
| Other | node-cron |

## 🏗️ Architecture

```
Customer phone ──scans QR──▶ React app (Vercel)
                                │  Axios (REST / JSON)
                                ▼
                          Express API (Render) ◀── cron ping /health
                                │  Mongoose
                                ▼
                          MongoDB Atlas
```

## 📁 Project Structure

```
cafe-app/
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection
│   │   ├── models/        # MenuItem, Order
│   │   ├── controllers/   # business logic
│   │   ├── routes/        # endpoints + Swagger comments
│   │   ├── middleware/    # validation, error handler, admin auth
│   │   ├── docs/          # Swagger config
│   │   ├── jobs/          # keep-alive cron
│   │   ├── utils/
│   │   ├── seed.js        # sample menu data
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│  
├── frontend/
│   ├── src/
│   │   ├── api/           # axios client
│   │   ├── components/
│   │   ├── context/       # Cart + Customer (phone/table)
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── utils/
│   ├── .env.example
│   └── vercel.json
├── screenshots/
└── README.md
```

## 🚀 Setup & Run Locally

### Prerequisites
- Node.js 18+ and npm
- A MongoDB Atlas cluster (free M0) or a local MongoDB

## 🔐 Environment Variables

### Backend (`backend/.env.example`)
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://MongoDB:lOWZAHw3aVK4DKAR@complete-backend.qgemkqe.mongodb.net/cafe_new
FRONTEND_URL=https://cafe-ordering-system-three.vercel.app/

### Frontend (`frontend/.env.example`)
VITE_API_URL=https://cafe-ordering-system-n7t9.onrender.com/api
VITE_QR_MENU_URL=https://cafe-ordering-system-three.vercel.app/


> ⚠️ Vite only exposes variables that start with `VITE_`, and bakes them in at **build time**. After changing them on Vercel, redeploy.

## 📡 API Endpoints

Base URL: `/api`. Full interactive docs at `/api/docs`.

### Menu

| Method | Endpoint | Description |
|---|---|---|
| GET | `/menu?search=&category=&sort=price_asc\|price_desc` | List menu items with search, filter and sort |
| GET | `/menu/categories` | List categories |
| GET | `/menu/:id` | Get a single item |
| POST | `/menu` | Create an item |
| PUT | `/menu/:id` | Update an item |
| DELETE | `/menu/:id` | Delete an item |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Place an order (total calculated on the server) |
| GET | `/orders?status=` | List all orders (admin) |
| GET | `/orders/:id` | Get one order |
| GET | `/orders/phone/:phone` | Get a customer's orders |
| PATCH | `/orders/:id/status` | Update order status (admin) |

### Other

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check (used by the keep-alive cron) |

**Example: place an order**

```json
POST /api/orders
{
  "customer": { "name": "Rahul", "phone": "9876543210", "notes": "Less sugar" },
  "tableNumber": "5",
  "items": [
    { "menuItemId": "<menu item id>", "quantity": 2 }
  ]
}
```

Order status values: `pending`, `preparing`, `ready`, `completed`, `cancelled`.

**Error format (all endpoints)**

```json
{ "success": false, "message": "Validation failed", "errors": [{ "field": "customer.phone", "message": "Phone must be a valid 10 digit number" }] }
```

## 📱 QR Code Flow

1. Each table has a QR code that encodes `https://cafe-ordering-system-three.vercel.app/?source=qr&table=T01`.
2. Scanning opens the menu; the table number is read from the URL and saved.
3. On the first visit a pop-up asks for a **phone number** (validated as a 10 digit Indian mobile number). It is stored in `localStorage`, so there is **no login or JWT**.
4. The customer builds a cart and checks out. The phone number and table number are attached to the order.
5. After ordering, the customer can see their orders using the saved phone number.

QR codes are generated in the app's QR page, and the encoded URL comes from `VITE_QR_MENU_URL`, so printed QR codes always point to the live site.

## ⏰ Keep-Alive Cron Job

Render's free tier puts a service to sleep after about 15 minutes without traffic, which makes the next request slow (cold start). Two layers are used:

1. **In-app cron** (`node-cron`, `backend/src/jobs/keepAlive.js`): every 10 minutes the server calls its own `/health` endpoint. It only runs when `RENDER_EXTERNAL_URL` is set (production).
2. **External cron** ([cron-job.org](https://cron-job.org)): pings `https://cafe-ordering-system-n7t9.onrender.com/api/health` every 10 minutes.

**Why both?** A self-ping can't wake a server that is already asleep, because the timer runs inside the sleeping process. The external pinger is the reliable one; the in-app cron is an extra safety net.

## 🧠 Design Decisions

- **Server-side total calculation:** the client sends only item ids and quantities. Prices come from the database, so a user cannot manipulate the amount.
- **Price snapshot in orders:** item name and price are copied into the order, so changing the menu later doesn't alter order history.
- **Context API + useReducer for the cart:** the state is small and local to the app, so Redux would be unnecessary overhead.
- **Centralized error handling:** controllers are wrapped with an async handler; Mongoose validation errors and invalid ids are converted to clean `400` responses.
- **No login for customers:** keeps ordering fast. The trade-off is that a phone number is not verified.

## 🔮 Future Improvements

- OTP verification of the phone number
- Real-time order updates for staff and customers with WebSockets
- Online payments (Razorpay / Stripe)
- Image upload for menu items (Cloudinary)

## 👤 Author

**<Your Name>**
GitHub:(https://github.com/farman1203) · Email: <ansarifarman1203@gmail.com>
