# Server-Sent Events Demo

A full-stack demonstration of Server-Sent Events (SSE) for real-time server-to-client communication. This project shows how servers can push updates to clients efficiently using a single persistent HTTP connection.

## 📋 What are Server-Sent Events?

Server-Sent Events (SSE) is a server push technology that allows a server to send automatic updates to clients via a single HTTP connection. Unlike polling, the connection stays open and the server pushes data whenever available.

**How it works:**
1. Client opens connection to server's SSE endpoint
2. Server keeps connection alive
3. Server pushes events to client whenever data changes
4. Client receives events in real-time
5. Built-in auto-reconnection if connection drops

## 🏗️ Project Structure

```
Server Sent Events/
├── Backend/          # Node.js + Express server with SSE
│   ├── index.js
│   ├── package.json
│   ├── .env
│   ├── .gitignore
│   └── README.md
├── Frontend/         # React app using EventSource API
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── README.md
└── README.md         # This file
```

## ✨ Features

### Backend
- RESTful API with Express.js
- Multiple event streams (stock prices, metrics, notifications)
- Auto-broadcast to all connected clients
- Connection management with Set data structure
- Heartbeat to keep connections alive (every 15s)
- Manual notification trigger endpoint
- CORS enabled for frontend communication

### Frontend
- React 19 with modern hooks
- EventSource API for SSE connection
- Real-time dashboard with 3 widgets
- Live statistics (event count, connection time)
- Event log with type-based coloring
- Connect/disconnect controls
- Manual notification trigger button
- Responsive design with animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Start the Backend

```bash
cd Backend
npm install
node --watch --env-file=.env index.js
```

Backend will start on **http://localhost:3000**

### 2. Start the Frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend will start on **http://localhost:5173**

### 3. See It in Action

1. Open http://localhost:5173 in your browser
2. Click "Connect to Stream"
3. Watch real-time updates:
   - Stock prices update every 2 seconds
   - System metrics update every 3 seconds
   - Notifications arrive every 5 seconds
   - Heartbeat every 15 seconds
4. Open DevTools Network tab to see the persistent `/events` connection
5. Try "Trigger Manual Notification" to send custom events

## 📊 What You'll Observe

### Single Persistent Connection
- **One connection** stays open for all updates
- Connection shows "pending" in Network tab
- No repeated requests like polling
- Automatic reconnection on network issues

