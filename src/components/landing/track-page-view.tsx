"use client";

import { useEffect, useRef } from "react";

function sessionStorageDedupeKey(landingPageId: string) {
  return `lc_pv_${landingPageId}`;
}

export function TrackPageView({ landingPageId }: { landingPageId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    try {
      const key = sessionStorageDedupeKey(landingPageId);
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* private mode / blocked storage — still attempt one track */
    }
    fetch("/api/track/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ landing_page_id: landingPageId }),
    }).catch(() => {
      // fire-and-forget — ignore errors
    });
  }, [landingPageId]);

  return null;
}
