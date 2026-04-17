# WealthPilot — Frontend

React + TypeScript frontend for the WealthPilot financial advisor platform. Provides a dashboard to manage household financial data end-to-end: members, investment accounts, bank details, Excel and audio ingestion, AI conflict review, aggregated insights, and workspace administration.

## Tech Stack

- **React 19** with **TypeScript**
- **Vite** — build tool and dev server
- **Bun** — package manager
- **shadcn/ui** + **Tailwind CSS v4** — UI components and styling
- **TanStack Query (React Query v5)** — data fetching, caching, mutations
- **Recharts** — charts and data visualisation
- **React Router v7** — client-side routing
- **Axios** — HTTP client
- **Sonner** — toast notifications
- **Lucide React** — icon system

## Prerequisites

- [Bun](https://bun.sh) installed (`curl -fsSL https://bun.sh/install | bash`)
- The [WealthPilot backend](https://github.com/jay-arora31/wealthpilot-backend) running (locally or deployed)

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppLayout.tsx     # Sidebar, top bar, breadcrumbs, global job indicators
│   │   └── ui/                   # shadcn/ui base components
│   ├── features/
│   │   ├── households/
│   │   │   ├── components/       # Upload dialogs, tables, KPI cards, job pills,
│   │   │   │                     # conflict review, audio job toast/card
│   │   │   ├── hooks/            # use-households, use-members, use-accounts,
│   │   │   │                     # use-conflicts, use-active-jobs, use-job-poller
│   │   │   └── pages/            # HouseholdListPage, HouseholdDetailPage
│   │   ├── insights/
│   │   │   ├── components/       # All chart components (NetWorth, Liquidity, etc.)
│   │   │   ├── hooks/            # Insights data hooks
│   │   │   └── pages/            # InsightsPage
│   │   └── settings/
│   │       ├── hooks/            # use-admin (reset-all)
│   │       └── pages/            # SettingsPage (danger zone)
│   ├── lib/
│   │   ├── api.ts                # Axios client — household/member/account/bank/
│   │   │                         # conflict/insight/job/admin endpoints
│   │   └── format.ts             # Shared currency/number formatters
│   ├── types/                    # TypeScript interfaces
│   └── App.tsx                   # Routes + React Query provider
├── .env.example
├── vercel.json
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
| `/` | Household list — search, sort, Excel upload |
| `/households/:id` | Household detail — members, accounts, bank details, financials, audio upload, conflict review |
| `/insights` | Insights dashboard with aggregated charts and KPI cards |
| `/settings` | Workspace settings — danger zone (delete all data) |

## Key Features

### Household Management
- List page with search and sort by name / income / net worth / members
- Detail page with:
  - Financial KPI cards (income, net worth, liquid net worth, expenses, risk tolerance, time horizon)
  - Members table with inline add / edit / remove
  - Investment accounts table with ownership distribution, inline CRUD
  - Bank details table with inline edit / delete
  - Editable household fields dialog
  - Delete household with confirmation

### Excel Upload
- Drag-and-drop or browse `.xlsx` / `.xls` files
- Upload returns immediately with a `job_id` — the UI then polls `/api/jobs/{id}`
- Real-time progress surfaces in the header `JobStatusPill` and on the upload dialog
- Post-upload review of the AI-generated column mappings in a collapsible panel

### Audio Upload
- Upload `.mp3` / `.wav` / `.m4a` / `.webm` / `.mp4` / `.ogg` recordings from the household detail page
- Inline `AudioJobCard` shows live progress on the owning household's page
- Global `AudioJobFloatingToast` tracks audio jobs when the user navigates away, so progress follows them around the app
- Result shows fields updated and conflicts flagged — with the transcript quote behind each change

### Background Job Tracking
- `useActiveJobs` persists job metadata in `localStorage`, so a full-page refresh re-attaches to the job
- `useJobPoller` polls job status with exponential intervals and stops on terminal state
- `JobStatusPill` in the top bar summarises any in-flight Excel or audio jobs

### Conflict Review
- Banner on household detail when pending conflicts exist
- Review dialog shows current value → incoming value with source quote (for audio) or sheet origin (for Excel)
- One-click Accept or Reject per conflict, with optimistic updates

### Insights Dashboard
- 8 charts: Income vs Expenses, Net Worth Breakdown, Account Distribution, Top Households by Wealth, Members per Household, Liquidity Ratios, Risk Tolerance, Tax Bracket
- KPI cards: Portfolio Income, Total Net Worth, Risk Profile Coverage
- Click any bar/segment to drill down to the household detail page

### Settings (Danger Zone)
- Settings → "Delete all data" wipes every household plus its members, accounts, bank details, and conflicts via `DELETE /api/admin/reset`
- Double-confirmation dialog prevents accidental resets

## API Client

All network calls go through `src/lib/api.ts`, organized by domain:

| Export | Purpose |
|--------|---------|
| `householdApi` | list / get / create / update / delete / upload-excel / upload-audio |
| `memberApi` | list / create / update / delete |
| `accountApi` | list / create / update / delete (financial accounts) |
| `bankDetailApi` | update / delete |
| `conflictApi` | list / resolve |
| `insightApi` | get aggregated insights |
| `jobApi` | getStatus for background jobs |
| `adminApi` | resetAllData |

## Build for Production

```bash
bun run build
```

TypeScript is compiled (`tsc -b`) and Vite outputs to `dist/`. Serve with any static file host (Vercel, Netlify, nginx). A `vercel.json` is included for zero-config Vercel deploys — set `VITE_API_URL` in the Vercel project settings before deploying.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api` |

> All Vite env vars must be prefixed with `VITE_` to be exposed to the browser bundle.
