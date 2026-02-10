# Server-Sent Events Frontend

A React-based demonstration showing real-time server-to-client communication using the EventSource API.

## 🚀 Features

- **EventSource API**: Native browser support for SSE with React hooks
- **Real-time Widgets**: Stock prices, system metrics, notifications
- **Connection Management**: Connect/disconnect controls with visual status
- **Event Logging**: Real-time log of all received events
- **Live Statistics**: Event count, connection time tracking
- **React 19**: Modern React with hooks (useState, useEffect, useRef)

## 📦 Installation

```bash
npm install
```

## 🏃 Running the Demo

Make sure the backend is running on `http://localhost:3000` first!

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🎯 How to Use

1. **Start the Backend** first (see Backend/README.md)
2. **Open the frontend** at http://localhost:5173
3. **Click "Connect to Stream"** to start receiving events
4. **Watch the widgets update** in real-time:
   - Stock price updates every 2 seconds
   - System metrics update every 3 seconds
   - Notifications arrive every 5 seconds
5. **Try "Trigger Manual Notification"** to send a custom event
6. **Monitor the Event Log** to see all incoming events

## 📊 Dashboard Widgets

### Stock Price Widget
- Displays current stock price (random walk simulation)
- Shows trend direction (up/down)
- Updates every 2 seconds

### System Metrics Widget
- CPU usage bar (0-100%)
- Memory usage bar (0-100%)
- Request counter
- Updates every 3 seconds

### Notifications Widget
- Shows last 5 notifications
- Displays timestamp for each
- New notifications slide in with animation

## 🔍 Technical Details

### React Implementation

The app uses React hooks for SSE management:

```javascript
const eventSourceRef = useRef(null);

const connect = () => {
  const eventSource = new EventSource('http://localhost:3000/events');
  eventSourceRef.current = eventSource;
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleEvent(data);
  };
};
```

### State Management

- `useState` for UI state (connection status, counts, data)
- `useRef` for EventSource instance and timers
- `useEffect` for cleanup on unmount

### Event Handling

The app processes different event types:
- `connected` - Initial connection confirmation
- `stock-update` - Stock price changes
- `metrics-update` - System metrics
- `notification` - New notifications
- `heartbeat` - Connection keepalive

## 🧪 Experiments to Try

1. **Open DevTools Network Tab**
   - See the `/events` connection stay open
   - Notice "pending" status while connected
   - One connection replaces thousands of requests!

2. **Multiple Tabs**
   - Open multiple browser tabs
   - Each gets its own SSE connection
   - All receive the same updates simultaneously

3. **Network Interruption**
   - Disconnect from SSE
   - Stop the backend
   - Observe error handling

4. **Manual Notifications**
   - Click "Trigger Manual Notification"
   - All connected clients receive it instantly
   - Check the Event Log

## 📝 Code Structure

```
src/
├── App.jsx      # Main component with SSE logic
├── App.css      # Styling and animations
├── main.jsx     # React entry point
└── index.css    # Global styles
```

### Key React Patterns

- **useRef** for mutable values that don't trigger re-renders
- **useEffect** with cleanup for connection lifecycle
- **Conditional rendering** for empty states
- **Dynamic className** for connection status
- **Array mapping** for lists (notifications, logs)

## 💡 Learning Points

After using this demo, you'll understand:

✅ How to use EventSource API in React  
✅ Managing SSE connections with useRef  
✅ Proper cleanup to prevent memory leaks  
✅ Real-time state updates with useState  
✅ Event-driven UI updates  
✅ Advantages of SSE over polling  

## 🔧 Troubleshooting

**Events not appearing?**
- Check that backend is running on port 3000
- Look for CORS errors in browser console
- Verify connection status shows "Connected"

**Connection keeps failing?**
- Ensure backend CORS is enabled
- Check network tab for error details
- Try clearing browser cache

**Widgets not updating?**
- Check Event Log for incoming events
- Verify event types match expected format
- Look for JavaScript errors in console

## ⚙️ Configuration

### Change API URL

In `App.jsx`:
```javascript
const API_BASE_URL = 'http://localhost:3000';
```

## 🌐 Browser Support

Server-Sent Events are supported in all modern browsers:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ❌ Internet Explorer (use polyfill)

---

**Built with React 19 + Vite** - Part of Understanding Systems project!

