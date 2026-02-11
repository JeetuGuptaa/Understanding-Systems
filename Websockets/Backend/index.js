const express = require("express");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const http = require("http");

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

const db = {};
const clients = new Set();

const initializeEvents = () => {
  const N = 5;
  for (let i = 0; i < N; i++) {
    let eventId = `EVENT#${String(i).padStart(2, '0')}`;
    db[eventId] = {
      id: eventId,
      score: 0,
      updatedAt: Date.now()
    };
  }
};

const startEmitter = async (eventId) => {
  let updateAfter = Math.floor(Math.random() * 5) + 2; 

  setTimeout(() => {
    let score = Math.floor(Math.random() * 10);
    db[eventId].score += score;
    db[eventId].updatedAt = Date.now();
    
    console.log(`${eventId} updated - New score: ${db[eventId].score}`);

    broadcast({
      type: 'UPDATE',
      data: db[eventId]
    });

    startEmitter(eventId);
  }, updateAfter * 1000);
};

const broadcast = (message) => {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === 1) { 
      client.send(data);
    }
  });
};

wss.on('connection', (ws) => {
  console.log('New client connected');
  clients.add(ws);

  ws.send(JSON.stringify({
    type: 'INITIAL',
    data: Object.values(db)
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      if (data.type === 'PING') {
        ws.send(JSON.stringify({
          type: 'PONG',
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'WebSocket Demo Server',
    websocket: `ws://localhost:${port}`,
    endpoints: {
      '/events': 'GET - Get all events',
      '/events/:id': 'GET - Get specific event'
    }
  });
});

app.get('/events', (req, res) => {
  res.json({
    success: true,
    data: Object.values(db)
  });
});

app.get('/events/:id', (req, res) => {
  const event = db[req.params.id];
  if (event) {
    res.json({
      success: true,
      data: event
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`WebSocket server available at ws://localhost:${port}`);
  
  initializeEvents();
  
  Object.keys(db).forEach(eventId => {
    startEmitter(eventId);
  });
});
