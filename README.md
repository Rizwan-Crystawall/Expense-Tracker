# Expense Tracker

A full-stack expense tracker with a **React** frontend and **Node.js** backend.

## Features

- Add income and expenses
- View total balance
- Monthly summary with income, expenses, and net
- Charts and graphs (Chart.js)
  - Bar chart: monthly income vs expenses
  - Doughnut chart: expenses by category

## Project Structure

```
Expense Tracker/
├── backend/          # Node.js + Express API
│   └── src/
│       ├── index.js
│       ├── routes/
│       ├── services/   # Balance & summary calculations
│       └── data/       # JSON file storage
└── frontend/         # React + Vite
    └── src/
        ├── components/
        └── api.js
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)

## Setup

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

The API runs at **http://localhost:5000**

### 2. Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:3000**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List all transactions |
| POST | `/api/transactions` | Add income or expense |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/transactions/balance` | Get total balance |
| GET | `/api/transactions/summary/:year/:month` | Monthly summary |
| GET | `/api/transactions/charts?months=6` | Chart data |

### Add transaction example

```json
POST /api/transactions
{
  "type": "expense",
  "amount": 45.50,
  "description": "Groceries",
  "category": "Food",
  "date": "2026-06-10"
}
```

## What You'll Learn

- **Data visualization** — Chart.js bar and doughnut charts
- **Backend calculations** — Balance, monthly summaries, category breakdowns
- **Form handling** — React controlled forms with validation
