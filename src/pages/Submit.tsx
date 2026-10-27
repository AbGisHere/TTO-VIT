import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { LogIn, Lock, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { canSubmitToTto } from '../utils/access';
import { Submission } from '../types/technologyBrief';
import { problemStatements } from '../data/problemStatements';

const field = 'w-full text-sm px-3 py-2.5  border border-slate-300 bg-white focus:outline-navy-700';

export const Submit: React.FC = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ title: '', domain: '', problemStatementId: params.get('ps') ?? '', description: '' });
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  if (loading) return <div className="py-24 text-center text-sm text-slate-400">Loading…</div>;

  if (!user) {
    return (
      <Notice icon={LogIn} title="Sign in to submit">
        Submitting ideas and responding to industry problem statements is open to VIT students and faculty.
        <button
          onClick={() => signInWithGoogle().catch(() => undefined)}
          className="mt-6 inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-semibold px-5 py-2.5 "
        >
          Sign in with Google
        </button>
      </Notice>
    );
  }

  if (!canSubmitToTto(user)) {
    return (
      <Notice icon={Lock} title="Restricted to VIT accounts">
        You are signed in as {user.email}. Only @vitstudent.ac.in and @vit.ac.in accounts can submit ideas. You
        can still{' '}
        <Link to="/tb" className="underline text-navy-700">
          browse technology briefs
        </Link>
        .
      </Notice>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      const entry: Submission = {
        kind: 'idea',
        title: form.title.trim(),
        domain: form.domain.trim(),
        description: form.description.trim(),
        ...(form.problemStatementId ? { problemStatementId: form.problemStatementId } : {}),
        submittedByUid: user.uid,
        submittedByEmail: user.email,
        submittedByName: user.displayName,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'submissions'), entry);
      setForm({ title: '', domain: '', problemStatementId: '', description: '' });
      setStatus('done');
    } catch (err) {
      console.error('Submission failed:', err);
      setStatus('error');
    }
  };

  const set = (k: 'title' | 'domain' | 'description') => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setStatus('idle');
    setForm({ ...form, [k]: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-navy-900">Submit an idea</h1>
      <p className="mt-2 text-slate-600 text-sm">Signed in as {user.email}.</p>

      <form onSubmit={submit} className="mt-8 space-y-5 bg-white border border-slate-200  p-6">
        <Label text="Responding to an industry problem statement (optional)">
          <select
            value={form.problemStatementId}
            onChange={e => setForm({ ...form, problemStatementId: e.target.value })}
            className={field}
          >
            <option value="">None: this is an independent idea</option>
            {problemStatements.map(p => (
              <option key={p.sn} value={p.id}>
                {p.id}: {p.text.replace(/\s+/g, ' ').slice(0, 70)}
              </option>
            ))}
          </select>
        </Label>
        <Label text="Title">
          <input required value={form.title} onChange={set('title')} className={field} />
        </Label>
        <Label text="Domain / discipline">
          <input required value={form.domain} onChange={set('domain')} placeholder="e.g. Energy, Biotechnology, AI" className={field} />
        </Label>
        <Label text="Describe your idea or proposed solution">
          <textarea required rows={7} value={form.description} onChange={set('description')} className={field} />
        </Label>

        <div className="flex items-center gap-4">
          <button
            disabled={status === 'saving'}
            className="bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 "
          >
            {status === 'saving' ? 'Submitting…' : 'Submit'}
          </button>
          {status === 'done' && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4" /> Received. The office will be in touch.
            </span>
          )}
          {status === 'error' && <span className="text-sm text-red-600">Could not submit. Please try again.</span>}
        </div>
      </form>
    </div>
  );
};

const Label: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <label className="block">
    <span className="block text-sm font-medium text-slate-700 mb-1.5">{text}</span>
    {children}
  </label>
);

const Notice: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <div className="max-w-xl mx-auto px-4 py-24 text-center text-slate-600 text-sm leading-relaxed">
    <Icon className="w-10 h-10 text-gold-600 mx-auto mb-4" />
    <h1 className="font-display text-2xl font-bold text-navy-900 mb-3">{title}</h1>
    {children}
  </div>
);
