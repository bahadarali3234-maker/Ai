import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-full transition-all duration-300 cursor-pointer select-none active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
        isLight
          ? 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-[var(--shadow-neumorphic-soft)] hover:bg-[var(--surface-soft)]'
          : 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] shadow-[var(--shadow-neumorphic-soft)] hover:bg-[var(--surface-soft)]'
      } ${className}`}
      title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      aria-label={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, scale: 0.7, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex items-center justify-center shrink-0"
      >
        {isLight ? (
          <Sun size={17} className="text-amber-500 fill-amber-500/20" />
        ) : (
          <Moon size={17} className="text-[var(--primary)] fill-[var(--primary)]/20" />
        )}
      </motion.div>
      {showLabel && (
        <span className="text-xs font-semibold tracking-wide hidden sm:inline-block">
          {isLight ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
