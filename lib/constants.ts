// Product IDs from Whop dashboard
export const PRODUCTS = {
  FREE: "prod_OVVaWf1nemJrp",
  MAX_BET_POTD: "prod_12U89lKiPpVxP",
  PREMIUM: "prod_o1jjamUG8rP8W",
  PLAYER_PROPS: "prod_RYRii4L26sK9m",
  HIGH_ROLLERS: "prod_bNsUIqwSfzLzU",
} as const;

export const COMPANY_ID = "biz_KfwlM1WObd2QW6";

// These tiers can see player prop plays (High Rollers + Player Props only)
export const PREMIUM_TIERS = [PRODUCTS.PLAYER_PROPS, PRODUCTS.HIGH_ROLLERS];

// These tiers see the paywall
export const PAYWALLED_TIERS = [
  PRODUCTS.FREE,
  PRODUCTS.PREMIUM,
  PRODUCTS.MAX_BET_POTD,
];

// ChalkBoard referral
export const CHALKBOARD_LINK = "https://go.chalkboard.io/websignup-v1-tt?utm_source=promo&offer=flare";
export const CHALKBOARD_CODE = "FLARE";

// For promo code generation
export const PLAYER_PROPS_PLAN_ID = "plan_la8tljuRIc3n3";
export const PLAYER_PROPS_PRODUCT_ID = "prod_RYRii4L26sK9m";
