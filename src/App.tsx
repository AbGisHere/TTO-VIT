import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { TechBriefCatalog } from './pages/TechBriefCatalog';
import { TechBriefBuilder } from './pages/TechBriefBuilder';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/tb" replace />} />
              <Route path="/tb" element={<TechBriefCatalog />} />
              <Route path="/upload-tb" element={<TechBriefBuilder />} />
              <Route path="*" element={<Navigate to="/tb" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
