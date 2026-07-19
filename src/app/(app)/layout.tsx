import { auth } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { TopBar } from "@/components/shell/TopBar";
import { Sidebar, MobileBottomNav } from "@/components/shell/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        username: session.user.username,
        image: session.user.image,
        isAdmin: session.user.isAdmin ?? false,
      }
    : null;

  return (
    <SessionProvider>
      <TopBar user={user} />
      <div className="mx-auto flex min-h-screen relative max-w-[1440px]">
        <Sidebar />
        <div className="flex-1 lg:ml-64 w-full pb-20 lg:pb-0">{children}</div>
      </div>
      <MobileBottomNav />
    </SessionProvider>
  );
}
