import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPanelPage from './pages/AdminPanelPage';
import { AdminAuthProvider } from './components/admin/AdminAuthProvider';
import NotFound from './pages/NotFound';

function App() {
  console.log('Rendering App');
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-dashboard" element={
            <AdminAuthProvider>
              <AdminPanelPage />
            </AdminAuthProvider>
          } />
        </Routes>
        <Routes>
          {/* Fallback route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;