/**
 * Sliding Window Algorithm
 * 
 * - Maintains a log of timestamps for each request
 * - Counts requests within the sliding time window
 * - Window moves with each request
 * - More accurate than fixed window (no boundary issues)
 * - Higher memory usage (stores all timestamps)
 * 
 * Best for: Precise rate limiting without edge case issues
 */

class SlidingWindow {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = []; // Array of timestamps
  }

  // Remove old requests outside the window
  cleanup() {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    this.requests = this.requests.filter(timestamp => timestamp > cutoff);
  }

  // Try to allow a request
  allow() {
    this.cleanup();
    const now = Date.now();
    
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return {
        allowed: true,
        remaining: this.maxRequests - this.requests.length,
        resetAt: this.requests[0] ? this.requests[0] + this.windowMs : now + this.windowMs
      };
    }
    
    // Calculate retry time (when oldest request expires)
    const oldestRequest = this.requests[0];
    const retryAfter = Math.ceil((oldestRequest + this.windowMs - now) / 1000);
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestRequest + this.windowMs,
      retryAfter
    };
  }

  getStatus() {
    this.cleanup();
    const now = Date.now();
    const resetAt = this.requests[0] ? this.requests[0] + this.windowMs : now + this.windowMs;
    
    return {
      current: this.requests.length,
      max: this.maxRequests,
      windowMs: this.windowMs,
      resetAt,
      resetIn: Math.max(0, Math.ceil((resetAt - now) / 1000))
    };
  }
}

// In-memory store for multiple clients
const windows = new Map();

export function slidingWindowMiddleware(maxRequests = 10, windowMs = 60000) {
  return (req, res, next) => {
    const clientId = req.ip || 'unknown';
    
    if (!windows.has(clientId)) {
      windows.set(clientId, new SlidingWindow(maxRequests, windowMs));
    }
    
    const window = windows.get(clientId);
    const result = window.allow();
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(result.resetAt).toISOString());
    res.setHeader('X-RateLimit-Algorithm', 'sliding-window');
    
    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Retry in ${result.retryAfter} seconds.`,
        algorithm: 'sliding-window',
        limit: maxRequests,
        windowMs,
        retryAfter: result.retryAfter,
        resetAt: new Date(result.resetAt).toISOString()
      });
    }
    
    next();
  };
}

export function getSlidingWindowStats() {
  const stats = [];
  windows.forEach((window, clientId) => {
    stats.push({
      clientId,
      ...window.getStatus()
    });
  });
  return stats;
}
