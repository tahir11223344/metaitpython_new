"use client";

import { useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile — captcha ka wo version jo zyadatar visitors ko puzzle
 * nahi dikhata, sirf ek tick.
 *
 * Site key na ho to `captchaEnabled` false hota hai aur component kuch render
 * nahi karta — form pehle jaisa chalta rehta hai. Backend bhi usi soorat me
 * captcha verify skip kar deta hai.
 *
 * frontend/.env.local:
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAA...
 */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const captchaEnabled = Boolean(SITE_KEY);

// Script sirf ek baar load ho, chahe widget kitni jagah bhi ho
let scriptPromise = null;

function loadScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * @param onVerify  (token) => void
 * @param onExpire  () => void   token expire ya error hone par
 * @param onFail    () => void   script hi load na ho saki (ad blocker waghera)
 * @param resetKey  badalne par widget reset — token single-use hota hai
 */
export default function Turnstile({
  onVerify,
  onExpire,
  onFail,
  theme = "light",
  resetKey = 0,
}) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Callbacks ref me — warna har parent render par identity badalti hai aur
  // widget baar baar dobara ban'ta hai.
  const cbRef = useRef({ onVerify, onExpire, onFail });
  useEffect(() => {
    cbRef.current = { onVerify, onExpire, onFail };
  });

  useEffect(() => {
    if (!SITE_KEY) return undefined;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme,
          callback: (token) => cbRef.current.onVerify?.(token),
          "expired-callback": () => cbRef.current.onExpire?.(),
          "error-callback": () => cbRef.current.onExpire?.(),
        });
      })
      .catch(() => {
        // Ad blocker ya network. Visitor ko rasta dena zaroori hai —
        // parent ise pakar kar fallback message dikhata hai.
        console.warn("[Turnstile] script could not load");
        cbRef.current.onFail?.();
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // widget already ja chuka
        }
        widgetIdRef.current = null;
      }
    };
  }, [theme]);

  // Token ek hi baar chalta hai. Har submit ke baad reset zaroori hai, warna
  // doosri koshish par "invalid token" aata hai.
  useEffect(() => {
    if (!resetKey || !widgetIdRef.current || !window.turnstile) return;
    try {
      window.turnstile.reset(widgetIdRef.current);
    } catch {
      // ignore
    }
  }, [resetKey]);

  if (!SITE_KEY) return null;

  return <div ref={containerRef} className="min-h-[65px]" />;
}