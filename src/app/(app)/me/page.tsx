import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

// "My profile" — resolves to the current user's public player profile.
export default async function MePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/me");
  redirect(`/players/${user.username ?? user.id}`);
}
