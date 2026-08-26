"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { logout } from "@/lib/auth/client";
import { initials } from "@/lib/utils";

export interface HeaderUser {
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

export function AppHeader({
  user,
  backHref,
  center,
}: {
  user: HeaderUser;
  backHref?: string;
  center?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const displayName = user.name?.trim() || user.email.split("@")[0];

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
    router.replace("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
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

        {center && <div className="min-w-0 flex-1">{center}</div>}

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-line-strong bg-surface py-1 pl-1 pr-2.5 transition-colors hover:border-ink/25"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {initials(displayName) || "U"}
              </span>
            )}
            <span className="hidden max-w-[120px] truncate text-sm font-semibold text-ink sm:inline">
              {displayName}
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
                role="menu"
              >
                <div className="border-b border-line px-4 py-3">
                  <p className="truncate text-sm font-semibold text-ink">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-ink-muted">{user.email}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink"
                    role="menuitem"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-ink/[0.04] hover:text-ink disabled:opacity-60"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? "Logging out…" : "Log out"}
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
