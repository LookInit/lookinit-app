"use server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { headers } from 'next/headers';
import { config } from '../config';
import { TIER_LIMITS, type Tier, subTierKey } from '@/lib/subscription-tiers';

let redis: Redis | undefined;
let limiters: Record<Tier, Ratelimit> | undefined;

function getRedis(): Redis {
  if (!redis) redis = Redis.fromEnv();
  return redis;
}

function getLimiters(): Record<Tier, Ratelimit> {
  if (!limiters) {
    const r = getRedis();
    limiters = {
      anonymous: new Ratelimit({ redis: r, limiter: Ratelimit.fixedWindow(TIER_LIMITS.anonymous, '1 d'), prefix: 'rl:anon' }),
      free:      new Ratelimit({ redis: r, limiter: Ratelimit.fixedWindow(TIER_LIMITS.free,      '1 d'), prefix: 'rl:free' }),
      basic:     new Ratelimit({ redis: r, limiter: Ratelimit.fixedWindow(TIER_LIMITS.basic,     '1 d'), prefix: 'rl:basic' }),
      pro:       new Ratelimit({ redis: r, limiter: Ratelimit.fixedWindow(TIER_LIMITS.pro,       '1 d'), prefix: 'rl:pro' }),
    };
  }
  return limiters;
}

export async function checkRateLimit(streamable: any, userId?: string): Promise<boolean> {
  if (!config.useRateLimiting) return true;

  let tier: Tier;
  let key: string;

  try {
    if (userId) {
      // Look up tier from Redis (written by Stripe webhook — cannot be spoofed by client)
      const storedTier = await getRedis().get<string>(subTierKey(userId));
      tier = (storedTier === 'pro' || storedTier === 'basic') ? storedTier : 'free';
      key = `user:${userId}`;
    } else {
      tier = 'anonymous';
      const h = headers();
      const forwardedFor = h.get('x-forwarded-for')?.split(',')[0]?.trim();
      const ip = forwardedFor || h.get('x-real-ip') || h.get('cf-connecting-ip');
      if (!ip) {
        // No client IP available to key on — don't collapse every anonymous
        // caller into one shared bucket. Fail open, same as a Redis outage.
        console.error('Rate limit check skipped: no client IP header present');
        return true;
      }
      key = ip;
    }

    const { success } = await getLimiters()[tier].limit(key);

    if (!success) {
      streamable.done({ status: 'rateLimitReached' });
    }
    return success;
  } catch (error) {
    // Redis unreachable — fail open so searches still work
    console.error('Rate limit check failed (Redis unreachable):', error);
    return true;
  }
}
