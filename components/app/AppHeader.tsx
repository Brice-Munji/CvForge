"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { getUser, signOut, type LocalUser } from "@/lib/auth";
import { initials } from "@/lib/utils";

export function AppHeader({ backHref }: { backHref?: string }) {
  const router = useRouter();
  const [user, setLocalUser] = useState<LocalUser | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setLocalUser(getUser());
    sync();
    window.addEventListener("cvforge:auth", sync);
    return () => window.removeEventListener("cvforge:auth", sync);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const displayName = user?.name || "Guest";
  const displayEmail = user?.email || "Not signed in";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-content items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-4">
          <Logo href="/dashboard" />
          {backHref && (
            <Link
              href={backHref}
              className="hidden text-sm font-medium text-ink-muted transition-colors hover:text-ink sm:inline"
            >
              ← Dashboard
            </Link>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-line-strong bg-surface py-1 pl-1 pr-2.5 transition-colors hover:border-ink/25"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
              {initials(displayName) || "U"}
            </span>
            <ChevronDown className="h-4 w-4 text-ink-muted" />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-line bg-surface shadow-lift"
              >
                <div className="border-b border-line px-4 py-3">
                  <p className="truncate text-sm font-semibold text-ink">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-ink-muted">
                    {displayEmail}
                  </p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      router.push("/");
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
