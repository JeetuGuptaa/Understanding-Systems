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

## 🗺️ Roadmap

Coming soon:

### Long Polling
- Request holds until data is available
- Comparison with short polling
- Resource usage analysis

### WebSockets
- Bidirectional real-time communication
- Chat application example
- Connection lifecycle management

### Server-Sent Events (SSE)
- One-way server-to-client streaming
- Live notifications demo
- Comparison with WebSockets

### Message Queues
- Pub/Sub patterns
- Queue-based communication
- Reliability and message ordering

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
5. **Message Queues** (decoupled architecture)
6. **Caching** (performance optimization)
7. **Load Balancing** (scaling)
8. **Rate Limiting** (protection)

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
