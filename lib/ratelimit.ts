import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

let ratelimitInstance: Ratelimit | null = null;

if (redisUrl && redisToken) {
  const redis = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  // 3 requests trong 10 phút sliding window
  ratelimitInstance = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '10 m'),
    analytics: true,
    prefix: 'ratelimit:wishes',
  });
}

// In-memory fallback rate limiter khi chưa cấu hình Upstash
const memoryHits = new Map<string, number[]>();

export async function checkRateLimit(ip: string): Promise<{ success: boolean; reset?: number }> {
  if (ratelimitInstance) {
    try {
      const res = await ratelimitInstance.limit(ip);
      return { success: res.success, reset: res.reset };
    } catch (e) {
      console.error('[RateLimit] Upstash error, fallback to pass:', e);
      return { success: true };
    }
  }

  // Memory limiter fallback (10 phút = 600,000ms, max 3 lần)
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const timestamps = (memoryHits.get(ip) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= 3) {
    return { success: false, reset: timestamps[0] + windowMs };
  }

  timestamps.push(now);
  memoryHits.set(ip, timestamps);
  return { success: true };
}
