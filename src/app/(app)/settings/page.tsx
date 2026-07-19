import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/settings");

  return (
    <div className="px-md py-lg max-w-2xl mx-auto">
      <PageHeader title="Settings" subtitle="Manage your account and profile." icon="settings" />
      <SettingsForm
        user={{
          name: user.name ?? "",
          bio: user.bio ?? "",
          district: user.district ?? "",
          phone: user.phone ?? "",
        }}
      />
    </div>
  );
}
