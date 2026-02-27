# Rate Limiting

A comprehensive demonstration of various rate limiting algorithms with full-stack implementation. Compare Token Bucket, Sliding Window, Fixed Window, and Distributed (Redis) approaches in action.

## 🎯 What You'll Learn

- **How rate limiting works** - Protect APIs from abuse and overload
- **Four different algorithms** - Token Bucket, Sliding Window, Fixed Window, Distributed
- **Trade-offs and comparisons** - When to use each algorithm
- **Implementation details** - Working code for each approach
- **Visual demonstrations** - See rate limits trigger in real-time
- **Distributed systems** - Redis-based rate limiting for multi-server deployments

## 📊 Algorithms Implemented

### 1. **Token Bucket**
```
Configuration: 5 tokens capacity, refills at 1 token/second
```

**How it works:**
- Bucket holds tokens (like a reservoir)
- Each request consumes one token
- Tokens refill at a constant rate
- Allows bursts up to bucket capacity

**Best for:** APIs that need to handle burst traffic while maintaining average rate

**Pros:**
- ✅ Smooths bursts naturally
- ✅ Memory efficient
- ✅ Most flexible

**Cons:**
- ❌ More complex implementation
- ❌ Timing-sensitive

---

### 2. **Sliding Window**
```
Configuration: 8 requests per 30 seconds
```

**How it works:**
- Maintains log of all request timestamps
- Window slides with each request
- Counts requests within the moving window
- Most accurate algorithm

**Best for:** Precise rate limiting without boundary edge cases

**Pros:**
- ✅ Most accurate
- ✅ No boundary issues
- ✅ Fair distribution

**Cons:**
- ❌ Higher memory usage (stores all timestamps)
- ❌ More computation per request

---

### 3. **Fixed Window**
```
Configuration: 6 requests per 20 seconds
```

**How it works:**
- Time divided into fixed windows
- Count requests in current window
- Reset counter at window boundary
- Simplest implementation

**Best for:** Simple rate limiting with minimal overhead

**Pros:**
- ✅ Very simple
- ✅ Low memory
- ✅ Fast

**Cons:**
- ❌ Boundary issue (can allow 2x requests at window edges)
- ❌ Less accurate

**Edge Case Example:**
```
Window: 60 seconds, Limit: 100 requests

User sends:
- 100 requests at 0:59 (allowed)
- 100 requests at 1:01 (allowed)
= 200 requests in 2 seconds! 🚨
```

---

### 4. **Distributed (Redis)**
```
Configuration: 10 requests per 60 seconds (shared across all servers)
```

**How it works:**
- Uses Redis sorted sets for shared state
- Sliding window implementation
- Atomic operations ensure accuracy
- Scales horizontally across multiple servers

**Best for:** Production systems with multiple servers

**Pros:**
- ✅ Scales horizontally
- ✅ Survives server restarts
- ✅ Shared across all instances

**Cons:**
- ❌ Requires Redis infrastructure
- ❌ Network dependency
- ❌ Slightly slower than in-memory

---

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │
│   (Port 5173)   │
└────────┬────────┘
         │ HTTP Requests
         ▼
┌─────────────────┐
│  Express Server │
│   (Port 3001)   │
├─────────────────┤
│ • Token Bucket  │
│ • Sliding Win   │
│ • Fixed Window  │
│ • Redis Dist.   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Redis (Opt.)   │
│   (Port 6379)   │
└─────────────────┘
```

## 🚀 Quick Start

### 1. Start Backend

```bash
cd Backend
npm install
npm start
```

Backend runs on `http://localhost:3001`

### 2. Start Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### 3. (Optional) Start Redis

For distributed rate limiting:

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

**Note:** The demo works fine without Redis - distributed endpoint will just be unavailable.

## 🎮 How to Use

### Interactive Testing

1. **Manual Testing:**
   - Click "Send Request" on any algorithm card
   - Watch the rate limit counter decrease
   - See success (green) or rate limited (red) states
   - View request history with timestamps

2. **Auto-Testing:**
   - Enable "Auto-test" checkbox
   - Sends 1 request per second automatically
   - Great for comparing algorithms side-by-side
   - Watch different behaviors emerge

3. **Burst Testing:**
   - Click rapidly on Token Bucket
   - Notice it allows bursts (uses stored tokens)
   - Compare with Fixed Window (strict boundary)

4. **Network Tab Observation:**
   - Open browser DevTools → Network tab
   - Watch HTTP headers:
     - `X-RateLimit-Limit`
     - `X-RateLimit-Remaining`
     - `X-RateLimit-Algorithm`
     - `Retry-After` (when rate limited)

