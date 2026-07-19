import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateTeamForm } from "./CreateTeamForm";

export const metadata = { title: "Create Team" };

export default async function CreateTeamPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?callbackUrl=/teams/create");

  return (
    <div className="px-md py-lg max-w-2xl mx-auto">
      <PageHeader title="Create your team" subtitle="Build a squad and start competing." icon="group_add" />
      <CreateTeamForm />
    </div>
  );
}
