# WebSocket Frontend Demo

A React-based frontend demonstrating real-time bidirectional communication using WebSocket protocol.

## Features

- **Real-time Updates**: Live tracking of 5 simultaneous events
- **Bidirectional Communication**: Both client and server can send messages
- **Connection Management**: Auto-reconnect on disconnect
- **PING/PONG**: Test server responsiveness
- **Live Statistics**: Track messages, connection time, and active events
- **Message Log**: See all WebSocket communications in real-time

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **WebSocket API** - Native browser WebSocket implementation

## Installation

```bash
npm install
```

## Running the App

```bash
npm run dev
```

The app will start on [http://localhost:5173](http://localhost:5173)

**Important:** Make sure the backend server is running on port 3000 before connecting!

## How It Works

### Connection Flow

1. Click "Connect" to establish WebSocket connection to `ws://localhost:3000`
2. Server sends initial event data (EVENT#00 through EVENT#04)
3. Events update randomly every 2-7 seconds
4. All updates are pushed to the client immediately
5. Client can send PING messages to test bidirectional communication

### UI Components

#### Connection Status
- Green pulsing dot when connected
- Shows current connection state

#### Statistics Panel
- **Messages Received**: Total number of WebSocket messages
- **Connection Time**: How long the connection has been active
- **Active Events**: Number of events being tracked

#### Live Events Grid
- Displays all 5 events in real-time
- Shows current score for each event
- Displays time since last update
- Animated updates when events change

#### Message Log
- Shows all WebSocket communications
- Color-coded by message type:
  - Green: Successful operations (PONG, initial connection)
  - Blue: Info messages (event updates, PING sent)
  - Orange: Warnings (disconnections)
  - Red: Errors

## WebSocket Message Types

### Server → Client

**INITIAL** - Sent when client connects
```json
{
  "type": "INITIAL",
  "data": [
    {
      "id": "EVENT#00",
      "score": 15,
      "updatedAt": 1234567890
    }
  ]
}
```

**UPDATE** - Sent when an event changes
```json
{
  "type": "UPDATE",
  "data": {
    "id": "EVENT#00",
    "score": 23,
    "updatedAt": 1234567890
  }
}
```

**PONG** - Response to client's PING
```json
{
  "type": "PONG",
  "timestamp": 1234567890
}
```

### Client → Server

**PING** - Test server responsiveness
```json
{
  "type": "PING"
}
```

## Key Features Demonstrated

### WebSocket vs HTTP
- **Persistent Connection**: Single connection stays open
- **Full-Duplex**: Both sides can send messages anytime
- **Low Latency**: No connection overhead for each message
- **Push Updates**: Server can send data without client request

### Connection Management
- Auto-reconnect after disconnect
- Connection state tracking
- Graceful error handling

### Real-time Updates
- Instant event score updates
- No polling required
- Minimal network overhead

## Development

### File Structure
```
src/
├── App.jsx        # Main component with WebSocket logic
├── App.css        # Styles
├── main.jsx       # React entry point
└── index.css      # Global styles
```

### Key Code Patterns

**Establishing Connection**
```javascript
const ws = new WebSocket('ws://localhost:3000');
ws.onopen = () => { /* connected */ };
ws.onmessage = (event) => { /* handle message */ };
```

**Sending Messages**
```javascript
ws.send(JSON.stringify({ type: 'PING' }));
```

**Cleanup**
```javascript
useEffect(() => {
  return () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };
}, []);
```

## Browser DevTools

Open DevTools → Network tab → WS filter to see:
- WebSocket connection upgrade
- All messages sent/received
- Connection state
- Message size and timing

## Comparison with Other Patterns

| Feature | WebSocket | SSE | Long Polling | Short Polling |
|---------|-----------|-----|--------------|---------------|
| Connection Type | Persistent | Persistent | Semi-persistent | Temporary |
| Direction | Bidirectional | Server→Client | Server→Client | Server→Client |
| Latency | Very Low | Low | Medium | High |
| Overhead | Minimal | Low | Medium | Very High |
| Browser Support | Modern | Modern | All | All |

## Learning Objectives

After using this demo, you should understand:
- How WebSocket connections work
- Difference between WebSocket and HTTP
- When to use WebSocket vs SSE vs polling
- How to handle connection lifecycle
- Message serialization (JSON)
- Real-time data synchronization

## Experiment Ideas

1. **Network Simulation**: Use DevTools to throttle network and see reconnection
2. **Message Types**: Add new message types for different interactions
3. **Multiple Clients**: Open multiple browser tabs and watch synchronization
4. **Error Handling**: Stop the backend and observe auto-reconnect
5. **Latency Testing**: Send PINGs and measure response time

## Troubleshooting

**Connection Failed**
- Ensure backend is running on port 3000
- Check firewall settings
- Verify WebSocket URL is correct

**Not Receiving Updates**
- Check browser console for errors
- Verify backend is sending messages
- Review network tab for WebSocket frames

**Auto-reconnect Not Working**
- Check browser console for errors
- Manually disconnect and reconnect
- Restart both frontend and backend

## Production Considerations

This is a learning demo. For production:
- Add authentication/authorization
- Implement heartbeat mechanism
- Handle reconnection with exponential backoff
- Add message queuing for offline scenarios
- Implement proper error boundaries
- Add monitoring and logging
- Use WSS (WebSocket Secure) for encryption
- Handle connection limits and scaling

---

**Built with ⚡ and React**
