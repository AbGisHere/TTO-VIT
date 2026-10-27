import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { TechBriefCatalog } from './pages/TechBriefCatalog';
import { Landing } from './pages/Landing';
import { ProblemStatements } from './pages/ProblemStatements';
import { Submit } from './pages/Submit';
import { TechBriefBuilder } from './pages/TechBriefBuilder';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/problem-statements" element={<ProblemStatements />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/tb" element={<TechBriefCatalog />} />
              <Route path="/upload-tb" element={<TechBriefBuilder />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
