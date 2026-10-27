import React from 'react';
import { TechnologyBriefData, BriefSection, ContentBlock } from '../types/technologyBrief';

interface TechBriefSheetProps {
  data: TechnologyBriefData;
  scale?: number;
}

export const TechBriefSheet: React.FC<TechBriefSheetProps> = ({ data, scale = 1 }) => {
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
          <ul className="list-disc pl-5 space-y-1 text-[15px] leading-[22px] text-black font-['Arial',sans-serif] text-justify" style={{ textAlignLast: 'left' }}>
            {block.bulletPoints?.map((pt, i) => (
              <li key={i} className="pl-1">
                <span dangerouslySetInnerHTML={{ __html: pt.replace(/\n/g, '<br/>') }} />
              </li>
            ))}
          </ul>
        );

      case 'text':
        return (
          <div className="text-[15px] leading-[22px] text-black font-['Arial',sans-serif] text-justify space-y-2 whitespace-pre-line" style={{ textAlignLast: 'left' }}>
            {block.content}
          </div>
        );

      case 'image':
      case 'text-with-image':
      case 'two-images':
        return (
          <div className="space-y-1 my-1">
            {block.title && (
              <div className="text-center my-0.5">
                <span className="text-[#a51c1c] font-serif font-bold text-[15px] tracking-tight border-b-2 border-sky-600 pb-0.5 inline-block">
                  {block.title}
                </span>
              </div>
            )}
            {block.content && (
              <p className="text-[14px] text-justify leading-[20px] text-black font-['Arial',sans-serif]">{block.content}</p>
            )}
            <div className="flex items-center justify-center gap-2">
              {block.imageUrl && (
                <div className="flex-1 flex justify-center bg-white p-0.5 rounded">
                  <img
                    src={block.imageUrl}
                    alt={block.title || 'Brief illustration'}
                    className="max-h-28 w-auto object-contain rounded"
                  />
                </div>
              )}
              {block.secondaryImageUrl && (
                <div className="flex-1 flex justify-center bg-white p-0.5 rounded">
                  <img
                    src={block.secondaryImageUrl}
                    alt="Secondary illustration"
                    className="max-h-28 w-auto object-contain rounded"
                  />
                </div>
              )}
            </div>
            {block.imageCaption && (
              <p className="text-[11px] text-center text-slate-600 italic">{block.imageCaption}</p>
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
        className={`flex flex-col mb-2 ${sec.columnSpan === 2 ? 'col-span-2' : 'col-span-1'}`}
      >
        {/* Canva Section Header Bar */}
        <div
          className="py-1 px-3 mb-1.5 text-center font-bold text-[17px] uppercase tracking-wide font-['Montserrat',sans-serif]"
          style={{
            backgroundColor: sec.headerBgColor || '#52d1dc',
            color: sec.headerTextColor || '#000000'
          }}
        >
          {sec.title}
        </div>

        {/* Section Content */}
        <div className="space-y-1.5 px-1">
          {sec.blocks.map(b => (
            <div key={b.id}>{renderBlock(b)}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className="tech-brief-print-container flex flex-col items-center gap-10 py-6"
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center'
      }}
    >
      {pages.map((p) => (
        <div
          key={p.pageNum}
          id={`tb-sheet-page-${p.pageNum}`}
          className="sheet-page bg-white text-black shadow-2xl relative flex flex-col justify-between overflow-hidden"
          style={{
            width: '893px',
            minHeight: '1263px',
            height: '1263px',
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
              <div className="px-8 pt-1 pb-1">
                {/* Purple Badge & Tech ID */}
                <div className="flex flex-col items-center justify-center my-1">
                  <span className="bg-[#3b3598] text-white font-extrabold text-[18px] tracking-wider px-6 py-0.5 uppercase font-['Montserrat',sans-serif] shadow-xs">
                    TECHNOLOGY BRIEF
                  </span>
                  <span className="text-[17px] font-bold text-black mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
                    Technology ID: {data.techId || 'Pending'}
                  </span>
                </div>

                {/* Green Title Banner */}
                <div
                  className="w-full py-2 px-6 my-2 text-center relative overflow-hidden"
                  style={{
                    backgroundColor: data.titleBannerBgColor || '#76cb3c'
                  }}
                >
                  <h1 className="text-[25px] font-black italic tracking-tight text-black font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
                    {data.title || 'Technology Title'}
                  </h1>
                </div>
              </div>
            )}
          </div>

          {/* MAIN CONTENT AREA: Grid with newspaper alignment */}
          <div className="flex-1 px-8 py-1 grid grid-cols-2 gap-x-8 gap-y-1 content-start">
            {p.sections.map(renderSection)}
          </div>

          {/* BOTTOM AREA: Footers */}
          <div className="w-full mt-auto">
            {/* Common Cyan Banner on all pages */}
            <div className="bg-[#52d1dc] text-center py-1.5 border-t border-b border-cyan-400">
              <span className="font-bold text-[17px] tracking-wide text-black uppercase font-['Montserrat',sans-serif]">
                Technology available for Licensing
              </span>
            </div>

            {/* LAST PAGE ONLY: 3-Column Contact Box */}
            {p.isLast && (
              <div className="px-8 py-3 bg-white">
                <div className="grid grid-cols-12 gap-3 items-center text-[15px] font-['Arial',sans-serif] leading-snug">
                  {/* Left Column: Officer Info */}
                  <div className="col-span-5 bg-[#e2edfd] p-3 rounded h-full flex flex-col justify-center">
                    <p className="font-bold text-black">Contact:</p>
                    <p className="font-bold text-black">{data.contactInfo.name}</p>
                    <p className="text-black">{data.contactInfo.title}</p>
                    <p className="text-black">{data.contactInfo.department}, {data.contactInfo.institution}</p>
                  </div>

                  {/* Center Column: IPR Logo */}
                  <div className="col-span-2 flex justify-center items-center">
                    <img
                      src="/assets/branding/ipr_cell_logo.png"
                      alt="IPR & TT Cell Logo"
                      className="max-h-20 w-auto object-contain"
                    />
                  </div>

                  {/* Right Column: Contact Details */}
                  <div className="col-span-5 bg-[#e2edfd] p-3 rounded h-full flex flex-col justify-center">
                    <p><span className="font-bold text-black">Email:</span> <a href={`mailto:${data.contactInfo.email}`} className="text-blue-800 hover:underline">{data.contactInfo.email}</a></p>
                    <p><span className="font-bold text-black">Phone No.:</span> {data.contactInfo.phoneOffice} (O)</p>
                    <p className="pl-20">: {data.contactInfo.phoneMobile} (M)</p>
                    <p><span className="font-bold text-black">Website:</span> <a href={data.contactInfo.website} target="_blank" rel="noreferrer" className="text-blue-800 hover:underline">{data.contactInfo.website}</a></p>
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
