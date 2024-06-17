import { Redis } from "ioredis";

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  throw new Error("REDIS_URL is not defined");
};

const redis = new Redis(getRedisUrl());

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_URL,
//   token: process.env.UPSTASH_REDIS_TOKEN,
// });

export default redis;
