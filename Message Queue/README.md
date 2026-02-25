# Message Queue Demo with BullMQ & Redis

A comprehensive demonstration of message queues using **BullMQ** and **Redis**. This demo showcases how to implement a robust, scalable job queue system with producers and workers.

## 🎯 What is a Message Queue?

A message queue is an asynchronous communication method where:
- **Producers** add jobs/tasks to a queue
- **Workers** process jobs from the queue independently
- Jobs can be retried on failure, scheduled for later, or prioritized

### Benefits:
- ✅ Decouples services
- ✅ Handles traffic spikes
- ✅ Enables background processing
- ✅ Provides fault tolerance
- ✅ Scales horizontally

## 🏗️ Architecture

```
Producer (API) → Redis Queue → Worker(s)
     ↓                             ↓
  index.js                    worker.js
```

## 📋 Prerequisites

- Node.js (v14+)
- Redis server running on localhost:6379

### Start Redis (if not running)

**Using Docker:**
```bash
docker run -d -p 6379:6379 redis:latest
```

**Using local installation:**
```bash
redis-server
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Producer API

In one terminal:
```bash
npm start
```

This starts the HTTP API on port 3000 that allows you to add jobs to the queue.

### 3. Start the Worker

In another terminal:
```bash
npm run worker
```

This starts the worker that processes jobs from the queue.

### Alternative: Run Both Together

```bash
npm run dev
```

This runs both the producer and worker concurrently.

## 📡 API Endpoints

### Add a Job to Queue

**POST** `/enqueue`

```bash
# Send an email
curl -X POST http://localhost:3000/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "task": "send-email",
    "data": {
      "to": "user@example.com",
      "subject": "Hello!",
      "body": "This is a test email"
    }
  }'

# Process an image
curl -X POST http://localhost:3000/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "task": "process-image",
    "data": {
      "imageUrl": "https://example.com/image.jpg",
      "operations": ["resize", "optimize", "watermark"]
    }
  }'

# Generate a report
curl -X POST http://localhost:3000/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "task": "generate-report",
    "data": {
      "reportType": "sales",
      "dateRange": "2024-01-01 to 2024-12-31"
    }
  }'

# Generic task
curl -X POST http://localhost:3000/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "task": "custom-task",
    "data": {
      "key": "value"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Job added to queue",
  "jobId": "1",
  "jobName": "send-email"
}
```

### Get Job Status

**GET** `/job/:jobId`

```bash
curl http://localhost:3000/job/1
```

**Response:**
```json
{
  "id": "1",
  "name": "send-email",
  "data": {
    "to": "user@example.com",
    "subject": "Hello!"
  },
  "state": "completed",
  "progress": 100,
  "returnvalue": {
    "success": true,
    "to": "user@example.com",
    "sentAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Queue Statistics

**GET** `/stats`

```bash
curl http://localhost:3000/stats
```

**Response:**
```json
{
  "waiting": 5,
  "active": 2,
  "completed": 150,
  "failed": 3,
  "delayed": 0,
  "total": 160
}
```

### Health Check

**GET** `/health`

```bash
curl http://localhost:3000/health
```

## 🔧 Features Demonstrated

### 1. **Job Processing**
- Multiple task types (email, image processing, report generation)
- Simulated async operations with progress tracking

### 2. **Retry Logic**
- Jobs automatically retry up to 3 times on failure
- Exponential backoff strategy (2s, 4s, 8s)

### 3. **Concurrency**
- Worker processes up to 5 jobs simultaneously
- Horizontal scaling: run multiple workers for more throughput

### 4. **Progress Tracking**
- Real-time progress updates (0-100%)
- Detailed status messages

### 5. **Job States**
- `waiting` - In queue, not started
- `active` - Currently being processed
- `completed` - Successfully finished
- `failed` - Failed after all retries
- `delayed` - Scheduled for future execution

## 🎓 How It Works

### Producer Flow
1. Client sends POST request to `/enqueue`
2. API creates a job with BullMQ's `Queue.add()`
3. Job is stored in Redis
4. API returns job ID to client
5. Client can poll `/job/:jobId` for status

### Worker Flow
1. Worker connects to the same Redis instance
2. Polls for jobs from the queue
3. Processes job based on task type
4. Updates progress during processing
5. Marks job as completed or failed
6. Result is stored and available via API

### BullMQ Features Used
- **Queue**: Producer interface for adding jobs
- **Worker**: Consumer interface for processing jobs
- **Job Options**: Retry attempts, backoff strategy
- **Events**: `completed`, `failed`, `active`, `progress`
- **Progress**: Real-time job progress updates

## 🧪 Testing the Demo

### Test 1: Add Multiple Jobs

```bash
# Add 5 email jobs
for i in {1..5}; do
  curl -X POST http://localhost:3000/enqueue \
    -H "Content-Type: application/json" \
    -d "{\"task\":\"send-email\",\"data\":{\"to\":\"user$i@example.com\",\"subject\":\"Test $i\"}}"
  echo
done
```

### Test 2: Monitor Queue Stats

```bash
# Watch stats update in real-time (Linux/Mac)
watch -n 1 curl -s http://localhost:3000/stats
```

### Test 3: Scale Workers

Start multiple workers in different terminals:
```bash
npm run worker  # Terminal 1
npm run worker  # Terminal 2
npm run worker  # Terminal 3
```

All workers will process jobs from the same queue!

## 🔍 Common Use Cases

- **Email services**: Send bulk emails without blocking API
- **Image processing**: Resize, optimize, generate thumbnails
- **Report generation**: Long-running data analysis
- **Video transcoding**: Convert video formats
- **Data imports**: Process large CSV/Excel files
- **Notifications**: Send push notifications, SMS
- **Webhooks**: Retry failed webhook deliveries

## 🛠️ Configuration

Edit `redis.js` to customize Redis connection:

```javascript
const redisConnection = {
  host: 'localhost',
  port: 6379,
  password: 'your-password', // if needed
  db: 0,                     // Redis database number
  maxRetriesPerRequest: null,
};
```

## 📚 Learn More

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Documentation](https://redis.io/docs/)
- [Message Queue Pattern](https://www.enterpriseintegrationpatterns.com/patterns/messaging/MessageChannel.html)

## 🐛 Troubleshooting

**Redis connection error:**
- Make sure Redis is running: `redis-cli ping` (should return "PONG")
- Check Redis host/port in `redis.js`

**Jobs not processing:**
- Ensure worker is running (`npm run worker`)
- Check worker terminal for error messages

**Port 3000 already in use:**
- Set environment variable: `PORT=4000 npm start`

## 💡 Next Steps

- Add job prioritization
- Implement delayed/scheduled jobs
- Add job events and webhooks
- Create a dashboard UI
- Implement rate limiting
- Add job dependencies (job chains)
