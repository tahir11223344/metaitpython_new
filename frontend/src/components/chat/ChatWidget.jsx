"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Headphones,
  X,
  Send,
  Square,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import { streamChat } from "@/lib/chatApi";

const STORAGE_KEY = "metait-chat";
const NUDGE_KEY = "metait-chat-nudge";
const NUDGE_DELAY = 9000;

const GREETING =
  "Hi! I'm the Meta IT assistant. Ask me about our services, or tell me what you're trying to build.";

const SUGGESTIONS = [
  "What services do you offer?",
  "Can you automate our workflows?",
  "I'd like a quote",
];

/* ================================================================== markdown
 *
 * LLM ke jawab me **bold**, lists aur links aam hain. Bina render kiye wo
 * kachche asterisks ki tarah dikhte hain.
 *
 * Ye chhota renderer React elements banata hai — `dangerouslySetInnerHTML`
 * nahi. Is liye model kuch bhi likh de, XSS mumkin nahi.
 */

const INLINE_RE =
  /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\)|https?:\/\/[^\s<>)]+)/g;

function safeHref(url) {
  return /^(https?:|mailto:)/i.test(url) ? url : "#";
}

function renderInline(text) {
  const parts = text.split(INLINE_RE).filter(Boolean);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[12px] text-slate-800">
          {part.slice(1, -1)}
        </code>
      );
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      return (
        <a key={i} href={safeHref(link[2])} target="_blank" rel="noopener noreferrer" className="font-medium text-orange-600 underline underline-offset-2 hover:text-orange-700">
          {link[1]}
        </a>
      );
    }

    if (/^https?:\/\//i.test(part)) {
      return (
        <a key={i} href={safeHref(part)} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-orange-600 underline underline-offset-2 hover:text-orange-700">
          {part}
        </a>
      );
    }

    return <span key={i}>{part}</span>;
  });
}

function Markdown({ text }) {
  const blocks = useMemo(() => {
    const lines = (text || "").split("\n");
    const out = [];
    let list = null;

    const flush = () => {
      if (list) {
        out.push(list);
        list = null;
      }
    };

    for (const line of lines) {
      const bullet = line.match(/^\s*[-*]\s+(.*)$/);
      const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);

      if (bullet || numbered) {
        const type = bullet ? "ul" : "ol";
        if (!list || list.type !== type) {
          flush();
          list = { type, items: [] };
        }
        list.items.push((bullet || numbered)[1]);
        continue;
      }

      flush();
      if (line.trim()) out.push({ type: "p", text: line });
    }
    flush();
    return out;
  }, [text]);

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        if (block.type === "p") {
          return (
            <p key={i} className="leading-relaxed">
              {renderInline(block.text)}
            </p>
          );
        }

        const List = block.type === "ul" ? "ul" : "ol";
        return (
          <List
            key={i}
            className={block.type === "ul" ? "ml-1 list-inside list-disc space-y-1 marker:text-orange-500" : "ml-1 list-inside list-decimal space-y-1 marker:font-semibold marker:text-orange-500"}
          >
            {block.items.map((item, j) => (
              <li key={j} className="leading-relaxed">
                {renderInline(item)}
              </li>
            ))}
          </List>
        );
      })}
    </div>
  );
}

/* ==================================================================== pieces */

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1.5" aria-label="Assistant is typing">
      {[0, 160, 320].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 rounded-full bg-orange-400 motion-safe:animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard block ho sakta hai (insecure origin) — chup chaap chhor dein
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy message"}
      className="rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 focus:opacity-100 group-hover:opacity-100"
    >
      {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
    </button>
  );
}

function Bubble({ role, children, copyText, animate }) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={isUser ? "group flex justify-end" : "group flex justify-start gap-2"}
    >
      {!isUser && (
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-sm">
          <Headphones size={13} aria-hidden="true" />
        </span>
      )}

      <div className={isUser ? "max-w-[82%]" : "flex max-w-[86%] items-start gap-1"}>
        <div
          className={
            isUser
              ? "whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gradient-to-br from-[#454e61] to-[#333b4a] px-4 py-2.5 text-sm text-white shadow-sm"
              : "break-words rounded-2xl rounded-tl-md border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
          }
        >
          {children}
        </div>
        {!isUser && copyText && <CopyButton text={copyText} />}
      </div>
    </motion.div>
  );
}

