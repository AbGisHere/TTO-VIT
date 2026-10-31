import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase/config';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { TechnologyBriefData, BriefSection, ContentBlock, BriefWatermark } from '../types/technologyBrief';
import { defaultEmptyBriefData } from '../data/defaultBrief';
import { sampleBriefData } from '../data/sampleBrief';
import { TechBriefSheet } from '../components/TechBriefSheet';
import { exportBriefToPdf, printBrief } from '../utils/pdfExport';
import {
  Download,
  Printer,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  List,
  AlignLeft,
  Columns,
  Palette,
  RotateCcw,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  Layers,
  FileCode2,
  Stamp
} from 'lucide-react';

const WATERMARK_PRESETS = ['License\nTerminated', 'Termination\nNotice Issued', 'Licensed', 'Under\nNegotiation', 'Draft'];

const SWATCHES = ['#000000', '#ff3131', '#1d4ed8', '#047857', '#7c3aed', '#c2410c', '#64748b'];

// Shared formatting toolbar for bullet items and text blocks. Commands act on the current
// selection inside `editorRef`; the last selection is saved so the colour picker (which
// steals focus) can still apply to it.
const FormatToolbar: React.FC<{
  editorRef: React.RefObject<HTMLDivElement>;
  onChange: (html: string) => void;
}> = ({ editorRef, onChange }) => {
  const savedRange = useRef<Range | null>(null);
  const [customColor, setCustomColor] = useState('#ff3131');

  useEffect(() => {
    const save = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount && editorRef.current?.contains(sel.anchorNode)) {
        savedRange.current = sel.getRangeAt(0).cloneRange();
      }
    };
    document.addEventListener('selectionchange', save);
    return () => document.removeEventListener('selectionchange', save);
  }, [editorRef]);

  const run = (...commands: [string, string?][]) => {
    const editor = editorRef.current;
    if (!editor) return;
    const sel = window.getSelection();
    if (savedRange.current && sel && !editor.contains(sel.anchorNode)) {
      editor.focus();
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
    commands.forEach(([cmd, value]) => document.execCommand(cmd, false, value));
    onChange(editor.innerHTML);
  };

  const btn = 'px-2 py-0.5 rounded hover:bg-slate-100 border border-slate-300 text-slate-800';
  const keep = (fn: () => void) => (e: React.MouseEvent) => { e.preventDefault(); fn(); };

  return (
    <div className="flex flex-wrap items-center gap-1.5 pb-1 border-b border-slate-100 text-xs">
      <button
        type="button"
        onMouseDown={keep(() => run(['bold'], ['foreColor', '#ff3131']))}
        className="px-2.5 py-0.5 rounded font-extrabold bg-red-50 hover:bg-red-100 border border-red-300 text-[#ff3131] flex items-center gap-1 shadow-2xs transition"
        title="Turn selected word(s) into Canva Bold Red Highlight"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff3131]" /> Bold Red
      </button>
      <button type="button" onMouseDown={keep(() => run(['bold']))} className={`${btn} font-bold`} title="Bold">
        B
      </button>
      <button type="button" onMouseDown={keep(() => run(['italic']))} className={`${btn} italic font-serif`} title="Italic">
        I
      </button>
      <button type="button" onMouseDown={keep(() => run(['underline']))} className={`${btn} underline`} title="Underline">
        U
      </button>

      <span className="w-px h-4 bg-slate-200 mx-0.5" />

      {SWATCHES.map(c => (
        <button
          key={c}
          type="button"
          onMouseDown={keep(() => run(['foreColor', c]))}
          className="w-4 h-4 rounded-full border border-slate-300 hover:scale-110 transition"
          style={{ backgroundColor: c }}
          title={`Colour ${c}`}
        />
      ))}
      <label className="relative flex items-center gap-1 px-1.5 py-0.5 rounded border border-slate-300 hover:bg-slate-100 cursor-pointer" title="Pick any colour">
        <Palette className="w-3 h-3 text-slate-500" />
        <span className="w-3 h-3 rounded-sm border border-slate-300" style={{ backgroundColor: customColor }} />
        <input
          type="color"
          value={customColor}
          onChange={e => {
            setCustomColor(e.target.value);
            run(['foreColor', e.target.value]);
          }}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>

      <button
        type="button"
        onMouseDown={keep(() => run(['removeFormat'], ['foreColor', '#000000']))}
        className="px-2 py-0.5 rounded text-[11px] hover:bg-slate-100 border border-slate-200 text-slate-500"
        title="Reset to regular black text"
      >
        Reset
      </button>
      <span className="text-[10px] text-slate-400 ml-auto italic">Select text, then format</span>
    </div>
  );
};

