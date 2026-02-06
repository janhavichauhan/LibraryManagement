import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Catalog from './pages/Catalog';
import Members from './pages/Members';
import Reports from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1e293b',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="flex bg-background min-h-screen font-sans">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/members" element={<Members />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;