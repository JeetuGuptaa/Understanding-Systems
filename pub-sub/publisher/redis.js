const { createClient } = require("redis");

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("ready", () => {
  console.log("Redis ready");
});

redis.on("error", (err) => {
  console.error("Redis error", err);
});

// Connect to Redis
redis.connect().catch(console.error);

module.exports = redis;