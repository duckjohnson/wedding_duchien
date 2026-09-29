import { Redis } from '@upstash/redis';
import { nanoid } from 'nanoid';

export type AttendChoice = 'Có' | 'Không' | 'Chưa chắc';

export interface RsvpItem {
  id: string;
  name: string;
  phone: string;
  attend: AttendChoice;
  guests: string;
  side: string;
  message: string;
  linkGuest: string;
  submittedAt: string;
}

export interface RsvpRepo {
  list(params?: { limit?: number }): Promise<{ items: RsvpItem[]; total: number }>;
  create(data: Omit<RsvpItem, 'id' | 'submittedAt'>): Promise<RsvpItem>;
  remove(id: string): Promise<boolean>;
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const hasRedis = Boolean(redisUrl && redisToken);

// ==========================================
// 1. Upstash Redis Implementation cho RSVP
// ==========================================
class UpstashRsvpRepo implements RsvpRepo {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: redisUrl!,
      token: redisToken!,
    });
  }

  async list(params?: { limit?: number }): Promise<{ items: RsvpItem[]; total: number }> {
    const limit = params?.limit ?? 500;
    const total = await this.redis.zcard('rsvps:all');
    if (total === 0) {
      return { items: [], total: 0 };
    }

    const ids = await this.redis.zrange<string[]>('rsvps:all', 0, limit - 1, { rev: true });
    if (!ids || ids.length === 0) {
      return { items: [], total };
    }

    const keys = ids.map((id) => `rsvp:${id}`);
    const rawRsvps = await this.redis.mget<unknown[]>(...keys);

    const items: RsvpItem[] = [];
    for (const r of rawRsvps) {
      if (!r) continue;
      try {
        const item: RsvpItem = typeof r === 'string' ? JSON.parse(r) : (r as RsvpItem);
        if (item && item.id) {
          items.push(item);
        }
      } catch {
        // bỏ qua phần tử lỗi
      }
    }

    return { items, total };
  }

  async create(data: Omit<RsvpItem, 'id' | 'submittedAt'>): Promise<RsvpItem> {
    const id = nanoid(10);
    const now = new Date();
    const timestamp = now.getTime();

    const item: RsvpItem = {
      ...data,
      id,
      submittedAt: now.toISOString(),
    };

    const pipe = this.redis.pipeline();
    pipe.set(`rsvp:${id}`, JSON.stringify(item));
    pipe.zadd('rsvps:all', { score: timestamp, member: id });
    await pipe.exec();

    return item;
  }

  async remove(id: string): Promise<boolean> {
    const pipe = this.redis.pipeline();
    pipe.del(`rsvp:${id}`);
    pipe.zrem('rsvps:all', id);
    await pipe.exec();
    return true;
  }
}

// ==========================================
// 2. In-Memory Fallback cho Local Dev
// ==========================================
declare global {
  // eslint-disable-next-line no-var
  var __rsvpMemoryStorage: RsvpItem[] | undefined;
}

class MemoryRsvpRepo implements RsvpRepo {
  private get storage(): RsvpItem[] {
    if (!globalThis.__rsvpMemoryStorage) {
      globalThis.__rsvpMemoryStorage = [];
    }
    return globalThis.__rsvpMemoryStorage;
  }

  async list(params?: { limit?: number }): Promise<{ items: RsvpItem[]; total: number }> {
    const limit = params?.limit ?? 500;
    const all = this.storage.slice().sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
    return {
      items: all.slice(0, limit),
      total: all.length,
    };
  }

  async create(data: Omit<RsvpItem, 'id' | 'submittedAt'>): Promise<RsvpItem> {
    const id = nanoid(10);
    const item: RsvpItem = {
      ...data,
      id,
      submittedAt: new Date().toISOString(),
    };
    this.storage.unshift(item);
    return item;
  }

  async remove(id: string): Promise<boolean> {
    const idx = this.storage.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    this.storage.splice(idx, 1);
    return true;
  }
}

export const rsvpRepo: RsvpRepo = hasRedis ? new UpstashRsvpRepo() : new MemoryRsvpRepo();
