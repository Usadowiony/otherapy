import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minut w ms

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();
  const timerRef = useRef();
  const popupTimeoutRef = useRef();

  // Wylogowanie admina
  const logout = (expired = false) => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setSessionExpired(expired);
    if (expired) {
      setPopupMessage('Sesja administratora wygasła. Za chwilę nastąpi wylogowanie...');
      setShowPopup(true);
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
      popupTimeoutRef.current = setTimeout(() => {
        setShowPopup(false);
        navigate('/login');
      }, 4000);
    } else {
      navigate('/login');
    }
  };

  // Resetuj timer nieaktywności
  const resetInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout(true);
    }, INACTIVITY_LIMIT);
  };

  // Nasłuchuj aktywności użytkownika
  useEffect(() => {
    if (!isAuthenticated) return;
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    const activityHandler = () => resetInactivityTimer();
    events.forEach(event => window.addEventListener(event, activityHandler));
    resetInactivityTimer();
    return () => {
      events.forEach(event => window.removeEventListener(event, activityHandler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated]);

  // Globalna obsługa błędów autoryzacji
  useEffect(() => {
    const handleAuthError = (event) => {
      if (event.key === 'admin_force_logout') {
        logout(true);
      }
    };
    window.addEventListener('storage', handleAuthError);
    return () => window.removeEventListener('storage', handleAuthError);
  }, []);

  // Sprawdzaj token przy każdej zmianie isAuthenticated
  useEffect(() => {
    if (!localStorage.getItem('token') && isAuthenticated) {
      // Token zniknął, a stan mówi że jesteśmy zalogowani
      logout(true);
    }
  }, [isAuthenticated]);

  // Sprawdzaj token w localStorage cyklicznie (np. co 1s)
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (!localStorage.getItem('token')) {
        logout(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Funkcja do wywołania przy błędzie autoryzacji w API
  const handleApiAuthError = () => {
    localStorage.setItem('admin_force_logout', Date.now());
    logout(true);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, logout, handleApiAuthError, sessionExpired }}>
      {showPopup && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:9999,background:'rgba(0,0,0,0.35)'}} className="flex items-center justify-center">
          <div className="bg-white border border-yellow-500 text-yellow-900 px-8 py-8 rounded shadow-xl text-center max-w-sm w-full">
            <div className="text-lg font-semibold mb-2">{popupMessage}</div>
            <div className="text-sm text-gray-500">Nastąpi przekierowanie do logowania...</div>
          </div>
        </div>
      )}
      {!showPopup && children}
    </AdminAuthContext.Provider>
  );
};
