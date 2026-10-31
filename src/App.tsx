import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { LogIn, Lock } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { TechBriefCatalog } from './pages/TechBriefCatalog';
import { Landing } from './pages/Landing';
import { ProblemStatements } from './pages/ProblemStatements';
import { Submit } from './pages/Submit';
import { TechBriefBuilder } from './pages/TechBriefBuilder';
import { ManageAdmins } from './pages/ManageAdmins';

// UI gate only; Firestore and Storage rules are what actually enforce access.
const RequireRole: React.FC<{ allow: 'tb_admin' | 'master_admin'; children: React.ReactElement }> = ({ allow, children }) => {
  const { user, loading, isTbAdmin, isMasterAdmin, signInWithGoogle } = useAuth();
  if (loading) return <div className="py-24 text-center text-sm text-slate-400">Loading…</div>;

  if (!user) {
    return (
      <Gate icon={LogIn} title="Sign in required">
        This area is for TTO administrators. Sign in with your Google account to continue.
        <button
          onClick={() => signInWithGoogle().catch(() => undefined)}
          className="mt-6 inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-5 py-2.5"
        >
          Sign in with Google
        </button>
      </Gate>
    );
  }

  const ok = allow === 'master_admin' ? isMasterAdmin : isTbAdmin;
  if (ok) return children;

  return (
    <Gate icon={Lock} title="Admins only">
      You are signed in as {user.email}, which doesn't have access to this page. Ask a master admin to add you, or{' '}
      <Link to="/tb" className="underline text-navy-700">browse technology briefs</Link>.
    </Gate>
  );
};

const Gate: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <div className="max-w-xl mx-auto px-4 py-24 text-center text-slate-600 text-sm leading-relaxed">
    <Icon className="w-10 h-10 text-gold-600 mx-auto mb-4" />
    <h1 className="font-display text-2xl font-bold text-navy-900 mb-3">{title}</h1>
    {children}
  </div>
);

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
              <Route path="/upload-tb" element={<RequireRole allow="tb_admin"><TechBriefBuilder /></RequireRole>} />
              <Route path="/admins" element={<RequireRole allow="master_admin"><ManageAdmins /></RequireRole>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
