import { Redis, RedisOptions } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redisClient: Redis | null = null;
let isConnected = false;

export interface BullMQConnectionConfig {
  host: string;
  port: number;
  password?: string;
}

export function getBullMQConnectionOptions(): BullMQConnectionConfig {
  try {
    const url = new URL(REDIS_URL);
    return {
      host: url.hostname || "localhost",
      port: Number(url.port) || 6379,
      password: url.password || undefined
    };
  } catch {
    return {
      host: "localhost",
      port: 6379
    };
  }
}

export function getRedisConnectionOptions(): RedisOptions {
  try {
    const url = new URL(REDIS_URL);
    return {
      host: url.hostname || "localhost",
      port: Number(url.port) || 6379,
      password: url.password || undefined,
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: false,
      retryStrategy(times) {
        if (times > 3) {
          // Do not loop infinitely if Redis is offline
          return null;
        }
        return Math.min(times * 200, 1000);
      }
    };
  } catch {
    return {
      host: "localhost",
      port: 6379,
      maxRetriesPerRequest: null,
      enableReadyCheck: false
    };
  }
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(REDIS_URL, {
      ...getRedisConnectionOptions(),
      lazyConnect: true
    });

    redisClient.on("connect", () => {
      isConnected = true;
      console.log("[Redis] Successfully connected to Redis server");
    });

    redisClient.on("error", (err) => {
      isConnected = false;
      // Suppress repeated unhandled error output in dev
    });
  }

  return redisClient;
}

export async function checkRedisHealth(): Promise<boolean> {
  const client = getRedisClient();
  try {
    if (client.status !== "ready" && client.status !== "connecting") {
      await client.connect().catch(() => {});
    }
    const pong = await client.ping();
    isConnected = pong === "PONG";
    return isConnected;
  } catch {
    isConnected = false;
    return false;
  }
}

export function isRedisConnected(): boolean {
  return isConnected;
}
