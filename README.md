# KiChat

KiChat is a full-stack chat app with:

- a React + Vite frontend in `Frontend/`
- an Express + Socket.IO backend in `Backend/`
- media uploads for images, video, audio, and files
- robot-avatar onboarding
- a local JSON fallback store for development
- PostgreSQL-ready deployment config for Render

## Local development

### Frontend

```bash
cd Frontend
npm install
npm run dev -- --host 127.0.0.1 --port 4173
```

### Backend

```bash
cd Backend
npm install
PORT=3001 npm start
```

If no working remote database is configured, the backend falls back to `Backend/data/local-store.json`.

## Environment variables

See `Backend/.env.example` for the current backend variables.

Important values:

- `JWT_SECRET`
- `DATABASE_URL`
- `FRONTEND_URL`
- `DB_SSL`

## Render deployment

The repository includes a root `render.yaml` that defines:

- `kichat-api` as a Node web service
- `kichat-web` as a static site
- `kichat-db` as a Render Postgres database

The frontend uses the backend service's public URL through `VITE_API_URL` and `VITE_SOCKET_URL`, and the backend uses the frontend service's public URL for production CORS.

## Notes

- The Render blueprint currently assumes the `frankfurt` region.
- For local development, `DB_SSL=false` is usually correct.
- Before pushing publicly, rotate any old secrets that may have been used during development.
