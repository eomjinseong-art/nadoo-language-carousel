"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

const UTM_KEY = "utm_src";
const SENT_KEY = "va_landing";

function storageGet(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

export function AnalyticsEvents() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get("utm_source") || "";
    const utmCampaign = params.get("utm_campaign") || "";
    if (utmSource) storageSet(UTM_KEY, utmSource);

    if (!storageGet(SENT_KEY)) {
      storageSet(SENT_KEY, "1");
      let referrer = "";
      if (document.referrer) {
        try {
          referrer = new URL(document.referrer).hostname || "";
        } catch {
          referrer = "";
        }
      }
      track("landing", {
        src: utmSource || referrer || "none",
        campaign: utmCampaign || "none",
      });
    }

    const onClick = (event: MouseEvent) => {
      const node = event.target instanceof Element ? event.target : event.target instanceof Node ? event.target.parentElement : null;
      const link = node?.closest("a");
      if (!link?.href) return;
      let url: URL;
      try {
        url = new URL(link.href);
      } catch {
        return;
      }
      if ((url.protocol !== "http:" && url.protocol !== "https:") || !url.hostname) return;
      if (url.hostname === window.location.hostname) return;
      track("cta_click", {
        dest: url.hostname,
        src: storageGet(UTM_KEY) || "none",
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
