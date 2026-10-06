import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download } from 'lucide-react';

export interface WebsitePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  fileName?: string;
  onDownload?: () => void;
}

/**
 * Website Preview Modal
 * Renders the generated live website directly inside an iPhone device frame mockup
 * (matching the user's uploaded chassis screenshot with metallic bezel & dynamic island).
 * Top bar contains ONLY two icon-only buttons: Download & Close (no text names).
 */
export const WebsitePreviewModal: React.FC<WebsitePreviewModalProps> = ({
  isOpen,
  onClose,
  htmlContent,
  fileName = 'preview.html',
  onDownload,
}) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    const cleanName = fileName.endsWith('.html') ? fileName : `${fileName}.html`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[11000] flex flex-col bg-[#070b12]/95 backdrop-blur-2xl text-white select-none overflow-hidden"
      >
        {/* Top Control Bar: ONLY Two Icon-Only Buttons (Download & Close) */}
        <div className="h-16 px-4 sm:px-8 flex items-center justify-between shrink-0 border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00a6ff] shadow-[0_0_10px_#00a6ff] animate-pulse" />
            <span className="text-xs font-mono text-zinc-400 font-semibold tracking-wider uppercase hidden sm:inline">
              Live Device Preview
            </span>
          </div>

          {/* Right: ONLY 2 Buttons (Download & Close) - Icon Only, No Text */}
          <div className="flex items-center gap-3">
            {/* Download Button (Icon Only) */}
            <button
              type="button"
              onClick={handleDownload}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#00a6ff] text-white flex items-center justify-center transition-all cursor-pointer shadow-[0_0_15px_rgba(0,166,255,0.25)] hover:shadow-[0_0_20px_rgba(0,166,255,0.7)] active:scale-95 border border-white/10 hover:border-[#00a6ff]"
              title="Download"
              aria-label="Download"
            >
              <Download size={18} strokeWidth={2.2} />
            </button>

            {/* Close Button (Icon Only) */}
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-white/10"
              title="Close"
              aria-label="Close"
            >
              <X size={20} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Central Display: iPhone Chassis Frame (matching user screenshot) */}
        <div className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="relative w-full max-w-[390px] h-[86vh] max-h-[820px] min-h-[520px] flex items-center justify-center">
            {/* Outer Metallic Bezel (Gold/Titanium Bronze Gradient matching screenshot) */}
            <div className="w-full h-full p-[3px] rounded-[52px] sm:rounded-[56px] bg-gradient-to-b from-[#e3c48d] via-[#a38048] to-[#d4b06f] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(0,166,255,0.2)] flex flex-col">
              {/* Inner Chassis Ring */}
              <div className="w-full h-full bg-[#0d0f12] rounded-[49px] sm:rounded-[53px] p-2.5 sm:p-3 flex flex-col relative shadow-inner">
                {/* Volume Buttons & Power Button Accents on Chassis */}
                <div className="absolute -left-[5px] top-28 w-[3px] h-12 bg-[#8c6b38] rounded-l" />
                <div className="absolute -left-[5px] top-44 w-[3px] h-12 bg-[#8c6b38] rounded-l" />
                <div className="absolute -right-[5px] top-32 w-[3px] h-16 bg-[#8c6b38] rounded-r" />

                {/* iPhone Screen Area */}
                <div className="w-full h-full rounded-[40px] sm:rounded-[44px] overflow-hidden bg-white relative flex flex-col shadow-2xl">
                  {/* Dynamic Island Pill (Center Top) */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 w-28 h-6 bg-black rounded-full flex items-center justify-between px-2.5 pointer-events-none shadow-md">
                    {/* Camera lens highlight */}
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-blue-950/80" />
                    </div>
                    {/* Sensor */}
                    <div className="w-2 h-2 rounded-full bg-zinc-950" />
                  </div>

                  {/* Top Status Bar indicator simulation */}
                  <div className="h-9 w-full bg-transparent shrink-0 flex items-center justify-between px-6 text-[10px] text-zinc-900 font-semibold pointer-events-none select-none z-30 pt-1">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5 opacity-80">
                      <span className="text-[9px] font-mono">5G</span>
                      <div className="w-4 h-2 rounded-sm border border-zinc-900 flex items-center p-0.5">
                        <div className="w-full h-full bg-zinc-900 rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Sandboxed Live HTML Preview iframe inside Phone Screen */}
                  <iframe
                    srcDoc={htmlContent}
                    title="Website Mobile Live Preview"
                    sandbox="allow-scripts allow-forms allow-modals"
                    className="w-full flex-1 border-0 bg-white"
                  />

                  {/* Bottom Home Indicator Bar */}
                  <div className="h-5 w-full bg-white shrink-0 flex items-center justify-center pointer-events-none pb-1">
                    <div className="w-32 h-1 bg-zinc-900/60 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
