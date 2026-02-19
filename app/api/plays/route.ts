import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { whopsdk } from "@/lib/whop-sdk";
import { COMPANY_ID, PRODUCTS, PREMIUM_TIERS } from "@/lib/constants";
import type { Play } from "@/lib/types";

const redis = Redis.fromEnv();
const PLAYS_KEY = "player-props:plays";

async function getPlays(): Promise<Play[]> {
  const data = await redis.get<Play[]>(PLAYS_KEY);
  return data || [];
}

async function savePlays(plays: Play[]): Promise<void> {
  await redis.set(PLAYS_KEY, plays);
}

async function getUser(request: NextRequest): Promise<{
  userId: string | null;
  isAdmin: boolean;
  hasPremiumAccess: boolean;
}> {
  try {
    const { userId } = await whopsdk.verifyUserToken(request.headers);
    if (!userId) return { userId: null, isAdmin: false, hasPremiumAccess: false };

    let isAdmin = false;
    try {
      const companyAccess = await whopsdk.users.checkAccess(COMPANY_ID, {
        id: userId,
      });
      isAdmin = companyAccess.access_level === "admin";
    } catch {
      isAdmin = false;
    }

    let hasPremiumAccess = false;
    for (const productId of PREMIUM_TIERS) {
      try {
        const access = await whopsdk.users.checkAccess(productId, {
          id: userId,
        });
        if (access.has_access) {
          hasPremiumAccess = true;
          break;
        }
      } catch {}
    }

    return { userId, isAdmin, hasPremiumAccess };
  } catch {
    return { userId: null, isAdmin: false, hasPremiumAccess: false };
  }
}

// GET /api/plays
export async function GET(request: NextRequest) {
  const user = await getUser(request);
  if (!user.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plays = await getPlays();

  if (user.hasPremiumAccess || user.isAdmin) {
    return NextResponse.json({ plays, isAdmin: user.isAdmin });
  } else {
    const redactedPlays = plays
      .filter((p) => p.result === "pending")
      .map((p) => ({
        id: p.id,
        sport: p.sport,
        postedAt: p.postedAt,
        result: p.result,
        team: "🔒 Locked",
        betType: p.betType,
        odds: "🔒",
        matchup: "🔒 Upgrade to view",
        time: p.time,
        units: 0,
        createdAt: p.createdAt,
      }));
    return NextResponse.json({ plays: redactedPlays, isAdmin: false });
  }
}

// POST /api/plays (admin only)
export async function POST(request: NextRequest) {
  const user = await getUser(request);
  if (!user.isAdmin) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const newPlay: Play = {
    id: `play_${Date.now()}`,
    team: body.team,
    betType: body.betType,
    odds: body.odds,
    matchup: body.matchup,
    time: body.time,
    sport: body.sport,
    result: "pending",
    postedAt:
      new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/New_York",
      }) + " ET",
    units: body.units || 1,
    createdAt: Date.now(),
  };

  const plays = await getPlays();
  plays.unshift(newPlay);
  await savePlays(plays);

  return NextResponse.json({ play: newPlay, success: true });
}

// PATCH /api/plays (admin only)
export async function PATCH(request: NextRequest) {
  const user = await getUser(request);
  if (!user.isAdmin) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { id, result } = body;

  const plays = await getPlays();
  const playIndex = plays.findIndex((p) => p.id === id);
  if (playIndex === -1) {
    return NextResponse.json({ error: "Play not found" }, { status: 404 });
  }

  plays[playIndex].result = result;
  await savePlays(plays);

  return NextResponse.json({ play: plays[playIndex], success: true });
}
