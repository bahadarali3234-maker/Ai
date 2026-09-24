import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Copy,
  CheckCircle2,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  ExternalLink,
  Code2,
  Eye,
  FileCode,
  ArrowLeft,
} from 'lucide-react';

export interface WebsitePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  fileName?: string;
  onDownload?: () => void;
}

export const WebsitePreviewModal: React.FC<WebsitePreviewModalProps> = ({
  isOpen,
  onClose,
  htmlContent,
  fileName = 'website.html',
  onDownload,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showCode, setShowCode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [key, setKey] = useState<number>(0);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.endsWith('.html') ? fileName : `${fileName}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Device dimension styling
  const getContainerWidth = () => {
    switch (device) {
      case 'mobile':
        return 'w-[375px] max-w-full';
      case 'tablet':
        return 'w-[768px] max-w-full';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[11000] flex flex-col bg-black/95 backdrop-blur-2xl text-white select-none">
        {/* Top Control Bar */}
        <div className="h-14 px-4 sm:px-6 bg-[#110305] border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
          {/* Left: Back button & Filename */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#ff1828] text-white text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95 group shrink-0 border border-white/15 hover:border-[#ff1828]"
              title="Back to Chat"
              aria-label="Back to Chat"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back</span>
            </button>
            <div className="w-[1px] h-6 bg-white/15 hidden sm:block" />
            <div className="w-8 h-8 rounded-xl bg-[#ff1828]/20 border border-[#ff1828]/40 text-[#ff1828] flex items-center justify-center shrink-0">
              <FileCode size={16} />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs sm:text-sm font-bold text-white truncate max-w-[150px] sm:max-w-xs">
                {fileName}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                Interactive Full Screen Preview
              </span>
            </div>
          </div>

          {/* Center: Device Viewport Switcher */}
          {!showCode && (
            <div className="hidden md:flex items-center bg-black/50 border border-white/10 rounded-full p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
                  device === 'desktop'
                    ? 'bg-[#ff1828] text-white font-semibold shadow-[0_0_12px_rgba(255,24,40,0.5)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor size={14} />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice('tablet')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
                  device === 'tablet'
                    ? 'bg-[#ff1828] text-white font-semibold shadow-[0_0_12px_rgba(255,24,40,0.5)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Tablet View (768px)"
              >
                <Tablet size={14} />
                <span>Tablet</span>
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all cursor-pointer ${
                  device === 'mobile'
                    ? 'bg-[#ff1828] text-white font-semibold shadow-[0_0_12px_rgba(255,24,40,0.5)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone size={14} />
                <span>Mobile</span>
              </button>
            </div>
          )}

          {/* Right: Actions (Refresh, Code/Preview Toggle, Copy, Download, Close) */}
          <div className="flex items-center gap-2">
            {!showCode && (
              <button
                type="button"
                onClick={() => setKey((k) => k + 1)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Refresh Sandbox Frame"
              >
                <RotateCcw size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title={showCode ? 'View Live Preview' : 'Inspect Source Code'}
            >
              {showCode ? <Eye size={13} /> : <Code2 size={13} />}
              <span className="hidden sm:inline">{showCode ? 'Preview' : 'Code'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
              title="Copy complete HTML code"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff1828] hover:bg-[#e01423] text-xs font-semibold text-white shadow-[0_0_14px_rgba(255,24,40,0.6)] transition-all cursor-pointer active:scale-95"
              title="Download standalone .html file"
            >
              <Download size={13} />
              <span>Download .html</span>
            </button>

            <button
              type="button"
              onClick={handleOpenNewTab}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer hidden sm:flex"
              title="Open full page in new tab"
            >
              <ExternalLink size={14} />
            </button>

            <div className="w-[1px] h-6 bg-white/15 mx-1" />

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#ff1828] text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Workspace Canvas */}
        <div className="flex-1 bg-[#050102] flex items-center justify-center overflow-auto p-2 sm:p-4 md:p-6 relative">
          {showCode ? (
            <div className="w-full h-full max-w-5xl rounded-2xl bg-[#090204] border border-white/15 overflow-auto p-4 font-mono text-xs sm:text-sm text-zinc-200 select-text leading-relaxed">
              <pre className="whitespace-pre-wrap">{htmlContent}</pre>
            </div>
          ) : (
            <div
              className={`h-full transition-all duration-300 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-white flex flex-col ${getContainerWidth()}`}
            >
              {/* Browser chrome header bar */}
              <div className="h-8 bg-zinc-900 border-b border-zinc-800 px-3 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="bg-zinc-800/80 rounded-md px-3 py-0.5 text-[11px] font-mono text-zinc-400 truncate max-w-xs">
                  https://preview.local/{fileName}
                </div>
                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </div>
              </div>

              {/* Live iframe */}
              <iframe
                key={key}
                srcDoc={htmlContent}
                title="Single-File Website Live Sandbox"
                sandbox="allow-scripts allow-forms allow-modals"
                className="w-full flex-1 border-0 bg-white"
              />
            </div>
          )}
        </div>
      </div>
    </AnimatePresence>
  );
};
