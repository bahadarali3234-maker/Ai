import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HelpCircle,
  CheckCircle2,
  Send,
  Sparkles,
  Edit3,
  Sliders,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { QuestionBlock } from '../types';

export interface InteractiveQuestionBoxProps {
  question: QuestionBlock;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

export const InteractiveQuestionBox: React.FC<InteractiveQuestionBoxProps> = ({
  question,
  onAnswer,
  disabled = false,
}) => {
  const [selected, setSelected] = useState<string>(question.selectedOption || '');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>(question.customAnswer || '');
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(Boolean(question.isAnswered));

  const optionsList = question.options && question.options.length > 0
    ? question.options
    : ['Minimal Premium', 'Glassmorphism', 'Futuristic Dark', 'Luxury Editorial'];

  const handleSelectOption = (opt: string) => {
    if (disabled || hasSubmitted) return;
    setSelected(opt);
    setIsCustomMode(false);
  };

  const handleConfirmOption = (optToConfirm?: string) => {
    const choice = optToConfirm || selected;
    if (!choice.trim() || disabled) return;
    setSelected(choice);
    setHasSubmitted(true);
    onAnswer(choice.trim());
  };

  const handleCustomSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customText.trim() || disabled) return;
    const choice = `Custom: ${customText.trim()}`;
    setSelected(choice);
    setHasSubmitted(true);
    onAnswer(choice);
  };

  const handleSmartDefault = () => {
    if (disabled) return;
    const defaultChoice = 'You Decide (Use Intelligent Defaults)';
    setSelected(defaultChoice);
    setHasSubmitted(true);
    onAnswer(defaultChoice);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="my-4 rounded-[26px] sm:rounded-[30px] bg-gradient-to-b from-[#190408]/95 via-[#100204]/95 to-[#080102]/95 border border-[#ff1828]/35 backdrop-blur-xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(255,24,40,0.18)] relative overflow-hidden text-zinc-100 select-none group"
    >
      {/* Ambient Crimson Top Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff1828] to-transparent opacity-80" />
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#ff1828]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff1828]/15 border border-[#ff1828]/35 text-[#ff1828] text-xs font-semibold tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff1828] animate-pulse" />
          <Sparkles size={12} />
          <span>Interactive Task Discovery</span>
        </div>

        {hasSubmitted ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle2 size={13} />
            <span>Answered</span>
          </div>
        ) : (
          <span className="text-[11px] text-zinc-400 font-mono">Decision Required</span>
        )}
      </div>

      {/* Question Title */}
      <div className="space-y-1 mb-4">
        <h3
          className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-snug"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {question.title}
        </h3>
        {question.description && (
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
            {question.description}
          </p>
        )}
      </div>

      {/* Answered State Summary View */}
      {hasSubmitted ? (
        <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#ff1828]/20 border border-[#ff1828]/40 text-[#ff1828] flex items-center justify-center shrink-0">
              <CheckCircle2 size={15} />
            </div>
            <div>
              <span className="text-xs text-zinc-400 block font-mono">Selected Preference</span>
              <span className="text-sm font-semibold text-white tracking-wide">{selected}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setHasSubmitted(false)}
            className="text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 size={12} />
            <span>Change</span>
          </button>
        </div>
      ) : (
        /* Interactive Question Form */
        <div className="space-y-3.5">
          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {optionsList.map((opt, idx) => {
              const isSelected = selected === opt && !isCustomMode;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleSelectOption(opt);
                    handleConfirmOption(opt);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group/opt active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#ff1828]/20 border-[#ff1828] text-white shadow-[0_0_20px_rgba(255,24,40,0.35)] font-semibold'
                      : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/10 hover:border-white/25 text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-[#ff1828] bg-[#ff1828] text-white'
                          : 'border-white/30 group-hover/opt:border-white/60 bg-transparent'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                    </span>
                    <span className="text-sm tracking-wide leading-tight">{opt}</span>
                  </div>
                  <ChevronRight
                    size={15}
                    className={`shrink-0 transition-transform ${
                      isSelected
                        ? 'text-[#ff1828] translate-x-0.5'
                        : 'text-zinc-500 group-hover/opt:text-zinc-300'
                    }`}
                  />
                </button>
              );
            })}

            {/* Custom Option Button */}
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(true);
                setSelected('Custom');
              }}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer active:scale-[0.98] ${
                isCustomMode
                  ? 'bg-[#ff1828]/20 border-[#ff1828] text-white shadow-[0_0_20px_rgba(255,24,40,0.35)] font-semibold'
                  : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/10 hover:border-white/25 text-zinc-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isCustomMode
                      ? 'border-[#ff1828] bg-[#ff1828] text-white'
                      : 'border-white/30 bg-transparent'
                  }`}
                >
                  {isCustomMode ? (
                    <span className="w-2 h-2 rounded-full bg-white" />
                  ) : (
                    <Sliders size={11} className="text-zinc-400" />
                  )}
                </span>
                <span className="text-sm tracking-wide leading-tight">Custom...</span>
              </div>
              <Edit3 size={14} className={isCustomMode ? 'text-[#ff1828]' : 'text-zinc-500'} />
            </button>
          </div>

          {/* Custom Input Field Drawer */}
          <AnimatePresence>
            {isCustomMode && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCustomSubmit}
                className="overflow-hidden pt-1"
              >
                <div className="p-3 rounded-2xl bg-black/60 border border-[#ff1828]/40 flex items-center gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Enter your custom design requirement or style..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none px-2 tracking-wide"
                  />
                  <button
                    type="submit"
                    disabled={!customText.trim()}
                    className="px-4 py-2 rounded-xl bg-[#ff1828] hover:bg-[#e01423] disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,24,40,0.5)] active:scale-95 shrink-0"
                  >
                    <span>Submit</span>
                    <Send size={12} />
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Bottom Fast Action: "You Decide (Use Intelligent Defaults)" */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-[11px] text-zinc-400">Not sure yet?</span>
            <button
              type="button"
              onClick={handleSmartDefault}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-white px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-colors cursor-pointer active:scale-95"
            >
              <Zap size={12} className="text-amber-400" />
              <span>You Decide (Use Intelligent Defaults)</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
