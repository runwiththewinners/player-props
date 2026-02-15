export type BetResult = "pending" | "win" | "loss" | "push";

export type Sport =
  | "NCAAB"
  | "NBA"
  | "NFL"
  | "NCAAF"
  | "NHL"
  | "MLB"
  | "Soccer"
  | "UFC"
  | "Tennis";

export type BetType =
  | "SPREAD"
  | "MONEYLINE"
  | "OVER/UNDER"
  | "ALTERNATE SPREAD"
  | "PLAYER PROP"
  | "FIRST HALF SPREAD"
  | "FIRST HALF ML"
  | "GAME TOTAL";

export interface Play {
  id: string;
  team: string;
  betType: BetType;
  odds: string;
  matchup: string;
  time: string;
  sport: Sport;
  result: BetResult;
  postedAt: string;
  units: number;
  createdAt: number; // timestamp
}

export interface UserAccess {
  experienceId?: string;
  hasPremiumAccess: boolean;
  isAdmin: boolean;
  userId: string | null;
  tier: string;
}
