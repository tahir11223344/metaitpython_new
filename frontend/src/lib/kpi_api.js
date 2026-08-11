// API client for KPI Section endpoints.
// Same assumptions as before (NEXT_PUBLIC_API_URL, bearer token in localStorage).

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    // credentials: "include",
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    let message = (data && (data.detail || data.message)) || "Something went wrong";
    if (Array.isArray(message)) {
      message = message.map((m) => m.msg || JSON.stringify(m)).join(", ");
    }
    throw new Error(message);
  }

  return data;
}

export function getKpiSections({
  search = "",
  sortDir = "desc",
  page = 1,
  size = 10,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (sortDir) params.set("sort_dir", sortDir);
  params.set("page", String(page));
  params.set("size", String(size));
  return request(`/kpi-sections?${params.toString()}`);
}

export function getKpiSection(id) {
  return request(`/kpi-sections/${id}`);
}

export function createKpiSection(payload) {
  return request("/kpi-sections", { method: "POST", body: JSON.stringify(payload) });
}

export function updateKpiSection(id, payload) {
  return request(`/kpi-sections/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteKpiSection(id) {
  return request(`/kpi-sections/${id}`, { method: "DELETE" });
}