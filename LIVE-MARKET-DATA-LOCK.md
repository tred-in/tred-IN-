# TredIN Live Market Data Lock

The final rebuild uses the **same TrueData Real Time Data Service source used by the old V7 package**.

Integrated:
- old V7 TrueData WebSocket configuration
- `addsymbol` subscription flow
- touchline/trade/bid-ask parsing
- TredIN → TrueData symbol map
- live quote REST endpoint
- live SSE stream
- Render private market adapter service

Re-check correction:
- touchline parser requires the full 18-field payload before reading bid/ask
- trade/bidask lookup uses the existing symbol map directly

Security:
- credentials remain server-side Render secrets
- no TrueData credential is shipped to browser JS
- real order execution remains OFF

External activation is intentionally not claimed inside the ZIP: real TrueData credentials, final Render URLs, database provisioning, deployment, and live tick acceptance testing must occur in the user's Render account.
