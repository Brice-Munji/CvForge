"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  isSupabaseConfigured,
  googleClientId,
  signInWithGoogle,
  signInWithGoogleCredential,
} from "@/lib/auth/client";

const GSI_SRC = "https://accounts.google.com/gsi/client";

// Minimal shape of the Google Identity Services API we use.
type GsiCredential = { credential?: string };
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (res: GsiCredential) => void;
          }) => void;
          prompt: () => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") return reject();
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject());
      if (window.google?.accounts?.id) resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.head.appendChild(s);
  });
}

export function GoogleButton({
  label,
  onError,
  redirectTo = "/dashboard",
}: {
  label: string;
  onError?: (message: string) => void;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  // Hidden container that hosts Google's rendered button; we forward clicks to
  // it so the visible UI (our own styled button) is unchanged.
  const hiddenRef = useRef<HTMLDivElement>(null);
  const [gsiReady, setGsiReady] = useState(false);

  const supabase = isSupabaseConfigured();
  const clientId = googleClientId();
  const localGoogle = !supabase && Boolean(clientId);

  useEffect(() => {
    if (!localGoogle) return;
    let cancelled = false;
    loadGsiScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id || !hiddenRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (res: GsiCredential) => {
            if (!res.credential) {
              onError?.("Google sign-in was cancelled.");
              setLoading(false);
              return;
            }
            setLoading(true);
            const { error } = await signInWithGoogleCredential(res.credential);
            if (error) {
              onError?.(error);
              setLoading(false);
              return;
            }
            router.push(redirectTo);
            router.refresh();
          },
        });
        // Render Google's real button into the hidden host so a click produces
        // an ID token even when One Tap is unavailable.
        window.google.accounts.id.renderButton(hiddenRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          width: 320,
        });
        setGsiReady(true);
      })
      .catch(() => onError?.("Couldn't load Google sign-in. Please try again."));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localGoogle, clientId]);

  const handle = async () => {
    if (loading) return;

    if (supabase) {
      setLoading(true);
      const { error } = await signInWithGoogle();
      if (error) {
        onError?.(error);
        setLoading(false);
      }
      return; // success → browser redirects to Google
    }

    if (!localGoogle) {
      onError?.(
        "Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID, or continue with email."
      );
      return;
    }

    // Local GIS: trigger the (hidden) Google button to obtain an ID token.
    const realBtn = hiddenRef.current?.querySelector<HTMLElement>(
      'div[role="button"], button'
    );
    if (gsiReady && realBtn) {
      realBtn.click();
    } else {
      onError?.("Google sign-in is still loading. Please try again in a moment.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-[0.95rem] font-semibold text-ink transition-colors hover:border-ink/30 hover:bg-canvas disabled:opacity-60"
      >
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
          />
        </svg>
        {loading ? "Connecting…" : label}
      </button>
      {/* Off-screen host for Google's rendered button (local GIS flow). */}
      <div
        ref={hiddenRef}
        aria-hidden
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden", opacity: 0 }}
      />
    </>
  );
}
