import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { TechnologyBriefData } from '../types/technologyBrief';
import { sampleBriefData } from '../data/sampleBrief';
import { TechBriefSheet } from '../components/TechBriefSheet';
import { exportBriefToPdf } from '../utils/pdfExport';
import { useAuth } from '../context/AuthContext';
import { PageBanner } from '../components/Brand';
import SpotlightCard from '../components/reactbits/SpotlightCard';
import CountUp from '../components/reactbits/CountUp';
import { Search, Download, Eye, Edit3, PlusCircle, FileText, X, Lock, LogIn, ArrowRight } from 'lucide-react';

/** Public description shown without signing in: explicit summary, else the first text block of the brief. */
const publicSummary = (b: TechnologyBriefData): string => {
  if (b.summary) return b.summary;
  const text = b.sections.flatMap(sec => sec.blocks).find(bl => bl.content)?.content?.replace(/<[^>]+>/g, '') ?? '';
  return text.length > 220 ? text.slice(0, 220).trimEnd() + '…' : text;
};

const TrlMeter: React.FC<{ level: number }> = ({ level }) => (
  <div>
    <div className="flex items-center justify-between text-[10px] font-semibold tracking-wider uppercase text-slate-500 mb-1.5">
      <span>Technology readiness</span>
      <span className="text-navy-800">TRL {level} / 9</span>
    </div>
    <div className="flex gap-1">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`h-1.5 flex-1  ${i < level ? 'bg-gold-400' : 'bg-navy-100'}`} />
      ))}
    </div>
  </div>
);

