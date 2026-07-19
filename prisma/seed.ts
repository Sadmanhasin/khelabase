import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const POSITIONS = ["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"] as const;
const DISTRICTS = ["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi"];

async function main() {
  console.log("Seeding Khelabase…");
  const passwordHash = await bcrypt.hash("password123", 10);

  // Demo login account
  await prisma.user.upsert({
    where: { email: "demo@khelabase.com" },
    update: {},
    create: {
      email: "demo@khelabase.com",
      name: "Demo Manager",
      username: "demo",
      passwordHash,
      district: "Dhaka",
      isVerified: true,
      bio: "Test-driving Khelabase. Football is life. ⚽",
      playerProfile: {
        create: { preferredPosition: "MIDFIELDER", preferredFoot: "RIGHT", jerseyNumber: 10, experienceLevel: "SEMI_PRO" },
      },
    },
  });

  const names = [
    "Sadman Rahman", "Tanvir Ahmed", "Arjun Mehta", "Rakib Hasan", "Imran Khan",
    "Nayeem Islam", "Sohel Rana", "Jamal Bhuiyan", "Rifat Chowdhury", "Mahdi Karim",
    "Ashraf Ali", "Zico Das", "Fahim Uddin", "Naeem Sarker", "Robiul Islam", "Shakib Noor",
  ];

  const users = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const username = slug(name);
    const user = await prisma.user.upsert({
      where: { email: `${username}@khelabase.com` },
      update: {},
      create: {
        email: `${username}@khelabase.com`,
        name,
        username,
        passwordHash,
        district: DISTRICTS[i % DISTRICTS.length],
        isVerified: i % 4 === 0,
        bio: i % 3 === 0 ? "Local footballer building my career on Khelabase." : null,
        playerProfile: {
          create: {
            preferredPosition: POSITIONS[i % POSITIONS.length],
            preferredFoot: i % 3 === 0 ? "LEFT" : "RIGHT",
            jerseyNumber: (i % 30) + 1,
            heightCm: 165 + (i % 20),
            experienceLevel: ["AMATEUR", "SEMI_PRO", "PRO"][i % 3] as "AMATEUR",
            lookingForTeam: i % 5 === 0,
          },
        },
      },
      include: { playerProfile: true },
    });
    users.push(user);
  }

  // Teams
  const teamDefs = [
    { name: "Bashundhara Kings", type: "CLUB", district: "Dhaka" },
    { name: "Dhaka Tigers FC", type: "SOCIAL", district: "Dhaka" },
    { name: "Chittagong Warriors", type: "CLUB", district: "Chattogram" },
    { name: "Sylhet United", type: "ACADEMY", district: "Sylhet" },
  ] as const;

  const teams = [];
  for (let t = 0; t < teamDefs.length; t++) {
    const def = teamDefs[t];
    const teamSlug = slug(def.name);
    const existing = await prisma.team.findUnique({ where: { slug: teamSlug } });
    if (existing) {
      teams.push(existing);
      continue;
    }
    const memberSlice = users.slice(t * 4, t * 4 + 4);
    const team = await prisma.team.create({
      data: {
        name: def.name,
        slug: teamSlug,
        shortName: def.name.split(" ").map((w) => w[0]).join("").slice(0, 4).toUpperCase(),
        type: def.type,
        district: def.district,
        format: "F11",
        isVerified: t < 2,
        foundedDate: new Date(2015 + t, 0, 1),
        description: `${def.name} — competing in local football across ${def.district}.`,
        members: {
          create: memberSlice.map((u, idx) => ({
            userId: u.id,
            role: idx === 0 ? "OWNER" : idx === 1 ? "CAPTAIN" : "PLAYER",
            jerseyNumber: u.playerProfile?.jerseyNumber ?? idx + 1,
            status: "ACTIVE",
          })),
        },
      },
    });
    teams.push(team);
  }

  // Organizer + venue + tournament
  const organizer = await prisma.organizerProfile.upsert({
    where: { slug: "dhaka-football-association" },
    update: {},
    create: {
      ownerId: users[0].id,
      name: "Dhaka Football Association",
      slug: "dhaka-football-association",
      district: "Dhaka",
      isVerified: true,
      description: "Organizing grassroots football tournaments across Dhaka since 2010.",
    },
  });

  const venue = await prisma.venue.upsert({
    where: { slug: "bashundhara-kings-arena" },
    update: {},
    create: {
      name: "Bashundhara Kings Arena",
      slug: "bashundhara-kings-arena",
      district: "Dhaka",
      address: "Bashundhara R/A, Dhaka",
      rating: 4.7,
      formats: ["F11", "F7"],
      ownerId: users[1].id,
    },
  });

  let tournament = await prisma.tournament.findUnique({ where: { slug: "dhaka-super-cup-2024" } });
  if (!tournament) {
    tournament = await prisma.tournament.create({
      data: {
        name: "Dhaka Super Cup 2024",
        slug: "dhaka-super-cup-2024",
        organizerId: organizer.id,
        venueId: venue.id,
        location: "Dhaka",
        format: "F11",
        type: "LEAGUE",
        status: "ONGOING",
        visibility: "PUBLIC",
        season: "2024",
        entryFee: 5000,
        prizeMoney: 100000,
        startDate: new Date(2024, 10, 1),
        description: "The premier local football tournament in Dhaka.",
        teams: {
          create: teams.map((tm, i) => ({ teamId: tm.id, status: "APPROVED", seed: i + 1 })),
        },
        standings: {
          create: teams.map((tm) => ({ teamId: tm.id })),
        },
      },
    });

    // A couple of matches
    await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        round: "Matchday 1",
        homeTeamId: teams[0].id,
        awayTeamId: teams[1].id,
        venueId: venue.id,
        status: "COMPLETED",
        homeScore: 2,
        awayScore: 1,
        kickoff: new Date(2024, 10, 2, 16, 0),
      },
    });
    // Reflect the completed match in the standings table.
    await prisma.standing.update({
      where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: teams[0].id } },
      data: { played: 1, won: 1, goalsFor: 2, goalsAgainst: 1, points: 3 },
    });
    await prisma.standing.update({
      where: { tournamentId_teamId: { tournamentId: tournament.id, teamId: teams[1].id } },
      data: { played: 1, lost: 1, goalsFor: 1, goalsAgainst: 2, points: 0 },
    });
    await prisma.match.create({
      data: {
        tournamentId: tournament.id,
        round: "Matchday 1",
        homeTeamId: teams[2].id,
        awayTeamId: teams[3].id,
        venueId: venue.id,
        status: "SCHEDULED",
        kickoff: new Date(2024, 11, 20, 18, 0),
      },
    });
  }

  // Posts
  const postCount = await prisma.post.count();
  if (postCount === 0) {
    await prisma.post.createMany({
      data: [
        { authorId: users[0].id, type: "ACHIEVEMENT", content: "Scored my first hat-trick of the season! ⚽⚽⚽ #Khelabase" },
        { authorId: users[2].id, type: "TEXT", content: "Great training session today. The squad is looking sharp for the Super Cup." },
        { authorId: users[5].id, type: "MATCH_RESULT", content: "Full time: Dhaka Tigers 3 - 2 Chittagong Warriors. What a game!" },
        { authorId: users[8].id, type: "TEXT", content: "Looking for a 7-a-side team in Dhaka this weekend. DM me!" },
      ],
    });
  }

  console.log(`Done. Users: ${await prisma.user.count()}, Teams: ${await prisma.team.count()}, Tournaments: ${await prisma.tournament.count()}`);
  console.log("Login with demo@khelabase.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
