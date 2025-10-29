# Flowence

All-in-one Supermarket/Warehouse Management (PWA)
[https://github.com/Lichu23/flowence](https://github.com/Lichu23/flowence)

## Overview

Flowence is a full-stack web application for small and medium retail businesses. It enables multi-store management, inventory and stock control, barcode scanning via QuaggaJS, and end-to-end sales processing with Stripe. The app supports role-based access (owners and employees), invitations via SendGrid, and robust operational tooling such as low-stock alerts and receipts. The frontend is built with React 18 + TypeScript + Vite (PWA), and the backend is Node.js + Express + TypeScript with PostgreSQL.

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

* React 18 + TypeScript + Vite
* Tailwind CSS for styling
* PWA: Service worker, caching, installable manifest

**Backend**

* Node.js, Express, TypeScript
* PostgreSQL (primary), with migrations and indexing recommendations
* JWT auth with Passport.js
* Stripe for payments, SendGrid for email

## Repository Structure

* `flowence-client/`: React frontend (TypeScript, Vite, Tailwind, PWA)
* `server/`: Node.js Express API (TypeScript)

### Client (React + Vite)

```
src/
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

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 13+
- Stripe account (API keys)
- SendGrid account (API key)
- A strong `JWT_SECRET` (≥ 32 characters) and `ENCRYPTION_KEY`

### Development Setup

1. **Install Dependencies**
```bash
# client
cd flowence-client
npm install

# server
cd ../server
npm install
```

2. **Configure Environment Variables**

Create `.env` in `flowence-client/`:
```bash
VITE_APP_NAME=Flowence
VITE_API_URL=http://localhost:3002
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

Create `.env` in `server/`:
```bash
NODE_ENV=development
PORT=3002
DATABASE_URL=postgres://user:pass@localhost:5432/flowence
JWT_SECRET=your_super_secret_jwt_key_at_least_32_chars
ENCRYPTION_KEY=your_32_char_encryption_key
STRIPE_SECRET_KEY=sk_test_xxx
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@your-domain.com
```

3. **Run Development Servers**
```bash
# Start client (Vite)
cd flowence-client
npm run dev

# Start server (nodemon)
cd ../server
npm run dev
```

---

## Production Deployment

This guide explains how to deploy Flowence with production-ready environment variables for both server and client.

---

### Configure Environment Variables

Create `.env` files based on the examples below.

#### Server (`server/.env`)
Copy from `server/.env.example` and fill in your values:

```
NODE_ENV=production
PORT=3000

# Database (prefer DATABASE_URL in production)
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/flowence?ssl=true
# Optional discrete settings if not using DATABASE_URL
DB_HOST=
DB_PORT=5432
DB_NAME=flowence
DB_USER=
DB_PASSWORD=

# Security
JWT_SECRET=change_me_to_a_random_32+_char_string
ENCRYPTION_KEY=replace_with_32_char_key_or_base64_32_bytes

# CORS / URLs
APP_URL=https://your-domain.com
API_URL=https://api.your-domain.com
CORS_ORIGIN=https://your-domain.com

# Third-party services
STRIPE_SECRET_KEY=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=notifications@your-domain.com

# Logging
LOG_LEVEL=info
```

Notes:
- `JWT_SECRET` must be at least 32 characters.
- `DATABASE_URL` should include `ssl=true` in production.
- `ENCRYPTION_KEY` should be 32 bytes (AES-256); use a strong random value.

#### Client (`flowence-client/.env`)
Copy from `flowence-client/.env.example` and fill in your values:

```
# Vite requires VITE_ prefix for exposed envs
VITE_APP_NAME=Flowence
VITE_API_URL=https://api.your-domain.com
VITE_STRIPE_PUBLISHABLE_KEY=

# Optional observability
VITE_SENTRY_DSN=
```

### Install Dependencies
Run from the repository root (Windows Git Bash shown). Do both client and server:

```bash
cd server && npm install && cd ..
cd flowence-client && npm install && cd ..
```

### Database Migration and Seed
Ensure the `server/.env` is configured, then:

```bash
cd server
npm run migrate
npm run seed   # optional if you want sample data
cd ..
```

### Build Artifacts

#### Server Build
```bash
cd server
npm run build
cd ..
```

#### Client Build
```bash
cd flowence-client
npm run build
cd ..
```

The client build output is typically in `flowence-client/dist`.

### Run in Production

#### Option A: Bare-metal/VM
Run the server (behind a reverse proxy with HTTPS):
```bash
cd server
npm run start
```

Serve the client static files using your web server (e.g., Nginx) pointing to `flowence-client/dist`.

Nginx example (snippet):
```
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    # ssl_certificate ...
    # ssl_certificate_key ...

    root /var/www/flowence-client/dist;
    index index.html;

    location /api/ {
        proxy_pass https://api.your-domain.com/;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri /index.html;
    }
}
```

#### Option B: Docker
Build and run the server container:
```bash
cd server
docker build -t flowence-server .
docker run -d --name flowence-server \
  -p 3000:3000 \
  --env-file .env \
  flowence-server
```

Deploy the client by serving `flowence-client/dist` on your static hosting (e.g., Nginx, Netlify, Vercel). Ensure `VITE_API_URL` points to the server URL.

### Production Checklist
- HTTPS enforced on both client and API
- JWT tokens expire in 30 minutes; refresh flow configured
- Strong `JWT_SECRET` and `ENCRYPTION_KEY`
- CORS locked down to your domain(s)
- Security headers enabled (helmet) on the API
- Rate limiting enabled on API and auth endpoints
- Database access secured and using SSL in production
- Audit logging configured; logs shipped/rotated
- Backups and monitoring in place

---

## Common Commands

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Tests
npm test

# Lint
npm run lint

# Build
npm run build
```

## Testing

* Unit/integration tests recommended on both client and server.
* E2E testing can be configured with Playwright or similar tools.

## Security & Compliance

* JWT expiry and refresh strategy
* Input validation/sanitization, parameterized queries
* HTTPS in production; secrets via environment variables
* Security headers (helmet), rate limiting, CSRF protection

## Accessibility & Performance

* WCAG: keyboard navigation, color contrast, semantic structure
* Performance: memoization, lazy-loading, caching, DB indexing
* PWA: Service workers for offline support

## License

MIT License. See `LICENSE` file.

## Contributing

Issues and PRs are welcome. Please follow TypeScript strictness, testing, and code review checklist.
