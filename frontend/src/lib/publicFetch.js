// src/lib/publicFetch.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function publicBaseUrl() {
  if (typeof window === "undefined") {
    return process.env.INTERNAL_API_URL || API_URL;
  }
  return API_URL;
}

export function mediaUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function publicFetch(url, { revalidate = 300 } = {}) {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") message = body.detail;
    } catch {}
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
