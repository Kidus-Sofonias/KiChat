# CORS setup

If you want the backend to accept requests from any frontend origin, set:

`ALLOW_ALL_ORIGINS=true`

Important:

- This backend uses `credentials: true`
- Browsers do not allow `Access-Control-Allow-Origin: *` together with credentials
- The correct approach is to reflect the requesting origin, which the backend now does when `ALLOW_ALL_ORIGINS=true`

Optional local-file support:

- If your frontend is opened directly from disk and the browser sends `Origin: null`, also set `ALLOW_NULL_ORIGIN=true`

Safer production setup:

- Prefer `ALLOWED_ORIGINS=https://site1.com,https://site2.com,http://localhost:4173`
- Use `ALLOW_ALL_ORIGINS=true` only if you intentionally want any site to call your backend
