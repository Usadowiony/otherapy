import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Quiz from './components/Quiz';
import AdminPanel from './components/AdminPanel';
import TherapistList from './components/TherapistList';
import Login from './components/Login';

function Header() {
  const location = useLocation();

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="header-logo">
          OTherapy
        </Link>
        <nav className="header-nav">
          <Link 
            to="/" 
            className={`header-nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Quiz
          </Link>
          <Link 
            to="/therapists" 
            className={`header-nav-link ${location.pathname === '/therapists' ? 'active' : ''}`}
          >
            Terapeuci
          </Link>
          <Link 
            to="/admin" 
            className={`header-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            Panel Admina
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section">
          <h3 className="footer-section-title">O nas</h3>
          <div className="footer-section-content">
            <p>OTherapy to platforma łącząca pacjentów z najlepszymi terapeutami.</p>
          </div>
        </div>
        <div className="footer-section">
          <h3 className="footer-section-title">Kontakt</h3>
          <div className="footer-section-content">
            <a href="mailto:kontakt@otherapy.pl" className="footer-link">kontakt@otherapy.pl</a>
            <a href="tel:+48123456789" className="footer-link">+48 123 456 789</a>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="footer-bottom">
          <p>&copy; 2024 OTherapy. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <div className="app d-flex flex-column min-vh-100">
        <Header />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Quiz />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/therapists" element={<TherapistList />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
