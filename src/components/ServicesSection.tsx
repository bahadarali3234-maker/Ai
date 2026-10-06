import React, { useState } from 'react';
import { SERVICES } from '../data/portfolioData';
import { Sparkles, Package, Layers, Monitor, CheckCircle2, ArrowUpRight, Play, Pause } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const [isPaused, setIsPaused] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const getIcon = (name: string) => {
    switch (name) {
      case 'Sparkles':
        return <Sparkles style={{ color: 'var(--primary)' }} size={20} />;
      case 'Package':
        return <Package style={{ color: 'var(--primary)' }} size={20} />;
      case 'Layers':
        return <Layers style={{ color: 'var(--primary)' }} size={20} />;
      case 'Monitor':
        return <Monitor style={{ color: 'var(--primary)' }} size={20} />;
      default:
        return <Sparkles style={{ color: 'var(--primary)' }} size={20} />;
    }
  };

  // We repeat the service list 3 times so the rightward infinite track loops seamlessly
  const loopedServices = [...SERVICES, ...SERVICES, ...SERVICES];

  return (
    <section
      id="services"
      className="py-20 sm:py-28 relative overflow-hidden transition-colors duration-380 border-t"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 right-1/4 w-[600px] h-[350px] rounded-full blur-[140px] pointer-events-none -translate-y-1/2 transition-all duration-500"
        style={{
          backgroundColor: isLight ? 'rgba(77, 163, 255, 0.12)' : 'rgba(255, 23, 68, 0.12)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 font-semibold text-xs sm:text-sm tracking-widest uppercase mb-2"
              style={{ color: 'var(--primary)' }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--primary)' }}
              />
              <span>How AI Works • Generative Architecture</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight transition-colors"
              style={{
                fontFamily: "'Syne', sans-serif",
                color: 'var(--text)',
              }}
            >
              AI <span style={{ color: 'var(--primary)' }}>Capabilities</span>
            </motion.h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p
              className="text-xs sm:text-sm max-w-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cards continuously float towards the right side. Hover over any card to freeze and explore details.
            </p>

            {/* Play / Pause Toggle Button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all cursor-pointer w-fit self-start sm:self-auto active:scale-95"
              style={{
                backgroundColor: 'var(--surface-soft)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
              title={isPaused ? "Resume Animation" : "Pause Animation"}
            >
              {isPaused ? (
                <>
                  <Play size={13} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
                  <span className="text-xs font-medium">Resume Drift</span>
                </>
              ) : (
                <>
                  <Pause size={13} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
                  <span className="text-xs font-medium">Pause Motion</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Full-width Rightward Continuous Floating Track Container */}
      <div className="relative w-full overflow-hidden py-4">
        {/* Soft edge mask gradients for seamless infinite entry and exit */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 z-20 pointer-events-none"
          style={{
            background: isLight
              ? 'linear-gradient(to right, #F4F8FC, rgba(244, 248, 252, 0.8), transparent)'
              : 'linear-gradient(to right, #050505, rgba(5, 5, 5, 0.8), transparent)',
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 z-20 pointer-events-none"
          style={{
            background: isLight
              ? 'linear-gradient(to left, #F4F8FC, rgba(244, 248, 252, 0.8), transparent)'
              : 'linear-gradient(to left, #050505, rgba(5, 5, 5, 0.8), transparent)',
          }}
        />

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
                className="w-[340px] xs:w-[370px] sm:w-[410px] shrink-0 backdrop-blur-3xl border rounded-[30px] sm:rounded-[34px] p-5 sm:p-6 transition-all duration-300 group flex flex-col justify-between select-none relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  boxShadow: isLight
                    ? '0 10px 30px rgba(71, 105, 135, 0.10), -6px -6px 20px rgba(255, 255, 255, 0.95)'
                    : '0 20px 45px rgba(0, 0, 0, 0.85)',
                }}
              >
                {/* Subtle card glow on hover */}
                <div
                  className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl transition-all pointer-events-none"
                  style={{
                    backgroundColor: isLight ? 'rgba(77, 163, 255, 0.12)' : 'rgba(255, 23, 68, 0.14)',
                  }}
                />

                <div>
                  {/* Card Visual Showcase Image */}
                  <div
                    className="relative h-44 sm:h-48 rounded-[22px] overflow-hidden mb-5 border shadow-inner"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--surface-soft)',
                    }}
                  >
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      referrerPolicy="no-referrer"
                    />

                    {/* Gradient overlay for readability */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: isLight
                          ? 'linear-gradient(to top, rgba(255,255,255,0.7) 0%, transparent 60%)'
                          : 'linear-gradient(to top, rgba(11,11,13,0.85) 0%, transparent 60%)',
                      }}
                    />

                    {/* Floating Service Number Badge */}
                    <div
                      className="absolute top-3 left-3 px-3 py-1 rounded-full backdrop-blur-md border text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-md"
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ backgroundColor: 'var(--primary)' }}
                      />
                      <span>0{serviceIndex} / 0{SERVICES.length}</span>
                    </div>

                    {/* Floating Icon in Bottom Right */}
                    <div
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-2xl backdrop-blur-md border flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      {getIcon(service.iconName)}
                    </div>
                  </div>

                  {/* Title & Tagline */}
                  <h3
                    className="text-xl sm:text-2xl font-extrabold mb-1.5 transition-colors"
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      color: 'var(--text)',
                    }}
                  >
                    {service.title}
                  </h3>

                  {service.tagline && (
                    <p
                      className="text-xs font-mono font-medium mb-3 transition-colors"
                      style={{ color: 'var(--primary)' }}
                    >
                      {service.tagline}
                    </p>
                  )}

                  {/* Description */}
                  <p
                    className="text-xs sm:text-sm leading-relaxed mb-5 line-clamp-2 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {service.description}
                  </p>
                </div>

                {/* Deliverables Checklist & CTA */}
                <div>
                  <div
                    className="pt-3.5 border-t space-y-2 mb-5"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {service.deliverables.slice(0, 3).map((item, dIdx) => (
                      <div key={dIdx} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={13} style={{ color: 'var(--primary)' }} className="shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* iOS Style Interactive Chat Action */}
                  <button
                    type="button"
                    onClick={() => onSelectService(service.title)}
                    className="w-full py-3 px-4 rounded-full border text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95 group-hover:text-white"
                    style={{
                      backgroundColor: 'var(--surface-soft)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-soft)';
                      e.currentTarget.style.color = 'var(--text)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
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
