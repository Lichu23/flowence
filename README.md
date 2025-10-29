## Flowence Deployment Guide

This guide explains how to deploy Flowence with production-ready environment variables for both server and client.

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 13+ reachable from the server
- Stripe account and API keys
- SendGrid API key and verified sender
- A strong `JWT_SECRET` (≥ 32 characters) and `ENCRYPTION_KEY`
- A production domain with HTTPS (recommended via reverse proxy like Nginx or managed hosting)

### Repository Structure
- `server/` — Node.js + Express + TypeScript API
- `flowence-client/` — React 18 + TypeScript (Vite) PWA

---

## 1) Configure Environment Variables

Create `.env` files based on the examples below.

### Server (`server/.env`)
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

### Client (`flowence-client/.env`)
Copy from `flowence-client/.env.example` and fill in your values:

```
# Vite requires VITE_ prefix for exposed envs
VITE_APP_NAME=Flowence
VITE_API_URL=https://api.your-domain.com
VITE_STRIPE_PUBLISHABLE_KEY=

# Optional observability
VITE_SENTRY_DSN=
```

---

## 2) Install Dependencies
Run from the repository root (Windows Git Bash shown). Do both client and server:

```bash
cd server && npm install && cd ..
cd flowence-client && npm install && cd ..
```

---

## 3) Database Migration and Seed
Ensure the `server/.env` is configured, then:

```bash
cd server
npm run migrate
npm run seed   # optional if you want sample data
cd ..
```

---

## 4) Build Artifacts
- Server build:
```bash
cd server
npm run build
cd ..
```

- Client build:
```bash
cd flowence-client
npm run build
cd ..
```

The client build output is typically in `flowence-client/dist`.

---

## 5) Run in Production

### Option A: Bare-metal/VM
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

### Option B: Docker
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

---

## 6) Production Checklist
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



