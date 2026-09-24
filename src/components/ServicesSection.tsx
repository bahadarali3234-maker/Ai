import React, { useState } from 'react';
import { SERVICES } from '../data/portfolioData';
import { Sparkles, Package, Layers, Monitor, CheckCircle2, ArrowUpRight, Play, Pause } from 'lucide-react';
import { motion } from 'motion/react';

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const [isPaused, setIsPaused] = useState(false);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Sparkles':
        return <Sparkles className="text-[#f41151]" size={20} />;
      case 'Package':
        return <Package className="text-[#f41151]" size={20} />;
      case 'Layers':
        return <Layers className="text-[#f41151]" size={20} />;
      case 'Monitor':
        return <Monitor className="text-[#f41151]" size={20} />;
      default:
        return <Sparkles className="text-[#f41151]" size={20} />;
    }
  };

  // We repeat the service list 3 times so the rightward infinite track loops seamlessly
  const loopedServices = [...SERVICES, ...SERVICES, ...SERVICES];

  return (
    <section id="services" className="py-20 sm:py-28 bg-[#070709] border-t border-white/[0.06] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[350px] bg-[#f41151]/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 left-10 w-[400px] h-[300px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 text-[#f41151] font-semibold text-xs sm:text-sm tracking-widest uppercase mb-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#f41151] animate-pulse" />
              <span>How AI Works • Generative Architecture</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              AI <span className="text-[#f41151]">Capabilities</span>
            </motion.h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-zinc-400 text-xs sm:text-sm max-w-sm">
              Cards continuously float towards the right side. Hover over any card to freeze and explore details.
            </p>

            {/* Play / Pause Toggle Button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/10 active:scale-95 text-zinc-300 hover:text-white text-xs font-medium border border-white/10 transition-all cursor-pointer w-fit self-start sm:self-auto"
              title={isPaused ? "Resume Animation" : "Pause Animation"}
            >
              {isPaused ? (
                <>
                  <Play size={13} className="text-[#f41151] fill-[#f41151]" />
                  <span>Resume Drift</span>
                </>
              ) : (
                <>
                  <Pause size={13} className="text-[#f41151] fill-[#f41151]" />
                  <span>Pause Motion</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Full-width Rightward Continuous Floating Track Container */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Soft edge mask gradients for seamless infinite entry and exit */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#070709] via-[#070709]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#070709] via-[#070709]/80 to-transparent z-20 pointer-events-none" />

        {/* The Animated Rightward Track */}
        <div
          className="animate-marquee-right flex gap-6 sm:gap-8 items-stretch"
          style={{
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {loopedServices.map((service, idx) => {
            const serviceIndex = (idx % SERVICES.length) + 1;
            return (
              <div
                key={`${service.id}-${idx}`}
                className="w-[340px] xs:w-[370px] sm:w-[410px] shrink-0 bg-[#0c0c14]/95 backdrop-blur-3xl border border-white/[0.12] hover:border-[#f41151]/60 rounded-[30px] sm:rounded-[34px] p-5 sm:p-6 shadow-[0_20px_45px_rgba(0,0,0,0.85)] hover:shadow-[0_25px_60px_rgba(244,17,81,0.25)] transition-all duration-500 group flex flex-col justify-between select-none relative overflow-hidden"
              >
                {/* Specular Edge Top Highlight */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                
                {/* Subtle card glow on hover */}
                <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#f41151]/10 rounded-full blur-3xl group-hover:bg-[#f41151]/25 transition-all pointer-events-none" />

                <div>
                  {/* Card Visual Showcase Image */}
                  <div className="relative h-44 sm:h-48 rounded-[22px] overflow-hidden mb-5 border border-white/10 group-hover:border-white/20 bg-black/50 shadow-inner">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover object-center transform group-hover:scale-108 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Dark gradient overlay for text readability & atmosphere */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c14] via-[#0c0c14]/30 to-black/20" />

                    {/* Floating Service Number Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-mono font-bold text-white flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f41151] animate-pulse" />
                      <span>0{serviceIndex} / 0{SERVICES.length}</span>
                    </div>

                    {/* Floating Icon in Bottom Right */}
                    <div className="absolute bottom-3 right-3 w-10 h-10 rounded-2xl bg-[#0c0c14]/85 backdrop-blur-md border border-white/15 group-hover:border-[#f41151]/50 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      {getIcon(service.iconName)}
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3
                    className="text-xl sm:text-2xl font-extrabold text-white mb-1.5 group-hover:text-zinc-100 transition-colors"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {service.title}
                  </h3>

                  {service.tagline && (
                    <p className="text-zinc-400 text-xs font-mono font-medium mb-3">
                      {service.tagline}
                    </p>
                  )}

                  {/* Description */}
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mb-5 line-clamp-2">
                    {service.description}
                  </p>
                </div>

                {/* Deliverables Checklist & CTA */}
                <div>
                  <div className="pt-3.5 border-t border-white/[0.08] space-y-2 mb-5">
                    {service.deliverables.slice(0, 3).map((item, dIdx) => (
                      <div key={dIdx} className="flex items-center gap-2 text-xs text-zinc-300">
                        <CheckCircle2 size={13} className="text-[#f41151] shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* iOS Style Interactive Chat Action */}
                  <button
                    type="button"
                    onClick={() => onSelectService(service.title)}
                    className="w-full py-3 px-4 rounded-full bg-white/[0.05] group-hover:bg-[#f41151] text-zinc-200 group-hover:text-white border border-white/10 group-hover:border-transparent text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-sm group-hover:shadow-[0_0_22px_rgba(244,17,81,0.5)] active:scale-95"
                  >
                    <span>Ask AI about {service.title.split(' ')[0]}</span>
                    <ArrowUpRight size={14} className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
