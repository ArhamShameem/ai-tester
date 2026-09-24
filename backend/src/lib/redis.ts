import { Redis, RedisOptions } from "ioredis";

const getRedisUrl = () => process.env.REDIS_URL || "redis://localhost:6379";

let redisClient: Redis | null = null;
let isConnected = false;

export interface BullMQConnectionConfig {
  host: string;
  port: number;
  password?: string;
  tls?: Record<string, any>;
}

export function getBullMQConnectionOptions(): BullMQConnectionConfig {
  try {
    const url = new URL(getRedisUrl());
    return {
      host: url.hostname || "localhost",
      port: Number(url.port) || 6379,
      password: url.password || undefined,
      tls: url.protocol === "rediss:" ? { servername: url.hostname } : undefined
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
    const url = new URL(getRedisUrl());
    return {
      host: url.hostname || "localhost",
      port: Number(url.port) || 6379,
      password: url.password || undefined,
      tls: url.protocol === "rediss:" ? { servername: url.hostname } : undefined,
      maxRetriesPerRequest: null, // Required by BullMQ
      enableReadyCheck: false,
      connectTimeout: 5000,
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
      enableReadyCheck: false,
      connectTimeout: 5000
    };
  }
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = getRedisUrl();
    const isTls = redisUrl.startsWith("rediss://");
    let servername: string | undefined;
    try {
      if (isTls) {
        servername = new URL(redisUrl).hostname;
      }
    } catch {}

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 5000,
      lazyConnect: true,
      tls: servername ? { servername } : undefined,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 1000);
      }
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
      await Promise.race([
        client.connect().catch(() => {}),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Connect timeout")), 4000))
      ]);
    }
    const pong = await Promise.race([
      client.ping(),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error("Ping timeout")), 4000))
    ]);
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
