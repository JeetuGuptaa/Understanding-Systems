# Subscriber 1

The first subscriber component that listens to messages from a Redis channel, demonstrating the "subscribe" side of the Pub/Sub pattern.

## 📘 What It Does

This subscriber:
- Connects to Redis server
- Creates a duplicate client for subscription (Redis requirement)
- Subscribes to the `temp` channel
- Receives and logs messages in real-time
- Runs an Express server on port 3001

## 🔍 How It Works

### Subscription Flow

1. **Main Redis Client** - Created from `redis.js` (for general operations)
2. **Duplicate for Subscription** - `redis.duplicate()` creates a dedicated subscriber client
3. **Connect Subscriber** - Explicitly connects the subscriber client
4. **Subscribe to Channel** - Registers callback for incoming messages
5. **Receive Messages** - Callback fires whenever publisher sends to channel
6. **Log Messages** - Displays channel name and message content

### Why Duplicate Client?

Redis has a restriction: **once a client subscribes, it can only use pub/sub commands**. To perform other Redis operations, you need separate clients:

```javascript
const redis = require('./redis');        // Main client (for SET, GET, etc.)
const subscriber = redis.duplicate();    // Dedicated for SUBSCRIBE

// subscriber can ONLY do pub/sub operations now
// redis can do everything EXCEPT pub/sub
```

### Message Reception

```javascript
await subscriber.subscribe(channel, (message) => {
  console.log(`Subscriber 1 received from ${channel}: ${message}`);
});
```

**How it works:**
- Callback is invoked **immediately** when message arrives
- Non-blocking: can receive multiple messages concurrently
- Messages are delivered in **near real-time** (milliseconds)
- Only receives messages published **after** subscription

## 📁 Files

- **`index.js`** - Main subscriber logic and Express server
- **`redis.js`** - Redis client configuration and connection
- **`package.json`** - Dependencies and scripts
- **`.gitignore`** - Excludes node_modules and .env

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:
```env
REDIS_URL=redis://localhost:6379
PORT=3001
```

### Customization Options

**Subscribe to multiple channels:**
```javascript
await subscriber.subscribe('channel1', callback);
await subscriber.subscribe('channel2', callback);
await subscriber.subscribe('channel3', callback);
```

**Pattern-based subscription:**
```javascript
// Subscribe to all channels matching pattern
await subscriber.pSubscribe('temp:*', (message, channel) => {
  console.log(`From ${channel}: ${message}`);
});
```

**Change channel:**
```javascript
const channel = 'your-channel-name';
```

## 🚀 Running

```bash
# Install dependencies
npm install

# Start subscriber
npm start

# Or directly
node index.js
```

**⚠️ Start subscribers BEFORE publisher** to ensure they receive all messages!

## 📊 Console Output

```
Redis connected
Redis ready
Subscriber 1: Subscribed to channel: temp
Subscriber 1 server running on port 3001
Subscriber 1 received from temp: Message A
Subscriber 1 received from temp: Message C
Subscriber 1 received from temp: Message B
```

## 🔍 Key Observations

### Real-time Delivery
- Messages appear instantly (typically <1ms latency)
- No polling or checking required
- Push-based, not pull-based

### Independent Processing
- Each subscriber processes messages independently
- No coordination with other subscribers
- Subscriber 2 receives identical messages simultaneously

### No Message History
- Only receives messages after subscription starts
- Late subscribers miss earlier messages
- No replay or catch-up mechanism

## 🧪 Experiments

1. **Start Late**
   - Start publisher first
   - Start this subscriber after a minute
   - Observe: missed all earlier messages

2. **Stop and Restart**
   - Stop subscriber with Ctrl+C
   - Messages published during downtime are lost
   - Restart: only new messages received

3. **Add Message Processing**
   ```javascript
   await subscriber.subscribe(channel, async (message) => {
     // Parse JSON messages
     const data = JSON.parse(message);
     
     // Save to database
     await saveToDatabase(data);
     
     // Trigger actions
     if (data.type === 'urgent') {
       await sendNotification(data);
     }
   });
   ```

4. **Message Filtering**
   ```javascript
   await subscriber.subscribe(channel, (message) => {
     if (message.includes('Message A')) {
       console.log('Processing only A messages:', message);
     }
   });
   ```

5. **Performance Testing**
   ```javascript
   let messageCount = 0;
   const startTime = Date.now();
   
   await subscriber.subscribe(channel, (message) => {
     messageCount++;
     const elapsed = (Date.now() - startTime) / 1000;
     const rate = messageCount / elapsed;
     console.log(`Received ${messageCount} msgs (${rate.toFixed(2)} msg/s)`);
   });
   ```

## 🔍 Understanding Subscription

### Connection State
- **Before subscribe**: Can use all Redis commands
- **After subscribe**: Dedicated to pub/sub only
- **Duplicate client**: Required for general Redis operations

### Message Delivery
- **Guaranteed order**: Messages from same publisher arrive in order
- **No acknowledgment**: Redis doesn't wait for subscriber confirmation
- **Best effort**: Network issues can cause message loss
- **No retry**: Failed deliveries are not retried

### Multiple Subscribers
- All subscribers on same channel get ALL messages
- True broadcast pattern
- No load distribution (use queues for that)

## ⚠️ Important Notes

**Missed Messages**
- No message buffer or history
- Start subscribers before publisher to catch all messages
- For persistence, use Redis Streams instead

**Error Handling**
- Add try-catch in message callback for processing errors
- Subscriber errors don't affect other subscribers
- Connection errors trigger 'error' event

**Memory Usage**
- Minimal - messages not stored
- Subscriber processes and discards each message
- No memory growth over time

## 🛠️ Dependencies

```json
{
  "express": "^5.2.1",  // Web server
  "redis": "^4.6.13"     // Redis client
}
```

## 📚 Learn More

**Redis Pub/Sub Commands:**
- `SUBSCRIBE channel` - Subscribe to channel
- `PSUBSCRIBE pattern` - Subscribe to pattern
- `UNSUBSCRIBE channel` - Unsubscribe
- `PUBSUB CHANNELS` - List active channels

**Next Steps:**
- Build message processing pipeline
- Add error recovery and reconnection
- Implement dead letter queue for failed messages

---

**Listening for messages!** Subscribe and receive broadcasts in real-time. 📡
