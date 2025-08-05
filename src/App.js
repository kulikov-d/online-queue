import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import './App.css';
import TicketTerminal from './pages/TicketTerminal';
import QueueBoard from './pages/QueueBoard';
import OperatorWindow from './pages/OperatorWindow';

// Обёртка для передачи номера окна
function OperatorWrapper() {
  const { windowId } = useParams();
  return <OperatorWindow windowId={windowId} />;
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<TicketTerminal />} />
          <Route path="/queue" element={<QueueBoard />} />
          <Route path="/operator/:windowId" element={<OperatorWrapper />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;