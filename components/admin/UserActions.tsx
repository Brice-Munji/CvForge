"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  ShieldOff,
  Shield,
  Ban,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

type ActionKey = "grant_pro" | "revoke_pro" | "change_role" | "disable" | "enable";

interface Dialog {
  action: ActionKey;
  title: string;
  body: string;
  cta: string;
  danger?: boolean;
  withReason?: boolean;
  role?: string;
}

export function UserActions({
  userId,
  role,
  disabled,
  tier,
  isSelf,
}: {
  userId: string;
  role: string;
  disabled: boolean;
  tier: "free" | "pro";
  isSelf: boolean;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = (d: Dialog) => {
    setReason("");
    setError(null);
    setDialog(d);
  };

  const run = async () => {
    if (!dialog || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: dialog.action,
          reason,
          role: dialog.role,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "The action couldn't be completed.");
      setDialog(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2.5">
      {tier === "pro" ? (
        <ActionBtn
          icon={<ShieldOff className="h-4 w-4" />}
          label="Revoke Pro"
          onClick={() =>
            open({
              action: "revoke_pro",
              title: "Revoke Pro access?",
              body: "The user will move to the Free plan. Their data is never deleted.",
              cta: "Revoke Pro",
              withReason: true,
              danger: true,
            })
          }
        />
      ) : (
        <ActionBtn
          icon={<Crown className="h-4 w-4" />}
          label="Grant Pro"
          primary
          onClick={() =>
            open({
              action: "grant_pro",
              title: "Grant Pro access",
              body: "Manually grant CVForge Pro (an administrative entitlement — not a payment).",
              cta: "Grant Pro",
              withReason: true,
            })
          }
        />
      )}

      {role === "ADMIN" ? (
        <ActionBtn
          icon={<Shield className="h-4 w-4" />}
          label="Remove admin role"
          disabled={isSelf}
          onClick={() =>
            open({
              action: "change_role",
              role: "USER",
              title: "Remove admin role?",
              body: "This user will lose access to the admin dashboard.",
              cta: "Remove admin",
              danger: true,
            })
          }
        />
      ) : (
        <ActionBtn
          icon={<Shield className="h-4 w-4" />}
          label="Make admin"
          onClick={() =>
            open({
              action: "change_role",
              role: "ADMIN",
              title: "Grant admin role?",
              body: "This user will gain full access to the admin dashboard.",
              cta: "Make admin",
            })
          }
        />
      )}

      {disabled ? (
        <ActionBtn
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Enable account"
          onClick={() =>
            open({
              action: "enable",
              title: "Enable this account?",
              body: "The user will regain access to CVForge.",
              cta: "Enable account",
            })
          }
        />
      ) : (
        <ActionBtn
          icon={<Ban className="h-4 w-4" />}
          label="Disable account"
          disabled={isSelf}
          onClick={() =>
            open({
              action: "disable",
              title: "Disable this account?",
              body: "The user will no longer be able to use CVForge. Their data is kept and can be restored by enabling the account.",
              cta: "Disable account",
              danger: true,
            })
          }
        />
      )}

      {isSelf && (
        <p className="pt-1 text-xs text-ink-faint">
          Some actions are disabled on your own account.
        </p>
      )}

      <Modal open={Boolean(dialog)} onClose={() => !busy && setDialog(null)} labelledBy="ua-title">
        {dialog && (
          <>
            <h2 id="ua-title" className="font-display text-xl font-bold text-ink">
              {dialog.title}
            </h2>
            <p className="mt-2 text-ink-muted">{dialog.body}</p>

            {dialog.withReason && (
              <div className="mt-4">
                <label className="mb-1.5 block text-[0.8rem] font-semibold text-ink-soft">
                  Reason (recorded in the audit log)
                </label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Partnership, support, testing"
                />
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDialog(null)} disabled={busy}>
                Cancel
              </Button>
              <Button
                onClick={run}
                disabled={busy}
                className={dialog.danger ? "bg-red-600 shadow-none hover:bg-red-700" : ""}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : dialog.cta}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  primary,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        "flex w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 " +
        (primary
          ? "border-brand-600 bg-brand-600 text-white hover:bg-brand-700"
          : "border-line-strong bg-surface text-ink hover:border-ink/30")
      }
    >
      {icon}
      {label}
    </button>
  );
}
