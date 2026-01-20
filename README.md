# DeshShera E-commerce

Full-stack e-commerce platform with customer storefront and admin panel.

## Features
- Product, category, supplier, promotion, and menu management
- Admin orders dashboard with tracking, invoices, and incomplete orders
- Payment options (COD, bKash, Nagad)
- Steadfast courier integration
- Site content + theme color controls
- Order success rate checking and fake order controls

## Tech Stack
- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + Prisma (MySQL)

## Prerequisites
- Node.js 18+
- MySQL

## Setup
1) Install dependencies
```bash
cd backend
npm install
cd ../frontend
npm install
```

2) Configure environment
- Backend: `backend/.env`
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `FRONTEND_URL`
  - `STEADFAST_BASE_URL` (default: `https://portal.packzy.com/api/v1`)

3) Run migrations and seed
```bash
cd backend
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

4) Start servers
```bash
cd backend
npm run dev
```
```bash
cd frontend
npm run dev
```

## Admin Access
- Visit `http://localhost:5173/admin`
- Configure payment gateways and courier keys in Admin → Settings

## Common Tasks
- Update schema: `npx prisma migrate dev`
- Regenerate Prisma client: `npx prisma generate`

## Notes
- Incomplete orders are saved when name + phone + address + city are filled but order is not confirmed.
- Delivery success rate is calculated from local order history (delivered vs cancelled).
