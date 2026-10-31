import React from 'react';
import { BriefWatermark } from '../types/technologyBrief';

// Rubber-stamp style status mark ("License Terminated", "Termination Notice Issued", …).
// `page` sits across an A4 sheet and is captured in the PDF; `card` is the small catalog badge.
export const WatermarkStamp: React.FC<{ watermark?: BriefWatermark; variant: 'page' | 'card' }> = ({ watermark, variant }) => {
  if (!watermark?.enabled || !watermark.text.trim()) return null;
  const page = variant === 'page';

  return (
    <div
      aria-label={`Status: ${watermark.text}`}
      className="pointer-events-none select-none font-['Arial',sans-serif] font-bold text-center leading-tight whitespace-pre-line"
      style={{
        color: watermark.color,
        border: `${page ? 6 : 2.5}px solid ${watermark.color}`,
        borderRadius: page ? 10 : 5,
        padding: page ? '14px 32px' : '4px 10px',
        fontSize: page ? 54 : 15,
        opacity: 0.8,
        transform: 'rotate(-28deg)',
        maxWidth: page ? 720 : 220
      }}
    >
      {watermark.text}
    </div>
  );
};
