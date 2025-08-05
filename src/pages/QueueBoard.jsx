import { useState, useEffect } from 'react';

function QueueBoard() {
  const [queue, setQueue] = useState([]);
  const [activeWindows, setActiveWindows] = useState({});

  useEffect(() => {
    const loadQueue = () => {
      const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      setQueue(tickets);
      
      // Определяем активные окна
      const windows = {};
      tickets.forEach(ticket => {
        if (ticket.status === 'called' && ticket.windowId) {
          windows[ticket.windowId] = true;
        }
      });
      setActiveWindows(windows);
    };

    loadQueue();

    const handleStorageChange = (event) => {
      if (event.key === 'tickets') {
        loadQueue();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="board-container">
      <h2 className="text-2xl font-bold text-center mb-6">Текущая очередь</h2>
      
      {/* Статус окон */}
      <div className="window-status mb-6">
        <div className="window-grid">
          {[1, 2, 3, 4].map(windowId => (
            <div 
              key={windowId} 
              className={`window-status-card ${activeWindows[windowId] ? 'active' : ''}`}
            >
              <div className="window-number">Окно {windowId}</div>
              <div className="window-status-text">
                {activeWindows[windowId] ? 'Занято' : 'Свободно'}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Очередь */}
      <div className="queue-list">
        {queue
          .filter(ticket => ticket.status === 'waiting')
          .map((ticket, index) => (
            <div key={ticket.id} className="queue-item">
              <div className="flex justify-between items-start">
                <div>
                  <span className="queue-number">{ticket.number}</span>
                  <p className="text-gray-600 mt-1">{ticket.problem}</p>
                </div>
                <span className="status-badge status-waiting">В ожидании</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(ticket.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
          
        {/* Вызванные клиенты */}
        {queue
          .filter(ticket => ticket.status === 'called')
          .map((ticket, index) => (
            <div key={ticket.id} className="queue-item called-item">
              <div className="flex justify-between items-start">
                <div>
                  <span className="queue-number">{ticket.number}</span>
                  <p className="text-gray-600 mt-1">{ticket.problem}</p>
                  <p className="window-call mt-1">
                    Подойдите к окну {ticket.windowId}
                  </p>
                </div>
                <span className="status-badge status-called">Вызван</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(ticket.calledAt).toLocaleTimeString()}
              </p>
            </div>
          ))}
          
        {queue.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Очередь пуста
          </div>
        )}
      </div>
    </div>
  );
}

export default QueueBoard;