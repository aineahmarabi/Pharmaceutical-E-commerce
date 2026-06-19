# PharmaCare — Pharmaceutical E-Commerce Platform

> **Your health, delivered.** A premium, production-ready pharmaceutical e-commerce web application built for the Kenyan market.

---

## Overview

PharmaCare is a full-stack pharmaceutical e-commerce platform with a customer-facing storefront and a comprehensive admin panel. Built with Next.js 15 App Router and TypeScript, it is designed to be connected to a real backend — every data surface shows professional skeleton loaders until live product and order data is wired in.

---

## Features

### Storefront
- **Animated hero** with Framer Motion scroll reveals and floating skeleton product cards
- **Mega-dropdown navigation** — Categories, Conditions, and Brands with icon-keyed columns and featured promo panels
- **Category browsing** — 8 categories with colour-coded icons (Pain & Fever, Cold & Flu, Vitamins, Skincare, Baby & Mum, Digestive, Diabetes, Personal Care)
- **Condition browsing** — 10 conditions with matching icons (Headaches, Cough, Immune Support, Acne, Allergies, Blood Sugar, Heart Health, Joints, Sleep, Women's Health)
- **Brand browsing** — All major pharmaceutical brands with dedicated pages
- **Search overlay** — Full-screen search with category quick-links, popular searches, and keyboard navigation
- **Shopping cart** — Zustand-persisted with animated badge counter
- **Wishlist** — Persisted across sessions with toggle support
- **Account portal** — Orders, wishlist, profile, addresses
- **Pages** — About, Contact, FAQ, Blog, Store Locator, Checkout, New Arrivals, Trending, Best Sellers, Special Offers
- **WhatsApp CTA** — Floating pharmacist chat button
- **Skeleton loaders** — Every data surface uses professional skeleton loaders; zero mock data is ever rendered

### Admin Panel (`/admin`)
- **Shopify-grade sidebar** — Collapsible on desktop with tooltip mode, slide-in drawer on mobile with backdrop blur
- **Breadcrumb topbar** — Context-aware title, search shortcut `⌘K`, notifications bell, avatar
- **Dashboard** — KPI cards, order value chart, status breakdown, recent orders panel, low-stock alerts
- **Orders** — Searchable table view with status and date columns
- **Products** — Table with search and Add product CTA
- **Inventory** — Stock-level filter (All / Low stock / Out of stock)
- **Customers** — Customer table derived from order history
- **Analytics** — Multi-chart layout with KPI row, revenue chart, category breakdown
- **POS Terminal** — Split-panel point-of-sale interface
- **Brands, Conditions, Categories** — CRUD-ready table views
- **Staff & Audit Log** — Skeleton-first (awaiting backend integration)
- **Settings** — Configuration page

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) — App Router, TypeScript strict mode |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) — `@theme` directive, CSS variables |
| Animation | [Framer Motion 12](https://www.framer-motion.com/) — all reveals, hovers, transitions |
| State | [Zustand 5](https://zustand-demo.pmnd.rs/) — cart + wishlist with `persist` middleware |
| Icons | [lucide-react](https://lucide.dev/) |
| Font | [Hanken Grotesk](https://fonts.google.com/specimen/Hanken+Grotesk) via `next/font/google` |
| Images | `next/image` with Unsplash remote patterns |
| Deployment | [Vercel](https://vercel.com/) |

---

## Design System — Apothecary Petrol

| Token | Value | Usage |
|---|---|---|
| `--color-petrol` | `#0E4D45` | Primary brand, sidebar, CTAs |
| `--color-signal` | `#E84545` | Alerts, badges, active indicators |
| `--color-ink` | `#111827` | Dark backgrounds, hero |
| `--color-paper` | `#FFFFFF` | Cards, surfaces |
| `--color-porcelain` | `#F5F6F7` | Page background |
| `--font-display` | Hanken Grotesk | All headings |
| `--font-mono` | monospace | Prices, IDs, doses, badges |

---

## Project Structure

```
pharmacare/
├── src/
│   ├── app/
│   │   ├── (store)/              # Public storefront — served at /
│   │   │   ├── page.tsx          # Home
│   │   │   ├── products/         # Product listing + detail
│   │   │   ├── category/[slug]/  # Category pages
│   │   │   ├── condition/[slug]/ # Condition pages
│   │   │   ├── brand/[slug]/     # Brand pages
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── account/          # Orders, wishlist, profile
│   │   │   └── ...
│   │   ├── (admin)/              # Admin panel — served at /admin
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx      # Dashboard
│   │   │   │   ├── orders/
│   │   │   │   ├── products/
│   │   │   │   ├── customers/
│   │   │   │   ├── analytics/
│   │   │   │   ├── inventory/
│   │   │   │   ├── pos/
│   │   │   │   └── ...
│   │   │   └── login/
│   │   ├── globals.css           # Tailwind v4 @theme design tokens
│   │   └── layout.tsx            # Root layout, fonts metadata
│   ├── components/
│   │   ├── admin/                # Sidebar, TopBar
│   │   ├── layout/               # Header (mega-menu), Footer, WhatsAppButton
│   │   ├── search/               # SearchOverlay
│   │   ├── sections/             # Hero, CategorySection, ConditionSection, TrendingSection, ...
│   │   └── ui/                   # Skeleton, ProductCard, ProductImagePlaceholder, ClassBadge, Toast
│   ├── hooks/
│   │   └── useSimulatedLoading.ts
│   ├── lib/
│   │   ├── config/branding.ts    # Store name, contact, currency, delivery threshold
│   │   ├── fixtures/             # Type definitions + seed arrays (products, orders, categories)
│   │   ├── images.ts             # CDN image references
│   │   └── utils.ts              # cn() helper
│   └── store/
│       └── cart.ts               # Zustand cart + wishlist stores
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install & Run

```bash
# Clone
git clone https://github.com/aineahmarabi/Pharmaceutical-E-commerce.git
cd Pharmaceutical-E-commerce

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

### Build for Production

```bash
npm run build
npm start
```

---

## Deployment on Vercel

This project is pre-configured for zero-config Vercel deployment.

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `aineahmarabi/Pharmaceutical-E-commerce` repository
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy** — no environment variables are required for the base build

---

## Routes Reference

| Route | Description |
|---|---|
| `/` | Home — hero, categories, conditions, trending, offers |
| `/products` | All products with category and brand filters |
| `/products/[slug]` | Product detail page |
| `/category/[slug]` | Category product listing |
| `/condition/[slug]` | Condition product listing |
| `/brand/[slug]` | Brand product listing |
| `/cart` | Shopping cart |
| `/checkout` | Checkout flow |
| `/account` | Account portal |
| `/account/orders` | Order history |
| `/account/orders/[id]` | Order detail |
| `/account/wishlist` | Saved items |
| `/search?q=` | Search results |
| `/offers` | Special offers |
| `/new-arrivals` | New arrivals |
| `/trending` | Trending products |
| `/best-sellers` | Best sellers |
| `/about` | About us |
| `/contact` | Contact page |
| `/faq` | Frequently asked questions |
| `/blog` | Blog listing |
| `/store-locator` | Find a store |
| `/admin` | Admin dashboard |
| `/admin/orders` | Order management |
| `/admin/products` | Product management |
| `/admin/customers` | Customer records |
| `/admin/analytics` | Analytics & reporting |
| `/admin/inventory` | Stock management |
| `/admin/pos` | Point-of-sale terminal |
| `/admin/brands` | Brand management |
| `/admin/conditions` | Condition management |
| `/admin/categories` | Category management |
| `/admin/staff` | Staff management |
| `/admin/audit-log` | System audit log |
| `/admin/settings` | Admin settings |

---

## Connecting a Backend

Every data surface in the app is skeleton-first and backend-ready. The integration pattern:

1. Replace skeleton loaders in each page with `fetch` / `SWR` / `React Query` calls to your API
2. Connect the cart store (`src/store/cart.ts`) to your orders API on checkout submission
3. Wire the search overlay (`src/components/search/SearchOverlay.tsx`) to your product search endpoint
4. Update `src/lib/config/branding.ts` with your real store name, contact details, and currency

---

## License

Private — all rights reserved.

© 2026 PharmaCare. Built for Kenya.
