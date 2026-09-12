# TredIN — Clean Rebuild (USER + ADMIN + BACKEND)

A hosting-first rebuild of the TredIN trading platform. The previous giant HTML pages are replaced by small, maintainable TypeScript frontends and a single Node/PostgreSQL API.

## Architecture
- `apps/user` — customer trading workspace (TypeScript + DOM, zero runtime frontend dependencies)
- `apps/admin` — admin control center (TypeScript + DOM, zero runtime frontend dependencies)
- `backend` — Node.js API + PostgreSQL + auth/RMS/order/finance/KYC/support/audit workflows
- `render.yaml` — one Blueprint for backend, user, admin and Postgres

## End-to-end workflows
USER: login → dashboard → market → order/RMS → orders → positions → funds → KYC → support → profile.
ADMIN: login → dashboard → users → orders → KYC approve/reject → finance approve/reject → risk → support → audit → reconciliation.
BACKEND: auth/refresh/logout/register, profile, market, orders, executions/positions, portfolio, RMS/margin, funds/ledger, KYC documents/submission, support, admin controls and audit/reconciliation.

## Demo mode
If `TREDIN_API` is not set in browser localStorage, both UIs remain fully navigable in local demo mode. This is intentionally separate from live trading. Live production requires PostgreSQL, strong secrets and real market/broker integrations.

To point the browser at the API:
```js
localStorage.setItem('TREDIN_API','https://YOUR-BACKEND.onrender.com')
location.reload()
```

## Render
1. Push this repository to GitHub with the repository root exactly as this folder.
2. In Render choose **New → Blueprint** and select the repo.
3. Set the secret values requested by `render.yaml`: `JWT_SECRET`, `CORS_ORIGIN`, `ADMIN_USER_ID`, `ADMIN_PASSWORD`.
4. After the user/admin URLs are known, set `CORS_ORIGIN` to the exact two origins, comma-separated.
5. Set `TREDIN_API` in the user and admin static services to the backend URL.
6. Verify `/health`, then test login, order, funds, KYC, admin review and reconciliation.

## Important production boundary
`ORDER_EXECUTION_ENABLED=false` is deliberate. The rebuild contains a safe internal/demo execution workflow, but it must not be represented as live exchange execution until a regulated broker/venue adapter and production risk controls are configured.
