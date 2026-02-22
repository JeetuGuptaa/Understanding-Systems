# Pub/Sub (Publish-Subscribe)

**Status:** ✅ Complete

A hands-on demonstration of the Publish-Subscribe messaging pattern using Redis as a message broker, showing how multiple subscribers can receive messages from publishers independently.

## 🎯 What is Pub/Sub?

Publish-Subscribe is a messaging pattern where:
- **Publishers** send messages to channels without knowing who receives them
- **Subscribers** listen to channels without knowing who sends messages
- **Message Broker** (Redis) handles message distribution
- Complete decoupling between publishers and subscribers

### Key Characteristics

- **Decoupling**: Publishers and subscribers don't need to know about each other
- **Broadcasting**: One message reaches all subscribers of a channel
- **Real-time**: Messages delivered immediately when published
- **Fire-and-forget**: Publishers don't wait for acknowledgment
- **No message persistence**: Subscribers only receive messages while connected

## 📂 Project Structure

```
pub-sub/
├── publisher/          # Publishes messages every 5 seconds
│   ├── index.js       # Publisher server
│   ├── redis.js       # Redis client setup
│   └── package.json
├── sub1/              # First subscriber
│   ├── index.js       # Subscriber 1 server
│   ├── redis.js       # Redis client setup
│   └── package.json
└── sub2/              # Second subscriber
    ├── index.js       # Subscriber 2 server
    ├── redis.js       # Redis client setup
    └── package.json
```

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** v18+
- **Redis** server running (local or remote)

### Install Redis

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:latest
```

**Windows:**
Use WSL2 or download from [Redis for Windows](https://github.com/microsoftarchive/redis/releases)

### Install Dependencies

Install dependencies for all three components:

```bash
# Publisher
cd publisher
npm install

# Subscriber 1
cd ../sub1
npm install

# Subscriber 2
cd ../sub2
npm install
```

### Configuration

Each component uses environment variables for Redis connection. Create a `.env` file if needed:

```env
REDIS_URL=redis://localhost:6379
PORT=3000  # Different for each component
```

**Default ports:**
- Publisher: 3000
- Subscriber 1: 3001
- Subscriber 2: 3002

## ▶️ Running the Demo

### Step 1: Start Redis
```bash
redis-server
```

### Step 2: Start Subscribers First
Open separate terminals:

```bash
# Terminal 1 - Subscriber 1
cd sub1
npm start

# Terminal 2 - Subscriber 2
cd sub2
npm start
```

### Step 3: Start Publisher
```bash
# Terminal 3 - Publisher
cd publisher
npm start
```

## 🔍 What to Observe

### Publisher Behavior
- Publishes one of three random messages every 5 seconds
- Shows count of active subscribers receiving each message
- Messages: "Message A", "Message B", "Message C"

### Subscriber Behavior
- Both subscribers receive the SAME messages
- Messages arrive in real-time
- Each subscriber independently processes messages
- No message queueing - only active subscribers receive messages

### Key Experiments

1. **Start subscribers at different times**
   - Later subscribers miss earlier messages
   - No message history

2. **Stop a subscriber**
   - Publisher shows reduced subscriber count
   - Other subscribers unaffected

3. **Start publisher before subscribers**
   - Subscriber count shows 0
   - Messages are lost (not persisted)

4. **Multiple channels**
   - Modify code to use different channel names
   - Subscribers only receive from their subscribed channels

## 🎓 What You'll Learn

### Core Concepts
- **Message broker pattern** - Redis as intermediary
- **Channel-based routing** - Topic-based message distribution
- **Loose coupling** - Components don't directly communicate
- **Scalability** - Add subscribers without changing publisher

### Redis Pub/Sub
- `redis.publish(channel, message)` - Send messages
- `redis.duplicate()` - Create subscriber client
- `subscriber.subscribe(channel, callback)` - Receive messages
- Connection management with `redis` package

### Use Cases
- ✅ Real-time notifications
- ✅ Event broadcasting
- ✅ Cache invalidation
- ✅ Microservice communication
- ❌ Guaranteed delivery (use queues)
- ❌ Message persistence (use streams)
- ❌ Work distribution (use task queues)

## 🔄 Pub/Sub vs Other Patterns

| Feature | Pub/Sub | Message Queue | HTTP Polling |
|---------|---------|--------------|--------------|
| Coupling | Loose | Loose | Tight |
| Delivery | All subscribers | One consumer | Direct |
| Persistence | No | Yes | N/A |
| Real-time | Yes | Yes | No |
| Guaranteed | No | Yes | Yes |
| Ordering | Best-effort | Guaranteed | N/A |

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web server (minimal usage)
- **Redis** - Message broker
- **redis (npm)** - Node.js Redis client

## 📈 Performance Characteristics

**Advantages:**
- ⚡ Near-instant message delivery
- 📡 Broadcast to unlimited subscribers
- 🔓 Complete decoupling
- 🚀 High throughput

**Limitations:**
- ❌ No message persistence
- ❌ Late subscribers miss messages
- ❌ No delivery guarantees
- ❌ No replay capability

## 🧪 Experiment Ideas

1. **Add more subscribers**
   - Copy sub2, change port, run it
   - See all subscribers receive messages

2. **Change publish interval**
   - Modify `5 * 1000` to `1 * 1000` for faster publishing

3. **Add multiple channels**
   - Subscribe to different channels
   - Selective message reception

4. **Add message filtering**
   - Subscribers process only specific messages
   - Pattern matching on message content

5. **Monitor Redis**
   ```bash
   redis-cli
   > PUBSUB CHANNELS      # List active channels
   > PUBSUB NUMSUB temp   # Count subscribers
   ```

## 🐛 Troubleshooting

**Connection issues:**
- Verify Redis is running: `redis-cli ping` (should return PONG)
- Check REDIS_URL environment variable
- Ensure correct port (default: 6379)

**No messages received:**
- Start subscribers BEFORE publisher
- Check channel name matches in all files
- Verify no errors in console

**Port conflicts:**
- Change PORT in .env or index.js
- Ensure all three use different ports

## 📚 Learn More

**Next Steps:**
- Explore **Redis Streams** for persistent messaging
- Learn **Message Queues** (RabbitMQ, Kafka) for guaranteed delivery
- Study **Event-Driven Architecture** patterns

**Related Projects:**
- [WebSockets](../Websockets/) - Bidirectional client-server communication
- [Server-Sent Events](../Server%20Sent%20Events/) - Server push to clients

## 📝 Notes

- This is a simplified educational demo
- Production systems need error handling, monitoring, reconnection logic
- For mission-critical messages, use queues instead of pub/sub
- Redis Pub/Sub is best for real-time broadcasts, not reliable messaging

---

**Ready to scale?** Pub/Sub patterns enable building distributed, event-driven systems! 🚀
