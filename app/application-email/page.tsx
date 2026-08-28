import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ApplicationEmailIndex() {
  redirect("/application-email/new");
}
