# Long Polling Frontend

A React-based demonstration of the long polling pattern, showing how connections stay open until data changes.

## 🚀 Features

- **Real-time Event Tracking**: Monitor 5 simultaneous events (EVENT#00 to EVENT#04)
- **Connection Status**: Visual indicators showing waiting, updated, timeout, and error states
- **Live Statistics**: Track total requests, active connections, and average scores
- **Individual Control**: Start/stop polling for each event independently
- **Efficient Updates**: Connections held open until backend sends updates (0-32 second intervals)
- **Auto-reconnect**: Automatically reconnects after receiving data or timing out

## 📦 Installation

```bash
npm install
```

## 🏃 Running the App

Make sure the backend is running on `http://localhost:3000` first!

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🎯 How It Works

### Long Polling Flow

1. **Start Polling**: Click "Start All" or individual event "Start" buttons
2. **Connection Opens**: Request sent to backend at `/status?eventId=EVENT#XX&last_updated=timestamp`
3. **Server Waits**: Backend holds connection open until:
   - Event data changes (responds immediately with new data)
   - 30-second timeout occurs (responds with 408)
4. **Response Received**: Frontend updates UI with new score/status
5. **Immediate Reconnect**: New request sent immediately after response
6. **Repeat**: Cycle continues until you click "Stop"

### Status Indicators

- **⏳ waiting** (orange): Connection is open, waiting for server response
- **✅ updated** (green): Just received new data from server
- **⏱️ timeout** (gray): 30 seconds passed with no update
- **❌ error** (red): Network or server error occurred
- **⭕ idle** (gray): Not currently polling

## 📊 Key Metrics

### Total Requests
Shows cumulative number of long poll requests made across all events.

### Active Connections
Number of requests currently waiting for server response (max 5 if all events active).

### Average Score
Mean score across all 5 events. Each event's score increases randomly (0-10) at random intervals.

### Connection Duration
How long the last request was held open before responding. Typically:
- **< 30s**: Event updated before timeout
- **~30s**: Request timed out (no update)

## 🔬 Comparing with Short Polling

**Short Polling** (typical 2-second intervals):
- Waits 20 seconds for update = **10 requests** (20s ÷ 2s)
- Most responses are "no change" = wasted bandwidth
- Fixed delay between checks

**Long Polling** (this demo):
- Waits 20 seconds for update = **1 request**
- Response only sent when data changes
- Immediate notification when data updates
- **90% fewer requests!**

## 🧪 Experiment Ideas

1. **Start Individual Events** - Start just EVENT#00 and watch connection duration
2. **Monitor Network Tab** - See requests stay "pending" until data changes
3. **Compare with Short Polling** - Run both demos side-by-side and count requests
4. **Simulate Network Issues** - Stop the backend mid-connection
5. **Load Testing** - Open multiple browser tabs and monitor performance

## 🐛 Troubleshooting

- **Events Not Updating**: Ensure backend is running on port 3000
- **Constant Timeouts**: Normal if events aren't updating within 30s
- **Connection Errors**: Backend auto-retries after 2 seconds on error

---

**Built with React + Vite**
