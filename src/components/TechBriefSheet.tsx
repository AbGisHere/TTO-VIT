import React from 'react';
import { TechnologyBriefData, BriefSection, ContentBlock } from '../types/technologyBrief';

interface TechBriefSheetProps {
  data: TechnologyBriefData;
  scale?: number;
}

export const TechBriefSheet: React.FC<TechBriefSheetProps> = ({ data, scale = 1 }) => {
  // Split sections by page
  const page1Sections = data.sections.filter(s => (s.page || 1) === 1);
  const page2Sections = data.sections.filter(s => s.page === 2);
  const additionalSections = data.sections.filter(s => (s.page || 1) > 2);

  const pages = [
    { pageNum: 1, sections: page1Sections, isLast: page2Sections.length === 0 },
    ...(page2Sections.length > 0 ? [{ pageNum: 2, sections: page2Sections, isLast: additionalSections.length === 0 }] : []),
    ...(additionalSections.length > 0 ? [{ pageNum: 3, sections: additionalSections, isLast: true }] : [])
  ];

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'bullets':
        return (
          <ul className="list-disc pl-4 space-y-1 text-[11px] leading-tight text-slate-900 text-justify">
            {block.bulletPoints?.map((pt, i) => (
              <li key={i} className="pl-0.5">
                <span dangerouslySetInnerHTML={{ __html: pt.replace(/\n/g, '<br/>') }} />
              </li>
            ))}
          </ul>
        );

      case 'text':
        return (
          <div className="text-[11px] leading-tight text-slate-900 text-justify space-y-1.5 whitespace-pre-line">
            {block.content}
          </div>
        );

      case 'image':
      case 'text-with-image':
      case 'two-images':
        return (
          <div className="space-y-1 my-0.5">
            {block.title && (
              <div className="text-center">
                <span className="text-red-700 font-serif font-bold text-[11px] tracking-tight border-b-2 border-sky-600 pb-0.5 inline-block">
                  {block.title}
                </span>
              </div>
            )}
            {block.content && (
              <p className="text-[11px] text-justify leading-tight text-slate-800">{block.content}</p>
            )}
            <div className="flex items-center justify-center gap-2">
              {block.imageUrl && (
                <div className="flex-1 flex justify-center bg-white p-0.5 rounded">
                  <img
                    src={block.imageUrl}
                    alt={block.title || 'Brief illustration'}
                    className="max-h-24 w-auto object-contain rounded"
                  />
                </div>
              )}
              {block.secondaryImageUrl && (
                <div className="flex-1 flex justify-center bg-white p-0.5 rounded">
                  <img
                    src={block.secondaryImageUrl}
                    alt="Secondary illustration"
                    className="max-h-24 w-auto object-contain rounded"
                  />
                </div>
              )}
            </div>
            {block.imageCaption && (
              <p className="text-[9px] text-center text-slate-600 italic">{block.imageCaption}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderSection = (sec: BriefSection) => {
    return (
      <div
        key={sec.id}
        className={`flex flex-col mb-1.5 ${sec.columnSpan === 2 ? 'col-span-2' : 'col-span-1'}`}
      >
        {/* Section Header Bar */}
        <div
          className="py-0.5 px-2 rounded-none mb-1 text-center font-bold text-[12px] uppercase tracking-wide shadow-xs"
          style={{
            backgroundColor: sec.headerBgColor || '#52d1dc',
            color: sec.headerTextColor || '#000000'
          }}
        >
          {sec.title}
        </div>

        {/* Section Blocks */}
        <div className="space-y-1.5 px-0.5">
          {sec.blocks.map(b => (
            <div key={b.id}>{renderBlock(b)}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="tech-brief-print-container flex flex-col items-center gap-8 py-4"
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center'
      }}
    >
      {pages.map((p) => (
        <div
          key={p.pageNum}
          id={`tb-sheet-page-${p.pageNum}`}
          className="sheet-page bg-white text-slate-900 shadow-2xl relative flex flex-col justify-between overflow-hidden"
          style={{
            width: '210mm',
            minHeight: '297mm',
            height: '297mm',
            padding: '0mm 0mm',
            boxSizing: 'border-box'
          }}
        >
          {/* TOP AREA: Header */}
          <div className="w-full">
            {/* Header graphic and logos */}
            <div className="w-full relative">
              <img
                src="/assets/branding/tto_header.png"
                alt="VIT TTO Header"
                className="w-full h-auto block object-contain"
              />
            </div>

            {/* PAGE 1 ONLY: Tech Brief Banner & Title */}
            {p.pageNum === 1 && (
              <div className="px-5 pt-1 pb-1">
                {/* Purple Badge & Tech ID */}
                <div className="flex flex-col items-center justify-center my-0.5">
                  <span className="bg-[#3b3598] text-white font-extrabold text-[12px] tracking-wider px-4 py-0.5 rounded-xs uppercase shadow-xs">
                    TECHNOLOGY BRIEF
                  </span>
                  <span className="text-[12px] font-bold text-slate-900 mt-0.5">
                    Technology ID: {data.techId || 'Pending'}
                  </span>
                </div>

                {/* Green Title Banner */}
                <div
                  className="w-full py-1 px-4 my-1 text-center relative overflow-hidden"
                  style={{
                    backgroundColor: data.titleBannerBgColor || '#76cb3c'
                  }}
                >
                  <h1 className="text-[17px] font-black italic tracking-tight text-slate-950 font-sans leading-tight">
                    {data.title || 'Technology Title'}
                  </h1>
                </div>
              </div>
            )}
          </div>

          {/* MAIN CONTENT AREA: Grid with newspaper alignment */}
          <div className="flex-1 px-6 py-1 grid grid-cols-2 gap-x-5 gap-y-1 content-start">
            {p.sections.map(renderSection)}
          </div>

          {/* BOTTOM AREA: Footers */}
          <div className="w-full mt-auto">
            {/* Common Cyan Banner on all pages */}
            <div className="bg-[#52d1dc] text-center py-1 border-t border-b border-cyan-400">
              <span className="font-bold text-[12px] tracking-wide text-slate-950 uppercase">
                Technology available for Licensing
              </span>
            </div>

            {/* LAST PAGE ONLY: 3-Column Contact Box */}
            {p.isLast && (
              <div className="px-6 py-2 bg-white">
                <div className="grid grid-cols-12 gap-2 items-center text-[11px] leading-snug">
                  {/* Left Column: Officer Info */}
                  <div className="col-span-5 bg-[#e4eefd] p-2 rounded border border-blue-100 h-full flex flex-col justify-center">
                    <p className="font-bold text-slate-900">Contact:</p>
                    <p className="font-semibold text-slate-800">{data.contactInfo.name}</p>
                    <p className="text-slate-700">{data.contactInfo.title}</p>
                    <p className="text-slate-600">{data.contactInfo.department}, {data.contactInfo.institution}</p>
                  </div>

                  {/* Center Column: IPR Logo */}
                  <div className="col-span-2 flex justify-center items-center">
                    <img
                      src="/assets/branding/ipr_cell_logo.png"
                      alt="IPR & TT Cell Logo"
                      className="max-h-16 w-auto object-contain"
                    />
                  </div>

                  {/* Right Column: Contact Details */}
                  <div className="col-span-5 bg-[#e4eefd] p-2 rounded border border-blue-100 h-full flex flex-col justify-center">
                    <p><span className="font-bold text-slate-900">Email:</span> <a href={`mailto:${data.contactInfo.email}`} className="text-blue-700 hover:underline">{data.contactInfo.email}</a></p>
                    <p><span className="font-bold text-slate-900">Phone No.:</span> {data.contactInfo.phoneOffice} (O)</p>
                    <p className="pl-14">: {data.contactInfo.phoneMobile} (M)</p>
                    <p><span className="font-bold text-slate-900">Website:</span> <a href={data.contactInfo.website} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">{data.contactInfo.website}</a></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
