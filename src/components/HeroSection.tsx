import React from 'react';
import { ArrowUpRight, Star } from 'lucide-react';
import { HERO_AVATAR, CLIENT_BRANDS } from '../data/portfolioData';
import heroGlowImg from '../assets/images/hero-glow.jpg';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

interface HeroSectionProps {
  onOpenChat: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenChat }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <section
      id="hero"
      className="relative pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-20 overflow-hidden transition-colors duration-380"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Hero Glow Background Image with theme-sensitive overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src={heroGlowImg}
          alt="Hero Atmosphere Glow"
          className={`w-full h-full object-cover object-top transition-opacity duration-500 ${
            isLight ? 'opacity-25 mix-blend-multiply' : 'opacity-85 mix-blend-screen'
          }`}
          referrerPolicy="no-referrer"
        />
        {/* Subtle gradient overlay to ensure perfect contrast and seamless blend */}
        <div
          className="absolute inset-0 transition-colors duration-380"
          style={{
            background: isLight
              ? 'linear-gradient(to bottom, rgba(244, 248, 252, 0.4), transparent, var(--bg))'
              : 'linear-gradient(to bottom, rgba(7, 7, 9, 0.5), transparent, var(--bg))',
          }}
        />
      </div>

      {/* Secondary ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[450px] sm:h-[600px] blur-[140px] pointer-events-none rounded-full z-0 transition-all duration-500"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(77, 163, 255, 0.18) 0%, rgba(140, 200, 255, 0.08) 50%, transparent 80%)'
            : 'radial-gradient(circle, rgba(255, 23, 68, 0.22) 0%, rgba(180, 0, 40, 0.10) 50%, transparent 80%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Massive Typography & Overlapping 3D Avatar */}
        <div className="relative flex flex-col items-center justify-center select-none text-center">
          {/* First word: THINK */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-[4.8rem] xs:text-[5.8rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[13.5rem] font-black tracking-tight leading-[0.88] uppercase transition-colors duration-380"
            style={{
              fontFamily: "'Syne', sans-serif",
              color: 'var(--text)',
              textShadow: isLight
                ? '0 10px 30px rgba(71, 105, 135, 0.15)'
                : '0 10px 30px rgba(0, 0, 0, 0.85)',
            }}
          >
            THINK
          </motion.h1>

          {/* Second row: CREATIVELY with overlapping 3D Character Avatar */}
          <div className="relative w-full flex items-center justify-center -mt-2 sm:-mt-5 md:-mt-8 lg:-mt-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-[4rem] xs:text-[5rem] sm:text-[7.2rem] md:text-[9rem] lg:text-[11rem] xl:text-[12.5rem] font-black tracking-tight leading-[0.88] uppercase flex items-center justify-center w-full transition-colors duration-380"
              style={{
                fontFamily: "'Syne', sans-serif",
                color: 'var(--primary)',
                textShadow: isLight
                  ? '0 15px 35px rgba(77, 163, 255, 0.30)'
                  : '0 15px 35px rgba(255, 23, 68, 0.45)',
              }}
            >
              CREATIVELY
            </motion.div>

            {/* 3D Cutout Avatar - Floating over typography */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] sm:-translate-y-[47%] md:-translate-y-[49%] z-20 pointer-events-auto"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                className="relative group cursor-pointer select-none"
              >
                {/* Subtle backlight glow behind character outline */}
                <div
                  className="absolute inset-0 blur-2xl rounded-full transform scale-90 pointer-events-none transition-all duration-500"
                  style={{
                    backgroundColor: isLight
                      ? 'rgba(77, 163, 255, 0.25)'
                      : 'rgba(255, 23, 68, 0.28)',
                  }}
                />

                <img
                  src={HERO_AVATAR}
                  alt="AI Character Avatar"
                  className="w-40 xs:w-48 sm:w-64 md:w-80 lg:w-96 xl:w-[26rem] max-w-none h-auto object-contain transform group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  style={{
                    filter: isLight
                      ? 'drop-shadow(0 20px 30px rgba(71, 105, 135, 0.25)) drop-shadow(0 0 20px rgba(77, 163, 255, 0.25))'
                      : 'drop-shadow(0 25px 50px rgba(0,0,0,0.95)) drop-shadow(0 0 35px rgba(255, 23, 68, 0.40))',
                  }}
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Subtitle & Ultimate Glass Chat CTA Row directly beneath typography */}
        <div className="mt-8 sm:mt-12 md:mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8 pt-4">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-md transition-colors duration-380"
            style={{ color: 'var(--text-secondary)' }}
          >
            Transforming complex prompts into structured,
            <br className="hidden sm:inline" />
            intelligent creations with cutting-edge AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Elevated Button with Ambient Theme Glow & Shimmer */}
            <motion.button
              id="hero-chat-btn"
              onClick={onOpenChat}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative inline-flex items-center gap-3 px-8 sm:px-9 py-4 sm:py-4.5 rounded-full text-white font-semibold text-sm sm:text-base tracking-wide cursor-pointer overflow-hidden group border border-white/25 shadow-lg transition-all"
              style={{
                background: isLight
                  ? 'linear-gradient(180deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)'
                  : 'linear-gradient(180deg, #FF4D6D 0%, #FF1744 50%, #C9002B 100%)',
                boxShadow: isLight
                  ? '0 12px 35px rgba(59, 130, 246, 0.45), inset 0 1px 1px rgba(255,255,255,0.6)'
                  : '0 12px 35px rgba(255, 23, 68, 0.50), inset 0 1px 1px rgba(255,255,255,0.4)',
              }}
            >
              {/* Glass Light Shimmer */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", repeatDelay: 1.5 }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
              />

              {/* Online Status Pill Indicator */}
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
              </span>

              <span className="relative z-10 font-bold tracking-tight">Start Chatting</span>

              <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center relative z-10 group-hover:bg-white/30 transition-all">
                <ArrowUpRight
                  size={16}
                  className="transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                />
              </div>
            </motion.button>
          </motion.div>
        </div>

        {/* Social Proof & Client Logo Marquee Strip */}
        <div
          className="mt-14 sm:mt-20 pt-8 border-t flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 transition-colors duration-380"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Rating Pill */}
          <div
            className="flex items-center gap-3 sm:gap-4 shrink-0 px-4 py-2.5 rounded-full border transition-all duration-380"
            style={{
              backgroundColor: 'var(--surface-soft)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-neumorphic-soft)',
            }}
          >
            <div className="flex -space-x-2.5 overflow-hidden">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="inline-block w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-[var(--surface)] overflow-hidden"
                >
                  <img
                    src={HERO_AVATAR}
                    alt={`AI Avatar ${item}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill="var(--primary)"
                    style={{ color: 'var(--primary)' }}
                  />
                ))}
              </div>
              <span
                className="text-xs sm:text-sm font-semibold tracking-tight mt-0.5"
                style={{ color: 'var(--text)' }}
              >
                99.9% Model Precision
              </span>
            </div>
          </div>

          {/* Marquee Brand Track */}
          <div className="w-full lg:max-w-3xl overflow-hidden relative py-2">
            <div className="animate-marquee items-center gap-10 sm:gap-14">
              {CLIENT_BRANDS.concat(CLIENT_BRANDS).map((brand, idx) => (
                <span
                  key={`${brand}-${idx}`}
                  className="text-xs sm:text-sm font-black tracking-[0.2em] uppercase transition-colors cursor-default whitespace-nowrap"
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    color: 'var(--text-muted)',
                  }}
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
