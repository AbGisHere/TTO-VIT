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
          // Content in Arial MT Pro 12pt (16px, 24px line pitch, text-justify)
          // Uses explicit solid round bullet elements instead of CSS ::marker to ensure crisp circular bullets in all PDF engines
          <ul className="space-y-1.5 text-[16px] leading-[24px] text-black font-['Arial',sans-serif] text-justify list-none p-0 m-0">
            {block.bulletPoints?.map((pt, i) => (
              <li key={i} className="flex items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-black mt-[9px] mr-2.5 shrink-0 inline-block" />
                <div className="flex-1" dangerouslySetInnerHTML={{ __html: pt.replace(/\n/g, '<br/>') }} />
              </li>
            ))}
          </ul>
        );

      case 'text':
        return (
          <div
            className="text-[16px] leading-[24px] text-black font-['Arial',sans-serif] text-justify space-y-2 whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
          />
        );

      case 'image':
      case 'text-with-image':
      case 'two-images':
        const placeholderHeight = block.placeholderHeight;
        const containerStyle: React.CSSProperties = {
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          ...(placeholderHeight && placeholderHeight > 0
            ? { height: `${placeholderHeight}px` }
            : { height: 'auto' })
        };

        const zoomScale = (block.imageZoom || 100) / 100;
        const zoomStyle: React.CSSProperties = zoomScale !== 1
          ? { transform: `scale(${zoomScale})`, transformOrigin: 'center' }
          : {};

        let imgClass = 'w-full h-auto object-contain';
        if (block.imageFit === 'height') {
          imgClass = 'h-full w-auto max-w-full object-contain';
        } else if (block.imageFit === 'cover') {
          imgClass = 'w-full h-full object-cover';
        } else if (block.imageFit === 'contain') {
          imgClass = 'w-full h-full object-contain';
        } else {
          // default 'width'
          imgClass = 'w-full h-auto object-contain';
        }

        return (
          <div className="w-full">
            {/* Render figure title ONLY if explicitly non-empty */}
            {block.title && block.title.trim() !== '' && (
              <div className="text-center mb-1">
                <span className="text-[#ff3131] font-bold text-[15px] border-b border-[#028fa1] pb-0.5 inline-block">
                  {block.title}
                </span>
              </div>
            )}

            {block.content && block.content.trim() !== '' && (
              <div
                className="text-[16px] text-justify leading-[24px] text-black font-['Arial',sans-serif] mb-1.5"
                dangerouslySetInnerHTML={{ __html: block.content }}
              />
            )}

            <div style={containerStyle} className="bg-white">
              {block.imageUrl && (
                <img
                  src={block.imageUrl}
                  alt={block.title || 'Figure'}
                  className={imgClass}
                  style={zoomStyle}
                />
              )}
              {block.secondaryImageUrl && (
                <img
                  src={block.secondaryImageUrl}
                  alt="Secondary figure"
                  className={imgClass}
                  style={zoomStyle}
                />
              )}
            </div>

            {/* Render caption ONLY if explicitly non-empty */}
            {block.imageCaption && block.imageCaption.trim() !== '' && (
              <p className="text-[12px] text-center text-slate-600 italic mt-1">{block.imageCaption}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderSection = (sec: BriefSection) => {
    return (
      <div key={sec.id} className="flex flex-col w-full">
        {/* Section Heading in Canva Sans 14pt (Bold) ~ 18.6px Title Case */}
        <div
          className="py-1 px-3 mb-2 text-center font-bold text-[18.6px] tracking-normal font-['Montserrat',sans-serif]"
          style={{
            backgroundColor: sec.headerBgColor || '#5ce1e6',
            color: sec.headerTextColor || '#000000'
          }}
        >
          {sec.title}
        </div>

        {/* Section Content */}
        <div className="px-0.5">
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

        // Exact uniform vertical gap constants matching Canva
        const sectionGapClass = p.pageNum === 1 ? 'space-y-[22px]' : 'space-y-[14px]';
        const interBlockGap = p.pageNum === 1 ? 'mt-[22px]' : 'mt-[14px]';

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
                <div className="w-full pt-1">
                  <div className="flex flex-col items-center justify-center mb-1">
                    <span className="bg-[#4f22c5] text-white font-bold text-[16px] tracking-wide px-7 py-1 uppercase font-['Montserrat',sans-serif]">
                      TECHNOLOGY BRIEF
                    </span>
                    <span className="text-[16px] font-medium text-black mt-1 font-['Arial',sans-serif]">
                      Technology ID: {data.techId || 'Pending'}
                    </span>
                  </div>

                  {/* Green Title Banner: Spans 100% full-width with peeking hexagon */}
                  <div className="w-full relative my-2 overflow-visible">
                    {/* Canva Teal Hexagon peeking symmetrically above and below the green bar on the left */}
                    <svg
                      className="absolute left-[36px] -top-[18px] w-[75px] h-[86px] pointer-events-none z-0"
                      viewBox="0 0 100 115"
                      preserveAspectRatio="none"
                    >
                      <polygon points="50,2 96,28 96,86 50,113 4,86 4,28" fill="#028fa1" />
                    </svg>

                    {/* Green Bar spanning 100% of page width */}
                    <div
                      className="w-full py-2.5 px-8 text-center relative z-10"
                      style={{
                        backgroundColor: data.titleBannerBgColor || '#7ed957'
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

            {/* MAIN CONTENT AREA: Clean, uniform gap spacing between all sections without stretching */}
            <div className="flex-1 px-[36px] pt-2 pb-1 flex flex-col justify-start overflow-hidden">
              {/* Top full width sections (e.g. Technical USP on Page 2) */}
              {topFullSections.map(s => (
                <div key={s.id} className="w-full mb-[14px]">
                  {renderSection(s)}
                </div>
              ))}

              {/* Two Column Grid */}
              {columnSections.length > 0 && (
                <div className="grid grid-cols-2 gap-x-[38px] items-start w-full">
                  <div className={`flex flex-col ${sectionGapClass}`}>
                    {leftSections.map(renderSection)}
                  </div>

                  <div className={`flex flex-col ${sectionGapClass}`}>
                    {rightSections.map(renderSection)}
                  </div>
                </div>
              )}

              {/* Bottom full width sections (e.g. Technology Summary on Page 1, Research Lab on Page 2) */}
              {bottomFullSections.map(s => (
                <div key={s.id} className={`w-full ${interBlockGap}`}>
                  {renderSection(s)}
                </div>
              ))}
            </div>

            {/* BOTTOM AREA: Footers */}
            <div className="w-full mt-auto">
              <div className="bg-[#5ce1e6] text-center py-2">
                <span className="font-bold text-[18.6px] tracking-wide text-black font-['Montserrat',sans-serif]">
                  Technology available for Licensing
                </span>
              </div>

              {/* LAST PAGE ONLY: 3-Column Contact Box */}
              {p.isLast && (
                <div className="px-[36px] py-3 bg-white">
                  <div className="grid grid-cols-12 gap-3 items-center text-[15px] font-['Arial',sans-serif] leading-snug">
                    <div className="col-span-5 bg-[#e1edfe] p-3 rounded h-full flex flex-col justify-center">
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

                    <div className="col-span-5 bg-[#e1edfe] p-3 rounded h-full flex flex-col justify-center">
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
