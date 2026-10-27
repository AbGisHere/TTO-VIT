import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { TechnologyBriefData, BriefSection, ContentBlock } from '../types/technologyBrief';
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
  AlertCircle
} from 'lucide-react';

export const TechBriefBuilder: React.FC = () => {
  const { user, isTbAdmin } = useAuth();
  const navigate = useNavigate();

  const [briefData, setBriefData] = useState<TechnologyBriefData>(sampleBriefData);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [previewScale, setPreviewScale] = useState<number>(0.65);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Field change handlers
  const handleBasicChange = (field: keyof TechnologyBriefData, value: any) => {
    setBriefData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field: string, value: string) => {
    setBriefData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
  };

  // Section handlers
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

  const addSection = (page: 1 | 2 = 1) => {
    const newSec: BriefSection = {
      id: `sec-${Date.now()}`,
      title: 'New Section',
      headerBgColor: '#52d1dc',
      headerTextColor: '#000000',
      columnSpan: 1,
      page,
      blocks: [
        {
          id: `blk-${Date.now()}`,
          type: 'text',
          content: 'Enter section content here...'
        }
      ]
    };
    setBriefData(prev => ({
      ...prev,
      sections: [...prev.sections, newSec]
    }));
  };

  // Block handlers
  const addBlockToSection = (secId: string, type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `blk-${Date.now()}`,
      type,
      ...(type === 'bullets' ? { bulletPoints: ['New bullet item'] } : {}),
      ...(type === 'text' ? { content: 'Text paragraph...' } : {}),
      ...(type === 'image' ? { title: 'Figure Title', imageUrl: '' } : {})
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

  // Export to PDF
  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      await exportBriefToPdf(briefData.techId, briefData.title);
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      alert("PDF generation error: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Save to Firestore
  const handleSaveToFirestore = async () => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      await addDoc(collection(db, 'technology_briefs'), {
        ...briefData,
        createdByEmail: user?.email || 'admin@vit.ac.in',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Error saving brief:", err);
      setErrorMessage("Could not save to Firestore: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-4 sm:px-8 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Technology Brief Generator
            </span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border font-mono">
              {briefData.techId}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBriefData(sampleBriefData)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              title="Reset to official B12 Fortification template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Template
            </button>

            <button
              onClick={printBrief}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Generating PDF...' : 'Download PDF'}
            </button>

            <button
              onClick={handleSaveToFirestore}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save & Publish'}
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="max-w-7xl mx-auto mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Technology Brief published successfully to database!
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
          {/* Left Column: Editor Form (7 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* 1. Header & Metadata Card */}
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

            {/* 2. Sections Manager */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  2. Content Sections & Blocks
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => addSection(1)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-md transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add to Page 1
                  </button>
                  <button
                    onClick={() => addSection(2)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-md transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add to Page 2
                  </button>
                </div>
              </div>

              {briefData.sections.map((sec, secIdx) => (
                <div
                  key={sec.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
                >
                  {/* Section Top Header Edit Bar */}
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-bold text-slate-400">#{secIdx + 1}</span>
                      <input
                        type="text"
                        value={sec.title}
                        onChange={e => updateSection(sec.id, { title: e.target.value })}
                        className="font-bold text-xs uppercase px-2 py-1 border border-slate-300 rounded bg-white flex-1"
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

                      {/* Width toggle */}
                      <button
                        onClick={() =>
                          updateSection(sec.id, { columnSpan: sec.columnSpan === 1 ? 2 : 1 })
                        }
                        className={`text-[11px] font-semibold px-2 py-1 rounded border transition flex items-center gap-1 ${
                          sec.columnSpan === 2
                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                            : 'bg-white text-slate-600 border-slate-300'
                        }`}
                        title="Toggle Full Width vs Half Column"
                      >
                        <Columns className="w-3 h-3" />
                        {sec.columnSpan === 2 ? 'Full Width' : 'Half Col'}
                      </button>

                      {/* Page selector */}
                      <select
                        value={sec.page || 1}
                        onChange={e =>
                          updateSection(sec.id, { page: parseInt(e.target.value) as 1 | 2 })
                        }
                        className="text-[11px] font-medium border border-slate-300 rounded px-1.5 py-1 bg-white text-slate-700"
                      >
                        <option value={1}>Page 1</option>
                        <option value={2}>Page 2</option>
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

                  {/* Blocks inside Section */}
                  <div className="p-4 space-y-3">
                    {sec.blocks.map(block => (
                      <div
                        key={block.id}
                        className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 space-y-2"
                      >
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                          <span className="uppercase tracking-wider font-semibold text-slate-600 flex items-center gap-1">
                            {block.type === 'bullets' && <List className="w-3.5 h-3.5 text-blue-500" />}
                            {block.type === 'text' && <AlignLeft className="w-3.5 h-3.5 text-emerald-500" />}
                            {block.type === 'image' && <ImageIcon className="w-3.5 h-3.5 text-purple-500" />}
                            {block.type} Block
                          </span>
                          <button
                            onClick={() => removeBlock(sec.id, block.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Bullets Block Editor */}
                        {block.type === 'bullets' && (
                          <div className="space-y-1.5">
                            {block.bulletPoints?.map((pt, ptIdx) => (
                              <div key={ptIdx} className="flex items-start gap-1.5">
                                <span className="text-slate-400 text-xs mt-1.5">•</span>
                                <textarea
                                  rows={2}
                                  value={pt}
                                  onChange={e => {
                                    const nextPts = [...(block.bulletPoints || [])];
                                    nextPts[ptIdx] = e.target.value;
                                    updateBlock(sec.id, block.id, { bulletPoints: nextPts });
                                  }}
                                  className="w-full text-xs border border-slate-200 rounded p-1.5 bg-white focus:outline-blue-500"
                                />
                                <button
                                  onClick={() => {
                                    const nextPts = block.bulletPoints?.filter((_, i) => i !== ptIdx);
                                    updateBlock(sec.id, block.id, { bulletPoints: nextPts });
                                  }}
                                  className="text-slate-300 hover:text-red-500 p-1 mt-1"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const nextPts = [...(block.bulletPoints || []), 'New bullet point...'];
                                updateBlock(sec.id, block.id, { bulletPoints: nextPts });
                              }}
                              className="text-xs text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Bullet Item
                            </button>
                          </div>
                        )}

                        {/* Text Paragraph Block Editor */}
                        {block.type === 'text' && (
                          <textarea
                            rows={3}
                            value={block.content || ''}
                            onChange={e =>
                              updateBlock(sec.id, block.id, { content: e.target.value })
                            }
                            className="w-full text-xs border border-slate-200 rounded p-2 bg-white focus:outline-blue-500"
                            placeholder="Enter paragraph text..."
                          />
                        )}

                        {/* Image Block Editor */}
                        {block.type === 'image' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={block.title || ''}
                              onChange={e =>
                                updateBlock(sec.id, block.id, { title: e.target.value })
                              }
                              className="w-full text-xs font-medium border border-slate-200 rounded p-1.5 bg-white"
                              placeholder="Subtitle (e.g. Synergistic Enhancement of Vitamin B12...)"
                            />

                            <div className="flex items-center gap-3">
                              {block.imageUrl ? (
                                <img
                                  src={block.imageUrl}
                                  alt="Preview"
                                  className="h-14 w-20 object-contain rounded border bg-white"
                                />
                              ) : (
                                <div className="h-14 w-20 bg-slate-100 rounded border border-dashed flex items-center justify-center text-[10px] text-slate-400">
                                  No Image
                                </div>
                              )}

                              <div className="flex-1 space-y-1">
                                <label className="block text-[11px] font-semibold text-slate-600">
                                  Upload Image
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={e => {
                                    if (e.target.files?.[0]) {
                                      handleImageUpload(sec.id, block.id, e.target.files[0]);
                                    }
                                  }}
                                  className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                              </div>
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
                3. Contact Information Footer (Last Page)
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
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Live A4 Document Preview
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Scale:</span>
                  {[0.5, 0.65, 0.85, 1.0].map(s => (
                    <button
                      key={s}
                      onClick={() => setPreviewScale(s)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        previewScale === s
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {Math.round(s * 100)}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Container */}
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto overflow-x-auto p-4 bg-slate-200/70 rounded-lg mt-3 flex justify-center">
                <TechBriefSheet data={briefData} scale={previewScale} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
