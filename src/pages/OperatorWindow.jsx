import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function OperatorWindow() {
  const { windowId } = useParams();
  const [queue, setQueue] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);

  useEffect(() => {
    const loadQueue = () => {
      try {
        const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
        setQueue(tickets);
        
        // Проверяем, не обслуживается ли клиент этим окном
        const currentTicket = tickets.find(
          t => t.status === 'called' && t.windowId === windowId
        );
        setActiveTicket(currentTicket || null);
      } catch (error) {
        console.error('Ошибка загрузки очереди:', error);
      }
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
  }, [windowId]);

  const handleCallNext = () => {
    try {
      const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      
      // Удаляем предыдущие вызовы этого окна
      const activeTickets = tickets.filter(ticket => 
        !(ticket.status === 'called' && ticket.windowId === windowId)
      );
      
      // Находим следующего клиента в очереди
      const nextTicket = activeTickets.find(t => t.status === 'waiting');
      
      if (nextTicket) {
        // Обновляем статус талона
        const updatedTickets = activeTickets.map(t => 
          t.id === nextTicket.id 
            ? { 
                ...t, 
                status: 'called', 
                windowId: windowId,
                calledAt: Date.now() 
              } 
            : t
        );
        
        // Сохраняем обновленную очередь
        localStorage.setItem('tickets', JSON.stringify(updatedTickets));
        setQueue(updatedTickets);
        setActiveTicket(nextTicket);
      }
    } catch (error) {
      console.error('Ошибка вызова клиента:', error);
    }
  };

  const handleFinishService = () => {
    if (!activeTicket) return;

    try {
      const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      const remainingTickets = tickets.filter(t => t.id !== activeTicket.id);
      
      localStorage.setItem('tickets', JSON.stringify(remainingTickets));
      setQueue(remainingTickets);
      setActiveTicket(null);
    } catch (error) {
      console.error('Ошибка завершения обслуживания:', error);
    }
  };

  return (
    <div className="operator-window">
      <h2 className="text-xl font-bold mb-4">Окно оператора #{windowId}</h2>
      
      <div className="window-status-indicator mb-4">
        <div className={`status-circle ${activeTicket ? 'active' : ''}`}></div>
        <span className="status-text">
          {activeTicket ? 'Сейчас обслуживает' : 'Ожидание клиента'}
        </span>
      </div>
      
      <div className="window-content">
        {activeTicket ? (
          <div className="current-ticket">
            <div className="ticket-number-large">{activeTicket.number}</div>
            <p className="text-sm mt-2 text-gray-600">
              {activeTicket.problem}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Вызвано: {new Date(activeTicket.calledAt).toLocaleTimeString()}
            </p>
            
            <button
              onClick={handleFinishService}
              className="btn btn-success mt-4"
            >
              Завершить обслуживание
            </button>
          </div>
        ) : (
          <p className="text-gray-500">Ожидание клиента</p>
        )}
      </div>
      
      <button
        onClick={handleCallNext}
        className="btn btn-primary mt-4"
        disabled={!!activeTicket}
      >
        Вызвать следующего
      </button>
    </div>
  );
}

export default OperatorWindow;