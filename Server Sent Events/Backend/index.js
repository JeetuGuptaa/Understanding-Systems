const express = require("express");
const cors = require("cors");

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

// Store active SSE connections
const clients = new Set();

// Simulated data source - multiple event streams
const eventStreams = {
  stock: { price: 100, trend: 1 },
  metrics: { cpu: 20, memory: 40, requests: 0 },
  notifications: []
};

// Update stock prices randomly
setInterval(() => {
  const change = (Math.random() - 0.5) * 5;
  eventStreams.stock.price = Math.max(50, Math.min(200, eventStreams.stock.price + change));
  eventStreams.stock.trend = change > 0 ? 1 : -1;
  
  broadcast({
    type: 'stock-update',
    data: {
      price: eventStreams.stock.price.toFixed(2),
      trend: eventStreams.stock.trend,
      timestamp: Date.now()
    }
  });
}, 2000);

// Update system metrics
setInterval(() => {
  eventStreams.metrics.cpu = Math.floor(Math.random() * 100);
  eventStreams.metrics.memory = Math.floor(Math.random() * 100);
  eventStreams.metrics.requests++;
  
  broadcast({
    type: 'metrics-update',
    data: eventStreams.metrics
  });
}, 3000);

// Send random notifications
setInterval(() => {
  const notifications = [
    'New user signed up',
    'Payment received',
    'Server health check passed',
    'Backup completed',
    'New comment posted'
  ];
  
  const notification = {
    id: Date.now(),
    message: notifications[Math.floor(Math.random() * notifications.length)],
    timestamp: Date.now()
  };
  
  broadcast({
    type: 'notification',
    data: notification
  });
}, 5000);

// Heartbeat to keep connections alive
setInterval(() => {
  broadcast({
    type: 'heartbeat',
    data: { timestamp: Date.now() }
  });
}, 15000);

// SSE endpoint
app.get('/events', (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    data: { message: 'Connected to SSE stream', timestamp: Date.now() }
  })}\n\n`);

  // Send current state immediately
  res.write(`data: ${JSON.stringify({
    type: 'stock-update',
    data: {
      price: eventStreams.stock.price.toFixed(2),
      trend: eventStreams.stock.trend,
      timestamp: Date.now()
    }
  })}\n\n`);

  res.write(`data: ${JSON.stringify({
    type: 'metrics-update',
    data: eventStreams.metrics
  })}\n\n`);

  // Add client to the set
  clients.add(res);
  console.log(`Client connected. Total clients: ${clients.size}`);

  // Handle client disconnect
  req.on('close', () => {
    clients.delete(res);
    console.log(`Client disconnected. Total clients: ${clients.size}`);
  });
});

// Broadcast to all connected clients
function broadcast(eventData) {
  const data = `data: ${JSON.stringify(eventData)}\n\n`;
  
  clients.forEach(client => {
    try {
      client.write(data);
    } catch (error) {
      console.error('Error sending to client:', error);
      clients.delete(client);
    }
  });
}

app.get('/', (req, res) => {
  res.json({
    success: true,
    data : {
        status: 'running',
        clients: clients.size,
        uptime: process.uptime(),
        streams: Object.keys(eventStreams)
    }, 
    message: 'Up and Running'
  });
});

app.listen(port, (err) => {
  if (err) {
    console.log(`Error starting server: ${err}`);
    process.exit(1);
  }
  console.log(`SSE Server running on port ${port}`);
});
