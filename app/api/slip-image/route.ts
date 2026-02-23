import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { whopsdk } from "@/lib/whop-sdk";
import { PREMIUM_TIERS } from "@/lib/constants";

const redis = Redis.fromEnv();
const SLIP_PREFIX = "player-props:slip:";

export async function GET(request: NextRequest) {
  // Check auth
  let hasPremiumAccess = false;
  let isAdmin = false;
  try {
    const { userId } = await whopsdk.verifyUserToken(request.headers);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const companyAccess = await whopsdk.users.checkAccess("biz_KfwlM1WObd2QW6", { id: userId });
      isAdmin = companyAccess.access_level === "admin";
    } catch {}

    for (const productId of PREMIUM_TIERS) {
      try {
        const access = await whopsdk.users.checkAccess(productId, { id: userId });
        if (access.has_access) {
          hasPremiumAccess = true;
          break;
        }
      } catch {}
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPremiumAccess && !isAdmin) {
    return NextResponse.json({ error: "Premium access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const playId = searchParams.get("id");

  if (!playId) {
    return NextResponse.json({ error: "Missing play ID" }, { status: 400 });
  }

  const imageData = await redis.get<string>(`${SLIP_PREFIX}${playId}`);

  if (!imageData) {
    return NextResponse.json({ error: "Slip image not found" }, { status: 404 });
  }

  return NextResponse.json({ imageData });
}
