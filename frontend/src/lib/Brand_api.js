// Brand API — admin CRUD + public (server-side) fetcher.

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    null
  );
}

async function request(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  if (!isFormData && options.body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    let message =
      (data && (data.detail || data.message)) || "Something went wrong";
    if (Array.isArray(message)) {
      message = message
        .map((m) => {
          const loc = Array.isArray(m.loc) ? m.loc.slice(1).join(".") : "";
          return loc ? `${loc}: ${m.msg}` : m.msg || JSON.stringify(m);
        })
        .join(", ");
    }
    throw new Error(message);
  }

  return data;
}

export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

/** Logo upload -> { url, name, size } */
export async function uploadImage(file) {
  const fd = new FormData();
  fd.append("file", file);
  return request("/media/image", { method: "POST", body: fd });
}

/* ---------------- ADMIN ---------------- */

export function getBrands({
  search = "",
  isActive = undefined,
  sortBy = "sort_order",
  sortDir = "asc",
  page = 1,
  size = 10,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive !== undefined && isActive !== "") {
    params.set("is_active", String(isActive));
  }
  params.set("sort_by", sortBy);
  params.set("sort_dir", sortDir);
  params.set("page", String(page));
  params.set("size", String(size));
  return request(`/brands?${params.toString()}`);
}

export function getBrand(id) {
  return request(`/brands/${id}`);
}

export function createBrand(payload) {
  return request("/brands", { method: "POST", body: JSON.stringify(payload) });
}

export function updateBrand(id, payload) {
  return request(`/brands/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteBrand(id) {
  return request(`/brands/${id}`, { method: "DELETE" });
}

/* ---------------- PUBLIC (website, server-side) ---------------- */

/** Logo sliders ke liye — sirf active brands, sort_order ke hisaab se */
export async function fetchBrands({ size = 100 } = {}) {
  try {
    const res = await fetch(
      `${BASE_URL}/brands?is_active=true&size=${size}&sort_by=sort_order&sort_dir=asc`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((b) => ({
      id: b.id,
      name: b.company_name,
      website: b.website || "",
      src: mediaUrl(b.logo),
      alt: b.logo_alt || b.company_name,
    }));
  } catch {
    return [];
  }
}
