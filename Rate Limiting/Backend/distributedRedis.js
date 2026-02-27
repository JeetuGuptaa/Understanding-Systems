/**
 * Distributed Rate Limiting with Redis
 * 
 * - Uses Redis for shared state across multiple servers
 * - Implements sliding window with Redis sorted sets
 * - Atomic operations ensure accuracy
 * - Scales horizontally
 * - Survives server restarts
 * 
 * Best for: Production systems with multiple servers
 */

import { createClient } from 'redis';

let redisClient = null;
let isRedisAvailable = false;

// Initialize Redis client
export async function initRedis() {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
      isRedisAvailable = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis for distributed rate limiting');
      isRedisAvailable = true;
    });

    await redisClient.connect();
    return true;
  } catch (error) {
    console.error('Failed to connect to Redis:', error.message);
    console.log('⚠️  Distributed rate limiting will not be available');
    isRedisAvailable = false;
    return false;
  }
}

// Sliding window implementation using Redis sorted sets
async function slidingWindowRedis(clientId, maxRequests, windowMs) {
  const key = `ratelimit:${clientId}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    // Start a pipeline for atomic operations
    const pipeline = redisClient.multi();

    // Remove old entries outside the window
    pipeline.zRemRangeByScore(key, 0, windowStart);

    // Count requests in current window
    pipeline.zCard(key);

    // Add current request with timestamp as score
    pipeline.zAdd(key, { score: now, value: `${now}-${Math.random()}` });

    // Set expiry on the key
    pipeline.expire(key, Math.ceil(windowMs / 1000));

    // Execute all commands
    const results = await pipeline.exec();
    const count = results[1]; // Result of zCard

    if (count < maxRequests) {
      return {
        allowed: true,
        remaining: maxRequests - count - 1,
        current: count + 1
      };
    }

    // Get oldest request to calculate retry time
    const oldest = await redisClient.zRange(key, 0, 0, { REV: false });
    const oldestScore = oldest.length > 0 ? parseInt(oldest[0].split('-')[0]) : now;
    const retryAfter = Math.ceil((oldestScore + windowMs - now) / 1000);

    // Remove the request we just added since it's not allowed
    await redisClient.zRem(key, `${now}-${Math.random()}`);

    return {
      allowed: false,
      remaining: 0,
      current: count,
      retryAfter: Math.max(1, retryAfter)
    };
  } catch (error) {
    console.error('Redis rate limit error:', error);
    // Fail open - allow the request if Redis fails
    return {
      allowed: true,
      remaining: maxRequests,
      error: 'Redis unavailable'
    };
  }
}

export function distributedRedisMiddleware(maxRequests = 10, windowMs = 60000) {
  return async (req, res, next) => {
    if (!isRedisAvailable) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Distributed rate limiting is not available (Redis not connected)'
      });
    }

    const clientId = req.ip || 'unknown';
    const result = await slidingWindowRedis(clientId, maxRequests, windowMs);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Algorithm', 'distributed-redis');

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Retry in ${result.retryAfter} seconds.`,
        algorithm: 'distributed-redis',
        limit: maxRequests,
        current: result.current,
        retryAfter: result.retryAfter
      });
    }

    next();
  };
}

export async function getDistributedStats() {
  if (!isRedisAvailable) {
    return { error: 'Redis not available' };
  }

  try {
    const keys = await redisClient.keys('ratelimit:*');
    const stats = [];

    for (const key of keys) {
      const count = await redisClient.zCard(key);
      const ttl = await redisClient.ttl(key);
      stats.push({
        clientId: key.replace('ratelimit:', ''),
        current: count,
        ttl
      });
    }

    return stats;
  } catch (error) {
    return { error: error.message };
  }
}

export function isRedisConnected() {
  return isRedisAvailable;
}
