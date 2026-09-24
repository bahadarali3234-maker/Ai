import React, { useState } from 'react';
import { FAQS } from '../data/portfolioData';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="py-20 sm:py-24 bg-[#070709] border-t border-white/[0.05] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-[#f41151] font-semibold text-xs sm:text-sm tracking-widest uppercase">
            AI Knowledge &amp; Guidelines
          </span>
          <h2
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mt-2"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Frequently Asked <span className="text-[#f41151]">Questions</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base mt-3 max-w-lg mx-auto">
            Everything you need to know about AI capabilities, prompt engineering, and intelligent outputs.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-[#0f0f16] border-[#f41151]/40 shadow-lg shadow-black/50'
                    : 'bg-[#0c0c11] border-white/[0.06] hover:border-white/15'
                }`}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full py-5 px-6 sm:px-8 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span
                    className={`font-bold text-base sm:text-lg transition-colors ${
                      isOpen ? 'text-white' : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'bg-[#f41151] text-white rotate-180' : 'bg-white/5 text-zinc-400'
                    }`}
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
                      <div className="px-6 sm:px-8 pb-6 text-zinc-400 text-sm sm:text-base leading-relaxed border-t border-white/[0.04] pt-4">
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
