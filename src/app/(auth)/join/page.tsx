import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "Join Khelabase" };

const ROLES = [
  {
    icon: "sports_soccer",
    title: "Register as Player",
    desc: "Join a team, track stats, and build your career.",
    cta: "Get Started",
    href: "/register?role=player",
    chip: "bg-primary-container text-on-primary-container",
  },
  {
    icon: "groups",
    title: "Create Team",
    desc: "Manage your squad, enter tournaments, and win glory.",
    cta: "Build Team",
    href: "/register?role=team",
    chip: "bg-secondary-container text-on-secondary-container",
  },
  {
    icon: "emoji_events",
    title: "Become Organizer",
    desc: "Host professional tournaments and manage leagues.",
    cta: "Start Hosting",
    href: "/register?role=organizer",
    chip: "bg-tertiary-container text-on-tertiary-container",
    pro: true,
  },
  {
    icon: "favorite",
    title: "Browse as Fan",
    desc: "Follow your favorite teams and stay updated.",
    cta: "Explore Now",
    href: "/register?role=fan",
    chip: "bg-surface-container-high text-primary",
  },
];

export default function JoinPage() {
  return (
    <>
      <div className="text-center mb-xl max-w-2xl">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm md:text-display-lg">
          What would you like to do?
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          Join the heartbeat of Bangladesh&apos;s football community. Choose your path to the pitch.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter w-full max-w-container-max">
        {ROLES.map((role) => (
          <div
            key={role.title}
            className={`group bg-surface-container-lowest rounded-xl p-lg premium-card-shadow flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 overflow-hidden relative ${
              role.pro ? "border-2 border-outline-variant hover:border-secondary" : "border border-outline-variant hover:border-primary"
            }`}
          >
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Icon name={role.icon} size={120} />
            </div>
            {role.pro && (
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed px-2 py-1 rounded-full">
                <Icon name="auto_awesome" filled size={12} />
                <span className="font-label-sm text-label-sm">PRO</span>
              </div>
            )}
            <div className="z-10">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-md ${role.chip}`}>
                <Icon name={role.icon} size={32} />
              </div>
              <h3 className="font-title-lg text-title-lg text-on-surface mb-xs">{role.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-lg">{role.desc}</p>
            </div>
            <Link
              href={role.href}
              className="cta-transition w-full bg-primary text-on-primary font-label-md text-label-md py-md rounded-lg hover:bg-primary-container active:scale-95 flex items-center justify-center gap-xs"
            >
              {role.cta}
              <Icon name="arrow_forward" size={20} />
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-2xl text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </>
  );
}
