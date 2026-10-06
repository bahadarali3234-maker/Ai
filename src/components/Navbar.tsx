import React, { useState, useEffect } from 'react';
import { HERO_AVATAR } from '../data/portfolioData';
import { Menu, X, ArrowUpRight, User } from 'lucide-react';
import { motion } from 'motion/react';
import { subscribeToAuth, logOut } from '../firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onOpenChat: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenChat, onNavigate, onOpenLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'AI Projects', id: 'work' },
    { label: 'AI Capabilities', id: 'services' },
    { label: 'About the AI', id: 'about' },
    { label: 'FAQs', id: 'faqs' },
  ];

  const handleLinkClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-navigation"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? isLight
            ? 'bg-white/85 backdrop-blur-2xl py-3 border-b border-[var(--border)] shadow-lg shadow-[rgba(71,105,135,0.08)]'
            : 'bg-[#0B0B0D]/85 backdrop-blur-2xl py-3 border-b border-[var(--border)] shadow-lg shadow-black/60'
          : 'bg-transparent py-5 sm:py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand identity: AI Workspace */}
        <button
          id="nav-brand-logo"
          onClick={() => handleLinkClick('hero')}
          className="flex items-center gap-3 group focus:outline-none text-left cursor-pointer"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 border border-[var(--border)] shadow-[var(--shadow-neumorphic-soft)]">
            <img
              src={HERO_AVATAR}
              alt="AI Workspace"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span
            className="font-bold text-base sm:text-lg tracking-tight transition-colors"
            style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text)' }}
          >
            AI Workspace
          </span>
        </button>

        {/* Center Desktop Links */}
        <nav id="desktop-nav-links" className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => (
            <button
              key={link.id}
              id={`nav-link-${link.id}`}
              onClick={() => handleLinkClick(link.id)}
              className="text-sm font-medium transition-colors duration-200 relative group cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span className="group-hover:text-[var(--text)] transition-colors">{link.label}</span>
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[var(--primary)] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        {/* Right Action & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button in Desktop Navbar */}
          <ThemeToggle showLabel={false} />

          {/* iOS Style Ask AI Button */}
          <motion.button
            id="nav-chat-btn"
            onClick={onOpenChat}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full text-white text-sm font-semibold tracking-tight transition-all cursor-pointer border border-white/20 theme-button-primary"
          >
            {/* Pulsing online status dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span>Ask AI</span>
            <ArrowUpRight size={14} className="opacity-90" />
          </motion.button>

          {/* Mobile hamburger button */}
          <button
            id="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl focus:outline-none cursor-pointer border border-[var(--border)] transition-colors"
            style={{ color: 'var(--text)', backgroundColor: 'var(--surface-soft)' }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden backdrop-blur-2xl border-b border-[var(--border)] px-6 py-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{ backgroundColor: 'var(--surface-card)' }}
        >
          {/* Mobile Theme Toggle bar */}
          <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Theme Mode
            </span>
            <ThemeToggle showLabel={true} />
          </div>

          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className="block w-full text-left text-base font-medium py-2 border-b border-[var(--border)] cursor-pointer transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              {link.label}
            </button>
          ))}

          {currentUser && !currentUser.isAnonymous ? (
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)] text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="truncate">{currentUser.email}</span>
              <button
                type="button"
                onClick={() => {
                  logOut();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-semibold px-2.5 py-1 rounded-full border border-[var(--border)] text-red-500 hover:bg-red-500/10 cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onOpenLogin?.();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-sm font-semibold flex items-center gap-2 border-b border-[var(--border)] cursor-pointer"
              style={{ color: 'var(--text)' }}
            >
              <User size={15} className="text-[var(--primary)]" />
              <span>Sign In / Create Account (Optional)</span>
            </button>
          )}

          <button
            onClick={() => {
              onOpenChat();
              setMobileMenuOpen(false);
            }}
            className="w-full text-center mt-2 py-3 rounded-full text-white font-semibold text-sm shadow-md cursor-pointer flex items-center justify-center gap-2 theme-button-primary"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span>Ask AI</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      )}
    </header>
  );
};
