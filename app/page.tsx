import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { PRODUCTS, COMPANY_ID } from "@/lib/constants";
import type { UserAccess } from "@/lib/types";
import PlayerPropsClient from "@/components/PlayerPropsClient";

async function getUserAccess(): Promise<UserAccess> {
  try {
    const headersList = headers();
    const { userId } = await whopsdk.verifyUserToken(headersList);

    if (!userId) {
      return { hasPremiumAccess: false, isAdmin: false, userId: null, tier: "FREE" };
    }

    let isAdmin = false;
    try {
      const companyAccess = await whopsdk.users.checkAccess(COMPANY_ID, { id: userId });
      isAdmin = companyAccess.access_level === "admin";
    } catch { isAdmin = false; }

    const accessChecks = await Promise.allSettled(
      Object.entries(PRODUCTS).map(async ([tierName, productId]) => {
        try {
          const access = await whopsdk.users.checkAccess(productId, { id: userId });
          return { tierName, hasAccess: access.has_access };
        } catch { return { tierName, hasAccess: false }; }
      })
    );

    const accessMap: Record<string, boolean> = {};
    for (const result of accessChecks) {
      if (result.status === "fulfilled") {
        accessMap[result.value.tierName] = result.value.hasAccess;
      }
    }

    const hasPremiumAccess =
      accessMap["PLAYER_PROPS"] === true || accessMap["HIGH_ROLLERS"] === true;

    let tier = "FREE";
    if (accessMap["HIGH_ROLLERS"]) tier = "HIGH_ROLLERS";
    else if (accessMap["PLAYER_PROPS"]) tier = "PLAYER_PROPS";
    else if (accessMap["PREMIUM"]) tier = "PREMIUM";
    else if (accessMap["MAX_BET_POTD"]) tier = "MAX_BET_POTD";
    else if (accessMap["FREE"]) tier = "FREE";

    return { hasPremiumAccess, isAdmin, userId, tier };
  } catch (error) {
    console.error("Error checking user access:", error);
    return { hasPremiumAccess: false, isAdmin: false, userId: null, tier: "FREE" };
  }
}

export default async function Page() {
  const userAccess = await getUserAccess();
  return <PlayerPropsClient userAccess={userAccess} />;
}
