import React, { useState, useEffect } from 'react';
import { HERO_AVATAR } from '../data/portfolioData';
import { Menu, X, ArrowUpRight, User, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { subscribeToAuth, logOut } from '../firebase';
import type { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  onOpenChat: () => void;
  onNavigate: (sectionId: string) => void;
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenChat, onNavigate, onOpenLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

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
          ? 'bg-[#070709]/80 backdrop-blur-2xl py-3 border-b border-white/[0.08] shadow-lg shadow-black/50'
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
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
            <img
              src={HERO_AVATAR}
              alt="AI Workspace"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span
            className="text-white font-bold text-base sm:text-lg tracking-tight group-hover:text-zinc-200 transition-colors"
            style={{ fontFamily: "'Syne', sans-serif" }}
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
              className="text-zinc-300 hover:text-white text-sm font-medium transition-colors duration-200 relative group cursor-pointer"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#f41151] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        {/* Right Action & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {/* Optional Sign In / Profile Button */}
          {currentUser && !currentUser.isAnonymous ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs text-zinc-200">
              <div className="w-5 h-5 rounded-full bg-[#f41151] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
              </div>
              <span className="max-w-[100px] truncate font-medium">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <button
                type="button"
                onClick={() => logOut()}
                title="Log out"
                className="hover:text-red-400 p-0.5 rounded cursor-pointer"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-zinc-200 text-xs font-semibold tracking-wide transition-all cursor-pointer"
            >
              <User size={13} className="text-[#f41151]" />
              <span>Sign In</span>
            </button>
          )}

          {/* iOS Style Ask AI Button */}
          <motion.button
            id="nav-chat-btn"
            onClick={onOpenChat}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#f41151] hover:bg-[#ff1e5d] text-white text-sm font-semibold tracking-tight transition-all shadow-[0_0_20px_rgba(244,17,81,0.45)] hover:shadow-[0_0_30px_rgba(244,17,81,0.65)] cursor-pointer border border-white/20"
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
            className="md:hidden text-zinc-300 hover:text-white p-2 rounded-lg focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link.id)}
              className="block w-full text-left text-zinc-200 hover:text-white text-base font-medium py-2 border-b border-white/5 cursor-pointer"
            >
              {link.label}
            </button>
          ))}

          {currentUser && !currentUser.isAnonymous ? (
            <div className="flex items-center justify-between py-2 border-b border-white/5 text-sm text-zinc-300">
              <span className="truncate">{currentUser.email}</span>
              <button
                type="button"
                onClick={() => {
                  logOut();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-red-400 font-semibold px-2 py-1 rounded bg-white/5"
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
              className="w-full text-left py-2 text-zinc-200 hover:text-white text-sm font-semibold flex items-center gap-2 border-b border-white/5"
            >
              <User size={15} className="text-[#f41151]" />
              <span>Sign In / Create Account (Optional)</span>
            </button>
          )}

          <button
            onClick={() => {
              onOpenChat();
              setMobileMenuOpen(false);
            }}
            className="w-full text-center mt-2 py-3 rounded-full bg-[#f41151] text-white font-semibold text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
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
