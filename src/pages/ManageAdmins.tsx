import React, { useEffect, useState } from 'react';
import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { MASTER_ADMINS, TB_ADMINS_COLLECTION, isMasterAdminEmail } from '../utils/admins';

interface TbAdmin {
  email: string;
  addedBy?: string;
  addedAt?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ManageAdmins: React.FC = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<TbAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const snap = await getDocs(collection(db, TB_ADMINS_COLLECTION));
      setAdmins(snap.docs.map(d => ({ email: d.id, ...(d.data() as Omit<TbAdmin, 'email'>) })).sort((a, b) => a.email.localeCompare(b.email)));
    } catch (err: any) {
      setError('Could not load admins: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = email.toLowerCase().trim();
    setError(null);
    if (!EMAIL_RE.test(target)) return setError('Enter a valid email address.');
    if (isMasterAdminEmail(target)) return setError(`${target} is already a master admin.`);
    if (admins.some(a => a.email === target)) return setError(`${target} is already a TB admin.`);

    setBusy(true);
    try {
      await setDoc(doc(db, TB_ADMINS_COLLECTION, target), { addedBy: user?.email ?? '', addedAt: new Date().toISOString() });
      setEmail('');
      await load();
    } catch (err: any) {
      setError('Could not add admin: ' + err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (target: string) => {
    if (!confirm(`Remove TB admin access for ${target}?`)) return;
    setError(null);
    try {
      await deleteDoc(doc(db, TB_ADMINS_COLLECTION, target));
      setAdmins(prev => prev.filter(a => a.email !== target));
    } catch (err: any) {
      setError('Could not remove admin: ' + err.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-navy-900">Manage admins</h1>
      <p className="mt-2 text-slate-600 text-sm">
        TB admins can create and publish technology briefs (<code>/upload-tb</code>). Access applies the next time they
        sign in, and works even if they have never signed in before.
      </p>

      <form onSubmit={add} className="mt-8 flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="name@vit.ac.in"
          className="flex-1 text-sm px-3 py-2.5 border border-slate-300 bg-white focus:outline-navy-700"
        />
        <button
          type="submit"
          disabled={busy || !email.trim()}
          className="inline-flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5"
        >
          <UserPlus className="w-4 h-4 text-gold-400" />
          Add TB admin
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-navy-900">TB admins</h2>
        {loading ? (
          <p className="mt-4 text-sm text-slate-400">Loading…</p>
        ) : admins.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No TB admins yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy-100 border border-navy-100 bg-white">
            {admins.map(a => (
              <li key={a.email} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">{a.email}</p>
                  {a.addedBy && (
                    <p className="text-[11px] text-slate-500 truncate">
                      Added by {a.addedBy}
                      {a.addedAt ? ` · ${new Date(a.addedAt).toLocaleDateString()}` : ''}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => remove(a.email)}
                  title="Remove"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-navy-900">Master admins</h2>
        <p className="mt-1 text-xs text-slate-500">Fixed in code (src/utils/admins.ts and the security rules). Full access, including this page.</p>
        <ul className="mt-4 divide-y divide-navy-100 border border-navy-100 bg-white">
          {MASTER_ADMINS.map(m => (
            <li key={m} className="flex items-center gap-3 px-4 py-3 text-sm text-navy-900">
              <ShieldCheck className="w-4 h-4 text-gold-600" />
              {m}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
