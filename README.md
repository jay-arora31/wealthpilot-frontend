# WealthPilot — Frontend

React + TypeScript frontend for the WealthPilot financial advisor platform. Provides a dashboard to manage household financial data, upload Excel files and audio recordings, review AI-detected conflicts, and visualise aggregated insights.

## Tech Stack

- **React 19** with **TypeScript**
- **Vite** — build tool and dev server
- **Bun** — package manager
- **shadcn/ui** + **Tailwind CSS v4** — UI components and styling
- **TanStack Query (React Query v5)** — data fetching and caching
- **Recharts** — charts and data visualisation
- **React Router v7** — client-side routing
- **Axios** — HTTP client

## Prerequisites

- [Bun](https://bun.sh) installed (`curl -fsSL https://bun.sh/install | bash`)
- The [WealthPilot backend](https://github.com/jay-arora31/wealthpilot-backend) running (locally or deployed)

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/          # AppLayout, sidebar, navigation
│   │   └── ui/              # shadcn/ui base components
│   ├── features/
│   │   ├── households/
│   │   │   ├── components/  # Upload dialogs, tables, conflict review
│   │   │   ├── hooks/       # React Query hooks
│   │   │   └── pages/       # HouseholdListPage, HouseholdDetailPage
│   │   └── insights/
│   │       ├── components/  # All chart components
│   │       ├── hooks/       # Insights data hooks
│   │       └── pages/       # InsightsPage
│   ├── lib/
│   │   ├── api.ts           # Axios API client
│   │   └── format.ts        # Shared currency/number formatters
│   ├── types/               # TypeScript interfaces
│   └── App.tsx              # Routes
├── .env.example
└── package.json
```

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/jay-arora31/wealthpilot-frontend.git
cd wealthpilot-frontend
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:8000/api
```

Point this at your running backend. If using the deployed Cloud Run backend:

```env
VITE_API_URL=https://wealthpilot-backend-753284960531.europe-west1.run.app/api
```

### 4. Start the development server

```bash
bun run dev
```

App will be available at **http://localhost:5173**

## Pages

| Route | Description |
|-------|-------------|
| `/households` | List all households with search and sort |
| `/households/:id` | Household detail — members, accounts, financials, bank details |
| `/insights` | Insights dashboard with charts |

## Key Features

### Household Management
- List page with search, sort by name / income / net worth / members
- Detail page with full financial profile, member list, investment accounts, bank details
- Edit household fields inline
- Delete household with confirmation

### Excel Upload
- Drag and drop or browse `.xlsx` / `.xls` files
- Real-time job progress via polling
- Post-upload review of AI column mappings in a collapsible panel

### Audio Upload
- Upload `.mp3` / `.wav` / `.m4a` recordings per household
- Whisper transcription + GPT extraction shown in real-time
- Result shows fields updated and conflicts flagged

### Conflict Review
- Banner on household detail when pending conflicts exist
- Review dialog shows current value → incoming value with source quote
- One-click Accept or Reject per conflict

### Insights Dashboard
- 8 charts: Income vs Expenses, Net Worth Breakdown, Account Distribution, Top Households by Wealth, Members per Household, Liquidity Ratios, Risk Tolerance, Tax Bracket
- KPI cards: Portfolio Income, Total Net Worth, Risk Profile Coverage
- Click any bar/segment to drill down to the household detail page

## Build for Production

```bash
bun run build
```

Output goes to `dist/`. Serve with any static file host (Vercel, Netlify, nginx).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api` |

> All Vite env vars must be prefixed with `VITE_` to be exposed to the browser bundle.
