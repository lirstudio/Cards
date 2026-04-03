"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Match @supabase/auth-js parseParametersFromURL (query overrides hash). */
function paramsFromAuthRedirect(href: string): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    const url = new URL(href);
    if (url.hash?.startsWith("#")) {
      const h = new URLSearchParams(url.hash.slice(1));
      h.forEach((value, key) => {
        result[key] = value;
      });
    }
    url.searchParams.forEach((value, key) => {
      result[key] = value;
    });
  } catch {
    /* ignore */
  }
  return result;
}

/**
 * Email links may return tokens or errors in the URL fragment (#...).
 * The server never sees `location.hash`; normalize:
 * - success (access_token + refresh_token) → setSession + redirect
 * - error hash → /login?auth_error=...
 */
export function AuthHashRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (!isSupabaseConfigured() || typeof window === "undefined") return;

    const raw = window.location.hash?.replace(/^#/, "");
    if (!raw) return;

    const params = paramsFromAuthRedirect(window.location.href);
    const access = params.access_token;
    const refresh = params.refresh_token;

    if (access && refresh) {
      void (async () => {
        const supabase = createClient();
        const { error } = await supabase.auth.setSession({
          access_token: access,
          refresh_token: refresh,
        });
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        if (error) {
          router.replace(`/login?auth_error=${encodeURIComponent("auth_callback")}`);
          return;
        }
        const next =
          params.type === "recovery" || params.type === "password_recovery"
            ? "/reset-password"
            : "/dashboard";
        router.replace(next);
      })();
      return;
    }

    const err = params.error;
    const errorCode = params.error_code;
    if (!err && !errorCode) return;

    const desc = (params.error_description ?? "").toLowerCase();

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
