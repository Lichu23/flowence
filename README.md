# Flowence

All-in-one Supermarket/Warehouse Management (PWA)
[https://github.com/Lichu23/flowence](https://github.com/Lichu23/flowence)

## Overview

Flowence is a full-stack web application for small and medium retail businesses. It enables multi-store management, inventory and stock control, barcode scanning via QuaggaJS, and end-to-end sales processing with Stripe. The app supports role-based access (owners and employees), invitations via SendGrid, and robust operational tooling such as low-stock alerts and receipts. The frontend is built with Next.js 15 + React 18 + TypeScript (PWA), and the backend is Node.js + Express + TypeScript with PostgreSQL.

## Key Features

* **Authentication & Authorization**: JWT-based with Passport.js; role-based access (owner/employee).
* **Multi-store**: Owners can invite employees; employees scoped to assigned stores.
* **Inventory**: CRUD products, unique barcodes per store, stock checks, low-stock alerts.
* **Sales**: Cart/checkout, cash/card/QR payments (Stripe), stock validation, receipts, returns.
* **Barcode Scanning**: Real-time scanning via QuaggaJS.
* **Notifications**: Email invites and notifications via SendGrid.
* **Currency**: Store currency with conversion preview and settings.
* **PWA**: Mobile-first, installable, responsive UI using Tailwind CSS.

## Tech Stack

**Frontend**

* Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS
* PWA: Service worker, caching, installable manifest

**Backend**

* Node.js, Express, TypeScript
* PostgreSQL (primary), with migrations and indexing recommendations
* JWT auth with Passport.js
* Stripe for payments, SendGrid for email

## Repository Structure

* `flowence-client/`: Next.js frontend (TypeScript, Tailwind, PWA)
* `server/`: Node.js Express API (TypeScript)

### Client (Next.js)

```
src/
├─ app/                 # App Router pages
├─ components/          # UI, common, scanner, payments, etc.
├─ contexts/            # Auth, Store, Cart, Settings contexts
├─ hooks/               # Custom hooks
├─ lib/                 # API client, utilities
├─ types/               # Shared TypeScript definitions
└─ styles/              # Global styles
```

### Server (Express)

```
server/
├─ controllers/         # Route handlers
├─ routes/              # Express routes
├─ services/            # Business logic
├─ models/              # DB models / repositories
├─ middleware/          # Auth, validation, error handling
├─ config/              # Env/config
└─ types/               # Server-side TypeScript definitions
```

## Prerequisites

* Node.js 18+
* PostgreSQL 13+
* Stripe account (API keys)
* SendGrid account (API key)

## Environment Variables

Create `.env.local` in `flowence-client/` and `.env` in `server/`. Typical variables:

### Client

```
NEXT_PUBLIC_API_URL=http://localhost:3002
```

### Server

```
PORT=3002
DATABASE_URL=postgres://user:pass@localhost:5432/flowence
JWT_SECRET=supersecret
STRIPE_SECRET_KEY=sk_test_xxx
SENDGRID_API_KEY=SG.xxx
```

## Setup & Development

### Install Dependencies

```bash
# client
cd flowence-client
npm install

# server
cd ../server
npm install
```

### Run Development

```bash
# Start client (Turbopack)
cd flowence-client
npm run dev

# Start server (nodemon)
cd ../server
npm run dev
```

## Build & Production

```bash
# Client (Next.js)
cd flowence-client
npm run build
npm run start

# Server (Express)
cd ../server
npm run build   # if ts build step is configured
npm run start
```

## Testing

* Unit/integration tests recommended on both client and server.
* Optional E2E: Playwright in `flowence-client`. Install with:

```bash
cd flowence-client
npm install --save-dev @playwright/test
npx playwright install
npx playwright test
```

## Security & Compliance

* JWT expiry and refresh strategy
* Input validation/sanitization, parameterized queries
* HTTPS in production; secrets via environment variables

## Accessibility & Performance

* WCAG: keyboard navigation, color contrast, semantic structure
* Performance: memoization, lazy-loading, caching, DB indexing

## Common Scripts

**Client**

```bash
npm run dev      # Next dev (Turbopack)
npm run build    # Next build
npm run start    # Next start
```

**Server**

```bash
npm run dev      # Nodemon
npm run start    # Node server
```

## License

MIT (or your chosen license). See `LICENSE`.

## Contributing

Issues and PRs are welcome. Please follow TypeScript strictness, testing, and code review checklist.
