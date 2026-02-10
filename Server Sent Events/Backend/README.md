# Server-Sent Events Backend

A Node.js + Express server demonstrating Server-Sent Events (SSE) for real-time server-to-client communication.

## 🚀 Features

- **Multiple Event Streams**: Stock prices, system metrics, and notifications
- **Auto-broadcast**: Server pushes updates to all connected clients
- **Heartbeat**: Keeps connections alive with periodic heartbeat events
- **Manual Triggers**: API endpoint to trigger custom notifications
- **Connection Management**: Tracks and manages multiple concurrent SSE connections

## 📦 Installation

```bash
npm install
```

## 🏃 Running the Server

```bash
node --watch --env-file=.env index.js
```

Server will start on **http://localhost:3000**

## 📡 SSE Endpoint

### GET /events

Opens a Server-Sent Events connection that streams real-time updates.

**Response Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Event Types:**

1. **connected** - Sent immediately upon connection
```json
{
  "type": "connected",
  "data": {
    "message": "Connected to SSE stream",
    "timestamp": 1738972800000
  }
}
```

2. **stock-update** - Stock price updates (every 2 seconds)
```json
{
  "type": "stock-update",
  "data": {
    "price": "105.43",
    "trend": 1,
    "timestamp": 1738972800000
  }
}
```

3. **metrics-update** - System metrics (every 3 seconds)
```json
{
  "type": "metrics-update",
  "data": {
    "cpu": 45,
    "memory": 62,
    "requests": 123
  }
}
```

4. **notification** - Random notifications (every 5 seconds)
```json
{
  "type": "notification",
  "data": {
    "id": 1738972800000,
    "message": "New user signed up",
    "timestamp": 1738972800000
  }
}
```

5. **heartbeat** - Connection keepalive (every 15 seconds)
```json
{
  "type": "heartbeat",
  "data": {
    "timestamp": 1738972800000
  }
}
```

## 🔧 Additional Endpoints

### GET /

Health check endpoint showing server status.

**Response:**
```json
{
  "status": "running",
  "clients": 3,
  "uptime": 1234.56,
  "streams": ["stock", "metrics", "notifications"]
}
```

## 🧪 Testing with curl

```bash
# Connect to SSE stream
curl -N http://localhost:3000/events

## 📊 How It Works

1. **Client connects** to `/events` endpoint
2. **Server registers** the connection in a Set of active clients
3. **Server sends** initial state immediately
4. **Background timers** update data at different intervals:
   - Stock prices: every 2 seconds
   - Metrics: every 3 seconds
   - Notifications: every 5 seconds
   - Heartbeat: every 15 seconds
5. **Broadcast function** sends updates to all connected clients
6. **Client disconnect** handled via `req.on('close')`

## 🔍 Key Implementation Details

### Connection Management
```javascript
const clients = new Set();

app.get('/events', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Add client
  clients.add(res);
  
  // Handle disconnect
  req.on('close', () => {
    clients.delete(res);
  });
});
```

### Broadcasting
```javascript
function broadcast(eventData) {
  const data = `data: ${JSON.stringify(eventData)}\n\n`;
  
  clients.forEach(client => {
    try {
      client.write(data);
    } catch (error) {
      clients.delete(client);
    }
  });
}
```

## ⚙️ Configuration

Edit the intervals in `index.js`:

```javascript
// Stock updates every 2 seconds
setInterval(() => { /* ... */ }, 2000);

// Metrics every 3 seconds
setInterval(() => { /* ... */ }, 3000);

// Notifications every 5 seconds
setInterval(() => { /* ... */ }, 5000);

// Heartbeat every 15 seconds
setInterval(() => { /* ... */ }, 15000);
```

## 🎯 Use Cases

Server-Sent Events are perfect for:
- **Live dashboards** - Stock prices, analytics, monitoring
- **Notifications** - Real-time alerts and updates
- **Activity feeds** - Social media updates, news feeds
- **Progress tracking** - Build status, upload progress
- **Scoreboards** - Live sports scores, game leaderboards

## ⚠️ Limitations

- **One-way communication** (server → client only)
- **Text-based data** (JSON must be stringified)
- **Browser limit** on concurrent connections per domain (~6)
- **Requires reconnection** on network issues
- **No binary data** support

## 🔄 Comparison

**vs Short/Long Polling:**
- ✅ More efficient (single persistent connection)
- ✅ Lower latency (immediate updates)
- ✅ Less server load (no repeated requests)

**vs WebSockets:**
- ✅ Simpler to implement
- ✅ Built-in auto-reconnect
- ✅ Uses standard HTTP/HTTPS
- ❌ Only server → client (not bidirectional)
- ❌ No binary data support

---

**Part of Understanding Systems** - Learn system design patterns through hands-on demos!
