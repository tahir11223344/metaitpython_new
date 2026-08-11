/**
 * Sub-services API client.
 *
 * Admin calls  -> apiClient (axios)
 * Public calls -> publicFetch (server components + ISR)
 */

import apiClient from "./apiClient";
import { mediaUrl, publicBaseUrl, publicFetch } from "./publicFetch";

export { mediaUrl };

const BASE = "/sub-services";
const publicBase = () => `${publicBaseUrl()}/public/sub-services`;

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
 * nahi kar pata aur 422 deta hai.
 */
const MULTIPART = { headers: { "Content-Type": "multipart/form-data" } };

/**
 * Form state -> multipart body.
 *
 * Commitments Section ke points ki tadaad fix nahi aur har point ki apni image
 * ho sakti hai. Is liye files ek list me jati hain aur `commitment_image_indexes`
 * batata hai ke kaunsi file kis point ki hai.
 */
function buildBody(values) {
  const { iconFile, ...rest } = values;

  const commitmentFiles = [];
  const commitmentIndexes = [];

  const points = (rest.commitments_section?.points || []).map((point, i) => {
    const { _file, ...clean } = point;
    if (_file) {
      commitmentFiles.push(_file);
      commitmentIndexes.push(i);
    }
    return clean;
  });

  const payload = {
    ...rest,
    commitments_section: { ...rest.commitments_section, points },
  };

  const body = new FormData();
  body.append("payload", JSON.stringify(payload));
  if (iconFile) body.append("icon", iconFile);
  commitmentFiles.forEach((file) => body.append("commitment_images", file));
  body.append("commitment_image_indexes", JSON.stringify(commitmentIndexes));

  return body;
}

/* ------------------------------------------------------------------ admin */

export function getSubServices({
  serviceId = null,
  search = "",
  isActive = null,
  page = 1,
  perPage = 20,
} = {}) {
  const params = { page, per_page: perPage };
  if (serviceId) params.service_id = serviceId;
  if (search) params.search = search;
  if (isActive !== null && isActive !== "") params.is_active = isActive;

  return run(apiClient.get(BASE, { params }));
}

export function getSubService(id) {
  return run(apiClient.get(`${BASE}/${id}`));
}

export function createSubService(values) {
  return run(apiClient.post(BASE, buildBody(values), MULTIPART));
}

export function updateSubService(id, values) {
  return run(apiClient.put(`${BASE}/${id}`, buildBody(values), MULTIPART));
}

export function deleteSubService(id) {
  return run(apiClient.delete(`${BASE}/${id}`));
}

/* ----------------------------------------------------------------- public */

export function getLandingSubServices({ revalidate = 300 } = {}) {
  return publicFetch(`${publicBase()}/landing`, { revalidate });
}

export function getPublicSubService(
  serviceSlug,
  subSlug,
  { revalidate = 300 } = {},
) {
  return publicFetch(`${publicBase()}/${serviceSlug}/${subSlug}`, {
    revalidate,
  });
}
