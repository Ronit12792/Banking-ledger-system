# Banking Ledger System — Frontend

React + Vite frontend for the Banking Ledger System backend.

## Setup

```bash
npm install
npm run dev
```

Runs on **http://localhost:5173** — proxies `/api/*` to `http://localhost:3000`.

> Make sure your backend is running on port 3000 before starting the frontend.

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign in with email & password |
| `/register` | Create a new user account |
| `/dashboard` | Overview of accounts and balances |
| `/accounts` | Create and manage bank accounts |
| `/transfer` | Transfer funds between accounts |
| `/system` | Seed initial funds (system user only) |

## Tech Stack

- **React 18** + **React Router v6**
- **Vite 5** (with `/api` proxy to backend)
- **CSS Variables** — dark industrial theme
- **Fonts**: Syne (display) · DM Mono · DM Sans

## API Integration

All API calls go through `src/services/api.js`:
- Auth token stored in `localStorage` as `bls_token`
- User info stored in `localStorage` as `bls_user`
- Token sent as `Authorization: Bearer <token>` header on every protected request
- Cookies also handled automatically (credentials: 'include')

## Notes

- Idempotency keys are auto-generated (`txn-<timestamp>-<random>`) per transfer session
- Balances are computed in real-time by querying `/api/accounts/balance/:id`
- The System Admin page calls `POST /api/transactions/system/initial-funds` which requires a system user JWT — regular users will get a 403