/* ================================================================= component */

export default function ChatWidget() {
  const reduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [lead, setLead] = useState(null);
  const [nudge, setNudge] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  const abortRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  /* ---------------------------------------------------------- persistence */

  // sessionStorage sirf mount ke baad — warna server aur client HTML alag ho
  // jate hain aur hydration mismatch aata hai.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {
      // private mode me storage band ho sakta hai
    }
  }, []);

  useEffect(() => {
    try {
      if (messages.length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  /* ----------------------------------------------------------- attention */

  const dismissNudge = useCallback(() => {
    setNudge(false);
    try {
      sessionStorage.setItem(NUDGE_KEY, "1");
    } catch {
      // ignore
    }
  }, []);

  // Thori der baad ek halka nudge — session me sirf ek baar
  useEffect(() => {
    if (open) return;
    try {
      if (sessionStorage.getItem(NUDGE_KEY)) return;
    } catch {
      return;
    }

    const t = setTimeout(() => setNudge(true), NUDGE_DELAY);
    return () => clearTimeout(t);
  }, [open]);

  /* -------------------------------------------------------------- scroll */

  // Sirf tab neeche scroll karein jab user pehle se neeche ho. Warna wo upar
  // parh raha hota hai aur content uske neeche se khisak jata hai.
  useEffect(() => {
    if (atBottom) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }, [messages, streaming, atBottom, reduceMotion]);

  function onScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setAtBottom(scrollHeight - scrollTop - clientHeight < 60);
  }

  function jumpToLatest() {
    setAtBottom(true);
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }

  /* --------------------------------------------------------- open effects */

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();
    dismissNudge();

    // Mobile par panel full-screen hai — peeche ka page scroll na ho
    const isMobile = window.matchMedia("(max-width: 639px)").matches;
    const previous = document.body.style.overflow;
    if (isMobile) document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, dismissNudge]);

  // Component hatne par chalta hua stream band kar dein
  useEffect(() => () => abortRef.current?.abort(), []);

  /* ---------------------------------------------------------------- send */

  const send = useCallback(
    async (text) => {
      const content = (text ?? draft).trim();
      if (!content || streaming) return;

      setDraft("");
      setError("");
      setAtBottom(true);
      if (inputRef.current) inputRef.current.style.height = "auto";

      const history = [...messages, { role: "user", content }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamChat({
          messages: history,
          sourcePage: typeof window !== "undefined" ? window.location.pathname : "",
          signal: controller.signal,
          onLeadSaved: setLead,
          onDelta: (chunk) => {
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              next[next.length - 1] = { ...last, content: last.content + chunk };
              return next;
            });
          },
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
          // Khali assistant bubble hata dein, warna adhoora dikhta hai
          setMessages((prev) => (prev[prev.length - 1]?.content ? prev : prev.slice(0, -1)));
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [draft, messages, streaming]
  );

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([]);
    setError("");
    setLead(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const nearLimit = draft.length > 1700;

  /* ================================================================= view */

  return (
    <>
      {/* ---------------------------------------------------- launcher */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 flex items-end gap-2.5"
          >
            <AnimatePresence>
              {nudge && (
                <motion.div
                  initial={{ opacity: 0, x: 12, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 12, scale: 0.95 }}
                  className="mb-2 max-w-[210px] rounded-2xl rounded-br-sm border border-slate-200 bg-white px-3.5 py-2.5 shadow-lg"
                >
                  <p className="flex items-start gap-1.5 text-xs leading-relaxed text-slate-700">
                    <Sparkles size={13} className="mt-0.5 shrink-0 text-orange-500" aria-hidden="true" />
                    Have a question? I can help you find the right service.
                  </p>
                  <button
                    type="button"
                    onClick={dismissNudge}
                    className="mt-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-600"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open chat with Meta IT assistant"
              className="group flex flex-col items-center gap-1"
            >
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_8px_24px_-6px_rgba(234,88,12,0.6)] transition duration-200 group-hover:scale-105">
                <span className="absolute inset-0 rounded-full bg-orange-400 opacity-40 motion-safe:animate-ping" />
                <Headphones size={25} className="relative" aria-hidden="true" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.15em] text-orange-600">
                CHAT
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------- panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Chat with Meta IT assistant"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#fbf8f6] sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[620px] sm:max-h-[calc(100vh-2.5rem)] sm:w-[400px] sm:rounded-[26px] sm:border sm:border-slate-200 sm:shadow-[0_24px_60px_-15px_rgba(15,23,42,0.35)]"
          >
            {/* header */}
            <header className="flex items-center gap-3 bg-gradient-to-br from-[#454e61] to-[#333b4a] px-4 py-3.5 text-white">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-orange-400 ring-1 ring-white/10">
                <Headphones size={19} aria-hidden="true" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#3b4353] bg-green-400" />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold tracking-tight">Meta IT Assistant</p>
                <p className="text-xs text-white/60">Usually replies instantly</p>
              </div>

              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Clear conversation"
                  className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </header>

            {/* messages */}
            <div className="relative flex-1 overflow-hidden">
              <div
                ref={scrollRef}
                onScroll={onScroll}
                aria-live="polite"
                className="h-full space-y-3.5 overflow-y-auto px-4 py-4"
              >
                <Bubble role="assistant">
                  <Markdown text={GREETING} />
                </Bubble>

                {messages.length === 0 && (
                  <div className="flex flex-wrap gap-2 pl-9 pt-0.5">
                    {SUGGESTIONS.map((text, i) => (
                      <motion.button
                        key={text}
                        type="button"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.06 }}
                        onClick={() => send(text)}
                        className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-medium text-orange-600 shadow-sm transition hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                      >
                        {text}
                      </motion.button>
                    ))}
                  </div>
                )}

                {messages.map((message, i) => {
                  const isLast = i === messages.length - 1;
                  const pending = !message.content && streaming && isLast;
                  const done =
                    message.role === "assistant" && message.content && !(streaming && isLast);

                  return (
                    <Bubble
                      key={i}
                      role={message.role}
                      animate={!reduceMotion}
                      copyText={done ? message.content : null}
                    >
                      {pending ? (
                        <TypingDots />
                      ) : message.role === "assistant" ? (
                        <Markdown text={message.content} />
                      ) : (
                        message.content
                      )}
                    </Bubble>
                  );
                })}

                {lead && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-9 flex items-start gap-2.5 rounded-2xl border border-green-200 bg-green-50 px-3.5 py-3"
                  >
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-600" aria-hidden="true" />
                    <div className="min-w-0 text-xs text-green-900">
                      <p className="font-semibold">Details sent to our team</p>
                      <p className="mt-0.5 break-words text-green-800">
                        {lead.name} — {lead.email}
                      </p>
                      <p className="mt-1 text-green-700">We&rsquo;ll be in touch shortly.</p>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <div className="ml-9 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs text-rose-700">
                    <p className="leading-relaxed">{error}</p>
                    {lastUserMessage && (
                      <button
                        type="button"
                        onClick={() => {
                          setMessages((prev) => prev.slice(0, -1));
                          send(lastUserMessage.content);
                        }}
                        className="mt-2 inline-flex items-center gap-1 font-semibold text-rose-800 hover:underline"
                      >
                        <RotateCcw size={12} />
                        Try again
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* upar scroll kiya hua ho to wapas neeche jaane ka rasta */}
              <AnimatePresence>
                {!atBottom && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    onClick={jumpToLatest}
                    className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-md"
                  >
                    <ArrowDown size={13} />
                    Latest
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* composer */}
            <div className="border-t border-slate-200 bg-white px-3 pb-3 pt-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={onKeyDown}
                  placeholder="Write your message…"
                  maxLength={2000}
                  aria-label="Your message"
                  className="max-h-[120px] flex-1 resize-none rounded-2xl border border-slate-200 bg-[#fbf8f6] px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />

                {streaming ? (
                  <button
                    type="button"
                    onClick={() => abortRef.current?.abort()}
                    aria-label="Stop generating"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#3b4353] text-white shadow-sm transition hover:opacity-90"
                  >
                    <Square size={14} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => send()}
                    disabled={!draft.trim()}
                    aria-label="Send message"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_4px_12px_-2px_rgba(234,88,12,0.5)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-200 disabled:shadow-none"
                  >
                    <Send size={16} />
                  </button>
                )}
              </div>

              <div className="mt-2 flex items-center justify-between px-1">
                <p className="text-[10px] text-slate-400">
                  AI assistant — please verify important details.
                </p>
                {nearLimit && (
                  <p className="text-[10px] font-medium text-orange-600">
                    {2000 - draft.length} left
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}