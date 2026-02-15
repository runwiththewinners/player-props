# RWTW Straight Bets — Whop App

A premium straight bets feed for **FlareGotLocks / Run With The Winners**. Admins post plays (via bet slip AI scanning or manual entry), members see live picks. Paywalled for non-premium tiers.

## Features

- **AI Bet Slip Scanner** — Upload a DraftKings/FanDuel screenshot, Claude reads it and pre-fills the play
- **Live Play Feed** — Pending plays shown to all users (premium sees details, free sees paywall)
- **Admin Grading** — Mark plays as Win/Loss/Push, change results anytime
- **Graded History** — Admin-only collapsible section for past plays
- **Push Notifications** — Whop native notifications when a play drops
- **Tiered Paywall** — Free, Player Props, and Max Bet POTD users see blurred cards with upgrade CTA

## Product Tiers

| Tier | Product ID | Access |
|------|-----------|--------|
| FREE | `prod_OVVaWf1nemJrp` | Paywalled |
| Max Bet POTD | `prod_12U89lKiPpVxP` | Paywalled |
| Player Props | `prod_RYRii4L26sK9m` | Paywalled |
| **Premium** | `prod_o1jjamUG8rP8W` | **Full Access** |
| **High Rollers** | `prod_bNsUIqwSfzLzU` | **Full Access** |

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/rwtw-straight-bets.git
cd rwtw-straight-bets
npm install
```

### 2. Environment Variables

Create `.env.local`:

```
WHOP_API_KEY=your_whop_api_key
NEXT_PUBLIC_WHOP_APP_ID=your_whop_app_id
```

### 3. Add Admin User IDs

Edit `lib/constants.ts` and add your Whop user IDs to `ADMIN_USER_IDS`:

```ts
export const ADMIN_USER_IDS: string[] = [
  "user_xxxxxxxxx", // Your user ID
];
```

### 4. Deploy to Vercel

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy

### 5. Connect to Whop

1. Create a new Whop App (or use your existing one)
2. Set the App URL to your Vercel deployment URL
3. Add a Web App experience pointing to your URL
4. Add the experience to your Premium and High Rollers products

### 6. Push Notifications

In `components/StraightBetsClient.tsx`, update the `/api/notify` call with your `experience_id`:

```ts
await fetch("/api/notify", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    team: playData.team,
    odds: playData.odds,
    sport: playData.sport,
    experienceId: "exp_xxxxxxxx", // Your experience ID
  }),
});
```

## Production Notes

- **Database**: The current API uses in-memory storage. For production, swap with Vercel KV, Supabase, or Planetscale in `app/api/plays/route.ts`
- **Upgrade Button**: When integrating the Whop iframe SDK, replace `window.parent.postMessage` in `PaywallCard` with `iframeSdk.inAppPurchase()`
- **Polling**: Plays refresh every 30 seconds. For real-time updates, integrate Whop websockets

## Local Development

```bash
npm run dev
```

Note: Subscription checking only works when embedded inside Whop (needs user token from iframe).
