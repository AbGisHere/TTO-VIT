import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canSubmitToTto } from '../utils/access';
import { LogIn, LogOut, FileText, ClipboardList, Lightbulb, PlusCircle } from 'lucide-react';
import { UserRole } from '../types/technologyBrief';

const roleLabel: Record<UserRole, string> = {
  master_admin: 'Master Admin',
  tb_admin: 'TB Admin',
  faculty: 'VIT Faculty',
  vit_student: 'VIT Student',
  outside_user: 'Visitor'
};

const Avatar: React.FC<{ name: string; src?: string }> = ({ name, src }) => {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-9 h-9 rounded-full object-cover ring-2 ring-navy-100"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center font-display font-bold text-sm ring-2 ring-navy-100">
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

export const Navbar: React.FC = () => {
  const { user, signInWithGoogle, logout, isTbAdmin } = useAuth();
  const { pathname } = useLocation();

  const links = [
    { to: '/tb', label: 'Technology Briefs', icon: FileText, show: true },
    { to: '/problem-statements', label: 'Problem Statements', icon: ClipboardList, show: canSubmitToTto(user) },
    { to: '/submit', label: 'Submit an Idea', icon: Lightbulb, show: canSubmitToTto(user) },
    { to: '/upload-tb', label: 'Create Brief', icon: PlusCircle, show: isTbAdmin }
  ].filter(l => l.show);

  const linkClass = (to: string) =>
    `relative flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
      pathname === to ? 'text-navy-700' : 'text-slate-600 hover:text-navy-700'
    }`;

  return (
    <header className="bg-white/90 backdrop-blur border-b border-navy-100 sticky top-0 z-50 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center gap-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src="/assets/branding/ipr_cell_logo.png" alt="IPR & TT Cell, VIT Vellore" className="h-11 w-auto" />
          <span className="hidden sm:block leading-tight border-l border-navy-100 pl-3">
            <span className="block font-display text-[17px] font-extrabold text-navy-700">Technology Transfer Office</span>
            <span className="block text-[11px] tracking-wide text-slate-500">VIT Vellore · IP &amp; Commercialization</span>
          </span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center ml-auto lg:ml-6 h-full">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`${linkClass(l.to)} h-full`}>
              <l.icon className={`w-4 h-4 ${pathname === l.to ? 'text-gold-600' : ''}`} />
              {l.label}
              {pathname === l.to && <span className="absolute left-3 right-3 bottom-0 h-0.5 bg-gold-500 rounded-full" />}
            </Link>
          ))}
        </nav>

        {/* Account */}
        <div className="ml-auto md:ml-0 lg:ml-auto flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <div className="hidden xl:block text-right leading-tight max-w-[14rem]">
                <p className="text-sm font-semibold text-navy-900 truncate">{user.displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
              <span className="hidden sm:inline-block text-[11px] font-semibold tracking-wide text-navy-800 bg-navy-50 border border-navy-100 px-2.5 py-1 rounded-full">
                {roleLabel[user.role]}
              </span>
              <Avatar name={user.displayName} src={user.photoURL} />
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-navy-900 hover:bg-navy-50 rounded-full transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => signInWithGoogle().catch(() => undefined)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-navy-700 hover:bg-navy-800 transition"
            >
              <LogIn className="w-4 h-4 text-gold-400" />
              Sign in
            </button>
          )}
        </div>
      </div>

      {/* Mobile links */}
      <nav className="md:hidden flex overflow-x-auto border-t border-navy-100 px-2">
        {links.map(l => (
          <Link key={l.to} to={l.to} className={linkClass(l.to)}>
            <l.icon className="w-4 h-4" />
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
};
