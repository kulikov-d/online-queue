import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function OperatorWindow() {
  const { windowId } = useParams();
  const [queue, setQueue] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);

  useEffect(() => {
    const loadQueue = () => {
      const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
      setQueue(tickets);
      
      // Проверяем, не обслуживается ли уже клиент этим окном
      const currentTicket = tickets.find(
        t => t.status === 'called' && t.windowId === windowId
      );
      setActiveTicket(currentTicket || null);
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
    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    
    // Удаляем все предыдущие вызовы этого окна
    const activeTickets = tickets.filter(ticket => 
      !(ticket.status === 'called' && ticket.windowId === windowId)
    );
    
    const nextTicket = activeTickets.find(t => t.status === 'waiting');
    
    if (nextTicket) {
      // Меняем статус и добавляем номер окна
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
      
      localStorage.setItem('tickets', JSON.stringify(updatedTickets));
      setQueue(updatedTickets);
      setActiveTicket(nextTicket);
    }
  };

  const handleFinishService = () => {
    if (!activeTicket) return;

    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    const remainingTickets = tickets.filter(t => t.id !== activeTicket.id);
    
    localStorage.setItem('tickets', JSON.stringify(remainingTickets));
    setQueue(remainingTickets);
    setActiveTicket(null);
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
              className="btn btn-success mt-4 w-full"
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
        className="btn btn-primary mt-4 w-full"
        disabled={!!activeTicket}
      >
        Вызвать следующего
      </button>
    </div>
  );
}

export default OperatorWindow;