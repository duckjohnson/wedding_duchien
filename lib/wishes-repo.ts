import { Redis } from '@upstash/redis';
import { nanoid } from 'nanoid';

export type WishSide = 'groom' | 'bride' | 'both' | null;

export interface WishItem {
  id: string;
  name: string;
  message: string;
  side: WishSide;
  createdAt: string; // ISO string
  approved: boolean;
}

export interface ListWishesParams {
  cursor?: string | null;
  limit?: number;
  includeUnapproved?: boolean;
}

export interface ListWishesResult {
  items: WishItem[];
  nextCursor: string | null;
  total: number;
}

export interface WishesRepo {
  list(params?: ListWishesParams): Promise<ListWishesResult>;
  create(data: { name: string; message: string; side?: WishSide }): Promise<WishItem>;
  hide(id: string, approved: boolean): Promise<boolean>;
  remove(id: string): Promise<boolean>;
}

// Kiểm tra biến môi trường Upstash Redis
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasRedis = Boolean(redisUrl && redisToken);

// ==========================================
// 1. Upstash Redis Implementation
// ==========================================
class UpstashWishesRepo implements WishesRepo {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: redisUrl!,
      token: redisToken!,
    });
  }

  async list(params?: ListWishesParams): Promise<ListWishesResult> {
    const limit = Math.min(Math.max(params?.limit ?? 6, 1), 50);
    const includeUnapproved = params?.includeUnapproved ?? false;
    const zsetKey = includeUnapproved ? 'wishes:all' : 'wishes:approved';

    const total = await this.redis.zcard(zsetKey);
    if (total === 0) {
      return { items: [], nextCursor: null, total: 0 };
    }

    // Xác định maxScore theo cursor
    // Khi byScore: true và rev: true, min là '-inf', max là cursor (hoặc '+inf')
    let maxScore: number | '+inf' | `(${number}` | '-inf' = '+inf';
    if (params?.cursor) {
      const cursorNum = Number(params.cursor);
      if (!Number.isNaN(cursorNum)) {
        maxScore = `(${cursorNum}` as `(${number}`;
      }
    }

    // Lấy dư 1 phần tử (limit + 1) để biết có trang tiếp theo không
    const rawResults = await this.redis.zrange<string[]>(zsetKey, '-inf', maxScore, {
      byScore: true,
      rev: true,
      offset: 0,
      count: limit + 1,
      withScores: true,
    });

    if (!rawResults || rawResults.length === 0) {
      return { items: [], nextCursor: null, total };
    }

    // zrange withScores trả về dạng mảng xen kẽ: [member1, score1, member2, score2, ...]
    // hoặc mảng đối tượng tuỳ version của upstash client. Chúng ta chuẩn hoá:
    const pairs: { member: string; score: number }[] = [];
    if (typeof rawResults[0] === 'object' && rawResults[0] !== null && 'member' in rawResults[0]) {
      for (const item of rawResults as unknown as { member: string; score: number }[]) {
        pairs.push({ member: String(item.member), score: Number(item.score) });
      }
    } else {
      for (let i = 0; i < rawResults.length; i += 2) {
        pairs.push({
          member: String(rawResults[i]),
          score: Number(rawResults[i + 1]),
        });
      }
    }

    const hasMore = pairs.length > limit;
    const slicePairs = hasMore ? pairs.slice(0, limit) : pairs;
    const nextCursor = hasMore ? String(slicePairs[slicePairs.length - 1].score) : null;

    const ids = slicePairs.map((p) => p.member);
    if (ids.length === 0) {
      return { items: [], nextCursor: null, total };
    }

    const keys = ids.map((id) => `wish:${id}`);
    const rawWishes = await this.redis.mget<unknown[]>(...keys);

    const items: WishItem[] = [];
    for (const rw of rawWishes) {
      if (!rw) continue;
      try {
        const item: WishItem = typeof rw === 'string' ? JSON.parse(rw) : (rw as WishItem);
        if (item && item.id) {
          items.push(item);
        }
      } catch {
        // bỏ qua phần tử hỏng
      }
    }

    return { items, nextCursor, total };
  }

  async create(data: { name: string; message: string; side?: WishSide }): Promise<WishItem> {
    const id = nanoid(10);
    const now = new Date();
    const timestamp = now.getTime();

    const item: WishItem = {
      id,
      name: data.name.trim(),
      message: data.message.trim(),
      side: data.side ?? null,
      createdAt: now.toISOString(),
      approved: true,
    };

    const pipe = this.redis.pipeline();
    pipe.set(`wish:${id}`, JSON.stringify(item));
    pipe.zadd('wishes:all', { score: timestamp, member: id });
    pipe.zadd('wishes:approved', { score: timestamp, member: id });
    await pipe.exec();

    return item;
  }

  async hide(id: string, approved: boolean): Promise<boolean> {
    const raw = await this.redis.get<unknown>(`wish:${id}`);
    if (!raw) return false;

    const item: WishItem = typeof raw === 'string' ? JSON.parse(raw) : (raw as WishItem);
    item.approved = approved;

    const timestamp = new Date(item.createdAt).getTime();
    const pipe = this.redis.pipeline();
    pipe.set(`wish:${id}`, JSON.stringify(item));

    if (approved) {
      pipe.zadd('wishes:approved', { score: timestamp, member: id });
    } else {
      pipe.zrem('wishes:approved', id);
    }

    await pipe.exec();
    return true;
  }

  async remove(id: string): Promise<boolean> {
    const pipe = this.redis.pipeline();
    pipe.del(`wish:${id}`);
    pipe.zrem('wishes:all', id);
    pipe.zrem('wishes:approved', id);
    await pipe.exec();
    return true;
  }
}