### Real-Time Updates
- Updates appear immediately when server sends them
- No polling delay (unlike short polling's 2-second wait)
- Multiple event types on same connection
- Zero client-initiated requests after connection

### Efficiency Gains
- **vs Short Polling**: 90%+ reduction in requests
- **vs Long Polling**: Simpler, built-in reconnection
- **vs WebSockets**: Easier to implement, HTTP-based
- One-way communication (server → client)

## 🎯 Event Streams

### 1. Stock Updates (every 2s)
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

### 2. System Metrics (every 3s)
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

### 3. Notifications (every 5s)
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

### 4. Heartbeat (every 15s)
```json
{
  "type": "heartbeat",
  "data": {
    "timestamp": 1738972800000
  }
}
```

## 🔍 Learning Objectives

After exploring this demo, you'll understand:

✅ How Server-Sent Events work  
✅ EventSource API in React  
✅ SSE message format (`data: ...\n\n`)  
✅ Managing persistent connections  
✅ Broadcasting to multiple clients  
✅ When to use SSE vs WebSockets vs polling  
✅ Automatic reconnection handling  

## ✨ Advantages of SSE

### 1. **Efficient Real-Time Updates**
- Server pushes data only when it changes
- No wasted requests checking for updates
- Lower latency than polling

### 2. **Simple to Implement**
- Built on HTTP (no special protocol)
- Native browser support (EventSource API)
- Automatic reconnection
- Works through most proxies/firewalls

### 3. **Perfect for One-Way Data**
- Live dashboards and monitoring
- Notifications and alerts
- Activity feeds
- Progress tracking
- Live scores/metrics

### 4. **Resource Efficient**
- Single connection for all events
- Text-based (JSON works great)
- Lower server load than polling
- Better battery life on mobile

## ⚠️ SSE Limitations

### 1. **One-Way Only**
- Server → Client communication only
- For bidirectional, use WebSockets
- Client must use HTTP requests for sending data

### 2. **Browser Connection Limits**
- ~6 concurrent SSE connections per domain
- Can be an issue with many tabs
- Use WebSockets for many simultaneous connections

### 3. **Text-Only**
- No binary data support
- Must encode/stringify data (JSON)
- For binary, use WebSockets

### 4. **Proxy Issues**
- Some proxies may timeout long connections
- May need shorter heartbeat intervals
- Generally works better than WebSockets with proxies

## 🔄 Comparison with Other Patterns

### vs Short Polling
- ✅ 90%+ fewer HTTP requests
- ✅ Lower latency (immediate updates)
- ✅ Less server load
- ✅ Better scalability

### vs Long Polling
- ✅ Simpler implementation
- ✅ Built-in reconnection
- ✅ Standard HTTP (better proxy support)
- ✅ Native browser API

### vs WebSockets
- ✅ Simpler to implement
- ✅ Standard HTTP/HTTPS (better compatibility)
- ✅ Automatic reconnection built-in
- ✅ Better for one-way communication
- ❌ Not bidirectional
- ❌ Text-only (no binary)
- ❌ Connection limits

## 🎯 When to Use SSE

### ✅ Perfect For
- **Live Dashboards** - Stock prices, analytics, monitoring
- **Notifications** - Alerts, messages, updates
- **Activity Feeds** - Social media, news, logs
- **Progress Tracking** - Build status, uploads
- **Live Scores** - Sports, games, metrics
- **Real-time Data** - Sensor data, IoT updates

### ❌ Use WebSockets Instead
- Bidirectional communication (chat, gaming)
- Binary data transfer
- Very high frequency updates (>10/sec)
- Low latency critical (sub-100ms)

### ❌ Use Polling Instead
- Infrequent updates (minutes apart)
- No real-time requirement
- Maximum simplicity needed

## 📖 API Documentation

### Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | SSE connection endpoint |
| POST | `/trigger-notification` | Manually trigger notification |
| GET | `/` | Health check |

See [Backend/README.md](Backend/README.md) for detailed API docs.

## 🛠️ Configuration

### Backend (.env)
```env
PORT=3000
```

### Frontend (src/App.jsx)
```javascript
const API_BASE_URL = 'http://localhost:3000';
```

### Backend Event Intervals
```javascript
// Stock updates: 2 seconds
// Metrics: 3 seconds
// Notifications: 5 seconds
// Heartbeat: 15 seconds
```

## 🧪 Experiment Ideas

1. **Open Multiple Tabs**
   - See each tab get its own connection
   - All receive same updates simultaneously
   - Check backend logs for client count

2. **Monitor Network Tab**
   - See single persistent connection
   - Notice "pending" status while connected
   - Compare with polling's constant requests

3. **Test Reconnection**
   - Disconnect and reconnect
   - Stop backend mid-stream
   - Observe auto-reconnection behavior

4. **Load Testing**
   - Open 10+ tabs
   - Monitor server memory
   - Check connection scalability

5. **Custom Events**
   - Use "Trigger Manual Notification"
   - All clients receive instantly
   - See real-time broadcast in action

## 📚 Further Reading

- [Server-Sent Events Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [EventSource API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [Using Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [Backend Documentation](Backend/README.md)
- [Frontend Documentation](Frontend/README.md)

## 🤝 Contributing

This is an educational demo. Feel free to:
- Add more event types
- Implement authentication
- Add reconnection strategies
- Create comparison dashboard
- Improve error handling

## 📝 License

Educational demo - free to use and modify

## 🎓 Part of "Understanding Systems"

This demo is part of a series exploring system design patterns:
- ✅ Short Polling Demo
- ✅ Long Polling Demo
- ✅ Server-Sent Events (you are here)
- 🔜 WebSockets Implementation
- 🔜 More coming soon...

---

**Happy Learning! 🚀** Experience the power of server push technology with Server-Sent Events!
