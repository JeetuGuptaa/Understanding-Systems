import { useState, useEffect, useRef } from 'react'
import './App.css'

const API_BASE_URL = 'http://localhost:3000';
const POLL_INTERVAL = 2000; // Poll every 2 seconds

function App() {
  const [items, setItems] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pollingIntervals = useRef({});

  // Fetch existing items on mount
  useEffect(() => {
    const fetchExistingItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/items`);
        const result = await response.json();
        
        if (result.success && result.data.items) {
          const existingItems = Object.values(result.data.items).map(item => ({
            ...item,
            pollCount: 0,
            startTime: Date.now()
          }));
          
          setItems(existingItems);
          
          // Start polling for items that are still creating
          existingItems.forEach(item => {
            if (item.status === 'creating') {
              startPolling(item.id);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching existing items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingItems();
  }, []);

  // Create a new item
  const createItem = async () => {
    setIsCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        const newItem = {
          ...result.data,
          pollCount: 0,
          startTime: Date.now()
        };
        setItems(prev => [...prev, newItem]);
        startPolling(newItem.id);
      }
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item. Make sure the backend is running on port 3000');
    } finally {
      setIsCreating(false);
    }
  };

  // Start polling for a specific item
  const startPolling = (itemId) => {
    // Clear existing interval if any
    if (pollingIntervals.current[itemId]) {
      clearInterval(pollingIntervals.current[itemId]);
    }

    pollingIntervals.current[itemId] = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/items/${itemId}/status`);
        const result = await response.json();

        if (result.success) {
          setItems(prev => prev.map(item => {
            if (item.id === itemId) {
              const updatedItem = {
                ...item,
                status: result.data.status,
                pollCount: item.pollCount + 1,
                timepassed: result.data.timepassed
              };

              // Stop polling if completed
              if (result.data.status === 'Success') {
                clearInterval(pollingIntervals.current[itemId]);
                delete pollingIntervals.current[itemId];
              }

              return updatedItem;
            }
            return item;
          }));
        }
      } catch (error) {
        console.error(`Error polling item ${itemId}:`, error);
      }
    }, POLL_INTERVAL);
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(pollingIntervals.current).forEach(clearInterval);
    };
  }, []);

  return (
    <div className="app">
      <header>
        <h1>🔄 Short Polling Demo</h1>
        <p>This demo shows how short polling works by repeatedly requesting status updates</p>
      </header>

      <div className="controls">
        <button 
          onClick={createItem} 
          disabled={isCreating}
          className="create-btn"
        >
          {isCreating ? 'Creating...' : '➕ Create New Item'}
        </button>
        <div className="info">
          <span>Polling Interval: {POLL_INTERVAL}ms</span>
          <span>Active Items: {items.length}</span>
        </div>
      </div>

      <div className="items-container">
        {isLoading ? (
          <div className="empty-state">
            <div className="spinner"></div>
            <p>Loading existing items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <p>No items yet. Click "Create New Item" to start!</p>
          </div>
        ) : (
          items.map(item => (
            <div 
              key={item.id} 
              className={`item-card ${item.status === 'Success' ? 'completed' : 'creating'}`}
            >
              <div className="item-header">
                <h3>Item #{item.id}</h3>
                <span className={`status-badge ${item.status.toLowerCase()}`}>
                  {item.status === 'creating' ? '⏳' : '✅'} {item.status}
                </span>
              </div>
              
              <div className="item-details">
                <div className="detail-row">
                  <span className="label">Poll Count:</span>
                  <span className="value">{item.pollCount}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Time Elapsed:</span>
                  <span className="value">{item.timepassed || 0}s</span>
                </div>
                <div className="detail-row">
                  <span className="label">Created At:</span>
                  <span className="value">{new Date(item.updatedAt).toLocaleTimeString()}</span>
                </div>
              </div>

              {item.status === 'creating' && (
                <div className="progress-indicator">
                  <div className="spinner"></div>
                  <span>Polling every {POLL_INTERVAL / 1000}s...</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <footer>
        <p>💡 Watch the poll count increase as the frontend checks status every {POLL_INTERVAL / 1000} seconds</p>
      </footer>
    </div>
  )
}

export default App
