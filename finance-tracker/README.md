# Personal Finance Tracker

Full-stack finance tracker: FastAPI + PostgreSQL backend, React + Vite + Zustand + Recharts frontend.

## Stack

| Layer     | Choice                        | Why                                           |
|-----------|-------------------------------|-----------------------------------------------|
| Backend   | FastAPI + Python              | Fast, typed, auto-generates /docs             |
| ORM       | SQLAlchemy + Alembic          | Mature ORM, migration tooling                 |
| Database  | PostgreSQL                    | Decimal precision for money, powerful queries |
| Frontend  | React + Vite + TypeScript     | Fast dev server, type safety                  |
| State     | Zustand + React Query         | UI state + server cache separated cleanly     |
| Charts    | Recharts                      | React-native, composable                      |
| Forms     | React Hook Form               | Performant, uncontrolled inputs               |
| CSV       | Papa Parse                    | Robust CSV with quoted fields, BOM handling   |

## Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ running locally

## Backend Setup

```bash
cd backend

# 1. Create virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create the database
# Open psql or pgAdmin and run:
# CREATE DATABASE finance_tracker;

# 4. Set up environment
venv\Scripts\activate
# Edit .env with your PostgreSQL credentials

# 5. Start the API server
uvicorn main:app --reload
```

API runs at http://localhost:8000
Interactive docs at http://localhost:8000/docs

## Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

App runs at http://localhost:5173

The Vite proxy forwards /api requests to http://localhost:8000 automatically.

## Project Structure

```
finance-tracker/
├── backend/
│   ├── main.py            ← FastAPI app, CORS, startup
│   ├── database.py        ← SQLAlchemy engine + session
│   ├── models.py          ← ORM table definitions
│   ├── schemas.py         ← Pydantic request/response schemas
│   ├── seed.py            ← Default categories on first run
│   ├── requirements.txt
│   └── routers/
│       ├── accounts.py    ← CRUD accounts
│       ├── categories.py  ← CRUD categories
│       ├── transactions.py← CRUD + analytics + bulk CSV import
│       └── budgets.py     ← CRUD budgets + progress endpoint
│
└── frontend/
    └── src/
        ├── types.ts       ← All TypeScript interfaces
        ├── api/client.ts  ← Axios instance + all API calls
        ├── store/         ← Zustand UI state
        ├── hooks/         ← React Query hooks
        ├── utils/         ← format.ts, csv.ts
        ├── components/
        │   ├── layout/    ← Sidebar, TopBar
        │   ├── dashboard/ ← SummaryCards, SpendingChart, CategoryPieChart
        │   ├── transactions/← TransactionTable, TransactionForm, FilterBar, CSVImport
        │   ├── budgets/   ← BudgetList, BudgetProgressBar
        │   └── ui/        ← MonthPicker
        └── pages/         ← Dashboard, Transactions, Budgets, Accounts
```

## Key design decisions

**Amounts are always positive** — the `type` field (income/expense/transfer) determines direction. This avoids negative number confusion in queries.

**React Query for server data, Zustand for UI state** — transactions/accounts/budgets live in React Query cache. Filters, selected account, active month live in Zustand and persist to localStorage.

**Unit conversion at display time** — currency formatting happens in `format.ts`, never stored in different units.

**CSV import is client-side** — Papa Parse runs in the browser. Only the final mapped transaction array is sent to the backend as a single bulk POST.
