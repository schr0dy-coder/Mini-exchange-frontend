# Mini Exchange — Frontend

Overview

React + Vite frontend for the Mini Exchange application.

Quick start (development)

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open the app at the URL shown by Vite (commonly http://localhost:5173).

Environment variables

- `VITE_API_BASE` (optional) — base URL for the backend API. Example: `https://mini-exchange-backend.onrender.com/api`. If unset, the app falls back to a sensible default.

Build & preview

```bash
npm run build
npm run preview
```

Deployment

- This project is suitable for hosting on Vercel or other static hosts that support single-page apps.
- The production frontend is currently hosted at: https://mini-exchange-frontend-98ua.vercel.app/

Notes and conventions

- JWT tokens are stored in `localStorage` using the keys `access` and `refresh`.
- API endpoints are expected under `/api/` on the backend; WebSocket endpoints are under `/ws/`.
- If you change `VITE_API_BASE`, rebuild the app for production.

Troubleshooting

- If registration or login fails, check `frontend/src/api/api.js` to confirm `API_BASE` is correct.
- If real-time updates fail, ensure WebSocket origin (`WS_ORIGIN`) matches the backend host and protocol.

Contributing

- Run the dev server and edit files under `src/`. Vite will HMR changes.
- Linting and formatting are configured via the project files; run the existing npm scripts as needed.

Frontend ↔ Backend (detailed)

This section explains precisely how the frontend connects to the backend, where the routes live, and how authentication and real-time channels are wired.

- API base: The frontend reads `VITE_API_BASE` (see `frontend/src/api/api.js`). If that env var is not set, the app falls back to the default configured in `api.js` (production backend URL or `http://127.0.0.1:8000/api`).

- REST endpoints used by the client (examples):
	- `POST /api/token/` — obtain `access` and `refresh` JWT tokens (login)
	- `POST /api/register/` — create a new user account (registration)
	- `GET /api/symbols/` — list symbols
	- `GET /api/orderbook/?symbol=SYMBOL` — snapshot of orderbook (used as polling fallback)
	- `GET /api/prices/` — delayed/cached market prices
	- `GET /api/portfolio/` — user's balances
	- `GET /api/holdings/` — user's holdings
	- `GET /api/orders/` — user's orders
	- `POST /api/orders/` — place an order
	- `POST /api/orders/<id>/cancel/` — cancel an order
	- `GET /api/trades/` — user's trades
	- `GET /api/candles/?symbol=SYMBOL&interval=5min` — candle data for charting

- Auth flow and where it is implemented:
	- The login/register UI is in `frontend/src/pages/Login.jsx`. Registration uses `registerUser(username, password)` and login uses `loginUser(username, password)` from `frontend/src/api/api.js`.
	- On successful login the backend returns `{ access, refresh }`. The code stores these in `localStorage` under the keys `access` and `refresh` and calls `setToken(access)` in `App.jsx` to update app state.
	- `App.jsx` uses simple conditional rendering to switch between `Login` and `Dashboard` rather than a router: if there is no `access` token the app shows `Login`; otherwise it renders `Dashboard`.

- `frontend/src/api/api.js` (central request helper):
	- All HTTP calls go through the `request()` helper. It reads the `access` token from `localStorage` and adds an `Authorization: Bearer <access>` header when present.
	- If a request returns `401` and a `refresh` token exists, `request()` calls `refreshAccessToken()` (POST `/api/token/refresh/`) to obtain a new `access` token, saves it to `localStorage`, and retries the original request once.
	- If token refresh fails the helper clears `localStorage` and reloads the page to force the user back to the login screen.

- Real-time (WebSocket) routing and how the frontend connects:
	- `frontend/src/api/api.js` exports `WS_ORIGIN`, computed from `API_BASE` (protocol + host) so sockets point to the same backend host by default.
	- Prices feed: `PricesChart.jsx` opens a WebSocket to `${WS_ORIGIN}/ws/prices/` to receive periodic price updates pushed by the backend.
	- Orderbook feed: the hook `frontend/src/hooks/useOrderBook.js` attempts a WebSocket connection to `${WS_ORIGIN}/ws/orderbook/?symbol=<SYMBOL>`.
		- The hook falls back to polling `GET /api/orderbook/?symbol=...` every 2 seconds if the WebSocket cannot connect.
	- On the backend the Channels consumers route WebSocket groups to endpoints like `/ws/prices/` and `/ws/orderbook/` — the frontend expects those paths. If you change backend routing, update `WS_ORIGIN` or the component code accordingly.

- Where to change API/WS origin in code:
	- Set `VITE_API_BASE` in your environment (dev: `.env` or Vite env config). The code in `frontend/src/api/api.js` will build `WS_ORIGIN` from that value.
	- You can also edit `frontend/src/api/api.js` directly for a quick override during development.

- Typical request sequence when placing an order (what the frontend does):
	1. User submits a form in `OrderForm.jsx`.
	2. The form calls `placeOrder(order)` which uses `request()` to `POST /api/orders/`.
	3. `request()` attaches `Authorization` header using `access` from `localStorage`.
	4. If backend rejects with 401, `request()` will attempt to refresh the token; otherwise it surfaces the error message which the UI displays (for example, price band validation messages).

Tips for debugging

- To verify a failing network call open the browser DevTools → Network tab and inspect the request/response for the endpoint; check headers to see the `Authorization` header.
- To verify WebSocket connectivity open DevTools → Console and watch connection logs printed by `PricesChart.jsx` and `useOrderBook`.
- If you change backend routes or host, update `VITE_API_BASE` and rebuild the frontend for production.

