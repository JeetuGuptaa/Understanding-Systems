import { useState, useEffect, useRef } from 'react';
import './App.css';

const API_BASE = 'http://localhost:3001';

const ALGORITHMS = [
  {
    id: 'token-bucket',
    name: 'Token Bucket',
    endpoint: '/api/token-bucket',
    description: '5 tokens capacity, refills at 1 token/second',
    info: 'Allows bursts up to capacity. Best for APIs that need burst handling.',
  },
  {
    id: 'sliding-window',
    name: 'Sliding Window',
    endpoint: '/api/sliding-window',
    description: '8 requests per 30 seconds',
    info: 'Most accurate. No boundary issues. Stores all request timestamps.',
  },
  {
    id: 'fixed-window',
    name: 'Fixed Window',
    endpoint: '/api/fixed-window',
    description: '6 requests per 20 seconds',
    info: 'Simple and efficient. Can have 2x burst at window boundaries.',
  },
  {
    id: 'distributed',
    name: 'Distributed (Redis)',
    endpoint: '/api/distributed',
    description: '10 requests per 60 seconds',
    info: 'Shared across all servers. Requires Redis. Production-ready.',
  },
];

function AlgorithmCard({ algorithm }) {
  const [stats, setStats] = useState({
    limit: 0,
    remaining: 0,
    current: 0,
  });
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [autoTest, setAutoTest] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const autoTestInterval = useRef(null);

  useEffect(() => {
    checkAvailability();
  }, []);

  useEffect(() => {
    if (autoTest) {
      autoTestInterval.current = setInterval(() => {
        makeRequest();
      }, 1000);
    } else {
      if (autoTestInterval.current) {
        clearInterval(autoTestInterval.current);
      }
    }
    return () => {
      if (autoTestInterval.current) {
        clearInterval(autoTestInterval.current);
      }
    };
  }, [autoTest]);

  const checkAvailability = async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      const data = await res.json();
      if (algorithm.id === 'distributed' && data.redis !== 'connected') {
        setIsAvailable(false);
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const makeRequest = async () => {
    if (loading) return;
    
    setLoading(true);
    const startTime = Date.now();

    try {
      const res = await fetch(`${API_BASE}${algorithm.endpoint}`);
      const data = await res.json();
      const duration = Date.now() - startTime;

      const limit = parseInt(res.headers.get('X-RateLimit-Limit') || '0');
      const remaining = parseInt(res.headers.get('X-RateLimit-Remaining') || '0');

      setStats({ limit, remaining, current: limit - remaining });

      const historyEntry = {
        time: new Date().toLocaleTimeString(),
        success: res.ok,
        message: res.ok ? 'Success' : data.error,
        duration,
        remaining,
      };

      setHistory((prev) => [historyEntry, ...prev].slice(0, 10));
      setStatus(res.ok ? 'success' : 'error');

      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      setHistory((prev) => [
        {
          time: new Date().toLocaleTimeString(),
          success: false,
          message: 'Network Error',
        },
        ...prev,
      ].slice(0, 10));
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setStats({ limit: 0, remaining: 0, current: 0 });
  };

  if (!isAvailable) {
    return (
      <div className="algorithm-card">
        <div className="algorithm-header">
          <h2>{algorithm.name}</h2>
          <span className="status-badge unavailable">Unavailable</span>
        </div>
        <div className="unavailable-message">
          Redis is not connected. Start Redis to use distributed rate limiting.
        </div>
        <div className="algorithm-info">{algorithm.info}</div>
      </div>
    );
  }

  const progressPercent = stats.limit > 0 ? (stats.current / stats.limit) * 100 : 0;

  return (
    <div className={`algorithm-card ${status}`}>
      <div className="algorithm-header">
        <h2>{algorithm.name}</h2>
        {status === 'success' && <span className="status-badge success">✓ Success</span>}
        {status === 'error' && <span className="status-badge error">✗ Rate Limited</span>}
      </div>

      <div className="algorithm-info">
        <strong>{algorithm.description}</strong>
        <p style={{ marginTop: '5px', fontSize: '0.85em' }}>{algorithm.info}</p>
      </div>

      <div className="stats">
        <div className="stat-item">
          <div className="stat-label">Limit</div>
          <div className="stat-value">{stats.limit || '—'}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Remaining</div>
          <div className="stat-value">{stats.remaining}</div>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className={`progress-bar-fill ${progressPercent > 80 ? 'danger' : ''}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="controls">
        <button
          className="btn btn-primary"
          onClick={makeRequest}
          disabled={loading || autoTest}
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
        <button className="btn btn-secondary" onClick={clearHistory}>
          Clear
        </button>
      </div>

      <div className="auto-test">
        <input
          type="checkbox"
          id={`auto-${algorithm.id}`}
          checked={autoTest}
          onChange={(e) => setAutoTest(e.target.checked)}
        />
        <label htmlFor={`auto-${algorithm.id}`}>
          Auto-test (1 req/sec)
        </label>
      </div>

      {history.length > 0 && (
        <div className="request-history">
          {history.map((entry, idx) => (
            <div key={idx} className={`request-item ${entry.success ? 'success' : 'error'}`}>
              <span>{entry.time}</span>
              <span>{entry.message}</span>
              {entry.success && <span>{entry.duration}ms</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <div className="header">
        <h1>⚡ Rate Limiting Demo</h1>
        <p>
          Compare different rate limiting algorithms in action. Click "Send Request" or enable
          auto-test to see how each algorithm handles traffic.
        </p>
      </div>

      <div className="algorithms-grid">
        {ALGORITHMS.map((algo) => (
          <AlgorithmCard key={algo.id} algorithm={algo} />
        ))}
      </div>

      <div className="comparison-section">
        <h2>📊 Algorithm Comparison</h2>
        <div className="comparison-grid">
          <div className="comparison-card">
            <h3>Token Bucket</h3>
            <p><strong>Use Case:</strong> APIs with bursty traffic</p>
            <ul>
              <li>Allows bursts</li>
              <li>Smooth refill</li>
              <li>Memory efficient</li>
              <li className="con">Complex timing</li>
            </ul>
          </div>

          <div className="comparison-card">
            <h3>Sliding Window</h3>
            <p><strong>Use Case:</strong> Precise rate limiting</p>
            <ul>
              <li>Most accurate</li>
              <li>No boundary issues</li>
              <li>Fair distribution</li>
              <li className="con">Higher memory</li>
            </ul>
          </div>

          <div className="comparison-card">
            <h3>Fixed Window</h3>
            <p><strong>Use Case:</strong> Simple rate limiting</p>
            <ul>
              <li>Very simple</li>
              <li>Low memory</li>
              <li>Fast</li>
              <li className="con">Boundary bursts</li>
            </ul>
          </div>

          <div className="comparison-card">
            <h3>Distributed (Redis)</h3>
            <p><strong>Use Case:</strong> Multi-server systems</p>
            <ul>
              <li>Scales horizontally</li>
              <li>Survives restarts</li>
              <li>Shared state</li>
              <li className="con">Requires Redis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
