"use client";

import { useEffect, useRef } from "react";

export function TrackPageView({ landingPageId }: { landingPageId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
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
