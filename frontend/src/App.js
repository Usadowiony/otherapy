import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Quiz from './components/Quiz';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Publiczne ścieżki */}
        <Route path="/" element={<Quiz />} />
        
        {/* Ścieżki admina */}
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin/*" 
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

// Komponent do zabezpieczenia ścieżek admina
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default App;
