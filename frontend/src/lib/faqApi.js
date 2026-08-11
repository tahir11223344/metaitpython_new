const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
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

export function getFaqPages() {
  return request("/faqs/pages");
}

export function getFaqs({
  search = "",
  pageName = "",
  sortDir = "desc",
  page = 1,
  size = 10,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (pageName) params.set("page_name", pageName);
  if (sortDir) params.set("sort_dir", sortDir);
  params.set("page", String(page));
  params.set("size", String(size));
  return request(`/faqs?${params.toString()}`);
}

export function getFaq(id) {
  return request(`/faqs/${id}`);
}

export function createFaq(payload) {
  return request("/faqs", { method: "POST", body: JSON.stringify(payload) });
}

export function updateFaq(id, payload) {
  return request(`/faqs/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteFaq(id) {
  return request(`/faqs/${id}`, { method: "DELETE" });
}