import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AdminUserNotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-heading font-bold text-ink">User not found</h1>
      <p className="mt-3 text-ink-muted">This account doesn&apos;t exist.</p>
      <div className="mt-8 flex justify-center">
        <Button href="/admin/users">Back to users</Button>
      </div>
    </div>
  );
}
