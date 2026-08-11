// API client for Portfolio endpoints.
// create/update FormData (files) bhejte hain, isliye request() FormData ko detect
// karke Content-Type khud set nahi karta (browser multipart boundary lagata hai).

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function publicBase() {
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_URL || BASE_URL;
  }
  return BASE_URL;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  // JSON ke liye hi Content-Type; FormData ke liye NAHI
  if (!isFormData && options.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    let message =
      (data && (data.detail || data.message)) || "Something went wrong";
    if (Array.isArray(message)) {
      message = message.map((m) => m.msg || JSON.stringify(m)).join(", ");
    }
    throw new Error(message);
  }

  return data;
}

// Image path ko full URL banane ke liye (thumbnail/gallery relative paths hote hain)
export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

export function getPortfolios({
  search = "",
  categoryId = undefined,
  sortDir = "desc",
  page = 1,
  size = 10,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (categoryId) params.set("category_id", String(categoryId));
  if (sortDir) params.set("sort_dir", sortDir);
  params.set("page", String(page));
  params.set("size", String(size));
  return request(`/portfolios?${params.toString()}`);
}

export function getPortfolio(id) {
  return request(`/portfolios/${id}`);
}

export function createPortfolio(formData) {
  return request("/portfolios", { method: "POST", body: formData });
}

export function updatePortfolio(id, formData) {
  return request(`/portfolios/${id}`, { method: "PUT", body: formData });
}

export function deletePortfolio(id) {
  return request(`/portfolios/${id}`, { method: "DELETE" });
}


export async function fetchPortfolios({ size = 12 } = {}) {
  try {
    const params = new URLSearchParams({ is_active: "true", size: String(size), sort_dir: "desc" });
    const res = await fetch(`${publicBase()}/portfolios?${params.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map((p) => ({
      id: p.id,
      title: p.title || "",
      desc: p.short_description || p.description || "",
      slug: p.slug || "",
      image: (p.thumbnail || p.image) ? mediaUrl(p.thumbnail || p.image) : "",
      imageAlt: p.image_alt || p.title || "",
    }));
  } catch {
    return [];
  }
}
