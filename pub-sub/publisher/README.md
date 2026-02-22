# Publisher

The publisher component sends messages to a Redis channel at regular intervals, demonstrating the "publish" side of the Pub/Sub pattern.

## 📘 What It Does

This publisher:
- Connects to Redis server
- Publishes random messages to the `temp` channel every 5 seconds
- Logs the number of active subscribers receiving each message
- Runs an Express server (minimal usage, mainly for process management)

## 🔍 How It Works

### Message Publishing Flow

1. **Connects to Redis** - Establishes connection on startup
2. **Waits for Ready** - Ensures Redis is ready before publishing
3. **Starts Recursive Timer** - Uses `setTimeout` for non-overlapping publishes
4. **Selects Random Message** - Picks from ["Message A", "Message B", "Message C"]
5. **Publishes to Channel** - Sends message to `temp` channel
6. **Reports Subscriber Count** - Shows how many subscribers received it
7. **Schedules Next** - Waits 5 seconds, repeats

### Key Implementation Details

**Why `setTimeout` instead of `setInterval`?**
```javascript
// ❌ Can overlap if redis.publish() is slow
setInterval(async () => {
  await redis.publish(channel, message);
}, 5000);

// ✅ Waits for completion before scheduling next
const messagePublisher = async () => {
  await redis.publish(channel, message);
  setTimeout(messagePublisher, 5000); // Next after current completes
};
```

**Redis Client Setup** (`redis.js`)
- Uses `redis` package (not ioredis)
- Calls `createClient()` with connection URL
- Explicitly calls `connect()` to establish connection
- Handles connect, ready, and error events

**Message Pattern**
- Fire-and-forget: doesn't wait for acknowledgment from subscribers
- No tracking of which subscribers received messages
- Redis handles distribution automatically

## 📁 Files

- **`index.js`** - Main publisher logic and Express server
- **`redis.js`** - Redis client configuration and connection
- **`package.json`** - Dependencies and scripts
- **`.gitignore`** - Excludes node_modules and .env

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:
```env
REDIS_URL=redis://localhost:6379
PORT=3000
```

### Customization Options

**Change publish interval:**
```javascript
// index.js, line ~20
setTimeout(messagePublisher, 5 * 1000); // Change 5 to your desired seconds
```

**Change messages:**
```javascript
// index.js, line ~8
const messages = ["Your", "Custom", "Messages", "Here"];
```

**Change channel name:**
```javascript
// index.js, line ~7
const channel = "your-channel-name";
```

## 🚀 Running

```bash
# Install dependencies
npm install

# Start publisher
npm start

# Or directly
node index.js
```

## 📊 Console Output

```
Redis connected
Redis ready
Starting message publisher...
Server running on port 3000
Published: Message A to 2 subscriber(s)
Published: Message C to 2 subscriber(s)
Published: Message B to 2 subscriber(s)
```

**Subscriber count shows:**
- `0` - No active subscribers (messages are lost)
- `1+` - Number of subscribers that received the message

## 🧪 Experiments

1. **Publish Faster**
   ```javascript
   setTimeout(messagePublisher, 1000); // Every 1 second
   ```

2. **Add Message Ordering**
   ```javascript
   let counter = 0;
   const message = `${messages[index]} #${counter++}`;
   ```

3. **Add Timestamps**
   ```javascript
   const message = JSON.stringify({
     text: messages[index],
     timestamp: Date.now()
   });
   ```

4. **Multiple Channels**
   ```javascript
   await redis.publish('channel1', message1);
   await redis.publish('channel2', message2);
   ```

5. **Monitor Redis Directly**
   ```bash
   redis-cli
   > MONITOR  # See all Redis commands in real-time
   ```

## 🔍 Understanding Subscriber Count

The return value of `redis.publish()` indicates how many subscribers received the message:

- **Returns 0**: No subscribers connected → messages disappear
- **Returns N**: N subscribers received the message
- **Does NOT guarantee** subscribers processed it successfully
- **Real-time value**: Count at moment of publish, not eventual delivery

## ⚠️ Important Notes

**No Message Persistence**
- If no subscribers are connected, messages are discarded
- Redis Pub/Sub is ephemeral by design
- For persistence, use Redis Streams or message queues

**No Delivery Guarantees**
- Publisher doesn't know if subscribers processed messages
- Network issues can cause message loss
- For critical messages, use queues with acknowledgments

**Performance Considerations**
- Pub/Sub is extremely fast (microsecond latency)
- Can handle thousands of messages per second
- Subscriber count doesn't significantly impact performance

## 🛠️ Dependencies

```json
{
  "express": "^5.2.1",  // Web server
  "redis": "^4.6.13"     // Redis client
}
```

## 📚 Learn More

**Redis Pub/Sub Commands:**
- `PUBLISH channel message` - Send message
- `PUBSUB CHANNELS` - List active channels
- `PUBSUB NUMSUB channel` - Count subscribers

**Next Steps:**
- Explore Redis Streams for persistent messaging
- Add message batching for high throughput
- Implement structured message formats (JSON, Protobuf)

---

**Publishing made simple!** Fire messages into channels and let Redis handle distribution. 📢
