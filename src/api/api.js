// const API_BASE = import.meta.env.VITE_API_BASE;


// /** WebSocket origin (same host as API) for orderbook live updates */
// export const WS_ORIGIN = (() => {
//   try {
//     const u = new URL(API_BASE);
//     return `${u.protocol === "https:" ? "wss:" : "ws:"}//${u.host}`;
//   } catch {
//     return "ws://127.0.0.1:8000";
//   }
// })();

// let access = localStorage.getItem("access");

// let res = await fetch(`${API_BASE}/symbols/`, {
//   headers: {
//     Authorization: `Bearer ${access}`,
//   },
// });

// if (res.status === 401) {
//   access = await refreshAccessToken();
//   if (!access) {
//     localStorage.clear();
//     window.location.reload();
//   }
//   // retry request
// }

// async function request(url, options = {}) {
//   const res = await fetch(url, {
//     ...options,
//     headers: {
//       "Content-Type": "application/json",
//       ...options.headers,
//     },
//   });
//   const data = await res.json().catch(() => ({}));
//   if (!res.ok) {
//     const err = new Error(data.detail || data.message || `Request failed (${res.status})`);
//     err.status = res.status;
//     err.data = data;
//     throw err;
//   }
//   return data;
// }

// export async function getOrderBook(symbol) {
//   return request(`${API_BASE}/orderbook/?symbol=${encodeURIComponent(symbol)}`);
// }

// /** GET /api/symbols/ → list of symbol names (optional ?q= search) */
// export async function getSymbols(query = "") {
//   const params = query ? `?q=${encodeURIComponent(query)}` : "";
//   return request(`${API_BASE}/symbols/${params}`);
// }

// /** GET /api/prices/ → [{ symbol, price, updated_at }, ...] (delayed, cached ~60 min) */
// export async function getPrices() {
//   return request(`${API_BASE}/prices/`);
// }

// export async function loginUser(username, password) {
//   return request(`${API_BASE}/token/`, {
//     method: "POST",
//     body: JSON.stringify({ username, password }),
//   });
// }

// /** POST /api/register/ → create account. Body: { username, password } */
// export async function registerUser(username, password) {
//   return request(`${API_BASE}/register/`, {
//     method: "POST",
//     body: JSON.stringify({ username, password }),
//   });
// }

// export async function placeOrder(token, order) {
//   return request(`${API_BASE}/orders/`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify({
//       symbol: order.symbol,
//       side: order.side,
//       price: order.price,
//       quantity: Number(order.quantity),
//     }),
//   });
// }

// export async function cancelOrder(token, orderId) {
//   return request(`${API_BASE}/orders/${orderId}/cancel/`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// }

// function authRequest(path, token, options = {}) {
//   return request(`${API_BASE}${path}`, {
//     ...options,
//     headers: {
//       Authorization: `Bearer ${token}`,
//       ...options.headers,
//     },
//   });
// }

// /** Requires backend: GET /api/portfolio/ → { available_balance, reserved_balance } */
// export async function getPortfolio(token) {
//   return authRequest("/portfolio/", token);
// }

// /** Requires backend: GET /api/holdings/ → [{ symbol, available_quantity, reserved_quantity }, ...] */
// export async function getHoldings(token) {
//   return authRequest("/holdings/", token);
// }

// /** Requires backend: GET /api/orders/ → list of Order (optional ?status=OPEN,PARTIAL) */
// export async function getMyOrders(token, params = {}) {
//   const q = new URLSearchParams(params).toString();
//   return authRequest(`/orders/${q ? `?${q}` : ""}`, token);
// }

// /** Requires backend: GET /api/trades/ → list of Trade (optional ?symbol=AAPL) */
// export async function getMyTrades(token, params = {}) {
//   const q = new URLSearchParams(params).toString();
//   return authRequest(`/trades/${q ? `?${q}` : ""}`, token);
// }

// export async function getCandles(symbol, interval = "5min") {
//   const res = await fetch(
//     `${API_BASE}/candles/?symbol=${encodeURIComponent(symbol)}&interval=${interval}`
//   );
//   if (!res.ok) throw new Error("Failed to fetch candles");
//   return res.json();
// }

// async function refreshAccessToken() {
//   const refresh = localStorage.getItem("refresh");
//   if (!refresh) return null;

//   const res = await fetch(`${API_BASE}/token/refresh/`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ refresh }),
//   });

//   if (!res.ok) return null;

//   const data = await res.json();
//   localStorage.setItem("access", data.access);
//   return data.access;
// }

const API_BASE =
  import.meta.env.VITE_API_BASE || 
  "https://mini-exchange-backend.onrender.com/api" ||
  "http://127.0.0.1:8000/api";

export const WS_ORIGIN = (() => {
  try {
    const u = new URL(API_BASE);
    return `${u.protocol === "https:" ? "wss:" : "ws:"}//${u.host}`;
  } catch {
    return "ws://127.0.0.1:8000";
  }
})();

async function request(url, options = {}, retry = true) {
  let access = localStorage.getItem("access");

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && retry) {
    const newAccess = await refreshAccessToken();
    if (!newAccess) {
      localStorage.clear();
      window.location.reload();
      return;
    }

    return request(url, options, false);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.detail || data.message || `Request failed (${res.status})`
    );
  }

  return data;
}

export const getSymbols = (q = "") =>
  request(`${API_BASE}/symbols/${q ? `?q=${encodeURIComponent(q)}` : ""}`);

export const getOrderBook = (symbol) =>
  request(`${API_BASE}/orderbook/?symbol=${encodeURIComponent(symbol)}`);

export const getPrices = () =>
  request(`${API_BASE}/prices/`);

export const loginUser = (username, password) =>
  request(`${API_BASE}/token/`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const registerUser = (username, password) =>
  request(`${API_BASE}/register/`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const placeOrder = (order) =>
  request(`${API_BASE}/orders/`, {
    method: "POST",
    body: JSON.stringify(order),
  });

export const cancelOrder = (orderId) =>
  request(`${API_BASE}/orders/${orderId}/cancel/`, {
    method: "POST",
  });

export const getPortfolio = () =>
  request(`${API_BASE}/portfolio/`);

export const getHoldings = () =>
  request(`${API_BASE}/holdings/`);

export const getMyOrders = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`${API_BASE}/orders/${q ? `?${q}` : ""}`);
};

export const getMyTrades = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return request(`${API_BASE}/trades/${q ? `?${q}` : ""}`);
};

export const getCandles = (symbol, interval = "5min") =>
  request(
    `${API_BASE}/candles/?symbol=${encodeURIComponent(
      symbol
    )}&interval=${interval}`
  );

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  const res = await fetch(`${API_BASE}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  localStorage.setItem("access", data.access);
  return data.access;
}

/** Decode JWT (access token) and return username from token payload */
export function getCurrentUser() {
  const access = localStorage.getItem("access");
  if (!access) return null;

  try {
    const payload = access.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.username || decoded.sub || null;
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}
