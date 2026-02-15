import { headers } from "next/headers";
import { whopsdk } from "@/lib/whop-sdk";
import { PRODUCTS, COMPANY_ID } from "@/lib/constants";
import type { UserAccess } from "@/lib/types";
import PlayerPropsClient from "@/components/PlayerPropsClient";

async function getUserAccess(
  experienceId: string
): Promise<UserAccess> {
  try {
    const headersList = headers();
    const { userId } = await whopsdk.verifyUserToken(headersList);

    if (!userId) {
      return {
        experienceId,
        hasPremiumAccess: false,
        isAdmin: false,
        userId: null,
        tier: "FREE",
      };
    }

    let isAdmin = false;
    try {
      const companyAccess = await whopsdk.users.checkAccess(COMPANY_ID, {
        id: userId,
      });
      isAdmin = companyAccess.access_level === "admin";
    } catch {
      isAdmin = false;
    }

    const accessChecks = await Promise.allSettled(
      Object.entries(PRODUCTS).map(async ([tierName, productId]) => {
        try {
          const access = await whopsdk.users.checkAccess(productId, {
            id: userId,
          });
          return { tierName, hasAccess: access.has_access };
        } catch {
          return { tierName, hasAccess: false };
        }
      })
    );

    const accessMap: Record<string, boolean> = {};
    for (const result of accessChecks) {
      if (result.status === "fulfilled") {
        accessMap[result.value.tierName] = result.value.hasAccess;
      }
    }

    // Player Props: Only High Rollers and Player Props subscribers get full access
    const hasPremiumAccess =
      accessMap["PLAYER_PROPS"] === true || accessMap["HIGH_ROLLERS"] === true;

    let tier = "FREE";
    if (accessMap["HIGH_ROLLERS"]) tier = "HIGH_ROLLERS";
    else if (accessMap["PLAYER_PROPS"]) tier = "PLAYER_PROPS";
    else if (accessMap["PREMIUM"]) tier = "PREMIUM";
    else if (accessMap["MAX_BET_POTD"]) tier = "MAX_BET_POTD";
    else if (accessMap["FREE"]) tier = "FREE";

    return { experienceId, hasPremiumAccess, isAdmin, userId, tier };
  } catch (error) {
    console.error("Error checking user access:", error);
    return {
      experienceId,
      hasPremiumAccess: false,
      isAdmin: false,
      userId: null,
      tier: "FREE",
    };
  }
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ experienceId: string }>;
}) {
  const { experienceId } = await params;
  const userAccess = await getUserAccess(experienceId);
  return <PlayerPropsClient userAccess={userAccess} />;
}
