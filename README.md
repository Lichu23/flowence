\documentclass[11pt]{article}

\usepackage[a4paper,margin=1in]{geometry}
\usepackage{hyperref}
\usepackage{enumitem}
\usepackage{inconsolata}
\usepackage{xcolor}

\hypersetup{
  colorlinks=true,
  linkcolor=blue!70!black,
  urlcolor=blue!70!black,
  citecolor=blue!70!black
}

\begin{document}

\begin{center}
{\LARGE \textbf{Flowence}}\\[4pt]
{\large All-in-one Supermarket/Warehouse Management (PWA)}\\[2pt]
\url{https://github.com/Lichu23/flowence}
\end{center}

\section*{Overview}
Flowence is a full-stack web application for small and medium retail businesses. It enables multi-store management, inventory and stock control, barcode scanning via QuaggaJS, and end-to-end sales processing with Stripe. The app supports role-based access (owners and employees), invitations via SendGrid, and robust operational tooling such as low-stock alerts and receipts. The frontend is built with Next.js 15 + React 18 + TypeScript (PWA), and the backend is Node.js + Express + TypeScript with PostgreSQL.

\section*{Key Features}
\begin{itemize}[leftmargin=1.2em]
  \item Authentication \& Authorization: JWT-based with Passport.js; role-based access (owner/employee).
  \item Multi-store: Owners can invite employees; employees scoped to assigned stores.
  \item Inventory: CRUD products, unique barcodes per store, stock checks, low-stock alerts.
  \item Sales: Cart/checkout, cash/card/QR payments (Stripe), stock validation, receipts, returns.
  \item Barcode Scanning: Real-time scanning via QuaggaJS.
  \item Notifications: Email invites and notifications via SendGrid.
  \item Currency: Store currency with conversion preview and settings.
  \item PWA: Mobile-first, installable, responsive UI using Tailwind CSS.
\end{itemize}

\section*{Tech Stack}
\textbf{Frontend}
\begin{itemize}[leftmargin=1.2em]
  \item Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS
  \item PWA: Service worker, caching, installable manifest
\end{itemize}
\textbf{Backend}
\begin{itemize}[leftmargin=1.2em]
  \item Node.js, Express, TypeScript
  \item PostgreSQL (primary), with migrations and indexing recommendations
  \item JWT auth with Passport.js
  \item Stripe for payments, SendGrid for email
\end{itemize}

\section*{Repository Structure}
\begin{itemize}[leftmargin=1.2em]
  \item \texttt{flowence-client/}: Next.js frontend (TypeScript, Tailwind, PWA)
  \item \texttt{server/}: Node.js Express API (TypeScript)
\end{itemize}

\subsection*{Client (Next.js)}
\begin{verbatim}
src/
├─ app/                 # App Router pages
├─ components/          # UI, common, scanner, payments, etc.
├─ contexts/            # Auth, Store, Cart, Settings contexts
├─ hooks/               # Custom hooks
├─ lib/                 # API client, utilities
├─ types/               # Shared TypeScript definitions
└─ styles/              # Global styles
\end{verbatim}

\subsection*{Server (Express)}
\begin{verbatim}
server/
├─ controllers/         # Route handlers
├─ routes/              # Express routes
├─ services/            # Business logic
├─ models/              # DB models / repositories
├─ middleware/          # Auth, validation, error handling
├─ config/              # Env/config
└─ types/               # Server-side TypeScript definitions
\end{verbatim}

\section*{Prerequisites}
\begin{itemize}[leftmargin=1.2em]
  \item Node.js 18+
  \item PostgreSQL 13+
  \item Stripe account (API keys)
  \item SendGrid account (API key)
\end{itemize}

\section*{Environment Variables}
Create \texttt{.env.local} in \texttt{flowence-client/} and \texttt{.env} in \texttt{server/}. Typical variables:

\subsection*{Client}
\begin{verbatim}
NEXT_PUBLIC_API_URL=http://localhost:3002
\end{verbatim}

\subsection*{Server}
\begin{verbatim}
PORT=3002
DATABASE_URL=postgres://user:pass@localhost:5432/flowence
JWT_SECRET=supersecret
STRIPE_SECRET_KEY=sk_test_xxx
SENDGRID_API_KEY=SG.xxx
\end{verbatim}

\section*{Setup \& Development}
\subsection*{Install Dependencies}
\begin{verbatim}
# client
cd flowence-client
npm install

# server
cd ../server
npm install
\end{verbatim}

\subsection*{Run Development}
\begin{verbatim}
# Start client (Turbopack)
cd flowence-client
npm run dev

# Start server (nodemon)
cd ../server
npm run dev
\end{verbatim}

\section*{Build \& Production}
\begin{verbatim}
# Client (Next.js)
cd flowence-client
npm run build
npm run start

# Server (Express)
cd ../server
npm run build   # if ts build step is configured
npm run start
\end{verbatim}

\section*{Testing}
\begin{itemize}[leftmargin=1.2em]
  \item Unit/integration tests recommended on both client and server.
  \item Optional E2E: Playwright in \texttt{flowence-client}. Install with:
\begin{verbatim}
cd flowence-client
npm install --save-dev @playwright/test
npx playwright install
npx playwright test
\end{verbatim}
\end{itemize}

\section*{Security \& Compliance}
\begin{itemize}[leftmargin=1.2em]
  \item JWT expiry and refresh strategy
  \item Input validation/sanitization, parameterized queries
  \item HTTPS in production; secrets via environment variables
\end{itemize}

\section*{Accessibility \& Performance}
\begin{itemize}[leftmargin=1.2em]
  \item WCAG: keyboard navigation, color contrast, semantic structure
  \item Performance: memoization, lazy-loading, caching, DB indexing
\end{itemize}

\section*{Common Scripts}
\textbf{Client}
\begin{verbatim}
npm run dev      # Next dev (Turbopack)
npm run build    # Next build
npm run start    # Next start
\end{verbatim}
\textbf{Server}
\begin{verbatim}
npm run dev      # Nodemon
npm run start    # Node server
\end{verbatim}

\section*{License}
MIT (or your chosen license). See \texttt{LICENSE}.

\section*{Contributing}
Issues and PRs are welcome. Please follow TypeScript strictness, testing, and code review checklist.

\end{document}
