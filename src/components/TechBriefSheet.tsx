import React from 'react';
import { TechnologyBriefData, BriefSection, ContentBlock } from '../types/technologyBrief';

interface TechBriefSheetProps {
  data: TechnologyBriefData;
  scale?: number;
}

export const TechBriefSheet: React.FC<TechBriefSheetProps> = ({ data, scale = 1 }) => {
  const maxPage = Math.max(1, ...data.sections.map(s => s.page || 1));
  const pages = [];
  for (let i = 1; i <= maxPage; i++) {
    pages.push({
      pageNum: i,
      sections: data.sections.filter(s => (s.page || 1) === i),
      isLast: i === maxPage
    });
  }

  const renderBlock = (block: ContentBlock) => {
    switch (block.type) {
      case 'bullets':
        return (
          // Content in Arial MT Pro 12pt (16px, 23px line-height)
          <ul className="list-disc pl-5 space-y-1.5 text-[16px] leading-[23px] text-black font-['Arial',sans-serif] text-justify">
            {block.bulletPoints?.map((pt, i) => (
              <li key={i} className="pl-1">
                <span dangerouslySetInnerHTML={{ __html: pt.replace(/\n/g, '<br/>') }} />
              </li>
            ))}
          </ul>
        );

      case 'text':
        return (
          <div
            className="text-[16px] leading-[23px] text-black font-['Arial',sans-serif] text-justify space-y-2 whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
          />
        );

      case 'image':
      case 'text-with-image':
      case 'two-images':
        const isHeightFit = block.imageFit === 'height';
        const imgClass = isHeightFit
          ? 'max-h-56 w-auto object-contain'
          : 'w-full h-auto object-contain';

        const zoomScale = (block.imageZoom || 100) / 100;
        const zoomStyle = zoomScale !== 1
          ? { transform: `scale(${zoomScale})`, transformOrigin: 'center' }
          : undefined;

        return (
          <div className="space-y-1 my-1 w-full overflow-hidden">
            {/* Only render title if explicitly non-empty */}
            {block.title && block.title.trim() !== '' && (
              <div className="text-center my-0.5">
                <span className="text-[#a51c1c] font-serif font-bold text-[15px] tracking-tight border-b-2 border-sky-600 pb-0.5 inline-block">
                  {block.title}
                </span>
              </div>
            )}

            {block.content && block.content.trim() !== '' && (
              <div
                className="text-[16px] text-justify leading-[23px] text-black font-['Arial',sans-serif]"
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            )}

            <div className="flex flex-col items-center justify-center gap-2 w-full">
              {block.imageUrl && (
                <div className="w-full flex justify-center bg-white overflow-hidden p-0.5">
                  <img
                    src={block.imageUrl}
                    alt="Figure"
                    className={imgClass}
                    style={zoomStyle}
                  />
                </div>
              )}
              {block.secondaryImageUrl && (
                <div className="w-full flex justify-center bg-white overflow-hidden p-0.5">
                  <img
                    src={block.secondaryImageUrl}
                    alt="Secondary figure"
                    className={imgClass}
                    style={zoomStyle}
                  />
                </div>
              )}
            </div>

            {/* Only render caption if explicitly non-empty */}
            {block.imageCaption && block.imageCaption.trim() !== '' && (
              <p className="text-[12px] text-center text-slate-600 italic">{block.imageCaption}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderSection = (sec: BriefSection) => {
    return (
      <div key={sec.id} className="flex flex-col mb-2.5 w-full">
        {/* Headings in Canva Sans 14pt (Bold) ~ 18.5px */}
        <div
          className="py-1 px-3 mb-1.5 text-center font-bold text-[18.5px] uppercase tracking-wide font-['Montserrat',sans-serif]"
          style={{
            backgroundColor: sec.headerBgColor || '#52d1dc',
            color: sec.headerTextColor || '#000000'
          }}
        >
          {sec.title}
        </div>

        {/* Section Content */}
        <div className="space-y-1 px-1">
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
      {pages.map((p) => {
        const fullWidthSections = p.sections.filter(s => s.columnSpan === 2);
        const columnSections = p.sections.filter(s => s.columnSpan !== 2);

        // Top full-width (e.g. Technical USP on Page 2)
        const topFullSections = fullWidthSections.filter((_, idx) => p.pageNum > 1 && idx === 0);
        // Bottom full-width (e.g. Technology Summary on Page 1, Research Lab on Page 2)
        const bottomFullSections = fullWidthSections.filter((_, idx) => p.pageNum === 1 || idx > 0);

        const leftSections = columnSections.filter(s => s.columnPosition === 'left' || (!s.columnPosition && columnSections.indexOf(s) % 2 === 0));
        const rightSections = columnSections.filter(s => s.columnPosition === 'right' || (!s.columnPosition && columnSections.indexOf(s) % 2 !== 0));

        return (
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
              <div className="w-full relative">
                <img
                  src="/assets/branding/tto_header.png"
                  alt="VIT TTO Header"
                  className="w-full h-auto block object-contain"
                />
              </div>

              {/* PAGE 1 ONLY: Tech Brief Banner & Full-Width Green Bar with Peeking Hexagon */}
              {p.pageNum === 1 && (
                <div className="w-full pt-1 pb-1">
                  <div className="flex flex-col items-center justify-center my-1 px-8">
                    <span className="bg-[#3b3598] text-white font-extrabold text-[18px] tracking-wider px-6 py-0.5 uppercase font-['Montserrat',sans-serif] shadow-xs">
                      TECHNOLOGY BRIEF
                    </span>
                    <span className="text-[17px] font-bold text-black mt-1 font-['Plus_Jakarta_Sans',sans-serif]">
                      Technology ID: {data.techId || 'Pending'}
                    </span>
                  </div>

                  {/* Green Title Banner: Extends throughout the entire width of the page with peeking hexagon */}
                  <div className="w-full relative my-2 overflow-visible">
                    {/* Teal Hexagon peeking above and below on the left */}
                    <svg
                      className="absolute left-10 -top-3.5 w-28 h-24 pointer-events-none z-0"
                      viewBox="0 0 100 100"
                      fill="#2fa4b2"
                    >
                      <polygon points="50,0 93,25 93,75 50,100 7,75 7,25" />
                    </svg>

                    {/* Green Bar spanning 100% of page width */}
                    <div
                      className="w-full py-2.5 px-8 text-center relative z-10"
                      style={{
                        backgroundColor: data.titleBannerBgColor || '#76cb3c'
                      }}
                    >
                      <h1 className="text-[25px] font-black italic tracking-tight text-black font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
                        {data.title || 'Technology Title'}
                      </h1>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* MAIN CONTENT AREA: Auto-optimized 2-column flex layout */}
            <div className="flex-1 px-8 py-1 flex flex-col justify-between overflow-hidden">
              {topFullSections.map(renderSection)}

              {columnSections.length > 0 && (
                <div className="grid grid-cols-2 gap-x-8 items-start my-auto">
                  <div className="flex flex-col space-y-2">
                    {leftSections.map(renderSection)}
                  </div>

                  <div className="flex flex-col space-y-2">
                    {rightSections.map(renderSection)}
                  </div>
                </div>
              )}

              {bottomFullSections.map(renderSection)}
            </div>

            {/* BOTTOM AREA: Footers */}
            <div className="w-full mt-auto">
              <div className="bg-[#52d1dc] text-center py-1.5 border-t border-b border-cyan-400">
                <span className="font-bold text-[18.5px] tracking-wide text-black uppercase font-['Montserrat',sans-serif]">
                  Technology available for Licensing
                </span>
              </div>

              {/* LAST PAGE ONLY: 3-Column Contact Box */}
              {p.isLast && (
                <div className="px-8 py-3 bg-white">
                  <div className="grid grid-cols-12 gap-3 items-center text-[15px] font-['Arial',sans-serif] leading-snug">
                    <div className="col-span-5 bg-[#e2edfd] p-3 rounded h-full flex flex-col justify-center">
                      <p className="font-bold text-black">Contact:</p>
                      <p className="font-bold text-black">{data.contactInfo.name}</p>
                      <p className="text-black">{data.contactInfo.title}</p>
                      <p className="text-black">{data.contactInfo.department}, {data.contactInfo.institution}</p>
                    </div>

                    <div className="col-span-2 flex justify-center items-center">
                      <img
                        src="/assets/branding/ipr_cell_logo.png"
                        alt="IPR & TT Cell Logo"
                        className="max-h-20 w-auto object-contain"
                      />
                    </div>

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
        );
      })}
    </div>
  );
};
