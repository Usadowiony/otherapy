import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminToken } from '../../services/authService';

const AdminAuthContext = createContext();
export const useAdminAuth = () => useContext(AdminAuthContext);
const INACTIVITY_LIMIT = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
const REFRESH_DEBOUNCE = 2 * 60 * 1000; // 2 minuty

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();
  const timerRef = useRef();
  const popupTimeoutRef = useRef();
  const refreshTimeoutRef = useRef();
  const lastRefreshRef = useRef(0);

  const logout = useCallback((expired = false) => {
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
  }, [navigate]);

  const resetInactivityTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout(true);
    }, INACTIVITY_LIMIT);
  }, [logout]);

  // Jeden nasłuch na aktywność użytkownika: resetuje timer i debounced refresh token
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleActivity = () => {
      resetInactivityTimer();
      const now = Date.now();
      if (now - lastRefreshRef.current > REFRESH_DEBOUNCE) {
        lastRefreshRef.current = now;
        checkAdminToken('refresh').catch(() => logout(true));
      }
    };
    ACTIVITY_EVENTS.forEach(event => window.addEventListener(event, handleActivity));
    resetInactivityTimer();
    return () => {
      ACTIVITY_EVENTS.forEach(event => window.removeEventListener(event, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, resetInactivityTimer, logout]);

  // Synchronizacja wylogowania między zakładkami
  useEffect(() => {
    const handleAuthError = (event) => {
      if (event.key === 'admin_force_logout') {
        logout(true);
      }
    };
    window.addEventListener('storage', handleAuthError);
    return () => window.removeEventListener('storage', handleAuthError);
  }, [logout]);

  // Wyloguj jeśli token zniknie z localStorage
  useEffect(() => {
    if (!localStorage.getItem('token') && isAuthenticated) {
      logout(true);
    }
  }, [isAuthenticated, logout]);

  // Cykliczne sprawdzanie ważności tokenu (można wydłużyć interwał)
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(async () => {
      try {
        await checkAdminToken();
      } catch (err) {
        logout(true);
      }
    }, 5 * 60 * 1000); // co 5 minut
    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

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