export const TechBriefCatalog: React.FC = () => {
  const { user, isTbAdmin, signInWithGoogle } = useAuth();
  const signedIn = !!user;
  const [briefs, setBriefs] = useState<TechnologyBriefData[]>([sampleBriefData]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedBriefForModal, setSelectedBriefForModal] = useState<TechnologyBriefData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchBriefs = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'technology_briefs'), orderBy('createdAt', 'desc')));
        setBriefs(
          snap.empty ? [sampleBriefData] : snap.docs.map(d => ({ id: d.id, ...(d.data() as TechnologyBriefData) }))
        );
      } catch (err) {
        console.warn('Firestore fetch error, using local template:', err);
        setBriefs([sampleBriefData]);
      } finally {
        setLoading(false);
      }
    };
    fetchBriefs();
  }, []);

  const domains = useMemo(
    () => ['All', ...Array.from(new Set(briefs.flatMap(b => b.domains ?? []))).sort()],
    [briefs]
  );

  const filteredBriefs = briefs.filter(b => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      b.title.toLowerCase().includes(s) ||
      publicSummary(b).toLowerCase().includes(s) ||
      (signedIn && (b.techId.toLowerCase().includes(s) || b.leadInventor.toLowerCase().includes(s)));
    const matchesDomain = selectedDomain === 'All' || (b.domains ?? []).includes(selectedDomain);
    return matchesSearch && matchesDomain;
  });

  const handleDownload = (brief: TechnologyBriefData) => {
    setSelectedBriefForModal(brief);
    setTimeout(async () => {
      try {
        setIsExporting(true);
        await exportBriefToPdf(brief.techId, brief.title);
      } catch (e: any) {
        alert('Error exporting PDF: ' + e.message);
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  return (
    <div className="pb-24">
      <PageBanner
        tag="Available for licensing"
        title="Technology Briefs"
        description={'Patented and patent-pending innovations from VIT researchers, packaged for industry partners.' + (!signedIn ? ' Sign in to read each brief in full.' : '')}
        right={
          <div className="flex items-end gap-6">
            {signedIn && isTbAdmin && (
              <Link to="/upload-tb" className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold text-sm px-5 py-2.5 rounded-full transition">
                <PlusCircle className="w-4 h-4" /> Create brief
              </Link>
            )}
            <div className="text-right">
              <CountUp to={briefs.length} className="font-display font-extrabold text-5xl text-black" />
              <p className="text-xs text-black/70">{briefs.length === 1 ? 'technology' : 'technologies'}</p>
            </div>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="relative max-w-xl">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={signedIn ? 'Search by title, ID or inventor' : 'Search technologies'}
            className="w-full text-sm pl-10 pr-4 py-2.5 rounded-full border border-navy-100 bg-white focus:outline-none focus:border-navy-700"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Domain filters */}
        {domains.length > 2 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {domains.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDomain(d)}
                className={`text-xs font-semibold px-3.5 py-2 rounded-full border transition ${
                  selectedDomain === d
                    ? 'bg-navy-900 text-white border-navy-900'
                    : 'bg-white text-slate-600 border-navy-100 hover:border-gold-400'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {/* Sign-in banner */}
        {!signedIn && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 bg-navy-50 border border-navy-100  px-6 py-4">
            <p className="text-sm text-navy-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gold-600" />
              You are viewing public summaries. Sign in for inventors, readiness levels, the full brief and PDF download.
            </p>
            <button
              onClick={() => signInWithGoogle().catch(() => undefined)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 px-4 py-2 rounded-full  transition"
            >
              <LogIn className="w-4 h-4 text-gold-400" /> Sign in
            </button>
          </div>
        )}

        {/* Cards */}
        <div className="mt-8">
          {loading ? (
            <div className="text-center py-20 text-slate-400 text-sm">Loading technology briefs…</div>
          ) : filteredBriefs.length === 0 ? (
            <div className="text-center py-20 bg-white  border border-navy-100">
              <FileText className="w-10 h-10 text-navy-200 mx-auto mb-3" />
              <h3 className="font-display text-lg font-semibold text-navy-900">No technology briefs found</h3>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBriefs.map(brief => (
                <SpotlightCard key={brief.techId} theme="light" spotlightColor="rgba(92,225,230,0.35)" className="!rounded-2xl !p-0 h-full">
                  <div className="flex flex-col h-full">
                    <div className="px-6 pt-6 flex items-center justify-between gap-2">
                      <div className="h-1 w-12 bg-gold-400 rounded-full" />
                      {signedIn && (
                        <span className="font-mono text-[11px] font-semibold text-navy-700 bg-navy-50 border border-navy-100 px-2 py-0.5 rounded">
                          {brief.techId}
                        </span>
                      )}
                    </div>
                    <div className="px-6 pt-4 pb-6 flex-1">

                      <h3 className="mt-5 font-display font-bold text-xl text-navy-900 leading-snug">{brief.title}</h3>

                      {signedIn ? (
                        <>
                          <p className="mt-3 text-sm text-slate-600">
                            <span className="text-slate-400">Lead inventor</span>{' '}
                            <span className="font-medium text-navy-800">{brief.leadInventor}</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {brief.domains?.slice(0, 3).map(d => (
                              <span key={d} className="text-[11px] font-medium bg-navy-50 text-navy-700 px-2.5 py-1 ">
                                {d}
                              </span>
                            ))}
                          </div>
                          <div className="mt-5">
                            <TrlMeter level={brief.trlLevel} />
                          </div>
                        </>
                      ) : (
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-5">{publicSummary(brief)}</p>
                      )}
                    </div>

                    <div className="px-6 py-4 border-t border-navy-100 flex items-center justify-between gap-2">
                      {signedIn ? (
                        <>
                          <button
                            onClick={() => setSelectedBriefForModal(brief)}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-gold-600 transition"
                          >
                            <Eye className="w-4 h-4" /> View brief
                          </button>
                          <div className="flex items-center gap-1">
                            {isTbAdmin && (
                              <Link to="/upload-tb" className="p-2 text-slate-400 hover:text-navy-900  transition" title="Edit in Brief Builder">
                                <Edit3 className="w-4 h-4" />
                              </Link>
                            )}
                            <button
                              onClick={() => handleDownload(brief)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy-800 border border-navy-100 hover:border-gold-400 px-3 py-1.5 rounded-full  transition"
                            >
                              <Download className="w-3.5 h-3.5" /> PDF
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          onClick={() => signInWithGoogle().catch(() => undefined)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-800 hover:text-gold-600 transition"
                        >
                          <Lock className="w-4 h-4" /> Sign in for full details <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full brief modal */}
      {signedIn && selectedBriefForModal && (
        <div className="fixed inset-0 z-[60] bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white  max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-navy-100 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[11px] text-gold-600 font-semibold">{selectedBriefForModal.techId}</p>
                <h3 className="font-display font-semibold text-lg text-navy-900 truncate">{selectedBriefForModal.title}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => exportBriefToPdf(selectedBriefForModal.techId, selectedBriefForModal.title)}
                  disabled={isExporting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 disabled:opacity-60  transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isExporting ? 'Generating…' : 'Download PDF'}
                </button>
                <button
                  onClick={() => setSelectedBriefForModal(null)}
                  className="p-2 text-slate-400 hover:text-navy-900 hover:bg-navy-50 "
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex justify-center bg-navy-50">
              <TechBriefSheet data={selectedBriefForModal} scale={0.7} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
