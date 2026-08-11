"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, Phone, Trash2, Circle, CheckCircle2 } from "lucide-react";
import { getLeads, setLeadRead, deleteLead } from "@/lib/leadApi";

const PER_PAGE = 20;

function formatWhen(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

export default function ChatLeadsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getLeads({ unreadOnly, page, perPage: PER_PAGE });
      setItems(data.items || []);
      setTotal(data.total || 0);
      setUnread(data.unread || 0);
    } catch (err) {
      setError(err.message || "Couldn't load leads.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [unreadOnly, page]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleRead(lead) {
    setBusyId(lead.id);
    try {
      await setLeadRead(lead.id, !lead.is_read);
      // Poori list dobara laane ke bajaye sirf ye row update karein
      setItems((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, is_read: !l.is_read } : l)),
      );
      setUnread((u) => (lead.is_read ? u + 1 : Math.max(0, u - 1)));
    } catch (err) {
      setError(err.message || "Couldn't update this lead.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(lead) {
    const ok = window.confirm(
      `Delete the lead from ${lead.name}? This can't be undone.`,
    );
    if (!ok) return;

    setBusyId(lead.id);
    try {
      await deleteLead(lead.id);
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
      else load();
    } catch (err) {
      setError(err.message || "Couldn't delete this lead.");
    } finally {
      setBusyId(null);
    }
  }

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Chat Leads</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Contact details visitors left in the website chat
            </p>
          </div>
          {unread > 0 && (
            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
              {unread} unread
            </span>
          )}
        </div>

        <div className="flex gap-3 border-b border-slate-200 bg-slate-50 px-6 py-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => {
                setPage(1);
                setUnreadOnly(e.target.checked);
              }}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            Unread only
          </label>
        </div>

        {error && (
          <div className="border-b border-rose-200 bg-rose-50 px-6 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && (
          <p className="px-6 py-12 text-center text-slate-500">Loading…</p>
        )}

        {!loading && items.length === 0 && (
          <p className="px-6 py-12 text-center text-slate-600">
            {unreadOnly ? "No unread leads." : "No leads yet."}
          </p>
        )}

        <ul className="divide-y divide-slate-100">
          {!loading &&
            items.map((lead) => (
              <li
                key={lead.id}
                className={
                  lead.is_read
                    ? "px-6 py-4"
                    : "border-l-4 border-orange-400 bg-orange-50/40 px-6 py-4"
                }
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-semibold text-slate-900">
                        {lead.name}
                      </p>
                      {lead.interest && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          {lead.interest}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {formatWhen(lead.created_at)}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <a
                        href={`mailto:${lead.email}`}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
                      >
                        <Mail size={14} aria-hidden="true" />
                        {lead.email}
                      </a>
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone.replace(/[^0-9+]/g, "")}`}
                          className="inline-flex items-center gap-1.5 text-slate-600 hover:underline"
                        >
                          <Phone size={14} aria-hidden="true" />
                          {lead.phone}
                        </a>
                      )}
                    </div>

                    {lead.summary && (
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {lead.summary}
                      </p>
                    )}
                    {lead.source_page && (
                      <p className="mt-1 text-xs text-slate-400">
                        From {lead.source_page}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleRead(lead)}
                      disabled={busyId === lead.id}
                      title={lead.is_read ? "Mark as unread" : "Mark as read"}
                      className="rounded-md border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                    >
                      {lead.is_read ? (
                        <Circle size={15} />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(lead)}
                      disabled={busyId === lead.id}
                      title="Delete lead"
                      className="rounded-md bg-rose-500 p-2 text-white transition hover:bg-rose-600 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
        </ul>

        {lastPage > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3">
            <span className="text-sm text-slate-500">
              Page {page} of {lastPage}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page >= lastPage}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm transition hover:bg-slate-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
