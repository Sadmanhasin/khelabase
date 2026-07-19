import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Help" };

const FAQS = [
  { q: "How do I create a team?", a: "Go to Teams → Create Team, fill in your squad details, and invite players." },
  { q: "How do I register for a tournament?", a: "Open a tournament page and use the Register button if open registration is enabled." },
  { q: "How are statistics calculated?", a: "Every goal, assist, card and clean sheet logged in a match updates player and team stats automatically." },
  { q: "How do I become an organizer?", a: "Create an organizer profile from your account menu, then submit tournaments for approval." },
];

export default function HelpPage() {
  return (
    <div className="px-md py-lg max-w-2xl mx-auto">
      <PageHeader title="Help Center" subtitle="Answers to common questions." icon="help" />
      <div className="space-y-sm">
        {FAQS.map((f) => (
          <Card key={f.q} className="p-lg">
            <h3 className="font-title-lg text-title-lg mb-xs">{f.q}</h3>
            <p className="text-body-md text-on-surface-variant">{f.a}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
