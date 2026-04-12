// Subscription tier limits and Redis key helpers — no "use server", safe to import anywhere

export const TIER_LIMITS = {
  anonymous: 3,
  free: 3,
  basic: 50,
  pro: 200,
} as const;

export type Tier = keyof typeof TIER_LIMITS;

// Redis key for a user's subscription tier (written by Stripe webhook, read by rate limiter)
export const subTierKey = (userId: string) => `sub:tier:${userId}`;
