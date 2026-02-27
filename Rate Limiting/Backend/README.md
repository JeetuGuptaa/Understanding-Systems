# Rate Limiting Backend

This backend demonstrates four different rate limiting algorithms with working implementations.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or use watch mode for development
npm run dev
```

Server runs on `http://localhost:3001`

## 📊 Algorithms Implemented

### 1. Token Bucket
- **Config:** 5 tokens capacity, refills at 1 token/second
- **Endpoint:** `GET /api/token-bucket`
- **Best for:** APIs that need burst handling

### 2. Sliding Window
- **Config:** 8 requests per 30 seconds
- **Endpoint:** `GET /api/sliding-window`
- **Best for:** Precise rate limiting

### 3. Fixed Window
- **Config:** 6 requests per 20 seconds
- **Endpoint:** `GET /api/fixed-window`
- **Best for:** Simple, low-memory rate limiting

### 4. Distributed (Redis)
- **Config:** 10 requests per 60 seconds
- **Endpoint:** `GET /api/distributed`
- **Best for:** Multi-server production systems
- **Requires:** Redis running on `localhost:6379`

## 🔧 Optional: Redis Setup

For distributed rate limiting, install and start Redis:

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

The server works fine without Redis - distributed endpoint will just return 503.

## 🧪 Testing

```bash
# Test token bucket
curl http://localhost:3001/api/token-bucket

# Get stats
curl http://localhost:3001/api/stats

# Get algorithm info
curl http://localhost:3001/api/info
```

## 📈 Response Headers

All endpoints return standard rate limit headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Algorithm: token-bucket
```

When rate limited (429 response):

```
Retry-After: 5
```

## 🎯 Learning Points

1. **Token Bucket** - Smooths bursts, most flexible
2. **Sliding Window** - Most accurate, no boundary issues
3. **Fixed Window** - Simplest, but has edge cases
4. **Distributed** - Production-ready, scales horizontally
