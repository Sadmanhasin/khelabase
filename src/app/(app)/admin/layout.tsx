import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { AdminNav } from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login?callbackUrl=/admin");
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  if (!user?.isAdmin) redirect("/feed");

  return (
    <div className="px-md py-lg max-w-container-max mx-auto">
      <div className="flex items-center gap-sm mb-lg">
        <div className="w-11 h-11 rounded-xl bg-charcoal text-white flex items-center justify-center">
          <span className="material-symbols-outlined">admin_panel_settings</span>
        </div>
        <div>
          <h1 className="font-headline-lg text-headline-md text-on-surface">Super Admin</h1>
          <p className="text-body-md text-on-surface-variant">Platform control center</p>
        </div>
        <Link href="/feed" className="ml-auto text-primary font-bold text-label-md">Exit</Link>
      </div>
      <AdminNav />
      <div className="mt-lg">{children}</div>
    </div>
  );
}
