const BASE = import.meta.env.VITE_API_URL || "/api";

const TOKEN_KEY = "mm2_token";

// Errors carry an i18n key when we know the meaning; otherwise the server
// message is translated (or shown as is) by errText() in i18n.jsx.
function keyedError(key) {
  return Object.assign(new Error(key), { key });
}

export const uploadUrl = file => `${BASE}/uploads/${file}`;

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private mode — the session just won't survive a reload.
  }
}

// The backend expects the raw JWT in Authorization (no "Bearer ").
async function request(path, { method = "GET", body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = token;

  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: payload });
  } catch {
    throw keyedError("srv.network");
  }

  let parsed = true;
  const data = await res.json().catch(() => {
    parsed = false;
    return {};
  });

  if (res.status === 401 || res.status === 403) {
    if (token) setToken(null);
  }

  // A non-JSON success (e.g. an HTML page from a misrouted proxy) must not
  // reach the screens as data.
  if (!res.ok || !parsed) {
    throw data.message ? new Error(data.message) : keyedError("srv.generic");
  }

  return data;
}

export const api = {
  // Free hosting sleeps when idle; a ping as soon as the site opens wakes it
  // while the visitor is still reading or filling in the first step.
  wake: () => fetch(BASE + "/").catch(() => {}),

  municipalities: () => request("/municipalities"),

  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  verify2fa: (tempToken, code) => request("/auth/2fa/verify-login", { method: "POST", body: { tempToken, code } }),
  forgotPassword: (email, lang) => request("/auth/forgot", { method: "POST", body: { email, lang } }),
  resetPassword: (token, password) => request("/auth/reset", { method: "POST", body: { token, password } }),
  deleteAccount: password => request("/profile", { method: "DELETE", body: { password } }),
  register: (username, email, password) => request("/auth/register", { method: "POST", body: { username, email, password } }),

  createTransfer: data => request("/transfers", { method: "POST", body: data }),
  listTransfers: () => request("/transfers"),
  getTransfer: id => request(`/transfers/${id}`),
  submitTransfer: id => request(`/transfers/${id}/submit`, { method: "POST" }),
  confirmInfo: token => request(`/transfers/public/confirm/${token}`),
  confirmReading: token => request(`/transfers/public/confirm/${token}`, { method: "POST" }),
  markServiceSent: (id, index) => request(`/transfers/${id}/services/${index}/send`, { method: "PUT" }),

  uploadMeterPhoto: (id, serviceIndex, file, meterReading) => {
    const form = new FormData();
    form.append("photo", file);
    form.append("serviceIndex", String(serviceIndex));
    if (meterReading) form.append("meterReading", meterReading);
    return request(`/transfers/${id}/meter-photo`, { method: "POST", form });
  },

  // The lease is private, so it's fetched with the token and handed to the
  // browser as a blob rather than linked directly.
  downloadLease: async id => {
    const res = await fetch(`${BASE}/transfers/${id}/lease`, { headers: { Authorization: getToken() || "" } });
    if (!res.ok) throw keyedError("srv.leaseFailed");
    const cd = res.headers.get("Content-Disposition") || "";
    const name = decodeURIComponent(
      cd.match(/filename\*=UTF-8''([^;]+)/i)?.[1] || cd.match(/filename="([^"]+)"/i)?.[1] || "lease"
    );
    const url = URL.createObjectURL(await res.blob());
    const a = Object.assign(document.createElement("a"), { href: url, download: name });
    a.click();
    URL.revokeObjectURL(url);
  },

  uploadLease: (id, file) => {
    const form = new FormData();
    form.append("lease", file);
    return request(`/transfers/${id}/lease`, { method: "POST", form });
  }
};
