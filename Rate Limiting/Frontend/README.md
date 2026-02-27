# Rate Limiting Frontend

Interactive React application to test and compare different rate limiting algorithms.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

## ⚙️ Prerequisites

Make sure the backend is running on `http://localhost:3001`

## 🎯 Features

### 1. **Interactive Testing**
- Click "Send Request" to test each algorithm
- See real-time success/failure responses
- View remaining quota and limits

### 2. **Auto-Testing**
- Enable "Auto-test" to send 1 request per second
- Watch rate limits trigger automatically
- Compare how different algorithms behave

### 3. **Visual Feedback**
- Progress bars show quota usage
- Color-coded cards (green = success, red = rate limited)
- Request history with timestamps

### 4. **Live Statistics**
- Current requests vs limit
- Remaining quota
- Response times
- Success/error tracking

### 5. **Algorithm Comparison**
- Side-by-side view of all algorithms
- Pros/cons for each approach
- Use case recommendations

## 📊 Understanding the Display

### Card Colors
- **White**: Idle, waiting for requests
- **Green border**: Last request succeeded
- **Red border**: Last request was rate limited

### Progress Bar
- **Purple**: Normal usage
- **Red**: High usage (>80% of quota)

### Request History
- **Green**: Successful request
- **Red**: Rate limited (429 response)
- Shows timestamp and response time

## 🧪 Experiments to Try

1. **Test Bursts**: Click rapidly on Token Bucket - it allows bursts
2. **Compare Accuracy**: Enable auto-test on all - see which is strictest
3. **Boundary Testing**: Watch Fixed Window at reset time
4. **Redis Testing**: Compare distributed vs in-memory performance

## 🎓 Learning Points

- **Token Bucket** - See how tokens refill over time
- **Sliding Window** - Notice precise request counting
- **Fixed Window** - Observe window reset behavior
- **Distributed** - Same limits work across multiple tabs!

## 🔧 Configuration

Backend endpoints are configured in `App.jsx`:

```javascript
const API_BASE = 'http://localhost:3001';
```

Change this if your backend is running elsewhere.
