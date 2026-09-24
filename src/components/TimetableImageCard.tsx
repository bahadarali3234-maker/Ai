import React, { useState, useRef } from 'react';
import { Download, CheckCircle2, Clock, Calendar, Sparkles, Maximize2, Share2, Layers } from 'lucide-react';
import { motion } from 'motion/react';

export interface TimetableSlot {
  time: string;
  activity: string;
  category: 'Morning' | 'Deep Work' | 'Fitness' | 'Nutrition' | 'Evening' | 'Sleep' | 'Break' | 'General';
  description?: string;
}

export interface TimetableImageCardProps {
  title?: string;
  subtitle?: string;
  wakeTime?: string;
  focus?: string;
  slots: TimetableSlot[];
  onOpenFullScreen?: () => void;
}

export const TimetableImageCard: React.FC<TimetableImageCardProps> = ({
  title = 'DAILY ROUTINE MASTER TIMETABLE',
  subtitle = 'High-Performance Structured Schedule',
  wakeTime,
  focus,
  slots,
  onOpenFullScreen,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Category badge colors
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'morning':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'deep work':
        return 'text-[#ff1828] bg-[#ff1828]/10 border-[#ff1828]/30';
      case 'fitness':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'nutrition':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
      case 'evening':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'sleep':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default:
        return 'text-zinc-300 bg-white/5 border-white/10';
    }
  };

  // High-Resolution 2X Retina PNG Canvas Generator & Downloader
  const handleDownloadPNG = async () => {
    try {
      setDownloading(true);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 1200;
      const rowHeight = 72;
      const headerHeight = 220;
      const footerHeight = 100;
      const totalHeight = headerHeight + slots.length * rowHeight + footerHeight;

      // 2X Scale for Ultra-Crisp Retina Displays & Mobile Wallpapers
      const scale = 2;
      canvas.width = width * scale;
      canvas.height = totalHeight * scale;
      ctx.scale(scale, scale);

      // Helper for rounded rect on canvas
      const drawRoundRect = (
        x: number,
        y: number,
        w: number,
        h: number,
        r: number
      ) => {
        const anyCtx = ctx as any;
        if (typeof anyCtx.roundRect === 'function') {
          anyCtx.roundRect(x, y, w, h, r);
        } else {
          ctx.rect(x, y, w, h);
        }
      };
      const bgGrad = ctx.createLinearGradient(0, 0, width, totalHeight);
      bgGrad.addColorStop(0, '#0c0204');
      bgGrad.addColorStop(0.5, '#130407');
      bgGrad.addColorStop(1, '#080102');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, totalHeight);

      // Subtle Crimson Glow at Top Left & Center
      const glowGrad = ctx.createRadialGradient(200, 100, 10, 200, 100, 450);
      glowGrad.addColorStop(0, 'rgba(255, 24, 40, 0.18)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, totalHeight);

      // 2. Outer Border & Frame
      ctx.strokeStyle = 'rgba(255, 24, 40, 0.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, width - 60, totalHeight - 60);

      // Top Red Accent Line
      ctx.fillStyle = '#ff1828';
      ctx.fillRect(30, 30, width - 60, 4);

      // 3. Header Section
      // Category Badge Pill
      ctx.fillStyle = 'rgba(255, 24, 40, 0.15)';
      ctx.strokeStyle = 'rgba(255, 24, 40, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      drawRoundRect(60, 60, 260, 30, 15);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ff1828';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('● HIGH-PERFORMANCE TIMETABLE', 75, 80);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(title, 60, 130);

      // Subtitle & Focus tags
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '15px sans-serif';
      const focusText = focus ? `Focus: ${focus}` : subtitle;
      const wakeText = wakeTime ? ` • Start Time: ${wakeTime}` : '';
      ctx.fillText(`${focusText}${wakeText}`, 60, 165);

      // Divider Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(60, 195);
      ctx.lineTo(width - 60, 195);
      ctx.stroke();

      // 4. Hourly Slot Rows
      let startY = headerHeight;

      slots.forEach((slot, idx) => {
        const isEven = idx % 2 === 0;

        // Row background
        if (isEven) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
          ctx.fillRect(60, startY - 10, width - 120, rowHeight - 6);
        }

        // Time Pill Badge
        ctx.fillStyle = 'rgba(255, 24, 40, 0.15)';
        ctx.strokeStyle = 'rgba(255, 24, 40, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        drawRoundRect(75, startY + 6, 170, 34, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(slot.time, 92, startY + 28);

        // Activity Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 17px sans-serif';
        ctx.fillText(slot.activity, 270, startY + 28);

        // Category Tag Pill
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        drawRoundRect(width - 240, startY + 8, 150, 28, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ff6b78';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(slot.category.toUpperCase(), width - 225, startY + 26);

        // Description / Notes if present
        if (slot.description) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.font = '12px sans-serif';
          ctx.fillText(slot.description, 270, startY + 48);
        }

        // Subtle row bottom border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(60, startY + rowHeight - 16);
        ctx.lineTo(width - 60, startY + rowHeight - 16);
        ctx.stroke();

        startY += rowHeight;
      });

      // 5. Footer Section
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '13px sans-serif';
      ctx.fillText('Generated with Intelligent Routine Architect • 100% Dedicated Routine Plan', 60, totalHeight - 50);

      ctx.fillStyle = '#ff1828';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('STATUS: VERIFIED & OPTIMIZED', width - 290, totalHeight - 50);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanName = title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
        a.download = `${cleanName || 'daily-timetable'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setDownloading(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);

        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([40, 20, 40]);
          } catch {}
        }
      }, 'image/png', 1.0);
    } catch (err) {
      console.error('Failed to generate timetable PNG:', err);
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full my-4 rounded-2xl bg-[#0e0305] border border-white/15 overflow-hidden shadow-2xl text-white"
    >
      {/* Top Banner with Red Accent */}
      <div className="h-1 bg-gradient-to-r from-[#ff1828] via-red-500 to-[#ff1828]" />

      <div className="p-4 sm:p-6 bg-gradient-to-b from-[#160508]/80 to-[#0e0305]">
        {/* Header Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ff1828]/20 border border-[#ff1828]/40 text-[#ff1828] flex items-center gap-1">
                <Sparkles size={10} />
                <span>Verified Timetable</span>
              </span>
              {wakeTime && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 border border-white/10 text-zinc-300 flex items-center gap-1">
                  <Clock size={10} />
                  <span>Start: {wakeTime}</span>
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Calendar size={18} className="text-[#ff1828]" />
              <span>{title}</span>
            </h3>
            {focus && (
              <p className="text-xs text-zinc-400 font-sans">
                Priority: <span className="text-zinc-200 font-medium">{focus}</span>
              </p>
            )}
          </div>

          {/* Action Buttons: 1-Click PNG Download & Full Screen */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={downloading}
              onClick={handleDownloadPNG}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#ff1828] hover:bg-[#e01423] text-white text-xs font-semibold shadow-[0_0_15px_rgba(255,24,40,0.5)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Download Timetable as a high-resolution PNG image"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 size={14} className="text-white" />
                  <span>Downloaded PNG</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>{downloading ? 'Exporting...' : 'Download .PNG Image'}</span>
                </>
              )}
            </button>

            {onOpenFullScreen && (
              <button
                type="button"
                onClick={onOpenFullScreen}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-200 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 border border-white/10"
                title="Full Screen Preview with Back Button"
              >
                <Maximize2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Schedule List */}
        <div className="pt-3 divide-y divide-white/5">
          {slots.map((slot, idx) => (
            <div
              key={idx}
              className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-[#ff6b78] bg-[#ff1828]/10 border border-[#ff1828]/20 px-2 py-0.5 rounded-md min-w-[110px] text-center">
                  {slot.time}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-100">
                  {slot.activity}
                </span>
              </div>

              <div className="flex items-center gap-2 pl-3 sm:pl-0">
                {slot.description && (
                  <span className="text-[11px] text-zinc-400 font-sans hidden md:inline">
                    {slot.description}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryColor(
                    slot.category
                  )}`}
                >
                  {slot.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
          <span>100% Complete & Optimized Hourly Strategy</span>
          <button
            type="button"
            onClick={handleDownloadPNG}
            className="text-[#ff1828] hover:underline font-medium flex items-center gap-1 cursor-pointer"
          >
            <Download size={12} />
            <span>Save to Image Gallery</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
