import { NextRequest, NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";
import { COMPANY_ID } from "@/lib/constants";

async function checkIsAdmin(request: NextRequest): Promise<boolean> {
  try {
    const { userId } = await whopsdk.verifyUserToken(request.headers);
    if (!userId) return false;
    const companyAccess = await whopsdk.users.checkAccess(COMPANY_ID, { id: userId });
    return companyAccess.access_level === "admin";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const isAdmin = await checkIsAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await request.json();
  const { imageData, mediaType } = body;

  if (!imageData) {
    return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
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
        max_tokens: 2000,
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
                text: `Read this bet slip / parlay screenshot from ChalkBoard or any sportsbook. Extract EVERY leg in the parlay.

For each leg, extract:
- player: The player name and their prop (e.g. "LeBron James Over 25.5 Points")  
- prop: The prop type (e.g. "Over", "Under", "Over/Under", "Moneyline", "Spread")
- line: The line/number (e.g. "O 25.5", "U 3.5", "-110")
- matchup: The two teams playing (e.g. "Lakers vs Celtics")
- sport: One of: NBA, NFL, NCAAB, NCAAF, NHL, MLB, Soccer, UFC, Tennis

Also extract the overall parlay odds if visible.

Respond ONLY with JSON, no markdown backticks:
{
  "legs": [
    {
      "player": "Player Name Prop Description",
      "prop": "Over",
      "line": "O 25.5",
      "matchup": "Team A vs Team B",
      "sport": "NBA"
    }
  ],
  "odds": "+450",
  "num_legs": 2
}

Be thorough - extract ALL legs from the slip. If you can't read a specific field, use your best guess based on context. The player field should contain both the player name AND the prop description.`,
              },
            ],
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("Claude API error:", aiResponse.status, errText.substring(0, 500));
      return NextResponse.json({ error: "Could not scan slip" }, { status: 503 });
    }

    const aiData = await aiResponse.json();
    const aiText = aiData.content
      ?.map((b: any) => (b.type === "text" ? b.text : ""))
      .join("") || "";
    const clean = aiText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("Failed to parse scan response:", clean.substring(0, 500));
      return NextResponse.json({ error: "Could not read the slip" }, { status: 500 });
    }

    return NextResponse.json({
      legs: parsed.legs || [],
      odds: parsed.odds || "",
      num_legs: parsed.num_legs || (parsed.legs?.length || 0),
    });

  } catch (error: any) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: "Something went wrong scanning the slip" }, { status: 500 });
  }
}
