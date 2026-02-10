import { useState, useEffect, useRef } from 'react'
import './App.css'

const API_BASE_URL = 'http://localhost:3000';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [connectionTime, setConnectionTime] = useState(0);
  const [lastEventType, setLastEventType] = useState('None');
  
  const [stockPrice, setStockPrice] = useState('100.00');
  const [stockTrend, setStockTrend] = useState(0);
  
  const [metrics, setMetrics] = useState({ cpu: 0, memory: 0, requests: 0 });
  
  const [notifications, setNotifications] = useState([]);
  const [eventLog, setEventLog] = useState([]);
  
  const eventSourceRef = useRef(null);
  const connectionStartRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = () => {
    if (eventSourceRef.current) return;

    const eventSource = new EventSource(`${API_BASE_URL}/events`);
    eventSourceRef.current = eventSource;
    connectionStartRef.current = Date.now();
    setIsConnected(true);
    setEventCount(0);

    timerRef.current = setInterval(() => {
      if (connectionStartRef.current) {
        const elapsed = Math.floor((Date.now() - connectionStartRef.current) / 1000);
        setConnectionTime(elapsed);
      }
    }, 1000);

    eventSource.onmessage = (event) => {
      setEventCount(prev => prev + 1);
      
      try {
        const eventData = JSON.parse(event.data);
        handleEvent(eventData);
      } catch (error) {
        console.error('Error parsing event:', error);
      }
    };

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      addLog('Connection opened', 'success');
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      addLog('Connection error', 'error');
      
      if (eventSource.readyState === EventSource.CLOSED) {
        disconnect();
      }
    };
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsConnected(false);
    connectionStartRef.current = null;
    addLog('Disconnected from stream', 'info');
  };

  const handleEvent = (eventData) => {
    const { type, data } = eventData;
    setLastEventType(type);

    switch (type) {
      case 'connected':
        addLog(`Connected: ${data.message}`, 'success');
        break;

      case 'stock-update':
        setStockPrice(data.price);
        setStockTrend(data.trend);
        addLog(`Stock: $${data.price}`, 'info');
        break;

      case 'metrics-update':
        setMetrics(data);
        addLog(`Metrics: CPU ${data.cpu}%, Memory ${data.memory}%`, 'info');
        break;

      case 'notification':
        addNotification(data);
        addLog(`Notification: ${data.message}`, 'warning');
        break;

      case 'heartbeat':
        addLog('Heartbeat', 'muted');
        break;

      default:
        addLog(`Unknown event: ${type}`, 'error');
    }
  };

  const addNotification = (data) => {
    setNotifications(prev => {
      const newNotifications = [{
        ...data,
        time: new Date(data.timestamp).toLocaleTimeString()
      }, ...prev];
      return newNotifications.slice(0, 5);
    });
  };

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setEventLog(prev => {
      const newLog = [{ time, message, type }, ...prev];
      return newLog.slice(0, 50);
    });
  };

  const triggerNotification = async () => {
    try {
      await fetch(`${API_BASE_URL}/trigger-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Manual test notification from React!' })
      });
    } catch (error) {
      console.error('Error triggering notification:', error);
      alert('Failed to trigger notification. Make sure backend is running!');
    }
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

  return (
    <div className="app">
      <header>
        <h1>📡 Server-Sent Events Demo</h1>
        <p>Real-time updates pushed from server to client</p>
      </header>

      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <span className="status-dot"></span>
        <span className="status-text">{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>

      <div className="controls">
        <button onClick={connect} disabled={isConnected} className="btn primary">
          Connect to Stream
        </button>
        <button onClick={disconnect} disabled={!isConnected} className="btn secondary">
          Disconnect
        </button>
        <button onClick={triggerNotification} className="btn accent">
          Trigger Manual Notification
        </button>
      </div>

      <div className="stats-panel">
        <div className="stat-card">
          <span className="stat-label">Events Received</span>
          <span className="stat-value">{eventCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Connection Time</span>
          <span className="stat-value">{formatConnectionTime()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Last Event</span>
          <span className="stat-value">{lastEventType}</span>
        </div>
      </div>

      <div className="dashboard">
        {/* Stock Widget */}
        <div className="widget stock-widget">
          <h3>📈 Stock Price</h3>
          <div className="stock-price">${stockPrice}</div>
          <div className={`stock-trend ${stockTrend > 0 ? 'up' : 'down'}`}>
            {stockTrend > 0 ? '📈 Trending Up' : '📉 Trending Down'}
          </div>
          <div className="widget-footer">Updates every 2s</div>
        </div>

        {/* Metrics Widget */}
        <div className="widget metrics-widget">
          <h3>⚡ System Metrics</h3>
          <div className="metric-row">
            <span className="metric-label">CPU:</span>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${metrics.cpu > 80 ? 'high' : metrics.cpu > 50 ? 'medium' : 'low'}`}
                style={{ width: `${metrics.cpu}%` }}
              ></div>
            </div>
            <span className="metric-value">{metrics.cpu}%</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Memory:</span>
            <div className="progress-bar">
              <div 
                className={`progress-fill ${metrics.memory > 80 ? 'high' : metrics.memory > 50 ? 'medium' : 'low'}`}
                style={{ width: `${metrics.memory}%` }}
              ></div>
            </div>
            <span className="metric-value">{metrics.memory}%</span>
          </div>
          <div className="metric-row">
            <span className="metric-label">Requests:</span>
            <span className="metric-value">{metrics.requests}</span>
          </div>
          <div className="widget-footer">Updates every 3s</div>
        </div>

        {/* Notifications Widget */}
        <div className="widget notifications-widget">
          <h3>🔔 Notifications</h3>
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-state">No notifications yet</div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="notification-item">
                  <div className="notification-icon">🔔</div>
                  <div className="notification-content">
                    <div className="notification-message">{notif.message}</div>
                    <div className="notification-time">{notif.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="widget-footer">Updates every 5s</div>
        </div>
      </div>

      {/* Event Log */}
      <div className="event-log">
        <div className="log-header">
          <h3>📋 Event Log</h3>
          <button onClick={clearLog} className="btn small">Clear</button>
        </div>
        <div className="log-content">
          {eventLog.map((entry, index) => (
            <div key={index} className={`log-entry ${entry.type}`}>
              <span className="log-time">{entry.time}</span>
              <span className="log-message">{entry.message}</span>
            </div>
          ))}
        </div>
      </div>

      <footer>
        <p>💡 Notice how the server pushes updates without the client requesting them!</p>
        <p className="hint">Open DevTools Network tab to see a single long-lived connection</p>
      </footer>
    </div>
  )
}

export default App
