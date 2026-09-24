import React from 'react';
import { HERO_AVATAR } from '../data/portfolioData';
import { ArrowUp, Heart, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenChat: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenChat }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050507] border-t border-white/[0.06] pt-16 pb-28 sm:pb-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/[0.06]">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src={HERO_AVATAR}
                  alt="AI Workspace"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span
                className="text-white font-extrabold text-xl tracking-tight"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                AI Workspace
              </span>
            </div>
            <p className="text-zinc-400 text-sm max-w-sm">
              Helping forward-thinking teams turn complex prompts into structured, unforgettable creations with Gemini AI.
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <button
              onClick={() => onNavigate('work')}
              className="text-zinc-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              AI Projects
            </button>
            <button
              onClick={() => onNavigate('services')}
              className="text-zinc-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              AI Capabilities
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="text-zinc-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              About the AI
            </button>
            <button
              onClick={() => onNavigate('faqs')}
              className="text-zinc-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              FAQs
            </button>
            <button
              onClick={onOpenChat}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f41151]/20 hover:bg-[#f41151] text-[#f41151] hover:text-white text-sm font-semibold border border-[#f41151]/40 hover:border-transparent transition-all cursor-pointer"
            >
              <span>Ask AI</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Scroll to Top */}
          <button
            onClick={scrollToTop}
            aria-label="Back to Top"
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#f41151] hover:text-white text-zinc-400 flex items-center justify-center transition-all duration-200 cursor-pointer border border-white/10"
          >
            <ArrowUp size={18} />
          </button>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div>
            &copy; {new Date().getFullYear()} AI Workspace. Powered by Gemini AI.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart size={13} className="text-[#f41151] fill-[#f41151]" />
            <span>for visionary creators &amp; prompt engineers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
