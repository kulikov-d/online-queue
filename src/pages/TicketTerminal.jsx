import { useState, useEffect } from 'react';

const PROBLEM_TO_PREFIX = {
  'Оплата коммуналки': 'К',
  'Регистрация авто': 'А',
  'Паспортные вопросы': 'П',
  'Льготы и субсидии': 'Л',
  'Справка о доходах': 'Д'
};

function TicketTerminal() {
  const [problem, setProblem] = useState('');
  const [ticketNumber, setTicketNumber] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (ticketNumber) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            setTicketNumber(null);
            setProblem('');
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [ticketNumber]);

  const handleSubmit = () => {
    if (!problem) return;

    const prefix = PROBLEM_TO_PREFIX[problem];
    const counters = JSON.parse(localStorage.getItem('counters') || '{}');
    const currentNumber = counters[prefix] || 1;

    const newTicket = {
      id: Date.now(),
      number: `${prefix}${currentNumber}`,
      problem,
      status: 'waiting',
      timestamp: new Date().toISOString()
    };

    const tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
    tickets.push(newTicket);
    localStorage.setItem('tickets', JSON.stringify(tickets));

    counters[prefix] = currentNumber + 1;
    localStorage.setItem('counters', JSON.stringify(counters));

    setTicketNumber(newTicket.number);
    setCountdown(5);
  };

  const problems = Object.keys(PROBLEM_TO_PREFIX);

  return (
    <div className="terminal-container">
      <h1 className="text-2xl font-bold mb-4">Получить талон</h1>

      {ticketNumber ? (
        <div className="ticket-display">
          <div className="ticket-number">{ticketNumber}</div>
          <p className="text-gray-600 mt-2">Ваша проблема: {problem}</p>
          <p className="countdown-timer mt-4">
            Возврат к выбору услуги через: {countdown} сек
          </p>
        </div>
      ) : (
        <>
          <label className="block mb-2 font-medium">Выберите проблему:</label>
          <select
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          >
            <option value="">-- Выберите --</option>
            {problems.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <button
            onClick={handleSubmit}
            disabled={!problem}
            className="btn btn-secondary"
          >
            Получить талон
          </button>
        </>
      )}
    </div>
  );
}

export default TicketTerminal;