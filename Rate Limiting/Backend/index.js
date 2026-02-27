import express from 'express';
import cors from 'cors';
import { tokenBucketMiddleware, getTokenBucketStats } from './tokenBucket.js';
import { slidingWindowMiddleware, getSlidingWindowStats } from './slidingWindow.js';
import { fixedWindowMiddleware, getFixedWindowStats } from './fixedWindow.js';
import { 
  distributedRedisMiddleware, 
  getDistributedStats, 
  initRedis,
  isRedisConnected 
} from './distributedRedis.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize Redis (optional - server works without it)
initRedis().catch(err => {
  console.log('Starting server without Redis support');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    redis: isRedisConnected() ? 'connected' : 'disconnected'
  });
});

// ======================
// TOKEN BUCKET ENDPOINTS
// ======================

// Token Bucket: 5 requests, refills at 1 token/second
app.get('/api/token-bucket', tokenBucketMiddleware(5, 1), (req, res) => {
  res.json({
    message: 'Request successful!',
    algorithm: 'token-bucket',
    timestamp: new Date().toISOString(),
    info: 'Capacity: 5 tokens, Refill: 1 token/second'
  });
});

app.get('/api/token-bucket/stats', (req, res) => {
  res.json({
    algorithm: 'token-bucket',
    clients: getTokenBucketStats()
  });
});

// ======================
// SLIDING WINDOW ENDPOINTS
// ======================

// Sliding Window: 8 requests per 30 seconds
app.get('/api/sliding-window', slidingWindowMiddleware(8, 30000), (req, res) => {
  res.json({
    message: 'Request successful!',
    algorithm: 'sliding-window',
    timestamp: new Date().toISOString(),
    info: 'Limit: 8 requests per 30 seconds'
  });
});

app.get('/api/sliding-window/stats', (req, res) => {
  res.json({
    algorithm: 'sliding-window',
    clients: getSlidingWindowStats()
  });
});

// ======================
// FIXED WINDOW ENDPOINTS
// ======================

// Fixed Window: 6 requests per 20 seconds
app.get('/api/fixed-window', fixedWindowMiddleware(6, 20000), (req, res) => {
  res.json({
    message: 'Request successful!',
    algorithm: 'fixed-window',
    timestamp: new Date().toISOString(),
    info: 'Limit: 6 requests per 20 seconds'
  });
});

app.get('/api/fixed-window/stats', (req, res) => {
  res.json({
    algorithm: 'fixed-window',
    clients: getFixedWindowStats()
  });
});

// ======================
// DISTRIBUTED REDIS ENDPOINTS
// ======================

// Distributed Redis: 10 requests per 60 seconds
app.get('/api/distributed', distributedRedisMiddleware(10, 60000), (req, res) => {
  res.json({
    message: 'Request successful!',
    algorithm: 'distributed-redis',
    timestamp: new Date().toISOString(),
    info: 'Limit: 10 requests per 60 seconds (shared across all servers)'
  });
});

app.get('/api/distributed/stats', async (req, res) => {
  const stats = await getDistributedStats();
  res.json({
    algorithm: 'distributed-redis',
    redis: isRedisConnected() ? 'connected' : 'disconnected',
    clients: stats
  });
});

// ======================
// COMPARISON ENDPOINT
// ======================

// Test all algorithms at once (no rate limiting)
app.get('/api/info', (req, res) => {
  res.json({
    algorithms: [
      {
        name: 'Token Bucket',
        endpoint: '/api/token-bucket',
        config: { capacity: 5, refillRate: '1/second' },
        pros: ['Allows bursts', 'Smooth rate limiting', 'Memory efficient'],
        cons: ['Complex implementation', 'Timing sensitive'],
        useCase: 'APIs that need to allow bursts while maintaining average rate'
      },
      {
        name: 'Sliding Window',
        endpoint: '/api/sliding-window',
        config: { maxRequests: 8, window: '30 seconds' },
        pros: ['Most accurate', 'No boundary issues', 'Fair distribution'],
        cons: ['Higher memory usage', 'Stores all timestamps'],
        useCase: 'Precise rate limiting without edge case issues'
      },
      {
        name: 'Fixed Window',
        endpoint: '/api/fixed-window',
        config: { maxRequests: 6, window: '20 seconds' },
        pros: ['Simple', 'Memory efficient', 'Fast'],
        cons: ['Boundary issue (2x burst possible)', 'Less accurate'],
        useCase: 'Simple rate limiting with minimal overhead'
      },
      {
        name: 'Distributed (Redis)',
        endpoint: '/api/distributed',
        config: { maxRequests: 10, window: '60 seconds' },
        pros: ['Shared across servers', 'Survives restarts', 'Scales horizontally'],
        cons: ['Requires Redis', 'Network dependency', 'Slightly slower'],
        useCase: 'Production systems with multiple servers',
        available: isRedisConnected()
      }
    ]
  });
});

// Global stats endpoint
app.get('/api/stats', async (req, res) => {
  const stats = {
    tokenBucket: getTokenBucketStats(),
    slidingWindow: getSlidingWindowStats(),
    fixedWindow: getFixedWindowStats(),
    distributed: await getDistributedStats(),
    redis: isRedisConnected()
  };
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║         Rate Limiting Demo Server                     ║
╚════════════════════════════════════════════════════════╝

🚀 Server running on http://localhost:${PORT}

📊 Available Algorithms:
   • Token Bucket:      http://localhost:${PORT}/api/token-bucket
   • Sliding Window:    http://localhost:${PORT}/api/sliding-window
   • Fixed Window:      http://localhost:${PORT}/api/fixed-window
   • Distributed Redis: http://localhost:${PORT}/api/distributed

📈 Stats Endpoints:
   • All Stats:         http://localhost:${PORT}/api/stats
   • Algorithm Info:    http://localhost:${PORT}/api/info

${isRedisConnected() ? '✅ Redis connected - Distributed rate limiting available' : '⚠️  Redis not available - Distributed rate limiting disabled'}

Try making requests and watch the rate limits in action!
  `);
});
