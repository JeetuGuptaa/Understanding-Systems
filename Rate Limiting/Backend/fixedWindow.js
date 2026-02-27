/**
 * Fixed Window Algorithm
 * 
 * - Time divided into fixed windows (e.g., every minute)
 * - Count requests in current window
 * - Reset counter at window boundary
 * - Simple and memory efficient
 * - Can have edge case: 2x requests at window boundaries
 * 
 * Best for: Simple rate limiting with minimal memory overhead
 */

class FixedWindow {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.count = 0;
    this.windowStart = Date.now();
  }

  // Reset if we're in a new window
  checkAndResetWindow() {
    const now = Date.now();
    const elapsed = now - this.windowStart;
    
    if (elapsed >= this.windowMs) {
      this.count = 0;
      this.windowStart = now;
    }
  }

  // Try to allow a request
  allow() {
    this.checkAndResetWindow();
    const now = Date.now();
    
    if (this.count < this.maxRequests) {
      this.count++;
      return {
        allowed: true,
        remaining: this.maxRequests - this.count,
        resetAt: this.windowStart + this.windowMs
      };
    }
    
    const resetAt = this.windowStart + this.windowMs;
    const retryAfter = Math.ceil((resetAt - now) / 1000);
    
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfter
    };
  }

  getStatus() {
    this.checkAndResetWindow();
    const now = Date.now();
    const resetAt = this.windowStart + this.windowMs;
    
    return {
      count: this.count,
      max: this.maxRequests,
      windowMs: this.windowMs,
      resetAt,
      resetIn: Math.ceil((resetAt - now) / 1000)
    };
  }
}

// In-memory store for multiple clients
const windows = new Map();

export function fixedWindowMiddleware(maxRequests = 10, windowMs = 60000) {
  return (req, res, next) => {
    const clientId = req.ip || 'unknown';
    
    if (!windows.has(clientId)) {
      windows.set(clientId, new FixedWindow(maxRequests, windowMs));
    }
    
    const window = windows.get(clientId);
    const result = window.allow();
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', new Date(result.resetAt).toISOString());
    res.setHeader('X-RateLimit-Algorithm', 'fixed-window');
    
    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Retry in ${result.retryAfter} seconds.`,
        algorithm: 'fixed-window',
        limit: maxRequests,
        windowMs,
        retryAfter: result.retryAfter,
        resetAt: new Date(result.resetAt).toISOString()
      });
    }
    
    next();
  };
}

export function getFixedWindowStats() {
  const stats = [];
  windows.forEach((window, clientId) => {
    stats.push({
      clientId,
      ...window.getStatus()
    });
  });
  return stats;
}