## 📈 Comparison at a Glance

| Algorithm | Accuracy | Memory | Complexity | Bursts | Distributed |
|-----------|----------|---------|------------|--------|-------------|
| Token Bucket | High | Low | Medium | ✅ Yes | ❌ No |
| Sliding Window | Highest | High | Medium | ❌ No | ❌ No |
| Fixed Window | Low | Lowest | Low | ⚠️ Edge | ❌ No |
| Redis Distributed | High | Medium | High | ❌ No | ✅ Yes |

## 🧪 Experiments to Try

### 1. **Compare Burst Handling**
- Enable auto-test on all algorithms
- Pause for 10 seconds
- Click rapidly on each
- **Observation:** Token Bucket handles bursts best

### 2. **Test Fixed Window Edge Case**
- Note when Fixed Window resets (check timer)
- Send requests right before reset
- Send more right after reset
- **Observation:** Can send 2x limit in short period

### 3. **Multi-Tab Distributed Test**
- Ensure Redis is running
- Open app in two browser tabs
- Send requests from both tabs
- **Observation:** Limits are shared across tabs

### 4. **Recovery Time**
- Hit rate limit on each algorithm
- Observe how long until you can send again
- **Observation:** Different recovery patterns

### 5. **Performance Comparison**
- Check response times in request history
- Compare in-memory vs Redis
- **Observation:** In-memory is faster, but can't scale

## 📊 Real-World Use Cases

### Token Bucket
- **GitHub API:** 5000 requests/hour with burst allowance
- **AWS API Gateway:** Burst tokens for traffic spikes
- **Stripe API:** Allows bursts while maintaining average rate

### Sliding Window
- **Twitter API:** Precise rate limiting for fair usage
- **High-value APIs:** Where accuracy matters most
- **Billing systems:** To avoid overcharges

### Fixed Window
- **Simple services:** Login attempts (5 per minute)
- **Internal APIs:** Where simplicity > precision
- **Low-traffic endpoints:** Minimal overhead needed

### Distributed (Redis)
- **Production APIs:** Multiple server instances
- **Cloudflare:** Global rate limiting
- **Kong/Nginx:** API gateway solutions
- **Microservices:** Shared rate limit quota

## 🎓 Key Takeaways

1. **No perfect algorithm** - Trade-offs between accuracy, memory, and complexity

2. **Token Bucket wins for flexibility** - Handles bursts gracefully

3. **Sliding Window wins for accuracy** - No edge cases, fair distribution

4. **Fixed Window wins for simplicity** - But has boundary issues

5. **Redis wins for scale** - Essential for multi-server deployments

6. **Choose based on needs:**
   - Need bursts? → Token Bucket
   - Need precision? → Sliding Window
   - Need simple? → Fixed Window
   - Need scale? → Distributed Redis

## 🔍 Common HTTP Headers

Response headers you'll see:

```http
X-RateLimit-Limit: 10          # Maximum requests allowed
X-RateLimit-Remaining: 7        # Requests left in window
X-RateLimit-Reset: 2026-02-27T... # When limit resets
X-RateLimit-Algorithm: token-bucket # Which algorithm used
```

When rate limited (429 response):

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 5                  # Retry in 5 seconds
```

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express
- Redis client (optional)
- Custom rate limiting implementations

**Frontend:**
- React 19
- Vite
- CSS3 (no frameworks)

**Infrastructure:**
- Redis (optional, for distributed)

## 📚 Further Reading

- [Rate Limiting Patterns](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- [Redis Rate Limiting Guide](https://redis.io/glossary/rate-limiting/)
- [HTTP 429 Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)

## 🤝 Production Considerations

This demo is for learning. In production, consider:

1. **Use proven libraries** - express-rate-limit, rate-limiter-flexible
2. **Monitoring** - Track rate limit hits
3. **User feedback** - Clear error messages
4. **Graceful degradation** - Fail open if Redis is down
5. **Per-user limits** - Not just per-IP
6. **Tiered limits** - Different for free/paid users
7. **Retry strategies** - Exponential backoff
8. **Security** - Prevent IP spoofing

## 💡 Tips

- Start without Redis - in-memory works great for learning
- Use auto-test to compare algorithms side-by-side
- Watch Network tab to see headers in action
- Try hitting limits to see error responses
- Open multiple tabs to test distributed mode

---

**Ready to explore?** Start the backend and frontend, then send some requests! 🚀
