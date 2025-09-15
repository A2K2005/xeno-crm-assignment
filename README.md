# Xeno CRM
A full‑stack mini CRM for customer and order ingestion, audience segmentation (with AI parsing), and simulated outbound campaign delivery.

## Overview
- **Frontend**: React, React Router, Axios, Bootstrap
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Auth**: Google OAuth + project JWT (access/refresh)
- **AI**: Google Gemini (natural language → structured filters)
- **Delivery**: Dummy vendor simulation (email-like delivery + receipts)

## Project Structure
```
xeno-crm/
├─ backend/
│  ├─ server.js
│  ├─ config/
│  │  ├─ database.js
│  │  └─ environment.js
│  ├─ middleware/
│  │  ├─ auth.js
│  │  ├─ validation.js
│  │  └─ security.js
│  ├─ services/
│  │  ├─ aiService.js
│  │  └─ campaignService.js
│  ├─ routes/
│  │  ├─ auth/
│  │  │  └─ oauth.js
│  │  ├─ api/
│  │  │  ├─ customers.js
│  │  │  ├─ orders.js
│  │  │  ├─ segments.js
│  │  │  ├─ campaigns.js
│  │  │  └─ delivery.js
│  │  └─ vendor/
│  │     └─ dummyVendor.js
│  └─ models/
│     ├─ Customer.js
│     ├─ Order.js
│     ├─ Segment.js
│     └─ CommunicationLog.js
└─ frontend/
   └─ src/
      ├─ components/
      ├─ marketing/
      │  ├─ App.js
      │  ├─ App.css
      │  └─ Components/
      │     ├─ Navbar/
      │     ├─ Home/
      │     ├─ Feature/
      │     ├─ Main/
      │     ├─ DoMore/
      │     ├─ Platforms/
      │     └─ Footer/
      └─ App.js
```

## Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- Google OAuth Client ID and Gemini API Key

## Environment Variables (backend/.env)
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000

# Google
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_API_KEY=your_gemini_api_key
ALLOWED_EMAILS=allowed1@example.com,allowed2@example.com

# JWT
JWT_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

# CORS
CORS_ORIGIN=http://localhost:3000

# Internal base URL for internal callbacks (optional)
INTERNAL_BASE_URL=http://localhost:5000
```

Frontend uses Google OAuth via `@react-oauth/google`. If you externalize values, use CRA-prefix (e.g., `REACT_APP_*`).

## Install & Run Locally
   ```
   # Backend
   cd backend
npm install
npm run dev

   # Frontend
   cd ../frontend
npm install
   npm start
   ```
Backend runs on `http://localhost:5000`, frontend on `http://localhost:3000`.

### Frontend dependencies
- react, react-dom, react-router-dom, axios, bootstrap
- Added for landing page: `aos`, `react-icons`
  - Already installed in `frontend`. If needed: `npm install aos react-icons`

### Quickstart checklist
- Create `backend/.env` with the variables in Environment Variables.
- Ensure MongoDB is reachable (local or Atlas).
- Obtain a Google OAuth Client ID and set `GOOGLE_CLIENT_ID`.
- Optional: set `INTERNAL_BASE_URL` (defaults to `http://localhost:5000`).
- Start backend (dev) and frontend in separate terminals as shown above.

### Verify the system is up
- Health: `GET http://localhost:5000/health` → `{ status: "ok" }`
- Status: `GET http://localhost:5000/status` → uptime and DB status
- Auth: Use Postman collection to call `/auth/google` with a valid `id_token` to get project `access_token`.

### Test the delivery simulation manually
1) Create a customer and an order (via Postman or APIs above)
2) Create a simple segment and campaign (or call the vendor directly):
```
POST http://localhost:5000/api/vendor/send
Content-Type: application/json
{
  "customer_id": 1,
  "message": "Hello from dummy vendor",
  "campaign_id": "test"
}
```
→ Response: `{ "delivery_id": N, "status": "processing" }`
3) Within ~2 seconds the vendor calls `/api/delivery/receipt` and the log status becomes `SENT` or `FAILED`.

## Security
- Helmet security headers, CORS allowlist, request logging, body size limits.
- Input validation/sanitization with `express-validator` and `express-mongo-sanitize`.
- Global rate limiting enabled; can be adjusted to per-user.
- All `/api/*` routes expect `Authorization: Bearer <access_token>` (issued after OAuth).

## Auth Flow
- `POST /auth/google`
  - Body: `{ id_token }` (Google ID token)
  - Verifies token, checks `ALLOWED_EMAILS`, returns project tokens:
    `{ access_token, refresh_token, expires_in }`
- `POST /auth/refresh`
  - Body: `{ refresh_token }`
  - Returns a fresh `{ access_token, refresh_token, expires_in }`

## Marketing Landing Page (Xeno)
- Route: `GET http://localhost:3000/landing`
- Location: `frontend/src/marketing` with modular components under `Components/`
- Styling: `frontend/src/marketing/App.css` plus each component's CSS
- Assets: co-located under `frontend/src/marketing`
- Navigation:
  - The “Start Free Trial” buttons in `Navbar`, `Home`, and `Platform` navigate to `/` (your existing Login route).
  - Ensure `/` renders the auth page; in this project it’s already wired in `frontend/src/App.js`.

### How to use
1. Start backend and frontend as above.
2. Open `http://localhost:3000/landing` to view the Xeno marketing page.
3. Click “Start Free Trial” to be redirected to `http://localhost:3000/` (Login).

