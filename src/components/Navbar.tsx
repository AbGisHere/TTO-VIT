import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  PlusCircle,
  LogIn,
  LogOut,
  ShieldCheck,
  UserCheck,
  Building2,
  Sparkles
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, signInWithGoogle, logout, isTbAdmin } = useAuth();
  const location = useLocation();

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'master_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3 h-3 text-purple-600" /> Master Admin
          </span>
        );
      case 'tb_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Sparkles className="w-3 h-3 text-blue-600" /> TB Admin
          </span>
        );
      case 'faculty':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Building2 className="w-3 h-3 text-emerald-600" /> VIT Faculty
          </span>
        );
      case 'vit_student':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">
            <UserCheck className="w-3 h-3 text-cyan-600" /> VIT Student
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Outside User
          </span>
        );
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Brand */}
          <div className="flex items-center gap-8">
            <Link to="/tb" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-sm group-hover:bg-blue-700 transition">
                TTO
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 block leading-tight">
                  Technology Transfer Office
                </span>
                <span className="text-xs text-slate-500 block">
                  VIT Vellore • IP & Commercialization
                </span>
              </div>
            </Link>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/tb"
                className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                  location.pathname === '/tb' || location.pathname === '/'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4" />
                Technology Briefs
              </Link>

              {isTbAdmin && (
                <Link
                  to="/upload-tb"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                    location.pathname === '/upload-tb'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-blue-600" />
                  Create Brief
                </Link>
              )}
            </div>
          </div>

          {/* Right User Auth Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {getRoleBadge()}

                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 leading-none">
                    {user.displayName}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {user.email}
                  </p>
                </div>

                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition shadow-2xs"
              >
                <LogIn className="w-4 h-4 text-blue-600" />
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
