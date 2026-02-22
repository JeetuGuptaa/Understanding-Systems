# Understanding Systems

A collection of hands-on projects and demonstrations exploring various system design patterns, communication protocols, and distributed system concepts. Each project includes working code, detailed explanations, and interactive examples to help you understand core concepts through practice.

## 🎯 Purpose

This repository is designed to help developers:
- **Learn by doing** - Working implementations, not just theory
- **Understand trade-offs** - See the pros and cons of different approaches
- **Compare alternatives** - Side-by-side demonstrations of different patterns
- **Observe real behavior** - Watch network requests, resource usage, and performance

## 📚 Projects

### 1. [Short Polling](Short%20Polling/)

**Status:** ✅ Complete

A full-stack demonstration of the short polling pattern, showing both implementation and limitations.

**What you'll learn:**
- How short polling works (client repeatedly requests updates)
- Why it's inefficient (constant network overhead, TCP handshakes)
- When NOT to use it
- What alternatives exist (long polling, WebSockets, SSE)

**Tech Stack:** Node.js + Express, React 19, Vite

**Key Features:**
- Visual poll counter showing wasted requests
- Real-time status updates every 2 seconds
- Network tab observations for inefficiency analysis

[📖 Read more →](Short%20Polling/README.md)

---

### 2. [Long Polling](Long%20Polling/)

**Status:** ✅ Complete

A full-stack demonstration of the long polling pattern, showing near real-time updates with much better efficiency than short polling.

**What you'll learn:**
- How long polling works (connection held until data changes)
- 90% reduction in requests compared to short polling
- Request queueing and timeout management
- Handling client disconnects gracefully
- When to use long polling vs WebSockets/SSE

**Tech Stack:** Node.js + Express, React 19, Vite

**Key Features:**
- 5 simultaneous events with real-time score tracking
- Visual connection status indicators (waiting, updated, timeout)
- Live statistics dashboard (active connections, total requests)
- Network tab shows requests staying "pending" until updates
- Comparison metrics vs short polling

[📖 Read more →](Long%20Polling/README.md)

---

### 3. [Server-Sent Events](Server%20Sent%20Events/)

**Status:** ✅ Complete

A full-stack demonstration of Server-Sent Events (SSE) for efficient real-time server-to-client communication using a single persistent HTTP connection.

**What you'll learn:**
- How SSE works (server pushes updates to client)
- EventSource API in React
- Broadcasting to multiple clients
- 90%+ fewer requests than polling
- When to use SSE vs WebSockets vs polling
- Built-in auto-reconnection

**Tech Stack:** Node.js + Express, React 19, Vite

**Key Features:**
- Real-time dashboard with 3 widgets (stock, metrics, notifications)
- Multiple event streams on single connection
- Live event log with color-coded types
- Manual notification trigger
- Connection management and statistics
- Heartbeat to keep connections alive

[📖 Read more →](Server%20Sent%20Events/README.md)

---

### 4. [WebSockets](Websockets/)

**Status:** ✅ Complete

A full-stack demonstration of WebSocket protocol for full-duplex, bidirectional real-time communication between client and server.

**What you'll learn:**
- How WebSockets work (persistent bidirectional connection)
- Difference between WebSockets and HTTP/SSE
- Broadcasting updates to multiple clients
- Connection lifecycle management
- When to use WebSockets vs SSE vs polling
- Message handling and protocol design

**Tech Stack:** Node.js + Express + ws, React 19, Vite

**Key Features:**
- Real-time event tracking with 5 simultaneous events
- Bidirectional communication (client can send messages)
- Live connection status and statistics
- Auto-reconnection on disconnect
- PING/PONG heartbeat mechanism
- HTTP endpoints alongside WebSocket

[📖 Read more →](Websockets/README.md)

---

### 5. [Pub/Sub (Publish-Subscribe)](pub-sub/)

**Status:** ✅ Complete

A hands-on demonstration of the Publish-Subscribe messaging pattern using Redis, showing how publishers and subscribers communicate through a message broker with complete decoupling.

**What you'll learn:**
- How Pub/Sub messaging works (publisher → broker → subscribers)
- Broadcast pattern (one message reaches all subscribers)
- Complete decoupling between components
- Redis as a message broker
- Difference between Pub/Sub and message queues
- Ephemeral messaging (no persistence)

**Tech Stack:** Node.js + Express, Redis, redis (npm client)

**Key Features:**
- Publisher sends random messages every 5 seconds
- Two independent subscribers receive all messages
- Real-time message broadcasting
- Subscriber count tracking
- Fire-and-forget delivery
- Connection management and error handling

[📖 Read more →](pub-sub/README.md)

---

## 🗺️ Roadmap

Coming soon:

### Message Queues
- Queue-based communication
- Reliability and message ordering
- Work distribution patterns

### Caching Strategies
- In-memory caching
- Distributed caching (Redis)
- Cache invalidation patterns

### Load Balancing
- Round-robin, least connections
- Health checks
- Session persistence

### Rate Limiting
- Token bucket algorithm
- Sliding window
- Distributed rate limiting

## 🚀 Getting Started

Each project has its own README with:
- Concept explanation
- Setup instructions
- Working code
- Learning objectives
- Experiment ideas

Navigate to any project folder and follow the README to get started!

## 🛠️ Prerequisites

Most projects require:
- **Node.js** v18+
- **npm** or **yarn**
- Modern web browser
- Basic JavaScript/React knowledge

Specific requirements are listed in each project's README.

## 📖 How to Use This Repo

1. **Pick a topic** you want to learn
2. **Clone and setup** the project
3. **Run the code** and observe behavior
4. **Experiment** - modify intervals, add features, break things!
5. **Compare** - try different approaches and see the differences
6. **Read the analysis** - understand why things work the way they do

## 🎓 Learning Path

Recommended order for beginners:

1. **Short Polling** ← Start here (simple, demonstrates inefficiency)
2. **Long Polling** (improves on short polling)
3. **Server-Sent Events** (one-way streaming)
4. **WebSockets** (full-duplex communication)
5. **Pub/Sub** ✅ (message broker pattern, decoupled architecture)
6. **Message Queues** (guaranteed delivery, work distribution)
7. **Caching** (performance optimization)
8. **Load Balancing** (scaling)
9. **Rate Limiting** (protection)

## 🤝 Contributing

This is an educational repository. Contributions are welcome:
- Fix bugs or improve existing demos
- Add new system design patterns
- Improve documentation
- Share experiment results

## 📝 Notes

- All projects are intentionally simplified for learning
- Production implementations would need additional considerations (security, monitoring, etc.)
- Some demos use in-memory storage for simplicity
- Focus is on understanding concepts, not production-ready code

## 📚 Additional Resources

- [System Design Primer](https://github.com/donnemartin/system-design-primer)
- [High Scalability Blog](http://highscalability.com/)

## 📧 Feedback

Found something confusing? Have suggestions? Feel free to open an issue or contribute!

---

**Happy Learning! 🚀** Build systems, break systems, understand systems.