## Ingestion APIs
- `POST /api/customers`
  - Body: `{ name, email, phone, city }`
  - Validates email/phone, enforces unique email, auto-increments `customer_id`.
  - Response (201): `{ success: true, customer_id, message: 'Customer created' }`

- `POST /api/orders`
  - Body: `{ customer_id, amount, date }`
  - Validates customer existence, amount > 0, ISO date; auto-increments `order_id`.
  - Response (201): `{ success: true, order_id, message: 'Order created' }`

## Segments (with AI parsing)
- `POST /api/segments/parse`
  - Body: `{ prompt }` → Gemini → structured conditions
- `POST /api/segments/preview`
  - Body: `{ conditions: [...], logic: 'AND'|'OR' }`
  - Returns audience size only: `{ count, preview: true }`
- `POST /api/segments/create`
  - Body: `{ name, conditions, logic, description }`
  - Saves segment and audience size: `{ success, segment_id, audience_size, message }`

Supported conditions: `amount`, `visits`, `days_inactive`, `city` with `> < =` and `AND/OR` logic.

## Campaigns and Delivery (Dummy Vendor)
- `POST /api/campaigns/send`
  - Body: `{ customerId, name, email, subject, message }` → simulated send and log

- `POST /vendor/dummy/send`
  - Body: `{ customer_id, message, campaign_id, delivery_method: 'email' }`
  - Returns: `{ delivery_id, status: 'processing' }`
  - Simulates 90% success, 10% failure, with realistic delays and background receipt call

- `POST /api/delivery/receipt`
  - Single or batch: `{ delivery_id, status: 'SENT'|'FAILED', failure_reason?, timestamp }` or `[ ... ]`
  - Bulk updates `CommunicationLog` statuses and timestamps

- `POST /vendor/dummy/retries/run-once`
  - Triggers exponential backoff retries for failed deliveries (max 3 attempts)

## Data Models (MongoDB)
- `Customer`
  - `{ customer_id, name, email, phone, city, created_at, updated_at }`
- `Order`
  - `{ order_id, customer_id, amount, date, created_at }`
- `Segment`
  - `{ segment_id, name, conditions, logic, audience_size, description, created_by, created_at }`
- `CommunicationLog`
  - `{ log_id, campaign_id, customer_id, message, delivery_status, failure_reason, retry_count, next_retry_at, last_error, sent_at, delivered_at, created_at }`

## Request Examples
```
POST /api/customers
Authorization: Bearer <access_token>
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1-555-123-4567",
  "city": "Delhi"
}
→ 201 { "success": true, "customer_id": 12, "message": "Customer created" }

POST /api/orders
Authorization: Bearer <access_token>
{
  "customer_id": 12,
  "amount": 1999,
  "date": "2025-09-15"
}
→ 201 { "success": true, "order_id": 31, "message": "Order created" }
```

## Deployment Notes
- Frontend: Vercel/Netlify. Backend: Render/Railway/Heroku.
- Set environment variables securely; update frontend API base via `REACT_APP_*` if needed.

## Deploy Frontend to Vercel

This project uses Create React App for the frontend located in `frontend/`.

1) Prepare environment variables (optional)
   - If the frontend needs a custom API base, create `frontend/.env` with:
     ```
     REACT_APP_API_BASE_URL=https://your-backend.example.com
     ```
   - Commit or add in Vercel Project Settings → Environment Variables.

2) Push your repository to GitHub/GitLab/Bitbucket

3) Import the repo into Vercel
   - When prompted to select the root directory, choose `frontend` (not the monorepo root)
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Install Command: `npm install`
   - Output Directory: `build`

4) Configure SPA routing (prevents 404 on refresh)
   - In `frontend`, create `vercel.json` with these rewrites:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
   - Commit and redeploy. This ensures routes like `/login` or anchors work in a single-page app.

5) Set environment variables in Vercel
   - Go to Project Settings → Environment Variables
   - Add any `REACT_APP_*` variables (e.g., `REACT_APP_API_BASE_URL`)
   - Redeploy to apply

6) Connect a custom domain (optional)
   - Add your domain in Vercel → Domains and follow the DNS instructions

Notes
- The Google OAuth Client ID currently lives in `frontend/src/index.js`. For production, move it to an env variable (e.g., `REACT_APP_GOOGLE_CLIENT_ID`) and pass it to `GoogleOAuthProvider`.
- The marketing landing page is at `/` and the auth page is at `/login`.
- Backend must support CORS for the deployed Vercel domain.

## Deploy Backend (suggested options)

Use Render/Railway/Fly/Heroku. Minimal steps (Render as example):

1) Create a new Web Service from this repo, set root directory to `backend`
2) Environment → add the variables from the `.env` block above
3) Build Command: `npm install`
4) Start Command: `node server.js`
5) Ensure `PORT` is set by the platform or to `5000`, and allow CORS `CORS_ORIGIN` for your Vercel domain

After deploy, set `REACT_APP_API_BASE_URL` in Vercel to the backend URL.

## Postman
- Collection: `postman/Xeno-CRM.postman_collection.json`
- Environment: `postman/Xeno-CRM.postman_environment.json`
- Set `base_url`, import Google `id_token`, then call `/auth/google` to obtain `access_token` and `refresh_token`.
- Each folder contains request/response examples, auth header usage, and common error formats.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.
