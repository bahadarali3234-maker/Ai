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
import { useTheme } from '../context/ThemeContext';

interface AboutSectionProps {
  onOpenChat: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenChat }) => {
  const [activePhase, setActivePhase] = useState<'vision' | 'enduring'>('enduring');
  const [selectedPillar, setSelectedPillar] = useState<number>(0);
  const { theme } = useTheme();
  const isLight = theme === 'light';

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
    <section
      id="about"
      className="py-24 sm:py-32 relative overflow-hidden transition-colors duration-380 border-t"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Cinematic Ambient Atmosphere */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[450px] rounded-full blur-[160px] pointer-events-none transition-all duration-500"
        style={{
          backgroundColor: isLight ? 'rgba(77, 163, 255, 0.12)' : 'rgba(255, 23, 68, 0.12)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Shocking Dual-State Interactive Switch */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14 sm:mb-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono uppercase tracking-widest mb-4 transition-colors"
              style={{
                backgroundColor: 'var(--surface-soft)',
                borderColor: 'var(--border)',
                color: 'var(--primary)',
              }}
            >
              <Sparkles size={13} className="animate-spin" />
              <span>About the AI • Core Architecture</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] transition-colors"
              style={{
                fontFamily: "'Syne', sans-serif",
                color: 'var(--text)',
              }}
            >
              Turning human prompts into{' '}
              <span className="inline-block relative" style={{ color: 'var(--primary)' }}>
                intelligent creations.
                <span
                  className="absolute bottom-1 left-0 right-0 h-1 rounded-full opacity-60"
                  style={{
                    background: 'linear-gradient(to right, var(--primary), transparent)',
                  }}
                />
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-sm sm:text-base leading-relaxed transition-colors"
              style={{ color: 'var(--text-secondary)' }}
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
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-1.5 rounded-[22px] border shadow-2xl backdrop-blur-xl transition-all"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: isLight
                ? '0 8px 24px rgba(71, 105, 135, 0.10)'
                : '0 8px 30px rgba(0,0,0,0.85)',
            }}
          >
            <span
              className="text-[11px] font-mono uppercase tracking-wider pl-3 pr-1 hidden sm:inline"
              style={{ color: 'var(--text-secondary)' }}
            >
              Dimension:
            </span>

            <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActivePhase('vision')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  activePhase === 'vision'
                    ? 'theme-button-primary shadow-lg'
                    : 'hover:bg-white/[0.04]'
                }`}
                style={{
                  color: activePhase === 'vision' ? '#ffffff' : 'var(--text-secondary)',
                }}
              >
                <Eye size={14} />
                <span>Abstract Vision</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePhase('enduring')}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  activePhase === 'enduring'
                    ? 'theme-button-primary shadow-lg'
                    : 'hover:bg-white/[0.04]'
                }`}
                style={{
                  color: activePhase === 'enduring' ? '#ffffff' : 'var(--text-secondary)',
                }}
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
            className="md:col-span-12 lg:col-span-5 backdrop-blur-3xl border rounded-[32px] p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: isLight
                ? '0 10px 30px rgba(71, 105, 135, 0.10), -6px -6px 20px rgba(255, 255, 255, 0.95)'
                : '0 20px 50px rgba(0, 0, 0, 0.85)',
            }}
          >
            {/* Top Specular Edge Glow */}
            <div
              className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all"
              style={{
                backgroundColor: isLight ? 'rgba(77, 163, 255, 0.14)' : 'rgba(255, 23, 68, 0.14)',
              }}
            />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full animate-ping"
                    style={{ backgroundColor: 'var(--primary)' }}
                  />
                  <span
                    className="text-xs font-mono font-bold tracking-wider uppercase"
                    style={{ color: 'var(--text)' }}
                  >
                    Gemini Intelligence — Core Model
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
                  Online &amp; Active
                </span>
              </div>

              {/* Avatar Presentation with Glowing Shield */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0">
                  <div
                    className="absolute -inset-2 rounded-full border border-dashed animate-spin opacity-50"
                    style={{ borderColor: 'var(--primary)', animationDuration: '24s' }}
                  />
                  <div
                    className="absolute inset-0 rounded-full blur-md opacity-40"
                    style={{ backgroundColor: 'var(--primary)' }}
                  />

                  <div
                    className="relative w-full h-full rounded-full overflow-hidden border-2 p-1 shadow-2xl"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--surface-soft)',
                    }}
                  >
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
                    className="text-2xl font-bold tracking-tight transition-colors"
                    style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text)' }}
                  >
                    Creative Intelligence &amp; Brand Co-Pilot
                  </h3>
                  <p
                    className="text-xs sm:text-sm mt-2 leading-relaxed transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Empowering innovators with instant, high-fidelity generative systems, 3D assets, and design architectures.
                  </p>
                </div>
              </div>

              <p
                className="text-xs sm:text-sm leading-relaxed mb-6 font-normal transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {activePhase === 'vision'
                  ? 'We deconstruct raw prompt context, market paradoxes, and emotional resonance to sculpt a cohesive aesthetic thesis.'
                  : 'We translate strategic requirements into high-contrast editorial typography, unboxing architecture, and durable visual equity.'}
              </p>
            </div>

            {/* Quick iOS Action Pill */}
            <div
              className="pt-4 border-t flex items-center justify-between"
              style={{ borderColor: 'var(--border)' }}
            >
              <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                Direct AI Channel
              </span>
              <button
                type="button"
                onClick={onOpenChat}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-xs transition-all duration-300 cursor-pointer group/btn theme-button-primary"
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
            className="md:col-span-12 lg:col-span-7 backdrop-blur-3xl border rounded-[32px] p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: isLight
                ? '0 10px 30px rgba(71, 105, 135, 0.10), -6px -6px 20px rgba(255, 255, 255, 0.95)'
                : '0 20px 50px rgba(0, 0, 0, 0.85)',
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Left text column */}
              <div className="sm:col-span-6 space-y-4">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono"
                  style={{
                    backgroundColor: 'var(--surface-soft)',
                    borderColor: 'var(--border)',
                    color: 'var(--primary)',
                  }}
                >
                  <Layers size={12} />
                  <span>Multimodal Vision &amp; Material Mastery</span>
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight transition-colors"
                  style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text)' }}
                >
                  {activePhase === 'vision' ? 'Prompt Vector Topology' : 'Tactile Synthesis & Materiality'}
                </h3>

                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Real-time generative precision felt in geometric vector curves, generative textures, and sub-millimeter print accuracy.
                </p>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--primary)' }} className="shrink-0" />
                    <span>Micro-embossed metallic foils &amp; AI textures</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--primary)' }} className="shrink-0" />
                    <span>Custom structural dielines &amp; unboxing logic</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--primary)' }} className="shrink-0" />
                    <span>Certified Pantone &amp; CMYK color calibration</span>
                  </div>
                </div>
              </div>

              {/* Right Macro Image Showcase */}
              <div
                className="sm:col-span-6 relative aspect-[4/3] rounded-[24px] overflow-hidden border shadow-2xl"
                style={{
                  backgroundColor: 'var(--surface-soft)',
                  borderColor: 'var(--border)',
                }}
              >
                <img
                  src={CRAFT_MACRO_IMAGE}
                  alt="Tactile brand craft macro detail"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: isLight
                      ? 'linear-gradient(to top, rgba(255,255,255,0.7), transparent)'
                      : 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  }}
                />

                {/* Floating spec pill */}
                <div
                  className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl backdrop-blur-md border flex items-center justify-between text-[11px] font-mono"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  <span style={{ color: 'var(--primary)' }} className="font-bold">100% COTTON RAG</span>
                  <span style={{ color: 'var(--text-secondary)' }}>GENERATIVE SPEC #04</span>
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
            className="md:col-span-12 lg:col-span-7 backdrop-blur-3xl border rounded-[32px] p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: isLight
                ? '0 10px 30px rgba(71, 105, 135, 0.10), -6px -6px 20px rgba(255, 255, 255, 0.95)'
                : '0 20px 50px rgba(0, 0, 0, 0.85)',
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              {/* Studio Vision Visual */}
              <div
                className="sm:col-span-6 order-2 sm:order-1 relative aspect-[4/3] rounded-[24px] overflow-hidden border shadow-2xl"
                style={{
                  backgroundColor: 'var(--surface-soft)',
                  borderColor: 'var(--border)',
                }}
              >
                <img
                  src={STUDIO_VISION_IMAGE}
                  alt="Creative director studio workspace"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: isLight
                      ? 'linear-gradient(to top, rgba(255,255,255,0.7), transparent)'
                      : 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  }}
                />

                {/* Live sprint marker */}
                <div
                  className="absolute top-3 left-3 px-3 py-1 rounded-full backdrop-blur-md border text-[10px] font-mono text-emerald-500 flex items-center gap-1.5"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>ACTIVE AI SPRINT</span>
                </div>

                <div
                  className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl backdrop-blur-md border flex items-center justify-between text-[11px] font-mono"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <span className="font-bold" style={{ color: 'var(--text)' }}>3D SPATIAL ASSETS</span>
                  <span style={{ color: 'var(--primary)' }}>STAGE 03</span>
                </div>
              </div>

              {/* Text side */}
              <div className="sm:col-span-6 order-1 sm:order-2 space-y-4">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono"
                  style={{
                    backgroundColor: 'var(--surface-soft)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Cpu size={12} style={{ color: 'var(--primary)' }} />
                  <span>Vision Intelligence &amp; Spatial Engine</span>
                </div>

                <h3
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight transition-colors"
                  style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text)' }}
                >
                  {activePhase === 'vision' ? 'Kinetic Prototyping' : 'High-Fidelity AI Reality'}
                </h3>

                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Every asset is generated to live and breathe across physical packaging, 3D campaigns, high-conversion interfaces, and generative media.
                </p>

                <div className="pt-2">
                  <div
                    className="p-3.5 rounded-2xl border flex items-center justify-between"
                    style={{
                      backgroundColor: 'var(--surface-soft)',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div>
                      <div className="text-xs font-bold" style={{ color: 'var(--text)' }}>Standard AI Delivery Kit</div>
                      <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Vector SVG/EPS, 3D OBJ/FBX, Dielines, Token Guide</div>
                    </div>
                    <span className="font-mono text-xs font-bold" style={{ color: 'var(--primary)' }}>PRO</span>
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
            className="md:col-span-12 lg:col-span-5 backdrop-blur-3xl border rounded-[32px] p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: isLight
                ? '0 10px 30px rgba(71, 105, 135, 0.10), -6px -6px 20px rgba(255, 255, 255, 0.95)'
                : '0 20px 50px rgba(0, 0, 0, 0.85)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-xs font-mono font-bold tracking-wider uppercase"
                  style={{ color: 'var(--primary)' }}
                >
                  Interactive AI Pillars
                </span>
                <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>Tap to inspect</span>
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
                          ? 'border-[var(--primary)] shadow-md'
                          : 'border-[var(--border)] hover:bg-white/[0.04]'
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? isLight ? 'rgba(77, 163, 255, 0.08)' : 'rgba(255, 23, 68, 0.10)'
                          : 'var(--surface-soft)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                            style={{
                              backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface)',
                              color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                            }}
                          >
                            <IconComponent size={15} />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold" style={{ color: 'var(--text)' }}>{p.title}</h4>
                            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{p.tag}</span>
                          </div>
                        </div>
                        <span
                          className="text-[11px] font-mono font-bold"
                          style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}
                        >
                          {p.stat}
                        </span>
                      </div>

                      {isSelected && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="text-xs leading-relaxed mt-2.5 pt-2.5 border-t"
                          style={{
                            color: 'var(--text-secondary)',
                            borderColor: 'var(--border)',
                          }}
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
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Built on radical transparency and zero bureaucratic bloat.
              </span>
            </div>
          </motion.div>
        </div>

        {/* Numerical Impact Matrix (Full Width) */}
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
              className="backdrop-blur-2xl border rounded-[26px] p-5 sm:p-6 shadow-xl group transition-all duration-300 relative overflow-hidden"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                boxShadow: isLight
                  ? '0 6px 20px rgba(71, 105, 135, 0.08)'
                  : '0 10px 30px rgba(0, 0, 0, 0.65)',
              }}
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-all"
                style={{
                  backgroundColor: isLight ? 'rgba(77, 163, 255, 0.08)' : 'rgba(255, 23, 68, 0.08)',
                }}
              />
              <div
                className="text-3xl sm:text-4xl lg:text-5xl font-black transition-colors"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  color: 'var(--primary)',
                }}
              >
                {item.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold mt-1.5" style={{ color: 'var(--text)' }}>{item.label}</div>
              <div className="text-[11px] font-mono mt-1" style={{ color: 'var(--text-secondary)' }}>{item.caption}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
