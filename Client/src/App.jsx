import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Catalog from './pages/Catalog';
import Members from './pages/Members';
import Reports from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
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