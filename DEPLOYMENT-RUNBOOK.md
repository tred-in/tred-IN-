# TredIN Production Deployment Runbook

## 1. GitHub
Push the contents of this folder to a repository with this exact root structure:

- `apps/user`
- `apps/admin`
- `backend`
- `render.yaml`
- `scripts`

Do not upload the ZIP as the repository contents; extract it first.

## 2. Render Blueprint
Create a Render Blueprint from the repository. `render.yaml` creates:

- `tredin-backend` — Node API
- `tredin-user` — static USER app
- `tredin-admin` — static ADMIN app
- `tredin-db` — PostgreSQL

## 3. Required secrets / environment values
Backend:

- `JWT_SECRET` — generate a long random secret (32+ random bytes recommended)
- `ADMIN_USER_ID` — production admin identifier
- `ADMIN_PASSWORD` — strong production password (14+ characters recommended)
- `CORS_ORIGIN` — exact USER and ADMIN origins, comma-separated

Static sites:

- `TREDIN_API` — exact public backend URL, e.g. `https://tredin-backend.onrender.com`

Never commit real secrets to GitHub.

## 4. First deployment checks
Open backend `/health` and require HTTP 200.

Then test:

1. USER login/register
2. USER market quotes
3. USER order → RMS → history
4. USER positions/portfolio
5. USER deposit/withdraw request
6. USER KYC submission
7. USER support
8. ADMIN login
9. ADMIN user controls
10. ADMIN KYC review
11. ADMIN finance review
12. ADMIN support
13. ADMIN audit
14. ADMIN reconciliation

## 5. Production safety boundary
`ORDER_EXECUTION_ENABLED=false` is intentional. Do not enable real exchange/broker execution until the regulated broker/venue integration, production risk controls, order reconciliation, monitoring, and operational procedures have been separately verified.

## 6. Browser configuration
The static build writes the Render `TREDIN_API` value into `dist/config.js`. LocalStorage `TREDIN_API` may override it for testing.

## 7. Rollback
Render rollback should target the previous known-good Git commit. Do not manually edit generated `dist/main.js` in production.
