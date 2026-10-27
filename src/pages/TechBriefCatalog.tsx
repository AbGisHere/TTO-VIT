import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { TechnologyBriefData } from '../types/technologyBrief';
import { sampleBriefData } from '../data/sampleBrief';
import { TechBriefSheet } from '../components/TechBriefSheet';
import { exportBriefToPdf } from '../utils/pdfExport';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit3,
  PlusCircle,
  FileText,
  Sparkles,
  ExternalLink,
  X,
  Layers,
  Award
} from 'lucide-react';

export const TechBriefCatalog: React.FC = () => {
  const { isTbAdmin } = useAuth();
  const [briefs, setBriefs] = useState<TechnologyBriefData[]>([sampleBriefData]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedBriefForModal, setSelectedBriefForModal] = useState<TechnologyBriefData | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    const fetchBriefs = async () => {
      try {
        const q = query(collection(db, 'technology_briefs'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const list: TechnologyBriefData[] = snap.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as TechnologyBriefData)
          }));
          setBriefs(list);
        } else {
          // If no remote briefs yet, display initial sample
          setBriefs([sampleBriefData]);
        }
      } catch (err) {
        console.warn("Firestore fetch error, using local template:", err);
        setBriefs([sampleBriefData]);
      } finally {
        setLoading(false);
      }
    };

    fetchBriefs();
  }, []);

  // Filtered items
  const filteredBriefs = briefs.filter(b => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.techId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.leadInventor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDomain =
      selectedDomain === 'all' ||
      b.domains.some(d => d.toLowerCase().includes(selectedDomain.toLowerCase()));

    return matchesSearch && matchesDomain;
  });

  const handleDownload = async (brief: TechnologyBriefData) => {
    setSelectedBriefForModal(brief);
    setTimeout(async () => {
      try {
        setIsExporting(true);
        await exportBriefToPdf(brief.techId, brief.title);
      } catch (e: any) {
        alert("Error exporting PDF: " + e.message);
      } finally {
        setIsExporting(false);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                VIT Technology Transfer Office
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Available Technologies for Licensing
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                Explore commercial-ready innovations, patents, and technical briefs developed by VIT researchers and inventors.
              </p>
            </div>

            {isTbAdmin && (
              <Link
                to="/upload-tb"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-xs transition shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                Create Technology Brief
              </Link>
            )}
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by technology title, ID (e.g. 2024VITTTO73), or inventor name..."
                className="w-full text-sm pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-blue-500 shadow-2xs"
              />
            </div>

            <div className="md:col-span-4 relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <select
                value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}
                className="w-full text-sm pl-9 pr-8 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-blue-500 shadow-2xs appearance-none"
              >
                <option value="all">All Domains & Disciplines</option>
                <option value="Biotechnology">Biotechnology & Food</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Engineering">Engineering & Hardware</option>
                <option value="AI">AI & Computing</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            Loading technology briefs...
          </div>
        ) : filteredBriefs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No technology briefs found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBriefs.map(brief => (
              <div
                key={brief.techId}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
              >
                {/* Card Header Top */}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {brief.techId}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Award className="w-3 h-3 text-emerald-600" />
                      TRL {brief.trlLevel}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2">
                    {brief.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2">
                    <span className="font-semibold text-slate-700">Lead Inventor:</span> {brief.leadInventor}
                  </p>

                  {/* Domain Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {brief.domains?.slice(0, 3).map((d, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedBriefForModal(brief)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview Sheet
                  </button>

                  <div className="flex items-center gap-2">
                    {isTbAdmin && (
                      <Link
                        to="/upload-tb"
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition"
                        title="Edit in Brief Builder"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    <button
                      onClick={() => handleDownload(brief)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white border border-slate-200 hover:border-blue-200 px-2.5 py-1 rounded shadow-2xs transition"
                    >
                      <Download className="w-3 h-3" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for 1:1 Canva Sheet Preview */}
      {selectedBriefForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-100 rounded-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {selectedBriefForModal.techId} — {selectedBriefForModal.title}
                </h3>
                <span className="text-xs text-slate-500">Official Technology Brief Format</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => exportBriefToPdf(selectedBriefForModal.techId, selectedBriefForModal.title)}
                  disabled={isExporting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isExporting ? 'Generating...' : 'Download PDF'}
                </button>

                <button
                  onClick={() => setSelectedBriefForModal(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with Sheet */}
            <div className="p-6 overflow-y-auto flex justify-center bg-slate-200">
              <TechBriefSheet data={selectedBriefForModal} scale={0.7} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
