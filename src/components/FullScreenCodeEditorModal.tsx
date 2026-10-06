import React, { useState, useEffect, useRef } from 'react';
import { X, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FullScreenCodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode: string;
  fileName?: string;
  language?: string;
  onSave?: (updatedCode: string) => void;
  onOpenInBrowser?: (code: string) => void;
}

export const FullScreenCodeEditorModal: React.FC<FullScreenCodeEditorModalProps> = ({
  isOpen,
  onClose,
  initialCode,
  fileName = 'index.html',
  language = 'html',
  onSave,
  onOpenInBrowser: _onOpenInBrowser,
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync initial code when opened
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode, isOpen]);

  // Synchronize textarea scroll with line numbers
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const lines = code.split('\n');
  const lineCount = lines.length;

  const isHtml =
    language.toLowerCase() === 'html' ||
    fileName.toLowerCase().endsWith('.html') ||
    fileName.toLowerCase().endsWith('.htm') ||
    code.includes('<!DOCTYPE') ||
    code.includes('<html');

  // Handle Tab key inside textarea for smooth indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      if (onSave) onSave(newCode);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-white text-zinc-900 font-sans select-none overflow-hidden"
      >
        {/* Top IDE Header / Title Bar */}
        <div className="h-13 bg-white border-b border-zinc-200 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none">
          {/* Left: Window controls & active file tab */}
          <div className="flex items-center gap-3 min-w-0">
            {/* macOS-style decorative control dots */}
            <div className="flex items-center gap-1.5 mr-2">
              <button
                type="button"
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer"
                title="Close"
              />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            {/* Active File Tab */}
            <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-mono font-medium text-zinc-800 shadow-sm">
              <FileCode size={15} className="text-[#00a6ff] shrink-0" />
              <span className="truncate">{fileName}</span>
            </div>

            <span className="hidden md:inline-flex text-[11px] font-mono text-zinc-500 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">
              {lineCount} lines • {code.length} chars
            </span>
          </div>

          {/* Right Action: ONLY Close Button per user requirement */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-black transition-all cursor-pointer border border-zinc-200 shadow-sm active:scale-95"
              title="Close Code Editor"
              aria-label="Close Code Editor"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Code Editor Main Body: Line numbers + Live Editable Textarea (Pure White Background) */}
        <div className="flex-1 flex overflow-hidden relative bg-white">
          {/* Synchronized Line Numbers Column */}
          <div
            ref={lineNumbersRef}
            aria-hidden="true"
            className="w-12 sm:w-16 shrink-0 py-4 bg-zinc-50 border-r border-zinc-200 text-right pr-3 select-none overflow-hidden font-mono text-xs sm:text-sm text-zinc-400 leading-6 tracking-normal"
          >
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Editable Textarea with Full Keyboard Control */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (onSave) onSave(e.target.value);
            }}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="flex-1 w-full h-full p-4 font-mono text-xs sm:text-sm leading-6 text-zinc-900 bg-white resize-none focus:outline-none selection:bg-[#00a6ff]/20 selection:text-zinc-900 caret-[#00a6ff] no-scrollbar overflow-auto whitespace-pre"
            style={{ tabSize: 2 }}
            placeholder="Type or paste your code here..."
          />
        </div>

        {/* Bottom IDE Status Bar */}
        <div className="h-7 bg-zinc-50 border-t border-zinc-200 px-4 flex items-center justify-between text-[11px] font-mono text-zinc-500 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Interactive Editor
            </span>
            <span className="hidden sm:inline text-zinc-300">•</span>
            <span className="hidden sm:inline">UTF-8</span>
            <span className="hidden sm:inline text-zinc-300">•</span>
            <span className="hidden sm:inline">Spaces: 2</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-zinc-400">
              Press Ctrl+S to save changes • Tab inserts 2 spaces
            </span>
            <span className="text-zinc-700 font-semibold uppercase">{language}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
