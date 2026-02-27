/**
 * Token Bucket Algorithm
 * 
 * - Bucket has a maximum capacity of tokens
 * - Tokens are added at a fixed rate
 * - Each request consumes one token
 * - If no tokens available, request is rejected
 * - Allows bursts up to bucket capacity
 * 
 * Best for: APIs that need to allow bursts while maintaining average rate
 */

class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity; // Maximum tokens in bucket
    this.tokens = capacity; // Current tokens available
    this.refillRate = refillRate; // Tokens added per second
    this.lastRefill = Date.now();
  }

  // Refill tokens based on time elapsed
  refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  // Try to consume a token
  consume() {
    this.refill();
    
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return {
        allowed: true,
        remaining: Math.floor(this.tokens),
        capacity: this.capacity
      };
    }
    
    return {
      allowed: false,
      remaining: 0,
      capacity: this.capacity,
      retryAfter: Math.ceil((1 - this.tokens) / this.refillRate)
    };
  }

  getStatus() {
    this.refill();
    return {
      tokens: Math.floor(this.tokens),
      capacity: this.capacity,
      refillRate: this.refillRate
    };
  }
}

// In-memory store for multiple clients
const buckets = new Map();

export function tokenBucketMiddleware(capacity = 10, refillRate = 2) {
  return (req, res, next) => {
    const clientId = req.ip || 'unknown';
    
    if (!buckets.has(clientId)) {
      buckets.set(clientId, new TokenBucket(capacity, refillRate));
    }
    
    const bucket = buckets.get(clientId);
    const result = bucket.consume();
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', capacity);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Algorithm', 'token-bucket');
    
    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Retry in ${result.retryAfter} seconds.`,
        algorithm: 'token-bucket',
        limit: capacity,
        retryAfter: result.retryAfter
      });
    }
    
    next();
  };
}

export function getTokenBucketStats() {
  const stats = [];
  buckets.forEach((bucket, clientId) => {
    stats.push({
      clientId,
      ...bucket.getStatus()
    });
  });
  return stats;
}
