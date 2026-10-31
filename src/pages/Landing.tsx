import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { ArrowRight, ArrowUpRight, Lock, LogIn, Mail, Phone, Globe } from 'lucide-react';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { canSubmitToTto } from '../utils/access';
import { TechnologyBriefData } from '../types/technologyBrief';
import { problemStatements } from '../data/problemStatements';
import BlurText from '../components/reactbits/BlurText';
import CountUp from '../components/reactbits/CountUp';
import SpotlightCard from '../components/reactbits/SpotlightCard';

/** Fades a block in the first time it scrolls into view. */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return setShown(true);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`transition-all duration-700 ease-out ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>
      {children}
    </div>
  );
};

const publicSummary = (b: TechnologyBriefData): string => {
  if (b.summary) return b.summary;
  const text = b.sections.flatMap(s => s.blocks).find(bl => bl.content)?.content?.replace(/<[^>]+>/g, '') ?? '';
  return text.length > 160 ? text.slice(0, 160).trimEnd() + '…' : text;
};

/* An idea moving from the laboratory to the market. */
const stages = [
  { x: 70, y: 330, label: 'Research' },
  { x: 215, y: 215, label: 'Protect' },
  { x: 380, y: 250, label: 'License' },
  { x: 530, y: 95, label: 'Market' }
];
const journey = 'M70 330 C 130 330, 150 215, 215 215 S 320 250, 380 250 S 470 95, 530 95';

const TransferGraphic: React.FC = () => (
  <svg viewBox="0 0 600 420" className="w-full h-auto" role="img" aria-label="An idea moving from research, through protection and licensing, to the market">
    <path d={journey} fill="none" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="2" />
    <path d={journey} fill="none" stroke="#5ce1e6" strokeWidth="2" strokeDasharray="6 10" className="tto-flow" />
    {stages.map((s, i) => (
      <g key={s.label}>
        <circle cx={s.x} cy={s.y} r="16" fill="none" stroke="#5ce1e6" strokeOpacity="0.5" className="tto-pulse" style={{ animationDelay: `${i * 0.6}s`, transformOrigin: `${s.x}px ${s.y}px` }} />
        <circle cx={s.x} cy={s.y} r="8" fill="#100e3a" stroke="#5ce1e6" strokeWidth="2.5" />
        <text x={s.x} y={s.y + (i % 2 === 0 ? 38 : -26)} textAnchor="middle" fill="#e8e7f5" fontSize="13" letterSpacing="3" fontWeight="600">
          {s.label.toUpperCase()}
        </text>
      </g>
    ))}
    <circle r="6" fill="#ffffff">
      <animateMotion dur="7s" repeatCount="indefinite" path={journey} />
    </circle>
  </svg>
);

const steps = [
  ['01', 'Assess', 'Each invention disclosure is reviewed for novelty, readiness and market fit.'],
  ['02', 'Protect', 'Patents, designs and copyrights are filed to secure the intellectual property.'],
  ['03', 'Partner', 'Technologies are matched with companies, startups and funding agencies.'],
  ['04', 'License', 'Agreements are structured so the technology reaches industry and the market.']
];

const trlBands = [
  ['Discovery', '1-3', 'Basic principles observed, concept formulated, proof of concept in the lab.'],
  ['Development', '4-6', 'Prototype validated in the lab and in relevant environments.'],
  ['Deployment', '7-9', 'Demonstrated in operational conditions and proven in the field.']
];

export const Landing: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();
  const mayContribute = canSubmitToTto(user);
  const [briefs, setBriefs] = useState<TechnologyBriefData[]>([]);
  const signIn = () => signInWithGoogle().catch(() => undefined);

  useEffect(() => {
    getDocs(query(collection(db, 'technology_briefs'), orderBy('createdAt', 'desc'), limit(3)))
      .then(snap => {
        setBriefs(snap.docs.map(d => ({ id: d.id, ...(d.data() as TechnologyBriefData) })));
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-navy-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 lg:pt-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <p className="text-center text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-400">
              Technology Transfer Office · VIT
            </p>
            <h1 className="font-display font-extrabold text-5xl sm:text-6xl leading-[1.05] mt-5">
              <BlurText text="Where research" animateBy="words" trigger="load" className="justify-start" />
              <span className="flex"><BlurText text="becomes impact." animateBy="words" trigger="load" delay={250} className="justify-start text-gold-400" /></span>
            </h1>
            <p className="mt-6 text-navy-200 text-lg max-w-lg leading-relaxed">
              We protect, license and commercialise the inventions created at VIT, and bring industry's real problems to the people best placed to solve them.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/tb" className="group inline-flex items-center gap-2 bg-gold-400 hover:bg-gold-100 text-navy-950 font-semibold px-6 py-3 rounded-full transition">
                Explore technologies <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {mayContribute ? (
                <Link to="/problem-statements" className="inline-flex items-center gap-2 border border-white/25 hover:bg-white/10 font-semibold px-6 py-3 rounded-full transition">
                  Problem statements
                </Link>
              ) : !user ? (
                <button onClick={signIn} className="inline-flex items-center gap-2 border border-white/25 hover:bg-white/10 font-semibold px-6 py-3 rounded-full transition">
                  <LogIn className="w-4 h-4" /> Sign in
                </button>
              ) : null}
            </div>
          </div>
          <div className="lg:col-span-6 hidden lg:block">
            <TransferGraphic />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 grid grid-cols-3 gap-8 border-t border-white/10 pt-8">
          {[
            [problemStatements.length, 'Industry problem statements'],
            [briefs.length, briefs.length === 1 ? 'Technology available' : 'Technologies available'],
            [9, 'Readiness levels tracked']
          ].map(([n, label]) => (
            <div key={label as string}>
              <CountUp to={n as number} className="font-display text-4xl sm:text-5xl font-extrabold text-gold-400" />
              <p className="mt-1 text-xs sm:text-sm text-navy-200">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Reveal className="grid lg:grid-cols-12 gap-8">
          <h2 className="lg:col-span-5 font-display text-4xl font-extrabold text-navy-900 leading-tight">
            A university's best work shouldn't stay on the shelf.
          </h2>
          <p className="lg:col-span-6 lg:col-start-7 text-slate-600 text-lg leading-relaxed">
            Technology transfer moves knowledge created in a university into products, processes and services people use. The IPR &amp; TT Cell handles every stage in between.
          </p>
        </Reveal>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-navy-100 border border-navy-100 rounded-2xl overflow-hidden">
          {steps.map(([n, t, d], i) => (
            <Reveal key={n} delay={i * 90} className="bg-white p-7 group hover:bg-navy-50 transition-colors">
              <span className="font-display text-5xl font-extrabold text-navy-100 group-hover:text-gold-400 transition-colors">{n}</span>
              <h3 className="mt-6 font-display text-xl font-bold text-navy-900">{t}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TRL */}
      <section className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Reveal>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-400">Technology Readiness Level</p>
            <h2 className="font-display text-4xl font-extrabold mt-3 max-w-2xl">Every brief tells you how close a technology is to market.</h2>
          </Reveal>
          <Reveal delay={100} className="mt-12">
            <div className="grid grid-cols-9 gap-1.5">
              {Array.from({ length: 9 }, (_, n) => (
                <div key={n} className="h-14 rounded-md flex items-end justify-center pb-1.5 text-sm font-semibold border border-white/10" style={{ background: `rgba(92,225,230,${0.08 + n * 0.1})`, color: n > 3 ? '#100e3a' : '#e8e7f5' }}>
                  {n + 1}
                </div>
              ))}
            </div>
            <div className="mt-6 grid md:grid-cols-3 gap-6">
              {trlBands.map(([name, range, text]) => (
                <div key={name} className="border-t border-gold-400/60 pt-4">
                  <p className="font-display text-lg font-bold">{name} <span className="text-gold-400 text-sm font-sans font-medium">TRL {range}</span></p>
                  <p className="mt-1 text-sm text-navy-200 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Reveal className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-gold-600">Available for licensing</p>
            <h2 className="font-display text-4xl font-extrabold text-navy-900 mt-3">Featured technologies</h2>
          </div>
          <Link to="/tb" className="inline-flex items-center gap-1.5 font-semibold text-navy-700 hover:text-gold-600">
            View all <ArrowUpRight className="w-4 h-4" />
          </Link>
        </Reveal>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {briefs.map((b, i) => (
            <Reveal key={b.techId} delay={i * 100}>
              <SpotlightCard theme="light" spotlightColor="rgba(92,225,230,0.35)" className="h-full !rounded-2xl !p-0">
                <Link to="/tb" className="block h-full p-7">
                  <div className="h-1 w-12 bg-gold-400 rounded-full" />
                  <h3 className="mt-5 font-display text-xl font-bold text-navy-900 leading-snug">{b.title}</h3>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-4">{publicSummary(b)}</p>
                  <p className="mt-6 text-xs font-semibold text-navy-700 inline-flex items-center gap-1.5">
                    {user ? 'Read full brief' : (<><Lock className="w-3.5 h-3.5" /> Sign in for full details</>)}
                  </p>
                </Link>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Participate */}
      <section className="bg-navy-50 border-y border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Reveal><h2 className="font-display text-4xl font-extrabold text-navy-900">Three ways in</h2></Reveal>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              ['Browse technologies', 'Open to all', 'See what VIT has to license. Sign in to read each brief in full.', '/tb', 'Open the catalogue'],
              ['Industry problem statements', 'VIT accounts', 'Real challenges posted by companies. Browse them and pick one to solve.', '/problem-statements', 'See problem statements'],
              ['Submit an idea', 'VIT accounts', 'Put a promising idea, or a solution to an industry problem, in front of the office.', '/submit', 'Submit an idea']
            ].map(([t, tag, d, to, cta], i) => (
              <Reveal key={t} delay={i * 100}>
                <Link to={to} className="group block h-full bg-white rounded-2xl p-7 border border-navy-100 hover:bg-navy-900 hover:border-navy-900 transition-colors">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-slate-500 group-hover:text-navy-200 border border-current rounded-full px-2.5 py-1">{tag}</span>
                  <h3 className="mt-8 font-display text-2xl font-bold text-navy-900 group-hover:text-white">{t}</h3>
                  <p className="mt-2 text-sm text-slate-600 group-hover:text-navy-200 leading-relaxed">{d}</p>
                  <p className="mt-6 text-sm font-semibold text-navy-700 group-hover:text-gold-400 inline-flex items-center gap-1.5">
                    {cta} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-navy-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-8 items-center text-sm">
          <div>
            <p className="font-display text-xl font-bold text-white">Technology Transfer Office</p>
            <p className="mt-1">IP &amp; TT Cell, Vellore Institute of Technology</p>
            <p className="mt-4 text-white">Mr. Manish Kumar</p>
            <p>Sr. Technology Transfer Officer</p>
          </div>
          <div className="mx-auto bg-white rounded-xl p-3">
            <img src="/assets/branding/ipr_cell_logo_full.png" alt="IPR & TT Cell, VIT Vellore" className="h-24 w-auto" />
          </div>
          <div className="space-y-2 md:justify-self-end">
            <a href="mailto:manish.k@vit.ac.in" className="flex items-center gap-2 hover:text-white"><Mail className="w-4 h-4 text-gold-400" /> manish.k@vit.ac.in</a>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold-400" /> +91 416 220 4330 (O)</p>
            <a href="https://vit.ac.in/iprcell" className="flex items-center gap-2 hover:text-white"><Globe className="w-4 h-4 text-gold-400" /> vit.ac.in/iprcell</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
