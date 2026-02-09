import { useState, useEffect, useRef } from 'react'
import './App.css'

const API_BASE_URL = 'http://localhost:3000';

// Event IDs that the backend creates
const EVENT_IDS = ['EVENT#00', 'EVENT#01', 'EVENT#02', 'EVENT#03', 'EVENT#04'];

function App() {
  const [events, setEvents] = useState({});
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeConnections: 0,
  });
  const abortControllers = useRef({});
  const isPolling = useRef({});
  const lastUpdatedTimestamps = useRef({});

  // Initialize events on mount
  useEffect(() => {
    const initialEvents = {};
    EVENT_IDS.forEach(eventId => {
      initialEvents[eventId] = {
        id: eventId,
        score: 0,
        updatedAt: 0,
        requestCount: 0,
        lastUpdateTime: null,
        connectionStatus: 'idle', // idle, waiting, updated, timeout, error
        connectionDuration: 0
      };
      lastUpdatedTimestamps.current[eventId] = 0;
    });
    setEvents(initialEvents);
  }, []);

  // Start long polling for an event
  const startLongPoll = async (eventId) => {
    if (isPolling.current[eventId]) return;
    
    isPolling.current[eventId] = true;
    
    while (isPolling.current[eventId]) {
      const controller = new AbortController();
      abortControllers.current[eventId] = controller;
      
      const startTime = Date.now();
      
      try {
        // Update connection status
        setEvents(prev => ({
          ...prev,
          [eventId]: { ...prev[eventId], connectionStatus: 'waiting' }
        }));
        setStats(prev => ({ ...prev, activeConnections: prev.activeConnections + 1 }));

        const currentLastUpdated = lastUpdatedTimestamps.current[eventId] || 0;
        
        const response = await fetch(
          `${API_BASE_URL}/status?eventId=${encodeURIComponent(eventId)}&last_updated=${currentLastUpdated}`,
          { signal: controller.signal }
        );
        
        const result = await response.json();
        const connectionDuration = ((Date.now() - startTime) / 1000).toFixed(2);

        setStats(prev => ({ 
          ...prev, 
          totalRequests: prev.totalRequests + 1,
          activeConnections: prev.activeConnections - 1
        }));

        if (result.success && result.data.item) {
          // Data was updated
          lastUpdatedTimestamps.current[eventId] = result.data.item.updatedAt;
          setEvents(prev => ({
            ...prev,
            [eventId]: {
              ...prev[eventId],
              score: result.data.item.score,
              updatedAt: result.data.item.updatedAt,
              requestCount: prev[eventId].requestCount + 1,
              lastUpdateTime: new Date().toLocaleTimeString(),
              connectionStatus: 'updated',
              connectionDuration: parseFloat(connectionDuration)
            }
          }));
        } else if (response.status === 408) {
          // Request timed out (no update within 30s)
          setEvents(prev => ({
            ...prev,
            [eventId]: {
              ...prev[eventId],
              requestCount: prev[eventId].requestCount + 1,
              connectionStatus: 'timeout',
              connectionDuration: parseFloat(connectionDuration)
            }
          }));
        }

        // Small delay before next poll to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        setStats(prev => ({ 
          ...prev, 
          activeConnections: Math.max(0, prev.activeConnections - 1)
        }));

        if (error.name === 'AbortError') {
          console.log(`Long poll aborted for ${eventId}`);
          break;
        } else {
          console.error(`Error polling ${eventId}:`, error);
          setEvents(prev => ({
            ...prev,
            [eventId]: {
              ...prev[eventId],
              connectionStatus: 'error',
              requestCount: prev[eventId].requestCount + 1
            }
          }));
          // Wait a bit before retrying on error
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  };

  // Stop long polling for an event
  const stopLongPoll = (eventId) => {
    isPolling.current[eventId] = false;
    if (abortControllers.current[eventId]) {
      abortControllers.current[eventId].abort();
      delete abortControllers.current[eventId];
    }
    setEvents(prev => ({
      ...prev,
      [eventId]: { ...prev[eventId], connectionStatus: 'idle' }
    }));
  };

  // Toggle polling for an event
  const togglePolling = (eventId) => {
    if (isPolling.current[eventId]) {
      stopLongPoll(eventId);
    } else {
      startLongPoll(eventId);
    }
  };

  // Start/stop all events
  const toggleAllPolling = () => {
    const anyActive = Object.values(isPolling.current).some(v => v);
    
    if (anyActive) {
      EVENT_IDS.forEach(stopLongPoll);
    } else {
      EVENT_IDS.forEach(startLongPoll);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.keys(abortControllers.current).forEach(eventId => {
        abortControllers.current[eventId].abort();
      });
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return '#ffa500';
      case 'updated': return '#4caf50';
      case 'timeout': return '#888';
      case 'error': return '#f44336';
      default: return '#888';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting': return '⏳';
      case 'updated': return '✅';
      case 'timeout': return '⏱️';
      case 'error': return '❌';
      default: return '⭕';
    }
  };

  return (
    <div className="app">
      <header>
        <h1>⚡ Long Polling Demo</h1>
        <p>Connections stay open until data changes - much more efficient than short polling!</p>
      </header>

      <div className="stats-panel">
        <div className="stat-card">
          <span className="stat-label">Total Requests</span>
          <span className="stat-value">{stats.totalRequests}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Connections</span>
          <span className="stat-value highlight">{stats.activeConnections}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average Score</span>
          <span className="stat-value">
            {Object.values(events).length > 0 
              ? Math.round(Object.values(events).reduce((sum, e) => sum + (e.score || 0), 0) / Object.values(events).length)
              : 0}
          </span>
        </div>
      </div>

      <div className="controls">
        <button 
          onClick={toggleAllPolling}
          className="control-btn primary"
        >
          {Object.values(isPolling.current).some(v => v) ? '⏸️ Stop All' : '▶️ Start All'}
        </button>
        <div className="info">
          <span>Backend updates events every 0-32 seconds</span>
          <span>Long poll timeout: 30 seconds</span>
        </div>
      </div>

      <div className="events-grid">
        {Object.values(events).map(event => (
          <div 
            key={event.id}
            className="event-card"
            style={{ borderColor: getStatusColor(event.connectionStatus) }}
          >
            <div className="event-header">
              <h3>{event.id}</h3>
              <button
                onClick={() => togglePolling(event.id)}
                className={`toggle-btn ${isPolling.current[event.id] ? 'active' : ''}`}
              >
                {isPolling.current[event.id] ? '⏸️ Stop' : '▶️ Start'}
              </button>
            </div>

            <div className="score-display">
              <div className="score-value">{event.score}</div>
              <div className="score-label">Score</div>
            </div>

            <div className="event-details">
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className="value status-indicator" style={{ color: getStatusColor(event.connectionStatus) }}>
                  {getStatusIcon(event.connectionStatus)} {event.connectionStatus}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Requests:</span>
                <span className="value">{event.requestCount}</span>
              </div>
              <div className="detail-row">
                <span className="label">Last Duration:</span>
                <span className="value">{event.connectionDuration}s</span>
              </div>
              {event.lastUpdateTime && (
                <div className="detail-row">
                  <span className="label">Last Update:</span>
                  <span className="value">{event.lastUpdateTime}</span>
                </div>
              )}
            </div>

            {isPolling.current[event.id] && event.connectionStatus === 'waiting' && (
              <div className="waiting-indicator">
                <div className="spinner"></div>
                <span>Waiting for update...</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <footer>
        <p>💡 Notice how requests stay open until data changes - way fewer requests than short polling!</p>
        <p className="hint">Compare: Short polling would make ~{Math.round(30/2)} requests for a 30-second wait. Long polling makes just 1!</p>
      </footer>
    </div>
  )
}

export default App
