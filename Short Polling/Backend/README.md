# Short Polling Backend

A simple Express.js backend designed for learning and experimenting with short polling patterns.

## What is Short Polling?

Short polling is a technique where the client repeatedly requests data from the server at regular intervals to check for updates. This backend simulates long-running operations that clients can poll to check completion status.

## How It Works

1. **Create an Item** - Client sends a POST request to create an item
2. **Item Processing** - The server simulates processing with a random delay (0-100 seconds)
3. **Poll for Status** - Client repeatedly checks the item's status using GET requests
4. **Complete** - Once processing finishes, status changes from `creating` to `Success`

## API Endpoints

### `GET /`
Health check endpoint to verify the server is running.

**Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Server is up and running"
}
```

### `POST /items`
Creates a new item with a simulated processing delay.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 0,
    "status": "creating",
    "updatedAt": 1738876800000
  },
  "message": "Being created"
}
```

### `GET /items`
Retrieves all items in the database.

**Response:**
```json
{
  "success": true,
  "data": {
    "items": { /* all items */ },
    "total": 3
  },
  "message": "Items fetched successfully"
}
```

### `GET /items/:id/status`
Polls the status of a specific item.

**Response (while creating):**
```json
{
  "success": true,
  "data": {
    "status": "creating",
    "timepassed": 15
  },
  "message": "Status fetched"
}
```

**Response (completed):**
```json
{
  "success": true,
  "data": {
    "status": "Success",
    "timepassed": 0
  },
  "message": "Status fetched"
}
```

## Features

- ✅ **CORS enabled** - Allows cross-origin requests from the frontend
- ✅ **Comprehensive error handling** - Try-catch blocks and global error handlers
- ✅ **Random processing delays** - Simulates real-world async operations (0-100 seconds)
- ✅ **In-memory storage** - Simple database using JavaScript objects
- ✅ **Process-level error handlers** - Catches uncaught exceptions and unhandled rejections

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file** (optional):
   ```
   PORT=3000
   ```

3. **Run the server:**
   ```bash
   node --watch --env-file=.env index.js
   ```

The server will start on port 3000 (or the port specified in `.env`).

## Environment Variables

- `PORT` - Server port (default: 3000)

## Dependencies

- `express` - Web framework
- `cors` - Enable CORS for cross-origin requests

## Use Cases

- Learning short polling implementation
- Testing frontend polling mechanisms
- Demonstrating async operation status tracking
- Understanding client-server communication patterns

## Limitations of Short Polling

While short polling is simple to implement, it comes with several drawbacks:

### 1. **Unnecessary Network Traffic**
- Client makes requests even when there's no new data
- Wastes bandwidth with repeated requests that return "still processing"
- Each request includes HTTP headers, cookies, and overhead

### 2. **Increased Server Load**
- Server processes many requests just to say "no updates yet"
- Database/resource queries happen on every poll, even when nothing changed
- Scales poorly with multiple clients (100 clients polling every 2 seconds = 50 requests/second)

### 3. **Delayed Updates**
- Updates are only received at the next poll interval
- If polling every 5 seconds, users might wait up to 5 seconds to see changes
- No instant notifications when status actually changes

### 4. **Resource Inefficiency**
- Keeps connections open/closed repeatedly
- Each request requires a **3-way TCP handshake** (SYN → SYN-ACK → ACK) to establish connection
- Each response requires a **connection teardown** (FIN → ACK or FIN+ACK) to close it
- This TCP overhead happens for every single poll, even if there's no new data
- CPU cycles wasted on processing "no change" responses
- Battery drain on mobile devices due to constant network activity

### 5. **Difficult to Optimize**
- Poll too frequently → waste resources
- Poll too slowly → poor user experience
- Hard to find the right balance

## When to Move to Long Polling

Consider migrating to **long polling** when you experience:

- **High traffic** - Many clients polling simultaneously
- **Real-time requirements** - Need instant updates (chat apps, live notifications)
- **Long processing times** - Operations that take several minutes or hours
- **Resource constraints** - Server struggling with constant polling requests
- **Mobile applications** - Battery life is a concern

### Long Polling Benefits:
- Server holds the request open until data is available
- Client gets updates immediately when they happen
- Drastically reduces unnecessary requests
- Better for real-time applications

### Even Better Alternatives:
- **WebSockets** - For bidirectional, real-time communication
- **Server-Sent Events (SSE)** - For one-way server-to-client updates
- **GraphQL Subscriptions** - For real-time data in GraphQL APIs

## Notes

- Data is stored in-memory and will be lost on server restart
- Each item gets a random processing time between 0-100 seconds
- Items automatically transition from `creating` to `Success` after processing

