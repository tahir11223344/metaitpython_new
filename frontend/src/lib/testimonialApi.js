// API client for Testimonial endpoints.
// Same assumptions as faqApi.js:
//  - NEXT_PUBLIC_API_URL points to your backend (add "/api" if you use a prefix)
//  - JWT bearer token in localStorage under "access_token" (change key if needed)
//  - For cookie auth: remove Authorization header, add credentials: "include"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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

export function getTestimonials({
  search = "",
  isActive = undefined,
  sortDir = "desc",
  page = 1,
  size = 10,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (isActive !== undefined && isActive !== "") params.set("is_active", String(isActive));
  if (sortDir) params.set("sort_dir", sortDir);
  params.set("page", String(page));
  params.set("size", String(size));
  return request(`/testimonials?${params.toString()}`);
}

export function getTestimonial(id) {
  return request(`/testimonials/${id}`);
}

export function createTestimonial(payload) {
  return request("/testimonials", { method: "POST", body: JSON.stringify(payload) });
}

export function updateTestimonial(id, payload) {
  return request(`/testimonials/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteTestimonial(id) {
  return request(`/testimonials/${id}`, { method: "DELETE" });
}