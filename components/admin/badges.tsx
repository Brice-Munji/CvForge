import { cn } from "@/lib/utils";

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "amber" | "blue" | "rose" | "ink";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-ink/[0.05] border-line-strong text-ink-soft",
    brand: "bg-brand-50 border-brand-200 text-brand-700",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    rose: "bg-rose-50 border-rose-200 text-rose-800",
    ink: "bg-ink text-canvas border-ink",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return role === "ADMIN" ? <Pill tone="ink">Admin</Pill> : <Pill>User</Pill>;
}

export function PlanBadge({
  tier,
  grantType,
}: {
  tier: "free" | "pro";
  grantType?: string | null;
}) {
  if (tier === "pro")
    return (
      <Pill tone="brand">
        Pro{grantType === "admin" ? " · granted" : ""}
      </Pill>
    );
  return <Pill>Free</Pill>;
}

export function AccountBadge({ disabled }: { disabled: boolean }) {
  return disabled ? <Pill tone="rose">Disabled</Pill> : <Pill tone="brand">Active</Pill>;
}

export function PaymentStatusBadge({ status }: { status: string }) {
  if (status === "SUCCESS") return <Pill tone="brand">Successful</Pill>;
  if (status === "FAILED") return <Pill tone="rose">Failed</Pill>;
  return <Pill tone="amber">Pending</Pill>;
}

export function SubStatusBadge({
  status,
  cancelAtPeriodEnd,
}: {
  status: string;
  cancelAtPeriodEnd?: boolean;
}) {
  if (status === "ACTIVE")
    return cancelAtPeriodEnd ? (
      <Pill tone="amber">Ending</Pill>
    ) : (
      <Pill tone="brand">Active</Pill>
    );
  if (status === "EXPIRED") return <Pill tone="neutral">Expired</Pill>;
  if (status === "PAST_DUE") return <Pill tone="rose">Past due</Pill>;
  if (status === "CANCELED") return <Pill tone="neutral">Canceled</Pill>;
  return <Pill>{status}</Pill>;
}
