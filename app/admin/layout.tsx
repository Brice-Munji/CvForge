import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/server";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();
  // Server-side authorization — never trust the client.
  if (!user) redirect("/login?redirect=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <AdminShell user={{ name: user.name, email: user.email }}>
      {children}
    </AdminShell>
  );
}
