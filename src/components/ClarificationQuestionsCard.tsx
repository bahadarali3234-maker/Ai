import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ClarificationDecision, ClarificationQuestion } from '../utils/clarificationGate';

export interface ClarificationQuestionsCardProps {
  decision: ClarificationDecision;
  onSubmitAnswers: (answers: Record<string, string>) => void;
  onSkip: () => void;
  disabled?: boolean;
}

/**
 * Compact Clarification Question Card
 * Meets all user design requirements:
 * - Reduced height / compact size
 * - Question counter in top corner (e.g. "1/3")
 * - Concise description
 * - Question text with options below
 * - Minimal Back (<) and Forward (>) buttons
 * - Candy Blue 🔵 accent (#00a6ff)
 * - Questions strictly asked ONE BY ONE
 */
export const ClarificationQuestionsCard: React.FC<ClarificationQuestionsCardProps> = ({
  decision,
  onSubmitAnswers,
  onSkip: _onSkip,
  disabled = false,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    decision.questions.forEach((q) => {
      if (q.default) {
        initial[q.id] = q.default;
      }
    });
    return initial;
  });

  const [customText, setCustomText] = useState('');

  const questions = decision.questions || [];
  const totalQuestions = questions.length;
  const currentQ: ClarificationQuestion | undefined = questions[currentStepIndex];

  if (!currentQ || totalQuestions === 0) {
    return null;
  }

  const currentAnswer = customText.trim() || answers[currentQ.id] || '';
  const isMulti = currentQ.type === 'multi_choice';
  const selectedMultiList = isMulti ? currentAnswer.split(', ').map((s) => s.trim()).filter(Boolean) : [];

  const handleSelectOption = (opt: string) => {
    if (disabled) return;

    if (isMulti) {
      const exists = selectedMultiList.includes(opt);
      const updated = exists ? selectedMultiList.filter((v) => v !== opt) : [...selectedMultiList, opt];
      const joined = updated.join(', ');
      setAnswers((prev) => ({ ...prev, [currentQ.id]: joined }));
      setCustomText(joined);
    } else {
      setAnswers((prev) => ({ ...prev, [currentQ.id]: opt }));
      setCustomText(opt);
      // Tactile auto-advance to next question smoothly
      setTimeout(() => {
        advanceNextStep({ ...answers, [currentQ.id]: opt });
      }, 180);
    }
  };

  const advanceNextStep = (currentAnswersMap = answers) => {
    const val = customText.trim() || currentAnswersMap[currentQ.id]?.trim() || currentQ.default || '';
    const updatedAnswers = { ...currentAnswersMap };
    if (val) {
      updatedAnswers[currentQ.id] = val;
      setAnswers(updatedAnswers);
    }

    if (currentStepIndex < totalQuestions - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      const nextQ = questions[currentStepIndex + 1];
      setCustomText(updatedAnswers[nextQ?.id] || '');
    } else {
      onSubmitAnswers(updatedAnswers);
    }
  };

  const handlePrevStep = () => {
    if (disabled || currentStepIndex === 0) return;
    setCurrentStepIndex((prev) => prev - 1);
    const prevQ = questions[currentStepIndex - 1];
    setCustomText(answers[prevQ?.id] || '');
  };

  const isLastQuestion = currentStepIndex === totalQuestions - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-3xl bg-white text-zinc-900 rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(0,166,255,0.15)] border border-zinc-200/90 flex flex-col space-y-2.5 text-left select-none"
    >
      {/* Top Header: Question Title + Corner Counter (e.g. 1/3) */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-[#00a6ff] shadow-[0_0_8px_#00a6ff] animate-pulse shrink-0" />
            <span className="text-[10px] font-bold text-[#00a6ff] uppercase tracking-wider font-mono">
              SPECIFICATION
            </span>
          </div>
          <h3 className="text-zinc-900 font-bold text-sm sm:text-base leading-snug">
            {currentQ.question}
          </h3>
          {currentQ.why_it_matters && (
            <p className="text-[11px] text-zinc-500 font-normal mt-0.5 leading-tight truncate">
              {currentQ.why_it_matters}
            </p>
          )}
        </div>

        {/* Small Corner Badge: Question Count (e.g. 1/3) */}
        <div className="shrink-0 flex items-center gap-1 bg-zinc-100 border border-zinc-200/90 text-zinc-600 px-2 py-0.5 rounded-full text-xs font-mono font-bold">
          <span className="text-[#00a6ff]">{currentStepIndex + 1}</span>
          <span>/</span>
          <span>{totalQuestions}</span>
        </div>
      </div>

      {/* Options: Compact Pills Below Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id || currentStepIndex}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.15 }}
          className="space-y-2 pt-0.5"
        >
          {currentQ.options && currentQ.options.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {currentQ.options.map((opt: string, optIdx: number) => {
                const isSelected = isMulti ? selectedMultiList.includes(opt) : currentAnswer === opt;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectOption(opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#00a6ff] text-white border-[#00a6ff] shadow-[0_2px_10px_rgba(0,166,255,0.4)] scale-[1.02]'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200/90 hover:border-zinc-300'
                    } active:scale-95 disabled:opacity-50`}
                  >
                    {isSelected && <Check size={12} strokeWidth={2.5} className="shrink-0" />}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Bottom Bar: Compact Input + Back (<) and Forward (>) Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              disabled={disabled}
              placeholder={currentQ.default ? `Custom: ${currentQ.default}` : 'Or type requirement...'}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !disabled) {
                  e.preventDefault();
                  advanceNextStep();
                }
              }}
              className="flex-1 bg-zinc-50 border border-zinc-200/90 focus:border-[#00a6ff] focus:bg-white rounded-xl px-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all disabled:opacity-50 font-medium"
            />

            {/* Back Button (<) */}
            <button
              type="button"
              disabled={disabled || currentStepIndex === 0}
              onClick={handlePrevStep}
              className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all cursor-pointer border border-zinc-200/80 active:scale-95 shrink-0"
              title="Previous question"
              aria-label="Previous question"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Forward / Next Button (>) */}
            <button
              type="button"
              disabled={disabled}
              onClick={() => advanceNextStep()}
              className="w-8 h-8 rounded-xl bg-[#00a6ff] hover:bg-[#0094e6] text-white flex items-center justify-center transition-all cursor-pointer shadow-[0_0_12px_rgba(0,166,255,0.4)] active:scale-95 disabled:opacity-50 shrink-0"
              title={isLastQuestion ? 'Confirm answers' : 'Next question'}
              aria-label={isLastQuestion ? 'Confirm answers' : 'Next question'}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
