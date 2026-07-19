import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateTournamentForm } from "./CreateTournamentForm";

export const metadata = { title: "Create Tournament" };

export default async function CreateTournamentPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?callbackUrl=/tournaments/create");

  const organizer = await prisma.organizerProfile.findFirst({
    where: { ownerId: userId },
    select: { name: true },
  });

  return (
    <div className="px-md py-lg max-w-2xl mx-auto">
      <PageHeader title="Create a tournament" subtitle="Set up your competition in a few steps." icon="emoji_events" />
      <CreateTournamentForm existingOrganizer={organizer?.name ?? null} />
    </div>
  );
}
