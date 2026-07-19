# Khelabase ⚽

Bangladesh's football ecosystem — players, teams, tournaments, venues, statistics and community, in one platform.

Built with **Next.js 15 (App Router) · TypeScript · Prisma · PostgreSQL (Neon) · Auth.js · Tailwind CSS**. The design system (colors, typography, spacing) is ported from `khelabase_design_system/DESIGN.md` and the HTML mockups in the sibling folders.

## Getting started

```bash
npm install
npx prisma db push        # sync schema to the database in .env
npm run db:seed           # optional: demo data (login demo@khelabase.com / password123)
npm run dev               # http://localhost:3000
```

Environment (`.env`):

- `DATABASE_URL` — PostgreSQL connection string (Neon).
- `AUTH_SECRET` — Auth.js secret (`npx auth secret` to generate).
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — optional, enables Google login.

## What's implemented

**Foundation** — Next.js app shell (topbar, sidebar, mobile nav), design-system tokens in Tailwind, Prisma schema covering identity, teams, tournaments, matches, statistics, community and venues. Auth.js with email/password + Google, JWT sessions.

**Phase 1 — Identity & Community**
- Landing page with live platform stats
- Register / login / role-select (`/join`)
- User + player profiles (`/players/[username]`, `/me`) with auto-computed career stats
- Community feed with composer, posts, likes
- Explore hub, global search, notifications, settings

**Phase 2 — Teams**
- Create team, team profile with squad, roster management (roles + jersey numbers)
- Join requests with approve/decline + notifications

**Phase 3 — Tournaments**
- Create tournament, public tournament home (overview / teams / fixtures / standings / awards tabs)
- Team registration + organizer approval flow
- Round-robin fixture generator
- Live standings engine (auto-recomputed from recorded results)
- **Live match panel** — log goals/assists/cards/subs with player selection; scores, player stats and standings update automatically; public match center with timeline
- **Awards engine** — auto Top Scorer / Most Assists / Best Goalkeeper / MVP / Fair Play from logged stats
- Organizer dashboard + public organizer profiles

**Phase 4 — Ecosystem**
- Venues: list + profile
- **Marketplace**: category browsing, product detail, cart, cash-on-delivery checkout, seller listing, buyer orders, seller notifications
- **Chat**: 1:1 conversations with unread indicators, message from any profile
- **Admin panel** (isAdmin-gated): dashboard (platform stats + GMV), user management (verify / grant admin), tournament oversight (status control), marketplace oversight

Still to build: finance/invoicing, reports export, friendly/weekly matches, reviews & reporting, PWA/real-time sockets.

## Project layout

```
src/
  app/
    (auth)/         login, register, join
    (app)/          authenticated shell: feed, players, teams,
                    tournaments, venues, organizer, notifications, settings…
    page.tsx        public landing
  components/       ui kit (Button, Card, Input, Avatar, Badge, Icon…), shell, FollowButton
  lib/
    actions/        server actions (auth, posts, teams, tournaments, follow, profile, notifications)
    prisma.ts, auth.ts, session.ts, stats.ts, utils.ts
prisma/
  schema.prisma     data model
  seed.ts           demo data
```

## Utilities

- `npm run db:studio` — Prisma Studio
- `npx tsx prisma/recompute-standings.ts` — recompute all tournament standings from results