// Keeps a contentEditable in sync with external HTML without resetting the caret while typing.
const useEditableHtml = (html: string) => {
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html || '';
    }
  }, [html]);
  return editorRef;
};

// WYSIWYG Rich Bullet Item Editor
const RichBulletItem: React.FC<{
  initialHtml: string;
  onChange: (html: string) => void;
  onRemove: () => void;
}> = ({ initialHtml, onChange, onRemove }) => {
  const editorRef = useEditableHtml(initialHtml);

  return (
    <div className="flex flex-col gap-1 p-2 bg-white rounded-lg border border-slate-200 shadow-2xs group focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
      <FormatToolbar editorRef={editorRef} onChange={onChange} />

      <div className="flex items-start gap-2">
        <span className="text-slate-500 font-bold text-sm mt-0.5">•</span>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => {
            if (editorRef.current) {
              onChange(editorRef.current.innerHTML);
            }
          }}
          className="flex-1 min-h-[36px] text-xs leading-relaxed focus:outline-none bg-slate-50/50 p-1.5 rounded text-black"
        />
        <button
          type="button"
          onClick={onRemove}
          className="text-slate-300 hover:text-red-500 p-1 text-base font-bold leading-none"
          title="Remove bullet item"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

// WYSIWYG Rich Text Paragraph Editor
const RichTextBlock: React.FC<{
  initialHtml: string;
  onChange: (html: string) => void;
}> = ({ initialHtml, onChange }) => {
  const editorRef = useEditableHtml(initialHtml);

  return (
    <div className="flex flex-col gap-1 p-2 bg-white rounded-lg border border-slate-200 shadow-2xs focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400">
      <FormatToolbar editorRef={editorRef} onChange={onChange} />
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Enter paragraph text (newspaper justified alignment will be applied)..."
        onInput={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
        className="min-h-[72px] text-xs leading-relaxed whitespace-pre-wrap focus:outline-none bg-slate-50/50 p-1.5 rounded text-black empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
      />
    </div>
  );
};

export const TechBriefBuilder: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Clean default template without pre-filled text
  const [briefData, setBriefData] = useState<TechnologyBriefData>(defaultEmptyBriefData);
  const [previewScale, setPreviewScale] = useState<number>(0.55);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ?id=<docId> opens an existing brief for editing; saving then updates it in place.
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('id');
  const [isLoadingBrief, setIsLoadingBrief] = useState<boolean>(!!editingId);

  useEffect(() => {
    if (!editingId) return;
    setIsLoadingBrief(true);
    getDoc(doc(db, 'technology_briefs', editingId))
      .then(snap => {
        if (snap.exists()) {
          setBriefData({ ...defaultEmptyBriefData, ...(snap.data() as TechnologyBriefData), id: snap.id });
        } else {
          setErrorMessage('That brief no longer exists. Starting a new one instead.');
        }
      })
      .catch(err => setErrorMessage('Could not load brief: ' + err.message))
      .finally(() => setIsLoadingBrief(false));
  }, [editingId]);

  const handleFitWidth = () => {
    if (previewContainerRef.current) {
      const containerW = previewContainerRef.current.clientWidth - 48;
      const calculated = Math.min(1.2, Math.max(0.3, containerW / 893));
      setPreviewScale(Number(calculated.toFixed(2)));
    }
  };

  const handleFitHeight = () => {
    if (previewContainerRef.current) {
      const containerH = previewContainerRef.current.clientHeight - 48;
      const calculated = Math.min(1.2, Math.max(0.3, containerH / 1263));
      setPreviewScale(Number(calculated.toFixed(2)));
    } else {
      const calculated = Math.min(1.2, Math.max(0.3, (window.innerHeight - 200) / 1263));
      setPreviewScale(Number(calculated.toFixed(2)));
    }
  };

  // Drag and Drop States
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [draggedBlockInfo, setDraggedBlockInfo] = useState<{ secId: string; blockIndex: number } | null>(null);

  // Max page currently in brief
  const maxPage = Math.max(1, ...briefData.sections.map(s => s.page || 1));
  const availablePages = Array.from({ length: Math.max(maxPage, 2) }, (_, i) => i + 1);

  // Field change handlers
  const handleBasicChange = (field: keyof TechnologyBriefData, value: any) => {
    setBriefData(prev => ({ ...prev, [field]: value }));
  };

  const watermark: BriefWatermark = briefData.watermark ?? { enabled: false, text: 'License\nTerminated', color: '#e53935' };
  const updateWatermark = (patch: Partial<BriefWatermark>) =>
    setBriefData(prev => ({ ...prev, watermark: { ...(prev.watermark ?? watermark), ...patch } }));

  const handleContactChange = (field: string, value: string) => {
    setBriefData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
  };

  // Section Management
  const updateSection = (secId: string, updates: Partial<BriefSection>) => {
    setBriefData(prev => ({
      ...prev,
      sections: prev.sections.map(s => (s.id === secId ? { ...s, ...updates } : s))
    }));
  };

  const removeSection = (secId: string) => {
    setBriefData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== secId)
    }));
  };

  const addSection = (pageNumber: number = 1) => {
    const newSec: BriefSection = {
      id: `sec-${Date.now()}`,
      title: 'New Section',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 1,
      columnPosition: 'left',
      page: pageNumber,
      blocks: [
        {
          id: `blk-${Date.now()}`,
          type: 'bullets',
          bulletPoints: ['']
        }
      ]
    };
    setBriefData(prev => ({
      ...prev,
      sections: [...prev.sections, newSec]
    }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= briefData.sections.length) return;

    const updated = [...briefData.sections];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setBriefData(prev => ({ ...prev, sections: updated }));
  };

  // Drag & drop for sections
  const handleSectionDragStart = (index: number) => {
    setDraggedSectionIndex(index);
  };

  const handleSectionDrop = (targetIndex: number) => {
    if (draggedSectionIndex === null || draggedSectionIndex === targetIndex) return;
    const updated = [...briefData.sections];
    const [moved] = updated.splice(draggedSectionIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setBriefData(prev => ({ ...prev, sections: updated }));
    setDraggedSectionIndex(null);
  };

  // Block Management
  const addBlockToSection = (secId: string, type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `blk-${Date.now()}`,
      type,
      ...(type === 'bullets' ? { bulletPoints: [''] } : {}),
      ...(type === 'text' ? { content: '' } : {}),
      ...(type === 'image' ? { title: '', imageUrl: '' } : {})
    };

    setBriefData(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === secId ? { ...s, blocks: [...s.blocks, newBlock] } : s
      )
    }));
  };

  const updateBlock = (secId: string, blockId: string, updates: Partial<ContentBlock>) => {
    setBriefData(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== secId) return s;
        return {
          ...s,
          blocks: s.blocks.map(b => (b.id === blockId ? { ...b, ...updates } : b))
        };
      })
    }));
  };

  const removeBlock = (secId: string, blockId: string) => {
    setBriefData(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== secId) return s;
        return {
          ...s,
          blocks: s.blocks.filter(b => b.id !== blockId)
        };
      })
    }));
  };

  const moveBlock = (secId: string, blockIndex: number, direction: 'up' | 'down') => {
    const sec = briefData.sections.find(s => s.id === secId);
    if (!sec) return;
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (targetIndex < 0 || targetIndex >= sec.blocks.length) return;

    const updatedBlocks = [...sec.blocks];
    const [moved] = updatedBlocks.splice(blockIndex, 1);
    updatedBlocks.splice(targetIndex, 0, moved);

    updateSection(secId, { blocks: updatedBlocks });
  };

  const handleBlockDragStart = (secId: string, blockIndex: number) => {
    setDraggedBlockInfo({ secId, blockIndex });
  };

  const handleBlockDrop = (secId: string, targetBlockIndex: number) => {
    if (!draggedBlockInfo || draggedBlockInfo.secId !== secId) return;
    const sec = briefData.sections.find(s => s.id === secId);
    if (!sec) return;

    const updatedBlocks = [...sec.blocks];
    const [moved] = updatedBlocks.splice(draggedBlockInfo.blockIndex, 1);
    updatedBlocks.splice(targetBlockIndex, 0, moved);

    updateSection(secId, { blocks: updatedBlocks });
    setDraggedBlockInfo(null);
  };

  // Image Upload Handler
  const handleImageUpload = async (secId: string, blockId: string, file: File, isSecondary: boolean = false) => {
    try {
      const storagePath = `tech_briefs/${briefData.techId || 'drafts'}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      if (isSecondary) {
        updateBlock(secId, blockId, { secondaryImageUrl: downloadUrl });
      } else {
        updateBlock(secId, blockId, { imageUrl: downloadUrl });
      }
    } catch (err: any) {
      console.warn("Storage upload failed, using local DataURL fallback:", err);
      const reader = new FileReader();
      reader.onload = () => {
        if (isSecondary) {
          updateBlock(secId, blockId, { secondaryImageUrl: reader.result as string });
        } else {
          updateBlock(secId, blockId, { imageUrl: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Export to PDF: Always generates a fresh, crisp PDF directly from the current editor DOM,
  // triggers instant download, and uploads/syncs to Firebase Storage
  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      const pdfBlob = await exportBriefToPdf(briefData.techId, briefData.title, true);

      // Asynchronously sync freshly generated PDF to Firebase Storage
      try {
        const fileName = `${briefData.techId || 'brief'}_${Date.now()}.pdf`;
        const storageRef = ref(storage, `tech-briefs-pdf/${fileName}`);
        await uploadBytes(storageRef, pdfBlob, { contentType: 'application/pdf' });
        const storedPdfUrl = await getDownloadURL(storageRef);
        setBriefData(prev => ({ ...prev, pdfUrl: storedPdfUrl }));
      } catch (uploadErr) {
        console.warn("Storage PDF auto-upload skipped:", uploadErr);
      }
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      alert("PDF generation error: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Save to Firestore & Store Official PDF to Firebase Storage
  const handleSaveToFirestore = async () => {
    try {
      setIsSaving(true);
      setErrorMessage(null);

      let storedPdfUrl = briefData.pdfUrl || '';

      // Auto-generate crisp PDF and store in Firebase Storage
      try {
        const pdfBlob = await exportBriefToPdf(briefData.techId, briefData.title, false);
        const fileName = `${briefData.techId || 'brief'}_${Date.now()}.pdf`;
        const storageRef = ref(storage, `tech-briefs-pdf/${fileName}`);
        await uploadBytes(storageRef, pdfBlob, { contentType: 'application/pdf' });
        storedPdfUrl = await getDownloadURL(storageRef);
        setBriefData(prev => ({ ...prev, pdfUrl: storedPdfUrl }));
      } catch (pdfErr) {
        console.warn("Storage PDF auto-upload skipped or failed:", pdfErr);
      }

      const { id: _id, createdAt: _createdAt, createdByEmail: _createdBy, ...content } = briefData;
      if (editingId && briefData.id === editingId) {
        await updateDoc(doc(db, 'technology_briefs', editingId), {
          ...content,
          pdfUrl: storedPdfUrl,
          updatedByEmail: user?.email || '',
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'technology_briefs'), {
          ...content,
          pdfUrl: storedPdfUrl,
          createdByEmail: user?.email || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err: any) {
      console.error("Error saving brief:", err);
      setErrorMessage("Could not save to Firestore: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingBrief) {
    return <div className="py-24 text-center text-sm text-slate-400">Loading brief…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-4 sm:px-8 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-600" />
              Technology Brief Generator
            </span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border font-mono">
              {briefData.techId || 'Draft ID'}
            </span>
            <span className="text-xs bg-navy-50 text-navy-800 px-2 py-0.5 rounded border border-blue-200 font-medium">
              {maxPage} {maxPage === 1 ? 'Page' : 'Pages'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBriefData(sampleBriefData)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition"
              title="Populate fields with B12 Vitamin sample data"
            >
              <FileCode2 className="w-3.5 h-3.5 text-purple-600" />
              Load Sample B12
            </button>

            <button
              onClick={() => setBriefData(defaultEmptyBriefData)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              title="Reset to blank institutional headings"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Fields
            </button>

            {/* Vector Native Print / Save to PDF */}
            <button
              onClick={printBrief}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-2xs"
              title="Print or Save as Vector PDF (Native Chrome / Safari quality)"
            >
              <Printer className="w-3.5 h-3.5 text-gold-600" />
              Print / Save PDF (Vector)
            </button>

            {/* Direct Download PDF */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Generating...' : 'Direct Download'}
            </button>

            <button
              onClick={handleSaveToFirestore}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Save & Publish'}
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="max-w-7xl mx-auto mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {editingId ? 'Technology Brief updated successfully!' : 'Technology Brief published successfully to database!'}
            </span>
            <button
              onClick={() => navigate('/tb')}
              className="underline font-semibold hover:text-emerald-950"
            >
              View in Catalog &rarr;
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="max-w-7xl mx-auto mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-600" />
            {errorMessage}
          </div>
        )}
      </div>

      {/* Main Workspace (Editor + Live Preview Split) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Editor (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* 1. Header & Identifiers Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                1. Brief Identifiers & Title
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Technology ID
                  </label>
                  <input
                    type="text"
                    value={briefData.techId}
                    onChange={e => handleBasicChange('techId', e.target.value)}
                    className="w-full text-xs font-mono border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. 2024VITTTO73"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Title Banner Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={briefData.titleBannerBgColor || '#76cb3c'}
                      onChange={e => handleBasicChange('titleBannerBgColor', e.target.value)}
                      className="w-9 h-9 p-0.5 rounded border border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-500">
                      {briefData.titleBannerBgColor || '#76cb3c'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Technology Title
                </label>
                <textarea
                  rows={2}
                  value={briefData.title}
                  onChange={e => handleBasicChange('title', e.target.value)}
                  className="w-full text-sm font-semibold border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter full technology brief title..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">TRL Level (1-9)</label>
                  <input
                    type="number"
                    min={1}
                    max={9}
                    value={briefData.trlLevel}
                    onChange={e => handleBasicChange('trlLevel', parseInt(e.target.value) || 1)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patent Status</label>
                  <input
                    type="text"
                    value={briefData.patentStatus}
                    onChange={e => handleBasicChange('patentStatus', e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                    placeholder="Patent Pending"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Patent App No.</label>
                  <input
                    type="text"
                    value={briefData.patentApplicationNo || ''}
                    onChange={e => handleBasicChange('patentApplicationNo', e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                    placeholder="202441015300"
                  />
                </div>
              </div>
            </div>

            {/* Status Watermark (e.g. "License Terminated") */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Stamp className="w-4 h-4 text-gold-600" />
                  Watermark
                </h2>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={watermark.enabled}
                    onChange={e => updateWatermark({ enabled: e.target.checked })}
                    className="w-4 h-4 accent-navy-700"
                  />
                  Show on brief & PDF
                </label>
              </div>

              <div className={`space-y-3 ${watermark.enabled ? '' : 'opacity-50 pointer-events-none'}`}>
                <div className="flex flex-wrap gap-1.5">
                  {WATERMARK_PRESETS.map(text => (
                    <button
                      key={text}
                      type="button"
                      onClick={() => updateWatermark({ text })}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition ${
                        watermark.text === text ? 'border-navy-700 bg-navy-50 text-navy-800' : 'border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {text.replace('\n', ' ')}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Text</label>
                    <textarea
                      rows={2}
                      value={watermark.text}
                      onChange={e => updateWatermark({ text: e.target.value })}
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                      placeholder={'License\nTerminated'}
                    />
                    <p className="mt-1 text-[10px] text-slate-400">Press Enter to split the stamp onto two lines.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Colour</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="color"
                        value={watermark.color}
                        onChange={e => updateWatermark({ color: e.target.value })}
                        className="w-9 h-9 p-0.5 rounded border border-slate-300 cursor-pointer"
                      />
                      {['#e53935', '#f57c00', '#2e7d32', '#1d4ed8', '#64748b'].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => updateWatermark({ color: c })}
                          className={`w-5 h-5 rounded-full border ${watermark.color === c ? 'ring-2 ring-offset-1 ring-navy-700' : 'border-slate-300'}`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Sections Manager with Drag & Reorder */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-gold-600" />
                    2. Sections & Reorderable Blocks
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Use Drag handles or arrows to reorder • Select text to turn Red or Bold
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => addSection(1)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gold-600 bg-navy-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-md transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Section
                  </button>
                  <button
                    onClick={() => addSection(maxPage + 1)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-md transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Page {maxPage + 1}
                  </button>
                </div>
              </div>

              {briefData.sections.map((sec, secIdx) => (
                <div
                  key={sec.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleSectionDrop(secIdx)}
                  className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs transition ${
                    draggedSectionIndex === secIdx ? 'opacity-50 ring-2 ring-blue-500' : ''
                  }`}
                >
                  {/* Section Top Header Edit Bar */}
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      {/* Section Drag Handle (ONLY this handle is draggable) */}
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleSectionDragStart(secIdx);
                        }}
                        className="cursor-grab active:cursor-grabbing p-1.5 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-200 rounded border border-slate-200 shadow-2xs"
                        title="Drag to reorder section"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Section Up / Down Buttons */}
                      <div className="flex flex-col -space-y-1">
                        <button
                          type="button"
                          disabled={secIdx === 0}
                          onClick={() => moveSection(secIdx, 'up')}
                          className="text-slate-400 hover:text-gold-600 disabled:opacity-20"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={secIdx === briefData.sections.length - 1}
                          onClick={() => moveSection(secIdx, 'down')}
                          className="text-slate-400 hover:text-gold-600 disabled:opacity-20"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-slate-400">#{secIdx + 1}</span>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={e => updateSection(sec.id, { title: e.target.value })}
                        className="font-bold text-xs uppercase px-2 py-1 border border-slate-300 rounded bg-white flex-1"
                        placeholder="Section Heading..."
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Color Picker */}
                      <div className="flex items-center gap-1" title="Header background color">
                        <Palette className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="color"
                          value={sec.headerBgColor || '#52d1dc'}
                          onChange={e => updateSection(sec.id, { headerBgColor: e.target.value })}
                          className="w-6 h-6 p-0 rounded cursor-pointer border border-slate-300"
                        />
                      </div>

                      {/* Column Position Selector (Left, Right, or Full Width) */}
                      <select
                        value={sec.columnSpan === 2 ? 'full' : (sec.columnPosition || 'left')}
                        onChange={e => {
                          const val = e.target.value;
                          if (val === 'full') {
                            updateSection(sec.id, { columnSpan: 2 });
                          } else {
                            updateSection(sec.id, { columnSpan: 1, columnPosition: val as 'left' | 'right' });
                          }
                        }}
                        className="text-[11px] font-semibold border border-slate-300 rounded px-2 py-1 bg-white text-slate-700"
                        title="Position on page"
                      >
                        <option value="left">Left Column</option>
                        <option value="right">Right Column</option>
                        <option value="full">Full Width</option>
                      </select>

                      {/* Page selector */}
                      <select
                        value={sec.page || 1}
                        onChange={e =>
                          updateSection(sec.id, { page: parseInt(e.target.value) || 1 })
                        }
                        className="text-[11px] font-medium border border-slate-300 rounded px-1.5 py-1 bg-white text-slate-700"
                      >
                        {availablePages.map(p => (
                          <option key={p} value={p}>Page {p}</option>
                        ))}
                      </select>

                      {/* Delete section */}
                      <button
                        onClick={() => removeSection(sec.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition"
                        title="Delete section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Blocks inside Section (Reorderable) */}
                  <div className="p-4 space-y-3">
                    {sec.blocks.map((block, bIdx) => (
                      <div
                        key={block.id}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleBlockDrop(sec.id, bIdx)}
                        className={`p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 space-y-2 transition ${
                          draggedBlockInfo?.secId === sec.id && draggedBlockInfo?.blockIndex === bIdx
                            ? 'opacity-50 ring-2 ring-blue-400'
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                          <div className="flex items-center gap-1.5">
                            {/* Block Drag Handle (ONLY this handle is draggable) */}
                            <div
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation();
                                handleBlockDragStart(sec.id, bIdx);
                              }}
                              className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded border border-slate-200 shadow-2xs"
                              title="Drag from this icon to reorder block"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </div>

                            {/* Block Move Up / Down Buttons */}
                            <button
                              type="button"
                              disabled={bIdx === 0}
                              onClick={() => moveBlock(sec.id, bIdx, 'up')}
                              className="text-slate-400 hover:text-gold-600 disabled:opacity-20"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={bIdx === sec.blocks.length - 1}
                              onClick={() => moveBlock(sec.id, bIdx, 'down')}
                              className="text-slate-400 hover:text-gold-600 disabled:opacity-20"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            <span className="uppercase tracking-wider font-semibold text-slate-600 flex items-center gap-1 ml-1">
                              {block.type === 'bullets' && <List className="w-3.5 h-3.5 text-blue-500" />}
                              {block.type === 'text' && <AlignLeft className="w-3.5 h-3.5 text-emerald-500" />}
                              {block.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-purple-500" />}
                              {block.type} Block
                            </span>
                          </div>

                          <button
                            onClick={() => removeBlock(sec.id, block.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Remove block"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Bullets Block with WYSIWYG Color & Bold Toolbar */}
                        {block.type === 'bullets' && (
                          <div className="space-y-2">
                            {block.bulletPoints?.map((pt, ptIdx) => (
                              <RichBulletItem
                                key={ptIdx}
                                initialHtml={pt}
                                onChange={(newHtml) => {
                                  const nextPts = [...(block.bulletPoints || [])];
                                  nextPts[ptIdx] = newHtml;
                                  updateBlock(sec.id, block.id, { bulletPoints: nextPts });
                                }}
                                onRemove={() => {
                                  const nextPts = block.bulletPoints?.filter((_, i) => i !== ptIdx);
                                  updateBlock(sec.id, block.id, { bulletPoints: nextPts });
                                }}
                              />
                            ))}

                            <button
                              onClick={() => {
                                const nextPts = [...(block.bulletPoints || []), ''];
                                updateBlock(sec.id, block.id, { bulletPoints: nextPts });
                              }}
                              className="text-xs text-gold-600 hover:underline font-medium inline-flex items-center gap-1 mt-1"
                            >
                              <Plus className="w-3 h-3" /> Add Bullet Item
                            </button>
                          </div>
                        )}

                        {/* Text Paragraph Block Editor */}
                        {block.type === 'text' && (
                          <RichTextBlock
                            initialHtml={block.content || ''}
                            onChange={html => updateBlock(sec.id, block.id, { content: html })}
                          />
                        )}

                        {/* Image Block Editor with Adjustable Placeholder & Fit Controls */}
                        {block.type === 'image' && (
                          <div className="space-y-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="flex items-center gap-3">
                              {block.imageUrl ? (
                                <img
                                  src={block.imageUrl}
                                  alt="Preview"
                                  className="h-20 w-28 object-contain rounded border bg-slate-50"
                                />
                              ) : (
                                <div className="h-20 w-28 bg-slate-100 rounded border border-dashed flex items-center justify-center text-[10px] text-slate-400">
                                  No Image
                                </div>
                              )}

                              <div className="flex-1 space-y-1">
                                <label className="block text-[11px] font-semibold text-slate-700">
                                  Upload Figure / Chart / Photo
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={e => {
                                    if (e.target.files?.[0]) {
                                      handleImageUpload(sec.id, block.id, e.target.files[0]);
                                    }
                                  }}
                                  className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-navy-50 file:text-navy-800 hover:file:bg-blue-100"
                                />
                                <span className="text-[10px] text-slate-400 block">
                                  Note: Images with built-in titles/captions will render directly without duplicate text.
                                </span>
                              </div>
                            </div>

                            {/* Placeholder Height Control */}
                            <div className="p-2.5 bg-slate-50 rounded border border-slate-200/80 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700 text-[11px]">Placeholder Height:</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => updateBlock(sec.id, block.id, { placeholderHeight: undefined })}
                                    className={`px-2 py-0.5 text-[11px] rounded font-semibold border ${
                                      !block.placeholderHeight || block.placeholderHeight === 0
                                        ? 'bg-navy-900 text-white border-blue-600'
                                        : 'bg-white text-slate-700 border-slate-300'
                                    }`}
                                  >
                                    Auto (Natural)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateBlock(sec.id, block.id, { placeholderHeight: 180 })}
                                    className={`px-2 py-0.5 text-[11px] rounded font-semibold border ${
                                      block.placeholderHeight === 180
                                        ? 'bg-navy-900 text-white border-blue-600'
                                        : 'bg-white text-slate-700 border-slate-300'
                                    }`}
                                  >
                                    180px
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateBlock(sec.id, block.id, { placeholderHeight: 220 })}
                                    className={`px-2 py-0.5 text-[11px] rounded font-semibold border ${
                                      block.placeholderHeight === 220
                                        ? 'bg-navy-900 text-white border-blue-600'
                                        : 'bg-white text-slate-700 border-slate-300'
                                    }`}
                                  >
                                    220px
                                  </button>
                                </div>
                              </div>

                              {/* Manual Height Slider */}
                              {block.placeholderHeight && block.placeholderHeight > 0 && (
                                <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                                  <span className="text-[10px] text-slate-500 font-medium">Custom Height:</span>
                                  <input
                                    type="range"
                                    min={80}
                                    max={400}
                                    step={10}
                                    value={block.placeholderHeight || 200}
                                    onChange={e => updateBlock(sec.id, block.id, { placeholderHeight: parseInt(e.target.value) || 200 })}
                                    className="flex-1 accent-navy-900 h-1.5"
                                  />
                                  <span className="text-[11px] font-mono text-slate-700 w-12 text-right">
                                    {block.placeholderHeight}px
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Fit & Zoom Controls */}
                            <div className="flex flex-wrap items-center gap-3 p-2 bg-slate-50 rounded border border-slate-200/80 text-xs">
                              <span className="font-bold text-slate-700 text-[11px]">Fit Mode:</span>
                              <div className="inline-flex rounded-md shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => updateBlock(sec.id, block.id, { imageFit: 'width' })}
                                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-l-md border ${
                                    (block.imageFit || 'width') === 'width'
                                      ? 'bg-navy-900 text-white border-blue-600'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  Fit to Width (Default)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateBlock(sec.id, block.id, { imageFit: 'height' })}
                                  className={`px-2.5 py-1 text-[11px] font-semibold border-t border-b border-r ${
                                    block.imageFit === 'height'
                                      ? 'bg-navy-900 text-white border-blue-600'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  Fit to Height
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateBlock(sec.id, block.id, { imageFit: 'cover' })}
                                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-r-md border-t border-b border-r ${
                                    block.imageFit === 'cover'
                                      ? 'bg-navy-900 text-white border-blue-600'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  Cover
                                </button>
                              </div>

                              {/* Zoom Slider */}
                              <div className="flex items-center gap-1.5 ml-auto">
                                <span className="text-[11px] text-slate-500 font-medium">Zoom:</span>
                                <input
                                  type="range"
                                  min={50}
                                  max={150}
                                  step={5}
                                  value={block.imageZoom || 100}
                                  onChange={e => updateBlock(sec.id, block.id, { imageZoom: parseInt(e.target.value) || 100 })}
                                  className="w-20 accent-navy-900 h-1.5"
                                />
                                <span className="text-[11px] font-mono text-slate-600 w-8 text-right">
                                  {block.imageZoom || 100}%
                                </span>
                              </div>
                            </div>

                            {/* Optional Figure Title */}
                            <div>
                              <input
                                type="text"
                                value={block.title || ''}
                                onChange={e =>
                                  updateBlock(sec.id, block.id, { title: e.target.value })
                                }
                                className="w-full text-xs font-medium border border-slate-200 rounded p-1.5 bg-white"
                                placeholder="Optional Figure Title (leave blank if heading is already in image)..."
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Block Toolbar */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-400">Add Block:</span>
                      <button
                        onClick={() => addBlockToSection(sec.id, 'bullets')}
                        className="text-[11px] text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-2 py-0.5 rounded shadow-2xs inline-flex items-center gap-1"
                      >
                        <List className="w-3 h-3 text-blue-500" /> Bullets
                      </button>
                      <button
                        onClick={() => addBlockToSection(sec.id, 'text')}
                        className="text-[11px] text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-2 py-0.5 rounded shadow-2xs inline-flex items-center gap-1"
                      >
                        <AlignLeft className="w-3 h-3 text-emerald-500" /> Text
                      </button>
                      <button
                        onClick={() => addBlockToSection(sec.id, 'image')}
                        className="text-[11px] text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-2 py-0.5 rounded shadow-2xs inline-flex items-center gap-1"
                      >
                        <ImageIcon className="w-3 h-3 text-purple-500" /> Image
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 3. Contact Footer Editor */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                3. Contact Information Footer (Rendered on Last Page)
              </h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1">Officer Name</label>
                  <input
                    type="text"
                    value={briefData.contactInfo.name}
                    onChange={e => handleContactChange('name', e.target.value)}
                    className="w-full border rounded p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Title</label>
                  <input
                    type="text"
                    value={briefData.contactInfo.title}
                    onChange={e => handleContactChange('title', e.target.value)}
                    className="w-full border rounded p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={briefData.contactInfo.email}
                    onChange={e => handleContactChange('email', e.target.value)}
                    className="w-full border rounded p-1.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Office Phone</label>
                  <input
                    type="text"
                    value={briefData.contactInfo.phoneOffice}
                    onChange={e => handleContactChange('phoneOffice', e.target.value)}
                    className="w-full border rounded p-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live A4 Sheet Preview (6 cols) */}
          <div className="lg:col-span-6 sticky top-36">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-gold-600" />
                  Live A4 Document Preview ({maxPage} {maxPage === 1 ? 'Page' : 'Pages'})
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleFitWidth}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                    title="Fit Page to Container Width"
                  >
                    Fit Width
                  </button>
                  <button
                    type="button"
                    onClick={handleFitHeight}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                    title="Fit Page to Viewport Height"
                  >
                    Fit Height
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewScale(prev => Math.max(0.3, Number((prev - 0.05).toFixed(2))))}
                    className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <span className="text-[11px] font-mono font-semibold text-slate-700 min-w-10 text-center">
                    {Math.round(previewScale * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewScale(prev => Math.min(1.5, Number((prev + 0.05).toFixed(2))))}
                    className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewScale(1.0)}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                    title="Reset to 100% scale"
                  >
                    100%
                  </button>
                </div>
              </div>

              {/* Scrollable Container */}
              <div
                ref={previewContainerRef}
                className="max-h-[calc(100vh-12rem)] overflow-y-auto overflow-x-auto p-4 bg-slate-200/70 rounded-lg mt-3 flex justify-center"
              >
                <TechBriefSheet data={briefData} scale={previewScale} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
