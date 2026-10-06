import React from 'react';
import { HERO_AVATAR } from '../data/portfolioData';
import { ArrowUp, Heart, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenChat: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenChat }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="border-t pt-16 pb-28 sm:pb-24 relative overflow-hidden transition-colors duration-380"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border shadow-sm"
                style={{ borderColor: 'var(--border)' }}
              >
                <img
                  src={HERO_AVATAR}
                  alt="AI Workspace"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span
                className="font-extrabold text-xl tracking-tight transition-colors"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  color: 'var(--text)',
                }}
              >
                AI Workspace
              </span>
            </div>
            <p
              className="text-sm max-w-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Helping forward-thinking teams turn complex prompts into structured, unforgettable creations with Gemini AI.
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <button
              type="button"
              onClick={() => onNavigate('work')}
              className="text-sm font-medium transition-colors cursor-pointer hover:text-[var(--text)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              AI Projects
            </button>
            <button
              type="button"
              onClick={() => onNavigate('services')}
              className="text-sm font-medium transition-colors cursor-pointer hover:text-[var(--text)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              AI Capabilities
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="text-sm font-medium transition-colors cursor-pointer hover:text-[var(--text)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              About the AI
            </button>
            <button
              type="button"
              onClick={() => onNavigate('faqs')}
              className="text-sm font-medium transition-colors cursor-pointer hover:text-[var(--text)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              FAQs
            </button>
            <button
              type="button"
              onClick={onOpenChat}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer theme-button-primary"
            >
              <span>Ask AI</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Scroll to Top */}
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to Top"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer border"
            style={{
              backgroundColor: 'var(--surface-soft)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <ArrowUp size={18} />
          </button>
        </div>

        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{ color: 'var(--text-secondary)' }}
        >
          <div>
            &copy; {new Date().getFullYear()} AI Workspace. Powered by Gemini AI.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart size={13} style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
            <span>for visionary creators &amp; prompt engineers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
