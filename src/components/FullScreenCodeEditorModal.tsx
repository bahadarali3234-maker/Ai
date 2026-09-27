import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Copy,
  CheckCircle2,
  Download,
  ExternalLink,
  Save,
  Code2,
  FileCode,
  Sparkles,
} from 'lucide-react';
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
  onOpenInBrowser,
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [copied, setCopied] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sync initial code when opened
  useEffect(() => {
    setCode(initialCode);
    setHasChanges(false);
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
      setHasChanges(true);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      });
    } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(code);
    }
    setHasChanges(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  const handleBrowserPreview = () => {
    if (onOpenInBrowser) {
      onOpenInBrowser(code);
    } else if (isHtml) {
      // Fallback direct preview in new tab
      try {
        const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        if (!win) {
          const a = document.createElement('a');
          a.href = blobUrl;
          a.target = '_blank';
          a.click();
        }
      } catch (err) {
        console.error('Failed to preview in browser:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-[#08080c] text-zinc-100 font-sans select-none overflow-hidden"
      >
        {/* Top IDE Header / Title Bar */}
        <div className="h-13 bg-[#0d0d14] border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none">
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
            <div className="flex items-center gap-2 bg-[#141420] border border-zinc-700/60 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-mono font-medium text-white shadow-sm">
              <FileCode size={15} className="text-[#ff1828] shrink-0" />
              <span className="truncate">{fileName}</span>
              {hasChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" title="Unsaved changes" />
              )}
            </div>

            <span className="hidden md:inline-flex text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
              {lineCount} lines • {code.length} chars
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Direct Browser Preview Button (Opens directly in browser / localhost) */}
            {isHtml && (
              <button
                type="button"
                onClick={handleBrowserPreview}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer active:scale-95"
                title="Open directly in browser tab (Localhost)"
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline">Preview in Browser</span>
              </button>
            )}

            {/* Save / Apply Changes */}
            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95 ${
                saveSuccess
                  ? 'bg-emerald-500 text-white'
                  : hasChanges
                  ? 'bg-[#ff1828] hover:bg-[#e01423] text-white shadow-[0_0_12px_rgba(255,24,40,0.5)]'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
              title="Save Changes (Ctrl+S)"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 size={14} />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save</span>
                </>
              )}
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-all cursor-pointer active:scale-95"
              title="Copy Code to Clipboard"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-all cursor-pointer active:scale-95"
              title="Download File"
            >
              <Download size={14} />
              <span className="hidden sm:inline ml-1.5">Download</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer ml-1"
              title="Exit Fullscreen Editor"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Code Editor Main Body: Line numbers + Live Editable Textarea */}
        <div className="flex-1 flex overflow-hidden relative bg-[#07070a]">
          {/* Synchronized Line Numbers Column */}
          <div
            ref={lineNumbersRef}
            aria-hidden="true"
            className="w-12 sm:w-16 shrink-0 py-4 bg-[#0a0a0f] border-r border-zinc-800/80 text-right pr-3 select-none overflow-hidden font-mono text-xs sm:text-sm text-zinc-600 leading-6 tracking-normal"
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
              setHasChanges(true);
            }}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="flex-1 w-full h-full p-4 font-mono text-xs sm:text-sm leading-6 text-zinc-100 bg-transparent resize-none focus:outline-none selection:bg-[#ff1828]/35 selection:text-white caret-red-400 no-scrollbar overflow-auto whitespace-pre"
            style={{ tabSize: 2 }}
            placeholder="Type or paste your code here..."
          />
        </div>

        {/* Bottom IDE Status Bar */}
        <div className="h-7 bg-[#0b0b12] border-t border-zinc-800/80 px-4 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Interactive Editor
            </span>
            <span className="hidden sm:inline text-zinc-500">•</span>
            <span className="hidden sm:inline">UTF-8</span>
            <span className="hidden sm:inline text-zinc-500">•</span>
            <span className="hidden sm:inline">Spaces: 2</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-zinc-500">
              Press Ctrl+S to save changes • Tab inserts 2 spaces
            </span>
            <span className="text-zinc-300 font-semibold uppercase">{language}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
