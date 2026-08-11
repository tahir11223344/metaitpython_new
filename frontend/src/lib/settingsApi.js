/** Site settings — singleton (poore site ki ek hi settings). */

import apiClient from "./apiClient";
import { apiBase } from "./apiBase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ADMIN = "/site-settings";
const MEDIA = "/media/image"; // logo/favicon upload — case studies jaisa

function toMessage(error) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) =>
        Array.isArray(e.loc) ? `${e.loc[e.loc.length - 1]}: ${e.msg}` : e.msg,
      )
      .join("\n");
  }
  if (typeof detail === "string" && detail.trim()) return detail;
  return error?.message || "Request failed";
}

async function run(promise) {
  try {
    const { data } = await promise;
    return data;
  } catch (error) {
    const err = new Error(toMessage(error));
    err.status = error?.response?.status;
    throw err;
  }
}

/* ------------------------------------------------------------------ admin */

export function getSiteSettings() {
  return run(apiClient.get(ADMIN));
}

export function updateSiteSettings(values) {
  return run(apiClient.put(ADMIN, values));
}

/**
 * Logo/favicon upload. Backend URL string wapas deta hai.
 * NOTE: apiClient ka default JSON content-type multipart ko torta hai, is liye
 * override zaroori hai (yehi bug services form me bhi tha).
 */
export async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  const data = await run(
    apiClient.post(MEDIA, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );
  // Backend { url: "..." } ya { path: "..." } — dono handle kar lein
  return data.url || data.path || data.location || "";
}

/* ----------------------------------------------------------------- public */

export async function getPublicSiteSettings() {
  // Ye layout (server) se chalti hai — Docker me container-internal URL chahiye
  const res = await fetch(`${apiBase()}/public/site-settings`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to load site settings");
  return res.json();
}

/* Relative upload path ko full URL banata hai (header/footer me <img> ke liye) */
export function mediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}${path}`;
}
