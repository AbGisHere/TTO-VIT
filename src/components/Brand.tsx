import React from 'react';

/** Dark page header shared by the inner pages. */
export const PageBanner: React.FC<{
  tag: string;
  title: string;
  description?: React.ReactNode;
  right?: React.ReactNode;
}> = ({ tag, title, description, right }) => (
  <section className="bg-navy-950 text-white relative overflow-hidden">
    <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-wrap items-end justify-between gap-8">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-400">{tag}</p>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl mt-4 leading-tight">{title}</h1>
        {description && <p className="mt-4 text-navy-200 leading-relaxed">{description}</p>}
      </div>
      {right}
    </div>
  </section>
);
