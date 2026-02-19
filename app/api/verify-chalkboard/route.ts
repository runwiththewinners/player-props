import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { whopsdk } from "@/lib/whop-sdk";
import { COMPANY_ID, PLAYER_PROPS_PLAN_ID, PLAYER_PROPS_PRODUCT_ID } from "@/lib/constants";

const redis = Redis.fromEnv();

const CLAIM_BY_USER = "cb:user:";
const CLAIM_BY_CB = "cb:chalkboard:";

interface ClaimData {
  whopUserId: string;
  chalkboardUsername: string;
  promoCode: string;
  claimedAt: number;
}

async function checkIsAuthenticated(request: NextRequest): Promise<string | null> {
  try {
    const { userId } = await whopsdk.verifyUserToken(request.headers);
    return userId || null;
  } catch {
    return null;
  }
}

function generatePromoCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "CB-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  const userId = await checkIsAuthenticated(request);
  if (!userId) {
    return NextResponse.json({ error: "Please log in first" }, { status: 401 });
  }

  const existingClaim = await redis.get<ClaimData>(`${CLAIM_BY_USER}${userId}`);
  if (existingClaim) {
    return NextResponse.json({
      error: "already_claimed",
      message: "You've already claimed your free month!",
      promoCode: existingClaim.promoCode,
      checkoutUrl: `https://whop.com/rwtw/rwtw-propboard/?code=${existingClaim.promoCode}`,
    }, { status: 400 });
  }

  try {
    const access = await whopsdk.users.checkAccess(PLAYER_PROPS_PRODUCT_ID, { id: userId });
    if (access.has_access) {
      return NextResponse.json({
        error: "already_has_access",
        message: "You already have Player Props access!",
      }, { status: 400 });
    }
  } catch {}

  const body = await request.json();
  const { imageData, mediaType } = body;

  if (!imageData) {
    return NextResponse.json({ error: "No screenshot uploaded" }, { status: 400 });
  }

  try {
    const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType || "image/png",
                  data: imageData,
                },
              },
              {
                type: "text",
                text: `Analyze this screenshot carefully. I need you to verify if this is a REAL ChalkBoard (chalkboard.io) account screenshot showing:

1. It is from the ChalkBoard app/website (look for ChalkBoard branding, logo, UI elements)
2. The user has an account (look for username, account info, balance info)
3. There is evidence of a deposit of at least $10 (look for balance, deposit history, transaction, or funds added)

Respond ONLY with JSON, no markdown backticks:
{
  "is_valid": true/false,
  "is_chalkboard": true/false,
  "has_account": true/false,
  "has_deposit": true/false,
  "deposit_amount": "amount if visible, or 'unknown'",
  "username": "detected username if visible, or 'unknown'",
  "confidence": "high/medium/low",
  "rejection_reason": "reason if not valid, or null"
}

Be strict - if it doesn't clearly look like ChalkBoard, reject it. If there's no visible evidence of a $10+ deposit, reject it. Look for wallet balance, deposit confirmation, transaction history showing funds added.`,
              },
            ],
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("Claude API error:", aiResponse.status, errText.substring(0, 500));
      return NextResponse.json({
        error: "verification_error",
        message: "Verification service temporarily unavailable. Please try again.",
      }, { status: 503 });
    }

    const aiData = await aiResponse.json();
    const aiText = aiData.content
      ?.map((b: any) => (b.type === "text" ? b.text : ""))
      .join("") || "";
    const clean = aiText.replace(/```json|```/g, "").trim();

    let verification;
    try {
      verification = JSON.parse(clean);
    } catch (e) {
      console.error("Failed to parse Claude response:", clean.substring(0, 500));
      return NextResponse.json({
        error: "verification_error",
        message: "Could not process the screenshot. Please try uploading a clearer image.",
      }, { status: 500 });
    }

    if (!verification.is_valid || !verification.is_chalkboard || !verification.has_deposit) {
      return NextResponse.json({
        error: "verification_failed",
        message: verification.rejection_reason || "Could not verify your ChalkBoard account. Make sure the screenshot shows your ChalkBoard account with a deposit of at least $10.",
        details: {
          is_chalkboard: verification.is_chalkboard,
          has_account: verification.has_account,
          has_deposit: verification.has_deposit,
        },
      }, { status: 400 });
    }

    const cbUsername = (verification.username || "unknown").toLowerCase().trim();
    if (cbUsername !== "unknown") {
      const existingCbClaim = await redis.get(`${CLAIM_BY_CB}${cbUsername}`);
      if (existingCbClaim) {
        return NextResponse.json({
          error: "chalkboard_already_claimed",
          message: "This ChalkBoard account has already been used to claim a free month.",
        }, { status: 400 });
      }
    }

    const promoCode = generatePromoCode();
    const companyApiKey = process.env.WHOP_COMPANY_API_KEY;
    if (!companyApiKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const promoResponse = await fetch("https://api.whop.com/api/v1/promo_codes", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${companyApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount_off: 100,
        base_currency: "usd",
        code: promoCode,
        company_id: COMPANY_ID,
        new_users_only: false,
        promo_duration_months: 1,
        promo_type: "percentage",
        product_id: PLAYER_PROPS_PRODUCT_ID,
        plan_ids: [PLAYER_PROPS_PLAN_ID],
        stock: 1,
        unlimited_stock: false,
      }),
    });

    if (!promoResponse.ok) {
      const errData = await promoResponse.json().catch(() => ({}));
      console.error("Promo code creation failed:", errData);
      return NextResponse.json({
        error: "promo_creation_failed",
        message: "Verification passed but we couldn't create your promo code. Please contact support.",
      }, { status: 500 });
    }

    const claimData: ClaimData = {
      whopUserId: userId,
      chalkboardUsername: cbUsername,
      promoCode: promoCode,
      claimedAt: Date.now(),
    };

    await redis.set(`${CLAIM_BY_USER}${userId}`, claimData);
    if (cbUsername !== "unknown") {
      await redis.set(`${CLAIM_BY_CB}${cbUsername}`, userId);
    }

    const checkoutUrl = `https://whop.com/rwtw/rwtw-propboard/?code=${promoCode}`;

    return NextResponse.json({
      success: true,
      promoCode,
      checkoutUrl,
      chalkboardUsername: cbUsername,
      message: "Your ChalkBoard account has been verified! Use the link below to claim your free month.",
    });

  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json({
      error: "verification_error",
      message: "Something went wrong during verification. Please try again.",
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const userId = await checkIsAuthenticated(request);
  if (!userId) {
    return NextResponse.json({ claimed: false });
  }

  const claim = await redis.get<ClaimData>(`${CLAIM_BY_USER}${userId}`);
  if (claim) {
    return NextResponse.json({
      claimed: true,
      promoCode: claim.promoCode,
      checkoutUrl: `https://whop.com/rwtw/rwtw-propboard/?code=${claim.promoCode}`,
      claimedAt: claim.claimedAt,
    });
  }

  return NextResponse.json({ claimed: false });
}