// ==========================================
// 2. In-Memory Fallback Implementation
// ==========================================
// Dùng khi chưa cấu hình Upstash Redis env (local development)
declare global {
  // eslint-disable-next-line no-var
  var __wishesMemoryStorage: WishItem[] | undefined;
}

class MemoryWishesRepo implements WishesRepo {
  private get storage(): WishItem[] {
    if (!globalThis.__wishesMemoryStorage) {
      globalThis.__wishesMemoryStorage = [];
    }
    return globalThis.__wishesMemoryStorage;
  }

  constructor() {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[WishesRepo] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN chưa được đặt. Đang chạy ở chế độ in-memory fallback.',
      );
    }
  }

  async list(params?: ListWishesParams): Promise<ListWishesResult> {
    const limit = Math.min(Math.max(params?.limit ?? 6, 1), 50);
    const includeUnapproved = params?.includeUnapproved ?? false;

    let all = this.storage.slice();
    if (!includeUnapproved) {
      all = all.filter((w) => w.approved);
    }

    // Sắp xếp mới nhất trước
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = all.length;

    let startIndex = 0;
    if (params?.cursor) {
      const cursorNum = Number(params.cursor);
      if (!Number.isNaN(cursorNum)) {
        startIndex = all.findIndex((w) => new Date(w.createdAt).getTime() < cursorNum);
        if (startIndex === -1) {
          return { items: [], nextCursor: null, total };
        }
      }
    }

    const slice = all.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < all.length;
    const nextCursor = hasMore && slice.length > 0 ? String(new Date(slice[slice.length - 1].createdAt).getTime()) : null;

    return { items: slice, nextCursor, total };
  }

  async create(data: { name: string; message: string; side?: WishSide }): Promise<WishItem> {
    const id = nanoid(10);
    const item: WishItem = {
      id,
      name: data.name.trim(),
      message: data.message.trim(),
      side: data.side ?? null,
      createdAt: new Date().toISOString(),
      approved: true,
    };
    this.storage.unshift(item);
    return item;
  }

  async hide(id: string, approved: boolean): Promise<boolean> {
    const item = this.storage.find((w) => w.id === id);
    if (!item) return false;
    item.approved = approved;
    return true;
  }

  async remove(id: string): Promise<boolean> {
    const idx = this.storage.findIndex((w) => w.id === id);
    if (idx === -1) return false;
    this.storage.splice(idx, 1);
    return true;
  }
}

// Xuất singleton instance theo cấu hình env
export const wishesRepo: WishesRepo = hasRedis ? new UpstashWishesRepo() : new MemoryWishesRepo();
