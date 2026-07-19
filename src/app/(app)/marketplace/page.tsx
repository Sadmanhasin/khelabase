import { PageHeader, ComingSoon } from "@/components/ui/PageHeader";

export const metadata = { title: "Marketplace" };

export default function MarketplacePage() {
  return (
    <div className="px-md py-lg max-w-container-max mx-auto">
      <PageHeader title="Marketplace" subtitle="Jerseys, boots, footballs and gear." icon="storefront" />
      <ComingSoon feature="The Marketplace" />
    </div>
  );
}
