"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Supabase sometimes returns auth errors in the URL hash (e.g. otp_expired).
 * The server never sees `location.hash`, so we translate to query params and
 * send the user to /login with a readable error.
 */
export function AuthHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    const raw = window.location.hash?.replace(/^#/, "");
    if (!raw) return;

    const params = new URLSearchParams(raw);
    const err = params.get("error");
    const errorCode = params.get("error_code");
    if (!err && !errorCode) return;

    const desc = (params.get("error_description") ?? "").toLowerCase();

    let authError = "auth_callback";
    if (errorCode === "otp_expired" || desc.includes("expired") || desc.includes("invalid")) {
      authError = "otp_expired";
    } else if (err === "access_denied") {
      authError = "access_denied";
    }

    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    router.replace(`/login?auth_error=${encodeURIComponent(authError)}`);
  }, [router]);

  return null;
}
