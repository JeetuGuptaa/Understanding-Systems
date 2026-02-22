# Subscriber 2

The second subscriber component that listens to messages from a Redis channel, demonstrating how multiple subscribers can independently receive the same messages.

## 📘 What It Does

This subscriber:
- Connects to Redis server
- Creates a duplicate client for subscription (Redis requirement)
- Subscribes to the `temp` channel
- Receives and logs messages in real-time
- Runs an Express server on port 3002

## 🔍 How It Works

### Identical to Subscriber 1 (By Design!)

This subscriber is **functionally identical** to Subscriber 1, but runs on a different port (3002). This demonstrates a key Pub/Sub principle:

> **All subscribers to the same channel receive ALL messages independently**

### Subscription Flow

1. **Main Redis Client** - Created from `redis.js`
2. **Duplicate for Subscription** - `redis.duplicate()` creates dedicated subscriber
3. **Connect Subscriber** - Connects the subscriber client
4. **Subscribe to Channel** - Registers callback for `temp` channel
5. **Receive Messages** - Gets same messages as Subscriber 1 simultaneously
6. **Log Messages** - Displays with "Subscriber 2" prefix

## 🎯 Purpose of This Subscriber

### Demonstrates Broadcast Pattern

Both subscribers receive **identical messages** at the **same time**:

```
Publisher          Subscriber 1         Subscriber 2
   |                    |                     |
   |--- Message A ----->|-------------------->|
   |                    ✓                     ✓
   |                Both receive "Message A"
   |
   |--- Message B ----->|-------------------->|
   |                    ✓                     ✓
   |                Both receive "Message B"
```

### Shows Independence

- Subscribers don't affect each other
- If Subscriber 1 crashes, Subscriber 2 continues
- If Subscriber 2 stops, Subscriber 1 is unaffected
- Processing times don't matter - each is independent

## 📁 Files

- **`index.js`** - Main subscriber logic and Express server (identical to sub1)
- **`redis.js`** - Redis client configuration and connection
- **`package.json`** - Dependencies and scripts
- **`.gitignore`** - Excludes node_modules and .env

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:
```env
REDIS_URL=redis://localhost:6379
PORT=3002
```

**Note:** Different port from Subscriber 1 (3001) to avoid conflicts.

## 🚀 Running

```bash
# Install dependencies
npm install

# Start subscriber
npm start

# Or directly
node index.js
```

**⚠️ Start both subscribers BEFORE publisher** to ensure they receive all messages!

## 📊 Console Output

```
Redis connected
Redis ready
Subscriber 2: Subscribed to channel: temp
Subscriber 2 server running on port 3002
Subscriber 2 received from temp: Message A
Subscriber 2 received from temp: Message C
Subscriber 2 received from temp: Message B
```

**Compare with Subscriber 1:** Identical messages, same order!

## 🔍 Key Observations

### Simultaneous Reception
When you run both subscribers:
```
# Subscriber 1 console
Subscriber 1 received from temp: Message A

# Subscriber 2 console (at the same time)
Subscriber 2 received from temp: Message A
```

Messages arrive at **both subscribers simultaneously** - Redis broadcasts in parallel, not sequentially.

### No Message Splitting
Unlike work queues where messages are distributed:
- ❌ NOT: Sub1 gets A, Sub2 gets B, Sub1 gets C (round-robin)
- ✅ YES: Sub1 gets A,B,C and Sub2 gets A,B,C (broadcast)

### Independent Failures
- Stop Subscriber 2 → Subscriber 1 still works
- Subscriber 2 errors → Doesn't affect Subscriber 1
- Restart Subscriber 2 → Misses messages during downtime

## 🧪 Experiments

1. **Add Processing Delay**
   ```javascript
   await subscriber.subscribe(channel, async (message) => {
     console.log(`Subscriber 2 received: ${message}`);
     
     // Simulate slow processing
     await new Promise(resolve => setTimeout(resolve, 3000));
     
     console.log(`Subscriber 2 finished processing: ${message}`);
   });
   ```
   **Observe:** Subscriber 1 processes faster, but both receive messages at same time.

2. **Start Late**
   - Start Publisher and Subscriber 1
   - Wait 30 seconds
   - Start Subscriber 2
   - **Observe:** Subscriber 2 misses earlier messages

3. **Crash Recovery**
   - Run all three components
   - Kill Subscriber 2 (Ctrl+C)
   - Observe Publisher shows 1 subscriber instead of 2
   - Restart Subscriber 2
   - **Observe:** Subscriber 2 only gets new messages, not missed ones

4. **Different Behavior**
   ```javascript
   // Subscriber 1: Saves to database
   await subscriber.subscribe(channel, async (message) => {
     await saveToDatabase(message);
   });
   
   // Subscriber 2: Sends notifications
   await subscriber.subscribe(channel, async (message) => {
     await sendEmailNotification(message);
   });
   ```
   **Use case:** Same message triggers multiple independent actions.

5. **Add More Subscribers**
   - Copy this folder to `sub3`, `sub4`, etc.
   - Change port in each
   - Run them all
   - **Observe:** ALL subscribers receive ALL messages

## 🔍 Pub/Sub vs Work Queue

### Pub/Sub (This Pattern)
```
Publisher → [temp] → Subscriber 1 (gets A,B,C)
                   → Subscriber 2 (gets A,B,C)
                   → Subscriber 3 (gets A,B,C)
```
**Every subscriber gets every message**

### Work Queue (Different Pattern)
```
Producer → [queue] → Worker 1 (gets A,C)
                   → Worker 2 (gets B)
```
**Each message goes to ONE worker**

## 🎯 Real-World Use Cases

Multiple subscribers receiving same messages:

1. **Multi-channel Notification System**
   - Sub1: Email service
   - Sub2: SMS service
   - Sub3: Push notification service
   - All send notifications for same event

2. **Analytics Pipeline**
   - Sub1: Real-time dashboard
   - Sub2: Data warehouse ETL
   - Sub3: Anomaly detector
   - All process same events differently

3. **Cache Invalidation**
   - Sub1: Server instance 1
   - Sub2: Server instance 2
   - Sub3: Server instance 3
   - All clear cache for same key

4. **Monitoring**
   - Sub1: Metrics aggregator
   - Sub2: Alert system
   - Sub3: Log archiver
   - All observe same events

## ⚠️ Important Notes

**Identical Code, Different Purpose**
- Code is same as Subscriber 1
- Purpose is to show broadcast pattern
- In production, each would likely do different things

**No Message Coordination**
- Subscribers don't know about each other
- No shared state
- Completely independent processing

**Scalability**
- Can add unlimited subscribers
- Each new subscriber receives ALL messages
- No performance impact on publisher

## 🛠️ Dependencies

```json
{
  "express": "^5.2.1",  // Web server
  "redis": "^4.6.13"     // Redis client
}
```

## 📚 Learn More

**Broadcast Patterns:**
- Fan-out architecture
- Event-driven design
- Reactive systems

**Next Steps:**
- Implement different processing logic for each subscriber
- Add message filtering (selective subscription)
- Build aggregation layer (combine subscriber results)

---

**Double the subscribers, double the coverage!** See how broadcasts reach everyone simultaneously. 📡📡
