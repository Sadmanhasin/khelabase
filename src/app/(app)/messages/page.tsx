import { PageHeader, ComingSoon } from "@/components/ui/PageHeader";

export const metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <div className="px-md py-lg max-w-container-max mx-auto">
      <PageHeader title="Messages" subtitle="Chat with players, teams and organizers." icon="chat" />
      <ComingSoon feature="Chat" />
    </div>
  );
}
