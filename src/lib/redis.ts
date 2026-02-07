import Redis from "ioredis";

const getRedisClient = () => {
  const client = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  client.on("error", (err) => {
    console.error("Redis connection error:", err.message);
  });

  return client;
};

// Singleton pattern for Redis client
let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = getRedisClient();
  }
  return redisClient;
}
