"use client";

import { useEffect, useState } from "react";

const BASE = "https://abacus.jasoncameron.dev";
const NAMESPACE = "nadoo-language-carousel";
const KEY = "visits";
const STORAGE_KEY = "nadoo-language-carousel:visits-day";

function todayLocal() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const day = todayLocal();
    let counted = false;
    try {
      counted = localStorage.getItem(STORAGE_KEY) === day;
    } catch {
      counted = false;
    }

    const controller = new AbortController();
    fetch(`${BASE}/${counted ? "get" : "hit"}/${NAMESPACE}/${KEY}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("abacus");
        return response.json();
      })
      .then((data: { value?: number }) => {
        if (typeof data.value !== "number" || !Number.isFinite(data.value)) throw new Error("abacus");
        if (!counted) {
          try {
            localStorage.setItem(STORAGE_KEY, day);
          } catch {
            /* private mode */
          }
        }
        setCount(data.value);
      })
      .catch(() => setCount(null));

    return () => controller.abort();
  }, []);

  if (count == null) return <span className="ml-auto" />;

  return (
    <span id="visit-counter" className="ml-auto text-xs font-normal tabular-nums text-muted">
      👁 {count.toLocaleString("en-US")}
    </span>
  );
}
