# Nupun Home Health — Admin Panel

An **ultra-premium, production-ready admin dashboard** for *Nupun Home Health
Care Services*. It is a pure **admin panel** (not the public website) that
connects to the existing FastAPI + MongoDB backend over REST.

Built to feel *luxury, medical, minimal and enterprise* — comparable in polish
to Linear, Stripe, Vercel, Clerk and Supabase dashboards.

---

## ✨ Highlights

- **Premium UI** — handcrafted components, glass header, soft shadows, rounded
  corners, generous spacing, and smooth Framer Motion micro-interactions.
- **Light & Dark themes** with system detection and persistence.
- **Collapsible sidebar**, floating glass header, breadcrumbs, global search
  (`⌘K`), notification center and user menu.
- **Executive dashboard** — 8 live stat cards, booking-trend area chart,
  booking-status donut, recent bookings / messages / applications, quick actions.
- **Full CRUD** for every module, driven by a reusable config engine (no
  duplicated table/form code) — real create/edit drawers, delete confirmation,
  search, filters, sorting and pagination.
- **Auth** — JWT access + refresh tokens with **automatic transparent token
  refresh**, RBAC-aware navigation and route guarding.
- **Skeletons, empty states, 404 / 500 / 403**, toasts, loading overlays.
- **Fully responsive** — desktop, laptop, tablet and mobile.

---

## 🧱 Tech Stack

React 19 · TypeScript (strict) · Vite 6 · Tailwind CSS · Radix UI (shadcn-style)
· TanStack Query · TanStack Table · React Hook Form + Zod · Framer Motion ·
React Router 7 · Axios · Lucide Icons · Recharts · Sonner · React Dropzone ·
React Helmet Async.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/            # shadcn-style primitives (button, card, dialog, table…)
│   ├── common/        # PageHeader, DataTable bits, EmptyState, ImageUpload…
│   ├── layout/        # Sidebar, Header, Breadcrumbs, GlobalSearch, UserMenu…
│   ├── dashboard/     # StatCard, charts
│   └── resource/      # Config-driven CRUD engine (ResourceView + ResourceForm)
├── config/            # env, navigation, per-resource CRUD configs
├── contexts/          # Auth + Theme providers
├── providers/         # App-wide provider composition
├── hooks/             # useCrud, useNotifications
├── pages/             # One page per route (Dashboard, Bookings, Users…)
├── routes/            # Router + ProtectedRoute
├── services/          # Axios client, endpoints, per-domain services
├── types/             # API envelope + domain models
├── lib/               # utils (cn, formatters…)
└── styles/            # Tailwind globals + design tokens
```

### The CRUD engine

Content modules (Services, Equipment, Blogs, Careers, Videos, Testimonials,
FAQ) are described by a single `ResourceConfig` object (columns + form fields +
filters + permissions). `ResourceView` renders the table, toolbar, drawer form,
pagination and delete flow from that config — keeping the codebase DRY while
every page stays fully functional. Bespoke pages (Dashboard, Bookings, Contact
inbox, Media Library, Settings, SEO, Users, Roles, Notifications, Activity Logs,
Profile) are hand-built.

---

## 🔌 Backend Connection

All requests go through a central Axios client (`src/services/api/client.ts`):

- Attaches the JWT access token to every request.
- On a `401`, **transparently refreshes** the token (single-flight) and retries
  the original request; on refresh failure it logs out and redirects to `/login`.
- Unwraps the backend envelope `{ success, message, data, errors }`.
- Normalises errors into friendly toast messages with field-level details.

Set the API base URL in `.env`:

```bash
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME="Nupun Home Health Care Services"
```

> **CORS note:** open the app on the same host the backend allows. If the
> backend's `CORS_ORIGINS` lists `http://localhost:5173`, use
> `http://localhost:5173` (not `127.0.0.1`).

---

## 🚀 Getting Started

```bash
# 1. Install dependencies (React 19 peer ranges → legacy flag)
npm install --legacy-peer-deps

# 2. Configure environment
cp .env.example .env      # then edit VITE_API_BASE_URL

# 3. Start the dev server
npm run dev               # http://localhost:5173
```

Make sure the FastAPI backend is running (default `http://localhost:8000`).
Log in with your seeded admin account.

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Strict TypeScript check |

---

## 🗂️ Modules

Dashboard · Services · Bookings (detail drawer, approve/reject/cancel, assign
staff, CSV export) · Medical Equipment · Rental Requests · Careers · Job
Applications (resume preview) · Blogs · Videos · Testimonials · FAQ · Contact
Messages (inbox UI) · SEO (per-page meta/OG/schema) · Media Library (Cloudinary
grid) · Website Settings (brand, contact, social) · Users · Roles (permission
matrix) · Notifications · Activity Logs (timeline + CSV) · Profile.

---

## 🎨 Design Tokens

The palette is defined as HSL CSS variables in `src/styles/globals.css` and
mapped in `tailwind.config.js`:

| Token | Value |
| --- | --- |
| Primary | `#33C4C7` |
| Accent | `#1F8E94` |
| Secondary | `#EAF6F6` |
| Background | `#F8FCFC` |
| Success / Warning / Danger | `#10B981` / `#F59E0B` / `#EF4444` |

---

## 🏗️ Production Build

```bash
npm run build      # outputs to dist/
npm run preview
```

Deploy `dist/` to any static host (Vercel, Netlify, Render Static, Nginx). Set
`VITE_API_BASE_URL` to your deployed backend URL at build time.

---

© Nupun Home Health Care Services.
