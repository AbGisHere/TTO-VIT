import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { canSubmitToTto } from '../utils/access';
import { problemStatements } from '../data/problemStatements';
import { PageBanner } from '../components/Brand';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import CountUp from '../components/reactbits/CountUp';

const tags = ['All', ...Array.from(new Set(problemStatements.map(p => p.tag))).sort()];

export const ProblemStatements: React.FC = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('All');
  const [open, setOpen] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      problemStatements.filter(
        p => (tag === 'All' || p.tag === tag) && (p.text + p.id).toLowerCase().includes(q.toLowerCase())
      ),
    [q, tag]
  );

  if (loading) return <div className="py-24 text-center text-sm text-slate-400">Loading…</div>;

  if (!canSubmitToTto(user)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center text-slate-600 text-sm leading-relaxed">
        <Lock className="w-10 h-10 text-gold-600 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-navy-900 mb-3">Industry problem statements</h1>
        <p>
          {problemStatements.length} real challenges from industry are open to VIT students and faculty. Sign in
          with an @vitstudent.ac.in or @vit.ac.in account to view them.
        </p>
        {!user ? (
          <button
            onClick={() => signInWithGoogle().catch(() => undefined)}
            className="mt-6 inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold px-5 py-2.5 "
          >
            <LogIn className="w-4 h-4" /> Sign in with Google
          </button>
        ) : (
          <p className="mt-4">You are signed in as {user.email}, which is not a VIT account.</p>
        )}
      </div>
    );
  }

  return (
    <div className="pb-20">
      <PageBanner
        tag="Industry · VIT"
        title="Industry Problem Statements"
        description="Challenges brought to the Technology Transfer Office by companies. Pick one and propose a solution."
        right={
          <div className="text-right">
            <CountUp to={problemStatements.length} className="font-display font-extrabold text-5xl text-black" />
            <p className="text-xs text-black/70">open requests</p>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[16rem]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search problem statements or IDs…"
              className="w-full text-sm pl-9 pr-4 py-2.5  border border-navy-100 bg-white focus:outline-navy-700"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map(t => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={`text-xs font-semibold px-3.5 py-2 rounded-full border transition ${
                  tag === t ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-slate-600 border-navy-100 hover:border-gold-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">{filtered.length} shown</p>

        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => {
            const long = p.text.length > 220;
            const expanded = open === p.sn;
            return (
              <SpotlightCard key={p.sn} theme="light" spotlightColor="rgba(92,225,230,0.35)" className="!rounded-2xl !p-0">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-navy-700 bg-navy-50 border border-navy-100 px-2 py-0.5 rounded">
                      {p.id}
                    </span>
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-gold-600">{p.tag}</span>
                  </div>
                  <p className={`mt-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line flex-1 ${expanded ? '' : 'line-clamp-6'}`}>
                    {p.text}
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    {long ? (
                      <button onClick={() => setOpen(expanded ? null : p.sn)} className="text-xs font-semibold text-slate-500 hover:text-navy-800">
                        {expanded ? 'Show less' : 'Read more'}
                      </button>
                    ) : (
                      <span />
                    )}
                    <Link
                      to={`/submit?ps=${encodeURIComponent(p.id)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-800 hover:text-gold-600"
                    >
                      Propose a solution <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </div>
    </div>
  );
};
