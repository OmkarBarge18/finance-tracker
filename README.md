# FinanceOS: Next.js + PostgreSQL Finance Tracker

A reimagined, modernized, full-stack Personal Finance Platform built with **Next.js 14 (App Router)**, **PostgreSQL 18**, **GSAP**, **Anime.js**, and **Tailwind CSS**.

---

## Highlights & Modernizations

- ⚡ **Next.js 14 App Router Full-Stack**: Complete React 18/19 server-side rendering, API route handlers, and unified architecture.
- 🐘 **Native PostgreSQL Integration**: Direct connection pooling via `pg` with automatic table creation, constraint migrations, and category seeding.
- 🛡️ **Resilient Fallback Mode**: If PostgreSQL authentication is pending, the app automatically runs in a zero-downtime fallback mode so UI, charts, and animations work out-of-the-box.
- 🪄 **GSAP 3.12 & Anime.js 3.2 Animations**:
  - Interactive 3D tilt micro-interactions on cards with perspective tracking.
  - Elastic spring physics on buttons and modal elements.
  - Smooth animated number counters for net worth, income, expenses, and savings velocity.
  - Staggered entrance timeline for lists and grid cards.
  - Celebratory confetti bursts upon recording transactions or staying under budget.
- 🎨 **Fintech Dark Mode UI/UX**:
  - Glassmorphic panels, neon emerald and indigo glow accents, crisp typography.
  - Keyboard-driven command palette (`Ctrl+K` / `Cmd+K`) for quick navigation and actions.
- 📊 **Deep Analytics & Visualizations**:
  - Cash flow dynamics with toggleable Area and Bar charts (Recharts).
  - Expense breakdown donut charts with real-time category allocation meters.
  - Multi-year savings rate velocity and monthly net surplus tracking.
- 📁 **CSV Statement Import & Export**:
  - Drag-and-drop bank statement CSV parser with intelligent column auto-detection (Date, Description, Amount).
  - One-click CSV export with filtered dataset downloads.
- 🎯 **Envelopes, Budgets & Goals**:
  - Monthly spending limits per category with overspending alerts.
  - Savings milestones (Emergency fund, travel, tech investments) with target countdowns.
- 💳 **Multi-Account & Subscriptions**:
  - Checking, savings, credit cards, investments, and cash wallets.
  - Atomic account-to-account balance transfers.
  - Recurring subscriptions tracking with monthly and annual run-rate forecasts.

---

## Getting Started

### 1. Install & Run Dev Server

```bash
# Install dependencies (already installed)
npm install

# Start Next.js development server
npm run dev
```

The application runs at **[http://localhost:3000](http://localhost:3000)**.

---

## PostgreSQL Database Connection

The app connects to your local PostgreSQL 18 instance running on `localhost:5432`.

### Option A: In-App Connection Panel (Easiest)
1. Open the app in your browser at `http://localhost:3000`.
2. Click the **Postgres: Config** pill in the topbar or the bottom-left sidebar.
3. Enter your PostgreSQL `postgres` password and click **Connect & Migrate**.
4. The database tables (`accounts`, `categories`, `transactions`, `budgets`, `recurring_bills`, `savings_goals`) will be automatically created and populated!

### Option B: `.env.local` File
Edit `.env.local` at the root of the project:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/finance_tracker
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=YOUR_PASSWORD
PGDATABASE=finance_tracker
```

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx               # Main Dashboard: KPIs, Cash Flow, Donut, Goals
│   │   ├── layout.tsx             # Root Layout with AppShell & Fonts
│   │   ├── globals.css            # Obsidian Fintech Dark Theme & Glassmorphism
│   │   ├── transactions/page.tsx  # Transactions Ledger, Filters, CSV Export
│   │   ├── budgets/page.tsx       # Category Budgets & Savings Goals
│   │   ├── accounts/page.tsx      # Liquidity Cards, Fund Transfers, Add Account
│   │   ├── recurring/page.tsx     # Subscriptions, Recurring Bills & Forecasts
│   │   ├── analytics/page.tsx     # Spending Velocity, Multi-year Net Surplus
│   │   └── api/                   # Server Route Handlers
│   │       ├── db-status/route.ts # Live PostgreSQL test & migrate
│   │       ├── accounts/route.ts  # Accounts CRUD
│   │       ├── categories/route.ts# Categories CRUD
│   │       ├── transactions/      # Transactions CRUD & Bulk CSV Import
│   │       ├── budgets/route.ts   # Budgets CRUD & Progress
│   │       ├── recurring/route.ts # Recurring Subscriptions CRUD
│   │       └── analytics/route.ts # Monthly & Category Analytics
│   ├── components/
│   │   ├── layout/                # Sidebar, Topbar, CommandPalette, AppShell
│   │   ├── dashboard/             # StatCards, CashFlowChart, CategoryBreakdown
│   │   ├── transactions/          # TransactionModal, CsvImportModal
│   │   └── ui/                    # DbStatusModal, Badges, Tooltips
│   └── lib/
│       ├── db.ts                  # PostgreSQL Connection Pool, Schema Auto-init
│       ├── animations.ts          # GSAP & Anime.js Physics & Timelines
│       ├── types.ts               # Unified TypeScript Interfaces
│       └── utils.ts               # Currency & Date Formatters
├── package.json
├── tailwind.config.js
└── next.config.mjs
```

---

## Keyboard Shortcuts

- `Ctrl + K` / `Cmd + K`: Open Command Palette (quick search, actions, page navigation)
- `Esc`: Close any open modal
