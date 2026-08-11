/**
 * Services API client.
 *
 * Admin calls  -> apiClient (axios): token aur 401 redirect wahan handle hote hain
 * Public calls -> publicFetch: server components + ISR caching ke liye
 */

import apiClient from "./apiClient";
import { mediaUrl, publicBaseUrl, publicFetch } from "./publicFetch";

export { mediaUrl };

const BASE = "/services"; // apiClient me baseURL already set hai
const publicBase = () => `${publicBaseUrl()}/public/services`;

/** FastAPI ki error shapes ko readable message banata hai. */
function toMessage(error) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((e) => {
        const field = Array.isArray(e.loc) ? e.loc.slice(1).join(".") : "";
        return field ? `${field}: ${e.msg}` : e.msg;
      })
      .join("\n");
  }
  if (typeof detail === "string" && detail.trim()) return detail;
  return error?.message || "Request failed";
}

/** Axios promise ko unwrap karta hai aur error ko readable bana deta hai. */
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

/**
 * Multipart requests ke liye config.
 *
 * ZAROORI: apiClient ka default `Content-Type: application/json` hai. FormData
 * bhejte waqt agar wo header rehne diya jaye to server multipart body parse
 * nahi kar pata aur 422 deta hai. Yahan explicitly override karna parta hai â€”
 * axios FormData dekh kar boundary khud laga deta hai.
 */
const MULTIPART = { headers: { "Content-Type": "multipart/form-data" } };

/** Form state -> multipart body. */
function buildBody(values) {
  const { thumbnailFile, sectionOneFile, sectionTwoFile, ...payload } = values;

  const body = new FormData();
  body.append("payload", JSON.stringify(payload));

  if (thumbnailFile) body.append("thumbnail", thumbnailFile);
  if (sectionOneFile) body.append("section_one_image", sectionOneFile);
  if (sectionTwoFile) body.append("section_two_image", sectionTwoFile);

  return body;
}

/* ------------------------------------------------------------------ admin */

export function getServices({
  search = "",
  isActive = null,
  page = 1,
  perPage = 20,
} = {}) {
  const params = { page, per_page: perPage };
  if (search) params.search = search;
  if (isActive !== null && isActive !== "") params.is_active = isActive;

  return run(apiClient.get(BASE, { params }));
}

export function getService(id) {
  return run(apiClient.get(`${BASE}/${id}`));
}

export function createService(values) {
  return run(apiClient.post(BASE, buildBody(values), MULTIPART));
}

export function updateService(id, values) {
  return run(apiClient.put(`${BASE}/${id}`, buildBody(values), MULTIPART));
}

export function deleteService(id) {
  return run(apiClient.delete(`${BASE}/${id}`));
}

/* ----------------------------------------------------------------- public */

export function getPublicServices({
  page = 1,
  perPage = 100,
  revalidate = 300,
} = {}) {
  const qs = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  return publicFetch(`${publicBase()}?${qs.toString()}`, { revalidate });
}

export function getPublicService(slug, { revalidate = 300 } = {}) {
  return publicFetch(`${publicBase()}/${slug}`, { revalidate });
}


export async function fetchServicesForSlider({ perPage = 12 } = {}) {
  try {
    const data = await getPublicServices({ perPage });
    return (data.items || []).map((s) => ({
      id: s.id,
      title: s.title || "",
      desc: s.short_description || "",
      slug: s.slug || "",
      image: s.thumbnail ? mediaUrl(s.thumbnail) : "",
      imageAlt: s.thumbnail_alt || s.title || "",
    }));
  } catch {
    return [];
  }
}
