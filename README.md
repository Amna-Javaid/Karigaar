# ⚡ KarigaarPK — Local Service Hub

> *Apka Kaam, Hamare Karigaar* — Pakistan's Local Service Booking Platform

A full-stack MERN application (MongoDB · Express · React · Node.js) for booking local services like electricians, plumbers, tutors, mehndi artists, makeup artists, and more.

---

## 📁 Project Structure

```
karigaarpk/
├── backend/        ← Express + MongoDB API
└── frontend/       ← React + Vite UI
```

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/karigaarpk
JWT_SECRET=karigaarpk_super_secret_jwt_key_change_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Seed the database with sample data:
```bash
node seed.js
```

Start the backend:
```bash
npm run dev      # development (nodemon)
npm start        # production
```

Backend runs on: **http://localhost:5000**

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## 🔐 Login Credentials (after seeding)

| Role  | Email                     | Password  |
|-------|---------------------------|-----------|
| Admin | admin@karigaarpk.com      | admin123  |
| User  | ali@example.com           | user123   |
| User  | ayesha@example.com        | user123   |

---

## ✨ Features

### User Side
- ✅ Register / Login with JWT auth
- ✅ Browse services with filters (category, city, search)
- ✅ Service detail page with reviews
- ✅ Add to cart / manage hours
- ✅ Checkout with date, time, address, payment method
- ✅ My Bookings with 5-step live tracking
- ✅ Wishlist (save favourite services)
- ✅ Profile management (name, phone, city, password)

### Admin Panel (`/admin`)
- ✅ Dashboard with stats, revenue chart, recent bookings
- ✅ Services CRUD — add, edit, delete services
- ✅ SEO tab — seoTitle, metaDescription, keywords per service
- ✅ Bookings management — update status, live reflects on user side
- ✅ User management — view and delete users

---

## 🗄 Database Schema

| Collection | Key Fields |
|------------|-----------|
| users      | name, email, password (hashed), phone, city, role, wishlist[] |
| services   | title, category, pricePerHour, providerName, city, rating, reviews[], SEO fields |
| bookings   | user, service, hours, totalAmount, scheduledDate, status, trackingSteps[] |
| carts      | user, items[{service, hours, pricePerHour}] |

---

## 🛠 Tech Stack

**Backend:** Node.js · Express · MongoDB · Mongoose · JWT · bcryptjs  
**Frontend:** React 18 · Vite · React Router v6 · Axios · React Hot Toast

---

## 🌐 API Endpoints

```
POST   /api/users/register
POST   /api/users/login
GET    /api/users/profile          (auth)
PUT    /api/users/profile          (auth)
POST   /api/users/wishlist/:id     (auth)

GET    /api/services               (public, supports ?category=&city=&search=&page=)
GET    /api/services/:id           (public)
GET    /api/services/admin/all     (admin)
POST   /api/services               (admin)
PUT    /api/services/:id           (admin)
DELETE /api/services/:id           (admin)
POST   /api/services/:id/review    (auth)

GET    /api/cart                   (auth)
POST   /api/cart                   (auth)
PUT    /api/cart/:serviceId        (auth)
DELETE /api/cart/:serviceId        (auth)
DELETE /api/cart/clear             (auth)

POST   /api/bookings               (auth)
GET    /api/bookings/my            (auth)
GET    /api/bookings/:id           (auth)
PUT    /api/bookings/:id/cancel    (auth)
GET    /api/bookings               (admin)
PUT    /api/bookings/:id/status    (admin)

GET    /api/admin/stats            (admin)
```
