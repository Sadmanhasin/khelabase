import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { SellForm } from "./SellForm";

export const metadata = { title: "Sell a Product" };

export default async function SellPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?callbackUrl=/marketplace/sell");

  return (
    <div className="px-md py-lg max-w-2xl mx-auto">
      <PageHeader title="List a product" subtitle="Sell football gear to the community." icon="add_business" />
      <SellForm />
    </div>
  );
}
