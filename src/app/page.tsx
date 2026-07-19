import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/ui/Icon";
import { compactNumber } from "@/lib/utils";

const FEATURES = [
  { icon: "sports_soccer", title: "Player Careers", desc: "Build a football identity with auto-tracked stats, awards and a career timeline." },
  { icon: "group", title: "Team Management", desc: "Run your squad, manage members, jerseys and enter tournaments." },
  { icon: "emoji_events", title: "Tournaments", desc: "Organize knockouts and leagues with fixtures, standings and live match panels." },
  { icon: "insights", title: "Live Statistics", desc: "Every goal, assist and clean sheet updates leaderboards instantly." },
  { icon: "stadium", title: "Venues", desc: "Discover turfs and grounds with facilities, ratings and upcoming matches." },
  { icon: "storefront", title: "Marketplace", desc: "Shop jerseys, boots and gear from the football economy." },
];

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/feed");

  const [players, teams, tournaments] = await Promise.all([
    prisma.user.count(),
    prisma.team.count(),
    prisma.tournament.count(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md shadow-sm">
        <nav className="max-w-container-max mx-auto flex justify-between items-center px-lg h-16">
          <div className="flex items-center gap-xl">
            <span className="text-headline-md font-extrabold text-primary tracking-tight">Khelabase</span>
            <div className="hidden md:flex items-center gap-lg">
              <Link href="/explore" className="text-label-md text-on-surface-variant hover:text-primary transition-colors">Explore</Link>
              <Link href="/tournaments" className="text-label-md text-on-surface-variant hover:text-primary transition-colors">Tournaments</Link>
              <Link href="/teams" className="text-label-md text-on-surface-variant hover:text-primary transition-colors">Teams</Link>
              <Link href="/marketplace" className="text-label-md text-on-surface-variant hover:text-primary transition-colors">Marketplace</Link>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <Link href="/login" className="hidden sm:block px-lg py-xs text-label-md text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all">Login</Link>
            <Link href="/join" className="px-lg py-2 text-label-md font-bold bg-primary text-on-primary rounded-lg shadow-sm hover:opacity-90 transition-all">Join Free</Link>
          </div>
        </nav>
      </header>

      <main className="pt-16">
        <section className="relative min-h-[560px] flex flex-col items-center justify-center text-center px-gutter py-2xl overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-[0.15] pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[400px] border-2 border-primary rounded-[100%]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[200px] border-2 border-primary rounded-[100%]" />
          </div>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-xs bg-surface-container-high text-primary px-md py-1 rounded-full mb-md">
              <Icon name="verified" filled size={16} />
              <span className="text-label-md">Bangladesh&apos;s Football Ecosystem</span>
            </div>
            <h1 className="text-headline-lg md:text-display-lg font-extrabold text-on-surface mb-md">
              The Home of Football in Bangladesh
            </h1>
            <p className="text-body-lg text-on-surface-variant mb-xl max-w-2xl mx-auto">
              Discover tournaments, teams, players and venues in one complete ecosystem — where players build careers, teams win glory, and organizers run professional competitions.
            </p>
            <div className="flex flex-col sm:flex-row gap-sm justify-center">
              <Link href="/join" className="px-xl h-12 flex items-center justify-center gap-xs bg-primary text-on-primary font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all">
                Get Started Free <Icon name="arrow_forward" size={20} />
              </Link>
              <Link href="/explore" className="px-xl h-12 flex items-center justify-center gap-xs bg-surface-container-lowest border border-outline-variant font-bold rounded-xl hover:border-primary transition-all">
                Explore the Community
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-xl">
          <div className="max-w-container-max mx-auto px-gutter grid grid-cols-3 gap-lg text-center">
            <Stat value={players} label="Players" />
            <Stat value={teams} label="Teams" divider />
            <Stat value={tournaments} label="Tournaments" />
          </div>
        </section>

        <section className="py-2xl max-w-container-max mx-auto px-gutter">
          <div className="text-center mb-xl">
            <h2 className="text-headline-lg font-extrabold text-on-surface">One platform, the whole game</h2>
            <p className="text-body-md text-on-surface-variant mt-xs">Five ecosystems working together.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg premium-card-shadow hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-lg bg-primary-container/15 text-primary flex items-center justify-center mb-md">
                  <Icon name={f.icon} size={28} />
                </div>
                <h3 className="font-title-lg text-title-lg mb-xs">{f.title}</h3>
                <p className="text-body-md text-on-surface-variant">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-container-max mx-auto px-gutter pb-2xl">
          <div className="rounded-xl bg-primary text-on-primary p-2xl text-center relative overflow-hidden">
            <h2 className="text-headline-lg font-extrabold mb-sm relative z-10">Ready to step onto the pitch?</h2>
            <p className="text-body-lg opacity-90 mb-lg relative z-10">Create your free football profile in under a minute.</p>
            <Link href="/join" className="relative z-10 inline-flex items-center gap-xs bg-on-primary text-primary font-bold px-xl h-12 rounded-xl hover:opacity-90 transition-all">
              Join Khelabase <Icon name="arrow_forward" size={20} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant bg-surface py-xl">
        <div className="max-w-container-max mx-auto px-lg flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="text-label-sm text-on-surface-variant">© 2024 Khelabase. Bangladesh&apos;s Premier Football Ecosystem.</div>
          <div className="flex gap-lg">
            <Link href="/help" className="text-label-sm text-on-surface-variant hover:text-primary">Help</Link>
            <a href="#" className="text-label-sm text-on-surface-variant hover:text-primary">Privacy</a>
            <a href="#" className="text-label-sm text-on-surface-variant hover:text-primary">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label, divider }: { value: number; label: string; divider?: boolean }) {
  return (
    <div className={divider ? "border-x border-outline-variant" : ""}>
      <div className="text-headline-lg md:text-display-lg font-extrabold text-primary">
        {compactNumber(value)}
      </div>
      <div className="text-label-md text-on-surface-variant uppercase tracking-widest">{label}</div>
    </div>
  );
}
