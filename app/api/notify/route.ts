import { NextRequest, NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { COMPANY_ID } from "@/lib/constants";

async function checkIsAdmin(request: NextRequest): Promise<boolean> {
  try {
    const { userId } = await whopsdk.verifyUserToken(request.headers);
    if (!userId) return false;
    const access = await whopsdk.users.checkAccess(COMPANY_ID, { id: userId });
    return access.access_level === "admin";
  } catch { return false; }
}

export async function POST(request: NextRequest) {
  const isAdmin = await checkIsAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { team, odds, sport, experienceId, companyId } = body;

  try {
    let result;
    if (experienceId) {
      result = await whopsdk.notifications.create({
        experience_id: experienceId,
        title: `🎯 New Player Prop — ${sport}`,
        subtitle: "FlareGotLocks just dropped a prop",
        content: `${team} (${odds}) — Check it now!`,
      });
    } else {
      result = await whopsdk.notifications.create({
        company_id: companyId || COMPANY_ID,
        title: `🎯 New Player Prop — ${sport}`,
        subtitle: "FlareGotLocks just dropped a prop",
        content: `${team} (${odds}) — Check it now!`,
      });
    }
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: "Failed to send notification", details: error?.message }, { status: 500 });
  }
}
