# WebSocket Backend Demo

A simple WebSocket server demonstration using Node.js, Express, and the `ws` library.

## Features

- Real-time bidirectional communication
- Automatic event updates broadcasted to all connected clients
- HTTP API endpoints for REST access
- Connection management (tracking connected clients)
- Demo event system with random score updates

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
```

The server will start on port 3000 (or the PORT environment variable if set).

## Endpoints

### HTTP Endpoints

- `GET /` - Server information and available endpoints
- `GET /events` - Get all events
- `GET /events/:id` - Get a specific event by ID

### WebSocket Connection

Connect to `ws://localhost:3000`

## WebSocket Message Types

### Server → Client

1. **INITIAL** - Sent when a client first connects
```json
{
  "type": "INITIAL",
  "data": [...]
}
```

2. **UPDATE** - Sent when an event is updated
```json
{
  "type": "UPDATE",
  "data": {
    "id": "EVENT#00",
    "score": 42,
    "updatedAt": 1234567890
  }
}
```

3. **PONG** - Response to PING messages
```json
{
  "type": "PONG",
  "timestamp": 1234567890
}
```

### Client → Server

1. **PING** - Check server responsiveness
```json
{
  "type": "PING"
}
```

## How It Works

1. The server creates 5 demo events (EVENT#00 through EVENT#04)
2. Each event randomly updates every 2-7 seconds
3. When an event updates, all connected WebSocket clients receive the update in real-time
4. Clients can also query event data via HTTP endpoints

## Testing with Postman or Browser Console

```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  console.log('Connected to WebSocket server');
  ws.send(JSON.stringify({ type: 'PING' }));
};

ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Disconnected from WebSocket server');
};
```
