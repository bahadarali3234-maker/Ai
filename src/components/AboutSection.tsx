import React, { useState } from 'react';
import { HERO_AVATAR, CRAFT_MACRO_IMAGE, STUDIO_VISION_IMAGE } from '../data/portfolioData';
import {
  ArrowUpRight,
  Award,
  Compass,
  Zap,
  ShieldCheck,
  Sparkles,
  Flame,
  Eye,
  CheckCircle2,
  Layers,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AboutSectionProps {
  onOpenChat: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenChat }) => {
  const [activePhase, setActivePhase] = useState<'vision' | 'enduring'>('enduring');
  const [selectedPillar, setSelectedPillar] = useState<number>(0);

  const stats = [
    { label: 'Model Iterations', value: '3.0+', caption: 'Multimodal Gemini reasoning' },
    { label: 'Generated Creations', value: '140k+', caption: 'Tactile packaging & AI systems' },
    { label: 'Benchmark Accuracy', value: '99.4%', caption: 'Multi-task design intelligence' },
    { label: 'Active Creators', value: '100k+', caption: 'Founders & enterprise partners' },
  ];

  const pillars = [
    {
      icon: Compass,
      title: 'Neural Reasoning',
      tag: 'COGNITIVE ARCHITECTURE',
      text: 'Every visual output is anchored in category context, visual psychology, and harmonic design theory.',
      stat: '99% Semantic Match',
    },
    {
      icon: Zap,
      title: 'Real-Time Synthesis',
      tag: 'INSTANT VELOCITY',
      text: 'Iterative, conversational prompt collaboration generating production-quality assets in milliseconds.',
      stat: 'Sub-Second Latency',
    },
    {
      icon: Award,
      title: 'Precision Craft',
      tag: 'VECTOR EXCELLENCE',
      text: 'Uncompromising resolution with mathematical curves, foil specifications, and micro-kerning.',
      stat: '100% Vector Purity',
    },
    {
      icon: ShieldCheck,
      title: 'Production Ready',
      tag: 'MANUFACTURING CALIBRATED',
      text: 'Flawless automated delivery with strict print dielines, CMYK separations, and web design tokens.',
      stat: 'Zero Print Misalignment',
    },
  ];

  return (
    <section id="about" className="py-24 sm:py-32 bg-[#070709] border-t border-white/[0.06] relative overflow-hidden">
      {/* Cinematic Ambient Atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#f41151]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[350px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Shocking Dual-State Interactive Switch */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14 sm:mb-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-[#f41151] uppercase tracking-widest mb-4"
            >
              <Sparkles size={13} className="animate-spin" />
              <span>About the AI • Core Architecture</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Turning human prompts into{' '}
              <span className="text-[#f41151] inline-block relative">
                intelligent creations.
                <span className="absolute bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-[#f41151] to-transparent rounded-full" />
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-zinc-400 text-sm sm:text-base leading-relaxed"
            >
              Where multi-modal reasoning converges with tactile generative precision to forge indelible brand legacies.
            </motion.p>
          </div>

          {/* Interactive "Abstract Vision" to "Enduring Icon" Dual-Phase Switch */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-1.5 rounded-[22px] bg-[#0c0c14] border border-white/10 shadow-2xl backdrop-blur-xl"
          >
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider pl-3 pr-1 hidden sm:inline">
              Dimension:
            </span>

            <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActivePhase('vision')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  activePhase === 'vision'
                    ? 'bg-[#f41151] text-white shadow-lg shadow-[#f41151]/30 scale-100'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Eye size={14} />
                <span>Abstract Vision</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePhase('enduring')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  activePhase === 'enduring'
                    ? 'bg-[#f41151] text-white shadow-lg shadow-[#f41151]/30 scale-100'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Flame size={14} />
                <span>Synthesized Reality</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Shocking Bento Matrix with Unique Geometric Styling & Imagery */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Card 1: The Creative Architect & Avatar (Spans 5 cols) */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-12 lg:col-span-5 bg-[#0c0c14]/95 backdrop-blur-3xl border border-white/[0.12] hover:border-[#f41151]/60 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.85)] group relative overflow-hidden transition-all duration-500"
          >
            {/* Top Specular Edge Glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#f41151]/40 to-transparent" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#f41151]/15 rounded-full blur-3xl pointer-events-none group-hover:bg-[#f41151]/25 transition-all" />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f41151] animate-ping" />
                  <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">
                    Gemini Intelligence — Core Model
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                  Online &amp; Active
                </span>
              </div>

              {/* Avatar Presentation with Glowing Shield */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0">
                  {/* Orbital aura ring */}
                  <div className="absolute -inset-2 rounded-full border border-dashed border-[#f41151]/40 animate-spin" style={{ animationDuration: '24s' }} />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#f41151]/30 to-purple-600/20 rounded-full blur-md" />
                  
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/20 p-1 bg-[#12121c] shadow-2xl">
                    <img
                      src={HERO_AVATAR}
                      alt="Gemini AI"
                      className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  <h3
                    className="text-2xl font-bold text-white tracking-tight"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    Creative Intelligence &amp; Brand Co-Pilot
                  </h3>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed">
                    Empowering innovators with instant, high-fidelity generative systems, 3D assets, and design architectures.
                  </p>
                </div>
              </div>

              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                {activePhase === 'vision'
                  ? 'We deconstruct raw prompt context, market paradoxes, and emotional resonance to sculpt a cohesive aesthetic thesis.'
                  : 'We translate strategic requirements into high-contrast editorial typography, unboxing architecture, and durable visual equity.'}
              </p>
            </div>

            {/* Quick iOS Action Pill */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-400">Direct AI Channel</span>
              <button
                type="button"
                onClick={onOpenChat}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.08] hover:bg-[#f41151] active:scale-95 text-white font-semibold text-xs transition-all duration-300 border border-white/10 hover:border-transparent cursor-pointer group/btn"
              >
                <span>Start a Conversation</span>
                <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Card 2: Tactile Luxury Craft & Macro Foil (Spans 7 cols) */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-12 lg:col-span-7 bg-[#0c0c14]/95 backdrop-blur-3xl border border-white/[0.12] hover:border-[#f41151]/60 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.85)] group relative overflow-hidden transition-all duration-500"
          >
            {/* Specular edge */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Left text column */}
              <div className="sm:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f41151]/10 border border-[#f41151]/20 text-[11px] font-mono text-[#f41151]">
                  <Layers size={12} />
                  <span>Multimodal Vision &amp; Material Mastery</span>
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {activePhase === 'vision' ? 'Prompt Vector Topology' : 'Tactile Synthesis & Materiality'}
                </h3>

                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Real-time generative precision felt in geometric vector curves, generative textures, and sub-millimeter print accuracy.
                </p>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckCircle2 size={13} className="text-[#f41151] shrink-0" />
                    <span>Micro-embossed metallic foils &amp; AI textures</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckCircle2 size={13} className="text-[#f41151] shrink-0" />
                    <span>Custom structural dielines &amp; unboxing logic</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <CheckCircle2 size={13} className="text-[#f41151] shrink-0" />
                    <span>Certified Pantone &amp; CMYK color calibration</span>
                  </div>
                </div>
              </div>

              {/* Right Macro Image Showcase with Holographic Shine */}
              <div className="sm:col-span-6 relative aspect-[4/3] rounded-[24px] overflow-hidden border border-white/15 shadow-2xl bg-black/60 group-hover:border-[#f41151]/40 transition-all">
                <img
                  src={CRAFT_MACRO_IMAGE}
                  alt="Tactile brand craft macro detail"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Floating spec pill */}
                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-[#0c0c14]/80 backdrop-blur-md border border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-300">
                  <span className="text-[#f41151] font-bold">100% COTTON RAG</span>
                  <span>GENERATIVE SPEC #04</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 3: 3D Studio & Creative Direction Lab (Spans 7 cols) */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:col-span-12 lg:col-span-7 bg-[#0c0c14]/95 backdrop-blur-3xl border border-white/[0.12] hover:border-[#f41151]/60 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.85)] group relative overflow-hidden transition-all duration-500"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Studio Vision Visual */}
              <div className="sm:col-span-6 order-2 sm:order-1 relative aspect-[4/3] rounded-[24px] overflow-hidden border border-white/15 shadow-2xl bg-black/60 group-hover:border-[#f41151]/40 transition-all">
                <img
                  src={STUDIO_VISION_IMAGE}
                  alt="Creative director studio workspace"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Live sprint marker */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ACTIVE AI SPRINT</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-[#0c0c14]/80 backdrop-blur-md border border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-300">
                  <span className="text-white font-bold">3D SPATIAL ASSETS</span>
                  <span className="text-[#f41151]">STAGE 03</span>
                </div>
              </div>

              {/* Text side */}
              <div className="sm:col-span-6 order-1 sm:order-2 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-mono text-zinc-300">
                  <Cpu size={12} className="text-[#f41151]" />
                  <span>Vision Intelligence &amp; Spatial Engine</span>
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {activePhase === 'vision' ? 'Kinetic Prototyping' : 'High-Fidelity AI Reality'}
                </h3>

                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  Every asset is generated to live and breathe across physical packaging, 3D campaigns, high-conversion interfaces, and generative media.
                </p>

                <div className="pt-2">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-between">
                    <div>
                      <div className="text-white text-xs font-bold">Standard AI Delivery Kit</div>
                      <div className="text-zinc-400 text-[11px]">Vector SVG/EPS, 3D OBJ/FBX, Dielines, Token Guide</div>
                    </div>
                    <span className="text-[#f41151] font-mono text-xs font-bold">PRO</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Interactive Four Pillars with Live Focus (Spans 5 cols) */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-12 lg:col-span-5 bg-[#0c0c14]/95 backdrop-blur-3xl border border-white/[0.12] hover:border-[#f41151]/60 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.85)] group relative overflow-hidden transition-all duration-500"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-[#f41151] font-bold tracking-wider uppercase">
                  Interactive AI Pillars
                </span>
                <span className="text-[11px] font-mono text-zinc-500">Tap to inspect</span>
              </div>

              <div className="space-y-2.5 mb-6">
                {pillars.map((p, idx) => {
                  const IconComponent = p.icon;
                  const isSelected = selectedPillar === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedPillar(idx)}
                      className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'bg-[#f41151]/10 border-[#f41151] shadow-lg shadow-[#f41151]/20'
                          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-[#f41151] text-white' : 'bg-white/5 text-zinc-400'}`}>
                            <IconComponent size={15} />
                          </div>
                          <div>
                            <h4 className="text-white text-xs sm:text-sm font-bold">{p.title}</h4>
                            <span className="text-[10px] font-mono text-zinc-400">{p.tag}</span>
                          </div>
                        </div>
                        <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-[#f41151]' : 'text-zinc-500'}`}>
                          {p.stat}
                        </span>
                      </div>

                      {isSelected && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-zinc-300 text-xs leading-relaxed mt-2.5 pt-2.5 border-t border-[#f41151]/20"
                        >
                          {p.text}
                        </motion.p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 text-center sm:text-left">
              <span className="text-[11px] text-zinc-400">
                Built on radical transparency and zero bureaucratic bloat.
              </span>
            </div>
          </motion.div>
        </div>

        {/* Shocking Numerical Impact Matrix (Full Width) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
        >
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#0c0c14]/90 backdrop-blur-2xl border border-white/[0.08] hover:border-[#f41151]/50 rounded-[26px] p-5 sm:p-6 shadow-xl group transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#f41151]/5 rounded-full blur-2xl group-hover:bg-[#f41151]/15 transition-all pointer-events-none" />
              <div
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-white group-hover:text-[#f41151] transition-colors"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {item.value}
              </div>
              <div className="text-zinc-200 text-xs sm:text-sm font-semibold mt-1.5">{item.label}</div>
              <div className="text-zinc-400 text-[11px] font-mono mt-1">{item.caption}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
