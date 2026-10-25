const BASE = import.meta.env.VITE_API_URL || "/api";

const TOKEN_KEY = "mm2_token";

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
    throw new Error("Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.");
  }

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 || res.status === 403) {
    if (token) setToken(null);
  }

  if (!res.ok) {
    throw new Error(data.message || "Ошибка сервера");
  }

  return data;
}

export const api = {
  municipalities: () => request("/municipalities"),

  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  verify2fa: (tempToken, code) => request("/auth/2fa/verify-login", { method: "POST", body: { tempToken, code } }),
  register: (username, email, password) => request("/auth/register", { method: "POST", body: { username, email, password } }),

  createTransfer: data => request("/transfers", { method: "POST", body: data }),
  listTransfers: () => request("/transfers"),
  getTransfer: id => request(`/transfers/${id}`),
  submitTransfer: id => request(`/transfers/${id}/submit`, { method: "POST" }),
  markServiceSent: (id, index) => request(`/transfers/${id}/services/${index}/send`, { method: "PUT" }),

  uploadMeterPhoto: (id, serviceIndex, file, meterReading) => {
    const form = new FormData();
    form.append("photo", file);
    form.append("serviceIndex", String(serviceIndex));
    if (meterReading) form.append("meterReading", meterReading);
    return request(`/transfers/${id}/meter-photo`, { method: "POST", form });
  },

  uploadLease: (id, file) => {
    const form = new FormData();
    form.append("lease", file);
    return request(`/transfers/${id}/lease`, { method: "POST", form });
  }
};
