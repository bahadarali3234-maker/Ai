import React from 'react';
import { MessageSquare, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface FloatingActionWidgetProps {
  onOpenChat: () => void;
}

export const FloatingActionWidget: React.FC<FloatingActionWidgetProps> = ({
  onOpenChat,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      <motion.button
        initial={{ y: 60, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        id="floating-chat-pill"
        onClick={onOpenChat}
        className="flex items-center gap-3.5 sm:gap-4 bg-[#12121c]/90 hover:bg-[#181826]/95 active:scale-95 backdrop-blur-2xl border border-white/20 hover:border-[#f41151]/50 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(244,17,81,0.25)] transition-all duration-300 cursor-pointer group"
      >
        {/* iOS Dynamic Chat Icon Badge with Breathing Glow */}
        <div className="relative">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#f41151] to-[#ff2a6d] text-white flex items-center justify-center shadow-md shadow-[#f41151]/40">
            <MessageSquare size={16} />
          </div>
          {/* Active online green dot */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#12121c]" />
        </div>

        {/* Text prompt with iOS typography */}
        <div className="flex flex-col text-left pr-1">
          <div className="flex items-center gap-1.5">
            <span className="text-white text-xs sm:text-sm font-bold tracking-tight">
              Ask AI
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#f41151]/25 text-[#f41151] font-semibold">
              Live
            </span>
            <ArrowUpRight
              size={13}
              className="text-[#f41151] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </div>
          <span className="text-zinc-400 text-[10px] sm:text-[11px]">
            Gemini Online • Fast response
          </span>
        </div>
      </motion.button>
    </div>
  );
};
