# Xeno CRM
Modern mini‑CRM: customer ingestion, smart audience segmentation, and simulated multichannel delivery — with secure Google login and a clean, blue‑tone marketing site.

## Live & Demo
- Frontend (Vercel): add your URL here
- Backend: https://xenoapi.jsondev.in/
- Postman collection: `postman/Xeno-CRM.postman_collection.json`

## Highlights
- Authentication: Google OAuth 2.0 via `@react-oauth/google`, JWT issuance (access/refresh)
- Segmentation: natural‑language to structured filters (Gemini integration point)
- Campaign simulation: delivery vendor mock with receipts and retry strategy
- Production hygiene: Helmet, CORS allowlist, rate limiting, slow‑down, compression, request logging
- Blue brand theme for the landing experience (marketing page)

## Tech Stack
- Frontend: React (CRA), React Router, Axios, Bootstrap
- Backend: Node.js, Express 5, Mongoose
- Database: MongoDB (Atlas/local)
- Auth: Google OAuth + JWT

## Project Structure
```
xeno-crm/
├─ backend/
│  ├─ server.js                # Express app entry
│  ├─ config/                  # DB/connectors
│  ├─ middleware/              # security, auth, rate limits
│  ├─ routes/                  # REST APIs (auth, customers, segments, campaigns, delivery)
│  └─ models/                  # Mongoose schemas
└─ frontend/
   └─ src/
      ├─ components/           # Login, Dashboard, etc.
      ├─ marketing/            # Landing page (blue theme)
      └─ App.js                # App routes
```

## Screenshots
Add your screenshots/gifs here:
- Landing page (/) — hero, features, CTAs
- Login (/login) — minimal Google sign‑in
- Dashboard (/dashboard) — campaign/segments (if enabled)

## Local Development
Prerequisites: Node.js 18+, MongoDB, Google OAuth Client ID

1) Backend
```
cd backend
npm install
npm run dev
```
Create `backend/.env`:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_API_KEY=your_gemini_api_key
ALLOWED_EMAILS=allowed1@example.com,allowed2@example.com
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
CORS_ORIGIN=http://localhost:3000
INTERNAL_BASE_URL=http://localhost:5000
```

2) Frontend
```
cd ../frontend
npm install
npm start
```
URLs: Frontend http://localhost:3000 · Backend https://xenoapi.jsondev.in

## Deployment
Frontend (Vercel)
1) Import repo → Root Directory = `frontend`
2) Framework: Create React App
3) Build: `npm run build` · Install: `npm install` · Output: `build`
4) SPA rewrite (`frontend/vercel.json`):
```
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```
5) Env vars (Vercel → Settings → Environment Variables):
- REACT_APP_API_BASE_URL=https://xenoapi.jsondev.in
- Optional: REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

Backend (Render example)
1) New Web Service → Root Directory = `backend`
2) Build: `npm install` · Start: `node server.js`
3) Add env from `backend/.env` and ensure `CORS_ORIGIN` includes your Vercel domain
4) Use the service URL as `REACT_APP_API_BASE_URL` in Vercel

## Security & Practices
- Helmet, CORS allowlist, compression, request logging (morgan)
- Rate limiting and slow‑down middleware to mitigate abuse
- Auth APIs issue JWTs; protected routes check `Authorization: Bearer <token>`

## Roadmap
- Add real email/SMS vendor integration
- Extend analytics and audience insights
- Add e2e tests and CI checks

## Contact
Maintainer: Armaan. Add your preferred contact links here.

## License
MIT
