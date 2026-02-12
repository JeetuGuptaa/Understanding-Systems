import { useState, useEffect, useRef } from 'react'
import './App.css'

const WS_URL = 'ws://localhost:3000';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState({});
  const [messageCount, setMessageCount] = useState(0);
  const [connectionTime, setConnectionTime] = useState(0);
  const [lastPing, setLastPing] = useState(null);
  const [eventLog, setEventLog] = useState([]);
  
  const wsRef = useRef(null);
  const connectionStartRef = useRef(null);
  const timerRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = () => {
    if (wsRef.current) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connection opened');
        setIsConnected(true);
        connectionStartRef.current = Date.now();
        addLog('Connected to WebSocket server', 'success');

        timerRef.current = setInterval(() => {
          if (connectionStartRef.current) {
            const elapsed = Math.floor((Date.now() - connectionStartRef.current) / 1000);
            setConnectionTime(elapsed);
          }
        }, 1000);
      };

      ws.onmessage = (event) => {
        setMessageCount(prev => prev + 1);
        
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Error parsing message:', error);
          addLog('Failed to parse message', 'error');
        }
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        cleanup();
        addLog('Disconnected from server', 'warning');
        
        // Auto-reconnect after 3 seconds
        if (isConnected) {
          reconnectTimeoutRef.current = setTimeout(() => {
            addLog('Attempting to reconnect...', 'info');
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        addLog('Connection error occurred', 'error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      addLog('Failed to connect to server', 'error');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    cleanup();
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsConnected(false);
    connectionStartRef.current = null;
  };

  const handleMessage = (message) => {
    const { type, data } = message;

    switch (type) {
      case 'INITIAL':
        // Initialize all events
        const eventsMap = {};
        data.forEach(event => {
          eventsMap[event.id] = event;
        });
        setEvents(eventsMap);
        addLog(`Received ${data.length} initial events`, 'success');
        break;

      case 'UPDATE':
        // Update specific event
        setEvents(prev => ({
          ...prev,
          [data.id]: data
        }));
        addLog(`${data.id} updated: score ${data.score}`, 'info');
        break;

      case 'PONG':
        const latency = Date.now() - lastPing;
        addLog(`PONG received (${latency}ms)`, 'success');
        setLastPing(null);
        break;

      default:
        addLog(`Unknown message type: ${type}`, 'warning');
    }
  };

  const sendPing = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = { type: 'PING' };
      wsRef.current.send(JSON.stringify(message));
      setLastPing(Date.now());
      addLog('PING sent to server', 'info');
    } else {
      addLog('Cannot send PING: not connected', 'error');
    }
  };

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setEventLog(prev => {
      const newLog = [{ time, message, type }, ...prev];
      return newLog.slice(0, 50);
    });
  };

  const clearLog = () => {
    setEventLog([]);
    addLog('Log cleared', 'muted');
  };

  const formatConnectionTime = () => {
    const minutes = Math.floor(connectionTime / 60);
    const seconds = connectionTime % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getTimeSince = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const eventsList = Object.values(events).sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="app">
      <header>
        <h1>⚡ WebSocket Demo</h1>
        <p>Full-duplex bidirectional real-time communication</p>
      </header>

      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span className="status-text">{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      <div className="controls">
        <button onClick={connect} disabled={isConnected} className="btn primary">
          Connect
        </button>
        <button onClick={disconnect} disabled={!isConnected} className="btn secondary">
          Disconnect
        </button>
        <button onClick={sendPing} disabled={!isConnected} className="btn accent">
          Send PING
        </button>
      </div>

      <div className="stats-panel">
        <div className="stat-card">
          <span className="stat-label">Messages Received</span>
          <span className="stat-value">{messageCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Connection Time</span>
          <span className="stat-value">{formatConnectionTime()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Events</span>
          <span className="stat-value">{eventsList.length}</span>
        </div>
      </div>

      <div className="events-section">
        <h2>📊 Live Events</h2>
        <div className="events-grid">
          {eventsList.length === 0 ? (
            <div className="empty-state">Connect to see live events</div>
          ) : (
            eventsList.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <span className="event-id">{event.id}</span>
                  <span className="event-time">{getTimeSince(event.updatedAt)}</span>
                </div>
                <div className="event-score">{event.score}</div>
                <div className="event-footer">
                  Last updated: {formatTime(event.updatedAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="event-log">
        <div className="log-header">
          <h3>📋 Message Log</h3>
          <button onClick={clearLog} className="btn small">Clear</button>
        </div>
        <div className="log-content">
          {eventLog.length === 0 ? (
            <div className="empty-state">No messages yet</div>
          ) : (
            eventLog.map((entry, index) => (
              <div key={index} className={`log-entry ${entry.type}`}>
                <span className="log-time">{entry.time}</span>
                <span className="log-message">{entry.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <footer>
        <p>💡 WebSocket provides full-duplex communication - both client and server can send messages anytime!</p>
        <p className="hint">Open DevTools Network tab and filter by WS to see the WebSocket connection</p>
      </footer>
    </div>
  )
}

export default App
