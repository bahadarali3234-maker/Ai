import React, { useState } from 'react';
import { FAQS } from '../data/portfolioData';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faqs"
      className="py-20 sm:py-24 relative transition-colors duration-380 border-t"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span
            className="font-semibold text-xs sm:text-sm tracking-widest uppercase"
            style={{ color: 'var(--primary)' }}
          >
            AI Knowledge &amp; Guidelines
          </span>
          <h2
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-2 transition-colors"
            style={{
              fontFamily: "'Syne', sans-serif",
              color: 'var(--text)',
            }}
          >
            Frequently Asked <span style={{ color: 'var(--primary)' }}>Questions</span>
          </h2>
          <p
            className="text-sm sm:text-base mt-3 max-w-lg mx-auto transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            Everything you need to know about AI capabilities, prompt engineering, and intelligent outputs.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border transition-all duration-300 overflow-hidden"
                style={{
                  backgroundColor: isOpen ? 'var(--surface)' : 'var(--surface-soft)',
                  borderColor: isOpen ? 'var(--primary)' : 'var(--border)',
                  boxShadow: isOpen
                    ? isLight
                      ? '0 8px 24px rgba(71, 105, 135, 0.12)'
                      : '0 8px 24px rgba(0, 0, 0, 0.70)'
                    : 'none',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="w-full py-5 px-6 sm:px-8 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <span
                    className="font-bold text-base sm:text-lg transition-colors"
                    style={{
                      color: isOpen ? 'var(--text)' : 'var(--text-secondary)',
                    }}
                  >
                    {faq.question}
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: isOpen ? 'var(--primary)' : 'var(--surface)',
                      color: isOpen ? '#ffffff' : 'var(--text-secondary)',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                    }}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-6 sm:px-8 pb-6 text-sm sm:text-base leading-relaxed border-t pt-4"
                        style={{
                          color: 'var(--text-secondary)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
