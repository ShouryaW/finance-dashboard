# FinDash — Personal Finance Dashboard

A full-stack web application for tracking income, expenses, budgets, and savings goals with interactive data visualizations and a polished dark/light mode UI.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Flask-3.0-000?logo=flask&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![Tech Stack](https://img.shields.io/badge/Chart.js-4-FF6384?logo=chartdotjs&logoColor=white)
![Tests](https://img.shields.io/badge/tests-33_passed-brightgreen)

## Features

- **Dashboard** — Balance, income, and expense summary cards with monthly forecast, spending pie chart, income vs. expense bar chart, and trend line chart with net savings
- **Transactions** — Add income/expenses with categorized emoji grids, search, filter, sort, paginate, delete with animation, and export to CSV
- **Budgets** — Set monthly category limits with gradient progress bars, percentage tracking, over-budget alerts with shake animation
- **Savings Goals** — Set goals with visual SVG progress rings, icon picker, deadline tracking, quick-add fund buttons (+$50/+$100/+$500)
- **Authentication** — JWT-based auth with bcrypt password hashing, protected routes, auto-redirect on token expiry
- **Dark Mode** — Full dark/light theme toggle persisted to localStorage
- **Animations** — Skeleton loading screens, staggered fade-ins, hover-lift cards, success checkmark, error shake, shimmer effects

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Chart.js (Pie, Bar, Line), Axios, React Router |
| Backend | Python Flask, Flask-SQLAlchemy, Flask-CORS |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT (PyJWT) + bcrypt |
| Testing | pytest (33 tests) |

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed_data.py             # Creates demo user + mock transactions
python app.py                   # Starts Flask on http://localhost:5001
```

### Frontend

```bash
cd frontend
npm install
npm start                       # Starts React on http://localhost:3000
```

### Demo Account

```
Username: demo
Password: demo123
```

> Tip: Run `python seed_clean.py` instead of `seed_data.py` for a fresh database with no mock data.

## Running Tests

```bash
cd backend
pytest tests/ -v
```

```
33 passed — covers auth (signup/login/token), transactions (CRUD, filtering, data isolation), budgets (CRUD, progress calculation, over-budget detection)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/signup` | Create account |
| POST | `/api/login` | Get JWT token |
| GET | `/api/me` | Get current user |
| GET | `/api/dashboard` | Summary stats + charts data |
| GET | `/api/transactions` | List with search/filter/sort/pagination |
| POST | `/api/transactions` | Create transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/transactions/export` | Download CSV |
| GET | `/api/budgets` | List with spent/percentage |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/:id` | Update budget |
| DELETE | `/api/budgets/:id` | Delete budget |
| GET | `/api/goals` | List savings goals |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |

## Architecture

```
finance-dashboard/
├── backend/
│   ├── app.py              # Flask app + all API routes
│   ├── models.py           # SQLAlchemy models (User, Transaction, Budget, Goal)
│   ├── auth.py             # JWT + bcrypt utilities + @token_required decorator
│   ├── database.py         # DB initialization
│   ├── seed_data.py        # Mock data generator
│   ├── seed_clean.py       # Clean DB with just demo user
│   ├── requirements.txt
│   └── tests/
│       ├── conftest.py     # Test fixtures (app, client, auth_header)
│       ├── test_auth.py    # 10 auth tests
│       ├── test_transactions.py  # 13 transaction tests
│       └── test_budgets.py      # 10 budget tests
└── frontend/
    └── src/
        ├── App.js          # Router + Navbar + dark mode toggle
        ├── utils/api.js    # Axios instance with JWT interceptors
        └── components/
            ├── Dashboard.jsx      # Summary cards + 3 charts
            ├── Transactions.jsx   # Table with search/filter/sort
            ├── AddTransaction.jsx # Expense/Income tabs + category grid
            ├── Budgets.jsx        # Budget cards + progress bars
            ├── Goals.jsx          # Goal rings + quick-add
            ├── PieChart.jsx       # Category spending donut
            ├── BarChart.jsx       # Monthly income vs expenses
            ├── LineChart.jsx      # Trend lines + net savings
            ├── Login.jsx
            └── Signup.jsx
```

## What I'd Improve Next

- Add recurring transaction scheduling with notification alerts
- Implement real-time WebSocket updates for live dashboard
- Add multi-currency support with exchange rate API
- Build receipt OCR scanning with auto-categorization
- Add end-to-end tests with Cypress
- Deploy to AWS/Vercel with CI/CD pipeline
