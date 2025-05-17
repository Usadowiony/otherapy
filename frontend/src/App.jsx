import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPanelPage from './pages/AdminPanelPage';

function App() {
  console.log('Rendering App');
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-dashboard" element={<AdminPanelPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App; 