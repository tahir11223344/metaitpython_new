"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Mail,
  Phone,
  Trash2,
  Circle,
  CheckCircle2,
  Building2,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import {
  getContactMessages,
  setMessageRead,
  deleteContactMessage,
} from "@/lib/messageApi";

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

export default function ContactMessagesPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getContactMessages({
        search,
        unreadOnly,
        page,
        perPage: PER_PAGE,
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
      setUnread(data.unread || 0);
    } catch (err) {
      setError(err.message || "Couldn't load messages.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, unreadOnly, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function toggleRead(item) {
    setBusyId(item.id);
    try {
      await setMessageRead(item.id, !item.is_read);
      setItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, is_read: !m.is_read } : m)),
      );
      setUnread((u) => (item.is_read ? u + 1 : Math.max(0, u - 1)));
    } catch (err) {
      setError(err.message || "Couldn't update this message.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(item) {
    const ok = window.confirm(
      `Delete the message from ${item.first_name}? This can't be undone.`,
    );
    if (!ok) return;

    setBusyId(item.id);
    try {
      await deleteContactMessage(item.id);
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
      else load();
    } catch (err) {
      setError(err.message || "Couldn't delete this message.");
    } finally {
      setBusyId(null);
    }
  }

  // Message khud padh liya to unread rakhna bemaani hai
  function expand(item) {
    const next = expanded === item.id ? null : item.id;
    setExpanded(next);
    if (next && !item.is_read) toggleRead(item);
  }

  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Contact Messages
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Messages sent from the Contact Us page
            </p>
          </div>
          {unread > 0 && (
            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
              {unread} unread
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3">
          <input
            type="search"
            placeholder="Search name, email, company or message…"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full max-w-sm rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
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
            {search || unreadOnly
              ? "No messages match your search."
              : "No messages yet."}
          </p>
        )}

        <ul className="divide-y divide-slate-100">
          {!loading &&
            items.map((item) => {
              const isOpen = expanded === item.id;
              const fullName =
                `${item.first_name} ${item.last_name || ""}`.trim();

              return (
                <li
                  key={item.id}
                  className={
                    item.is_read
                      ? "px-6 py-4"
                      : "border-l-4 border-orange-400 bg-orange-50/40 px-6 py-4"
                  }
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="font-semibold text-slate-900">
                          {fullName}
                        </p>
                        <span className="text-xs text-slate-400">
                          {formatWhen(item.created_at)}
                        </span>
                      </div>

                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        <a
                          href={`mailto:${item.email}`}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
                        >
                          <Mail size={14} aria-hidden="true" />
                          {item.email}
                        </a>
                        {item.phone && (
                          <a
                            href={`tel:${item.phone.replace(/[^0-9+]/g, "")}`}
                            className="inline-flex items-center gap-1.5 text-slate-600 hover:underline"
                          >
                            <Phone size={14} aria-hidden="true" />
                            {item.phone}
                          </a>
                        )}
                      </div>

                      {(item.company_name || item.company_url) && (
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                          {item.company_name && (
                            <span className="inline-flex items-center gap-1.5 text-slate-600">
                              <Building2 size={14} aria-hidden="true" />
                              {item.company_name}
                            </span>
                          )}
                          {item.company_url && (
                            <a
                              href={item.company_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
                            >
                              <ExternalLink size={14} aria-hidden="true" />
                              {item.company_url.replace(/^https?:\/\//, "")}
                            </a>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => expand(item)}
                        className="mt-2.5 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
                      >
                        <ChevronDown
                          size={14}
                          className={
                            isOpen
                              ? "rotate-180 transition-transform"
                              : "transition-transform"
                          }
                        />
                        {isOpen ? "Hide message" : "Read message"}
                      </button>

                      {isOpen && (
                        <div className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">
                          {item.message}
                          <div className="mt-3 space-y-0.5 text-xs text-slate-400">
                            {item.source_page && (
                              <p>Sent from {item.source_page}</p>
                            )}
                            {item.consent && <p>Consented to be contacted</p>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => toggleRead(item)}
                        disabled={busyId === item.id}
                        title={item.is_read ? "Mark as unread" : "Mark as read"}
                        className="rounded-md border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                      >
                        {item.is_read ? (
                          <Circle size={15} />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item)}
                        disabled={busyId === item.id}
                        title="Delete message"
                        className="rounded-md bg-rose-500 p-2 text-white transition hover:bg-rose-600 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
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
