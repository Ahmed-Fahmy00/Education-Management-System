# Education-Management-System (MERN)

## Structure

### Backend (Express)

- `backend/src/server.js` – server entry (loads env, optional Mongo connect, starts HTTP)
- `backend/src/app.js` – express app setup (middleware + routes)
- `backend/src/routes/` – route modules
- `backend/src/controllers/` – controller handlers
- `backend/src/middleware/` – error + 404 handlers
- `backend/.env.example` – env template

### Frontend (React + Vite)

- `frontend/src/pages/` – page components
- `frontend/src/components/` – reusable components
- `frontend/src/api/` – API helpers
- `frontend/vite.config.js` – proxies `/api/*` to the backend during dev
- `frontend/.env.example` – env template

## Getting started

1) Install dependencies (both apps)

`npm run install:all`

2) Create env files

- Copy `backend/.env.example` to `backend/.env` and set values as needed.
- (Optional) Copy `frontend/.env.example` to `frontend/.env`.

3) Run both apps

`npm run dev`

## Dev URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API health: http://localhost:5000/api/health