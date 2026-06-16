/**
 * Seed script: creates demo accounts, a camp, squads, members and a schedule.
 * Run with `npm run db:seed`. Safe to re-run — it resets demo data first.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeScores } from "../src/lib/scoring/score";
import { isProfileComplete, generateCode } from "../src/lib/member-utils";
import { SQUAD_COLORS } from "../src/lib/enums";

const prisma = new PrismaClient();

const GENDERS = ["MALE", "FEMALE"];
const RESIDENCE = ["BUILDING", "TENT", "HOME"];
const BUILD = ["SLIM", "AVERAGE", "ATHLETIC", "HEAVY"];
const PERSONALITY = ["EXTROVERT", "INTROVERT", "AMBIVERT"];
const SPORTS = ["Футбол", "Волейбол", "Плавання", "Біг", ""];
const LAST = ["Шевченко", "Коваленко", "Бондаренко", "Ткаченко", "Кравчук", "Мельник", "Поліщук", "Савченко", "Руденко", "Левченко"];
const MALE_NAMES = ["Андрій", "Богдан", "Іван", "Максим", "Назар", "Олег", "Петро", "Тарас"];
const FEMALE_NAMES = ["Анна", "Дарина", "Катерина", "Марія", "Олена", "Софія", "Юлія", "Ярина"];

// Deterministic pseudo-random so the demo data is stable across runs.
let seed = 42;
function rnd() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}
const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const scale = () => 1 + Math.floor(rnd() * 5); // 1..5
const chance = (p: number) => rnd() < p;

async function main() {
  console.log("Seeding…");

  // Reset (demo only).
  await prisma.member.deleteMany();
  await prisma.scheduleEntry.deleteMany();
  await prisma.squad.deleteMany();
  await prisma.camp.deleteMany();
  await prisma.user.deleteMany();

  const hash = (p: string) => bcrypt.hash(p, 10);

  const admin = await prisma.user.create({
    data: { name: "Супер Адмін", email: "admin@camp.local", role: "SUPER_ADMIN", passwordHash: await hash("admin12345") },
  });
  await prisma.user.create({
    data: { name: "Директор Табору", email: "director@camp.local", role: "DIRECTOR", passwordHash: await hash("director123") },
  });
  // Four squad leaders, each with a personal account.
  const leaderNames = ["Вожатий Перший", "Вожатий Другий", "Вожатий Третій", "Вожатий Четвертий"];
  const leaders: { id: string; name: string }[] = [];
  for (let i = 0; i < 4; i++) {
    leaders.push(
      await prisma.user.create({
        data: {
          name: leaderNames[i],
          email: `leader${i + 1}@camp.local`,
          role: "LEADER",
          passwordHash: await hash("leader12345"),
        },
      }),
    );
  }

  const camp = await prisma.camp.create({
    data: {
      name: "Табір 2026",
      year: 2026,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-06-14"),
      description: "Літній християнський табір — демо-дані",
    },
  });

  // Four squads, each with a leader account and a named assistant.
  const squadDefs = [
    { name: "Орли", leaderName: "Вожатий Перший", assistant: "Помічник Перший" },
    { name: "Леви", leaderName: "Вожатий Другий", assistant: "Помічник Другий" },
    { name: "Соколи", leaderName: "Вожатий Третій", assistant: "Помічник Третій" },
    { name: "Вовки", leaderName: "Вожатий Четвертий", assistant: "Помічник Четвертий" },
  ].map((d, i) => ({ ...d, leaderUser: leaders[i].id }));
  const squads = [];
  for (let i = 0; i < squadDefs.length; i++) {
    const d = squadDefs[i];
    squads.push(
      await prisma.squad.create({
        data: {
          campId: camp.id,
          name: d.name,
          color: SQUAD_COLORS[i],
          leaderUserId: d.leaderUser,
          leaderName: d.leaderName,
          assistantName: d.assistant,
        },
      }),
    );
  }

  const usedCodes = new Set<string>();
  const uniqueCode = () => {
    let c = generateCode();
    while (usedCodes.has(c)) c = generateCode();
    usedCodes.add(c);
    return c;
  };

  // 30 members per squad (120 total); a few incomplete; two with birthdays this week.
  const PER_SQUAD = 30;
  const TOTAL = squads.length * PER_SQUAD;
  for (let i = 0; i < TOTAL; i++) {
    const gender = pick(GENDERS);
    const firstName = gender === "MALE" ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
    const lastName = pick(LAST);
    const squad = squads[Math.floor(i / PER_SQUAD)]; // exactly 30 per squad
    const complete = i % 7 !== 0; // ~1 in 7 left incomplete

    // Two members get a birthday in the current demo week (June 2026).
    const dob =
      i < 2
        ? new Date(2014, 5, 8 + i)
        : complete
          ? new Date(2010 + (i % 6), Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 27))
          : null;

    const profile = {
      gender,
      // Body metrics are objective — always recorded.
      height: 120 + Math.floor(rnd() * 60), // 120..179 cm
      weight: 25 + Math.floor(rnd() * 45), // 25..69 kg
      build: pick(BUILD),
      doesSports: chance(0.5),
      sportType: pick(SPORTS) || null,
      // Physical traits (1..5)
      agility: complete ? scale() : null,
      strength: complete ? scale() : null,
      endurance: complete ? scale() : null,
      coordination: complete ? scale() : null,
      // Mental ("розумова") traits (1..5)
      intellect: complete ? scale() : null,
      logic: complete ? scale() : null,
      creativity: complete ? scale() : null,
      communication: complete ? scale() : null,
      // Profile info (not scored)
      personalityType: complete ? pick(PERSONALITY) : null,
      isExceptional: chance(0.15),
      firstTimeAtCamp: chance(0.4),
      panicAttacks: chance(0.1),
    };

    const scores = computeScores(profile);

    await prisma.member.create({
      data: {
        campId: camp.id,
        squadId: squad.id,
        code: uniqueCode(),
        isLeader: i % PER_SQUAD === 0, // one leader child at the start of each squad
        isProfileComplete: isProfileComplete({ lastName, firstName, dateOfBirth: dob?.toISOString(), ...profile } as never),
        ...scores,
        lastName,
        firstName,
        dateOfBirth: dob,
        residenceType: pick(RESIDENCE),
        childPhone: chance(0.5) ? "+38067" + Math.floor(1000000 + rnd() * 8999999) : null,
        parentsPhone: "+38050" + Math.floor(1000000 + rnd() * 8999999),
        guardianName: `${lastName} ${gender === "MALE" ? "Олена" : "Сергій"}`,
        address: chance(0.6) ? "м. Київ, вул. Прикладна, " + (1 + Math.floor(rnd() * 100)) : null,
        instagram: chance(0.4) ? "@" + firstName.toLowerCase() + i : null,
        ...profile,
      },
    });
  }

  // Recompute squad aggregates from members.
  for (const squad of squads) {
    const agg = await prisma.member.aggregate({
      where: { squadId: squad.id },
      _sum: { physicalScore: true, mentalScore: true },
    });
    await prisma.squad.update({
      where: { id: squad.id },
      data: {
        totalPhysical: agg._sum.physicalScore ?? 0,
        totalMental: agg._sum.mentalScore ?? 0,
      },
    });
  }

  // A sample day's schedule.
  const day = new Date("2026-06-02T12:00:00");
  const slots = [
    ["08:00", "08:30", "Підйом і зарядка", "Спільна зарядка на майданчику"],
    ["08:30", "09:00", "Сніданок", null],
    ["09:00", "10:30", "Ранкове служіння", "Поклоніння та слово"],
    ["11:00", "13:00", "Загонові ігри", "Активності по загонах"],
    ["13:00", "14:00", "Обід", null],
    ["20:00", "21:30", "Вечірнє багаття", "Спільне зібрання"],
  ];
  for (const [startTime, endTime, title, description] of slots) {
    await prisma.scheduleEntry.create({
      data: { campId: camp.id, date: day, startTime: startTime!, endTime, title: title!, description },
    });
  }

  console.log(`Done. Admin login: admin@camp.local / admin12345`);
  console.log(`Camp "${camp.name}" with ${TOTAL} members and ${squads.length} squads (owner ${admin.email}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
