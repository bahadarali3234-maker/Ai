import React from 'react';
import { ArrowUpRight, Star, MessageSquare } from 'lucide-react';
import { HERO_AVATAR, CLIENT_BRANDS } from '../data/portfolioData';
import heroGlowImg from '../assets/images/hero-glow.jpg';
import { motion } from 'motion/react';

interface HeroSectionProps {
  onOpenChat: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenChat }) => {
  return (
    <section
      id="hero"
      className="relative pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-20 overflow-hidden bg-[#070709]"
    >
      {/* User's Hero Glow Background Image */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <img
          src={heroGlowImg}
          alt="Hero Atmosphere Glow"
          className="w-full h-full object-cover object-top opacity-85 mix-blend-screen"
          referrerPolicy="no-referrer"
        />
        {/* Subtle dark gradient overlay to ensure perfect contrast and seamless blend */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070709]/40 via-transparent to-[#070709]" />
      </div>

      {/* Secondary ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[450px] sm:h-[600px] bg-gradient-to-b from-[#ff1253]/15 via-[#a00030]/10 to-transparent blur-[140px] pointer-events-none rounded-full z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Massive Typography & Overlapping 3D Avatar */}
        <div className="relative flex flex-col items-center justify-center select-none text-center">
          {/* First word: THINK */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-[4.8rem] xs:text-[5.8rem] sm:text-[8rem] md:text-[10rem] lg:text-[12rem] xl:text-[13.5rem] font-black tracking-tight leading-[0.88] text-white uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            THINK
          </motion.h1>

          {/* Second row: CREATIVELY with overlapping 3D Character Avatar */}
          <div className="relative w-full flex items-center justify-center -mt-2 sm:-mt-5 md:-mt-8 lg:-mt-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-[4rem] xs:text-[5rem] sm:text-[7.2rem] md:text-[9rem] lg:text-[11rem] xl:text-[12.5rem] font-black tracking-tight leading-[0.88] text-[#f41151] uppercase flex items-center justify-center w-full drop-shadow-[0_15px_35px_rgba(244,17,81,0.3)]"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              CREATIVELY
            </motion.div>

            {/* 3D Cutout Avatar - Enlarged, more attractive, pure cutout floating over typography */}
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
                <div className="absolute inset-0 bg-[#f41151]/20 blur-2xl rounded-full transform scale-90 pointer-events-none" />

                <img
                  src={HERO_AVATAR}
                  alt="Ruchit P. 3D Avatar"
                  className="w-40 xs:w-48 sm:w-64 md:w-80 lg:w-96 xl:w-[26rem] max-w-none h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)] drop-shadow-[0_0_35px_rgba(244,17,81,0.3)] transform group-hover:scale-105 transition-transform duration-500 pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Subtitle & Ultimate iOS Style Chat CTA Row directly beneath the typography */}
        <div className="mt-8 sm:mt-12 md:mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8 pt-4">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-zinc-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed max-w-md drop-shadow-md"
          >
            Transforming complex prompts into structured,
            <br className="hidden sm:inline" />
            intelligent creations with Gemini AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Ultimate iOS-Style Glass Button with Ambient Glow & Shimmer */}
            <motion.button
              id="hero-chat-btn"
              onClick={onOpenChat}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative inline-flex items-center gap-3 px-8 sm:px-9 py-4 sm:py-4.5 rounded-full bg-gradient-to-b from-[#ff205b] via-[#f41151] to-[#d60c44] text-white font-semibold text-sm sm:text-base tracking-wide shadow-[0_12px_35px_rgba(244,17,81,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:shadow-[0_16px_45px_rgba(244,17,81,0.7),inset_0_1px_2px_rgba(255,255,255,0.6)] cursor-pointer overflow-hidden group border border-white/20"
            >
              {/* iOS Animated Glass Light Shimmer */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", repeatDelay: 1.5 }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 pointer-events-none"
              />

              {/* iOS Online Status Pill Indicator */}
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
        <div className="mt-14 sm:mt-20 pt-8 border-t border-white/[0.08] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* 99+ Happy Clients Rating */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0 bg-[#0c0c12]/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/[0.06]">
            <div className="flex -space-x-2.5 overflow-hidden">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="inline-block w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-[#070709] bg-zinc-800 overflow-hidden"
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
              <div className="flex items-center gap-1 text-[#f41151]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#f41151" className="text-[#f41151]" />
                ))}
              </div>
              <span className="text-white text-xs sm:text-sm font-semibold tracking-tight mt-0.5">
                99.9% Model Precision
              </span>
            </div>
          </div>

          {/* Marquee Brand Track */}
          <div className="w-full lg:max-w-3xl overflow-hidden relative mask-gradient py-2">
            <div className="animate-marquee items-center gap-10 sm:gap-14 text-zinc-500 hover:text-zinc-300 transition-colors">
              {CLIENT_BRANDS.concat(CLIENT_BRANDS).map((brand, idx) => (
                <span
                  key={`${brand}-${idx}`}
                  className="text-xs sm:text-sm font-black tracking-[0.2em] uppercase text-zinc-400/80 hover:text-white transition-colors cursor-default whitespace-nowrap"
                  style={{ fontFamily: "'Syne', sans-serif" }}
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
