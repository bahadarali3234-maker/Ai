import React, { useState } from 'react';
import { Download, Maximize2, X, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

interface MessageTopImageGalleryProps {
  promptOrTopic: string;
  customImages?: GalleryImage[];
}

/**
 * Returns 3 to 4 topic-related high-resolution images tailored to the prompt.
 * NO links, NO text URLs, NO clutter.
 * Users can click to expand wide and download directly.
 */
export function getRelatedImagesForTopic(text: string): GalleryImage[] {
  const lower = text.toLowerCase();

  // 1. Timetable / Daily Routine / Schedule / Productivity
  if (/timetable|time\s*table|routine|schedule|planner|day\s*plan|morning|productivity/i.test(lower)) {
    return [
      {
        id: 'img-rt-1',
        url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
        alt: 'Morning Meditation & Mobility Routine',
      },
      {
        id: 'img-rt-2',
        url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
        alt: 'Intense Strength & Fitness Workout',
      },
      {
        id: 'img-rt-3',
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        alt: 'High-Focus Deep Work Obsidian Desk Setup',
      },
      {
        id: 'img-rt-4',
        url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
        alt: 'Nutritious Fuel & Clean Diet Meal',
      },
    ];
  }

  // 2. Workout / Fitness / Gym
  if (/workout|fitness|gym|exercise|training|muscle|hypertrophy/i.test(lower)) {
    return [
      {
        id: 'img-fit-1',
        url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
        alt: 'High-Performance Gym Training Facility',
      },
      {
        id: 'img-fit-2',
        url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
        alt: 'Strength & Core Hypertrophy Session',
      },
      {
        id: 'img-fit-3',
        url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
        alt: 'Athletic Conditioning & Dumbbells',
      },
      {
        id: 'img-fit-4',
        url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
        alt: 'Athletic Recovery & Nutrition Bowl',
      },
    ];
  }

  // 3. Study / Exam / Learning / Books
  if (/study|exam|academic|homework|reading|revision|student|book/i.test(lower)) {
    return [
      {
        id: 'img-st-1',
        url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
        alt: 'Deep Focus Academic Study Session',
      },
      {
        id: 'img-st-2',
        url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        alt: 'Digital Research & Learning Station',
      },
      {
        id: 'img-st-3',
        url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
        alt: 'Library Reference & Study Environment',
      },
      {
        id: 'img-st-4',
        url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
        alt: 'Notebook Planning & Exam Preparation',
      },
    ];
  }

  // 4. Automotive / Car / BMW / Supercar / Telemetry
  if (/bmw|car|automotive|vehicle|telemetry|motor|speed|supercar|racing/i.test(lower)) {
    return [
      {
        id: 'img-car-1',
        url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
        alt: 'High-Performance Sports Sedan Frontal',
      },
      {
        id: 'img-car-2',
        url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
        alt: 'Dark Obsidian Performance Coupe',
      },
      {
        id: 'img-car-3',
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
        alt: 'Aerodynamic Supercar Profile',
      },
      {
        id: 'img-car-4',
        url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
        alt: 'Luxury Sport Cockpit & Precision Engineering',
      },
    ];
  }

  // 5. Website / Landing Page / UI Design / Coding / Software
  if (/website|landing\s*page|web\s*app|html|code|design|software|dashboard|ui|developer/i.test(lower)) {
    return [
      {
        id: 'img-web-1',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        alt: 'Modern Dark UI Analytics Dashboard',
      },
      {
        id: 'img-web-2',
        url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
        alt: 'Responsive Web Design & Grid Layout',
      },
      {
        id: 'img-web-3',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        alt: 'Telemetry Visual Data Graphs & Metrics',
      },
      {
        id: 'img-web-4',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        alt: 'High-Tech Digital Code Architecture',
      },
    ];
  }

  // 6. Luxury / Fashion / Editorial / Premium
  if (/luxury|brand|fashion|editorial|minimal|premium|aesthetic/i.test(lower)) {
    return [
      {
        id: 'img-lux-1',
        url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
        alt: 'High-End Editorial Aesthetics',
      },
      {
        id: 'img-lux-2',
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
        alt: 'Luxury Architectural Space & Lighting',
      },
      {
        id: 'img-lux-3',
        url: 'https://images.unsplash.com/photo-1513094735237-8f2714d57c13?auto=format&fit=crop&w=1200&q=80',
        alt: 'Premium Monochrome Material Finish',
      },
      {
        id: 'img-lux-4',
        url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
        alt: 'Minimalist High-Impact Visuals',
      },
    ];
  }

  // 7. General High-Tech / AI / Futuristic Default
  return [
    {
      id: 'img-def-1',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      alt: 'Next-Generation Silicon Neural Engine',
    },
    {
      id: 'img-def-2',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      alt: 'Global Neural Data Sphere & High Connectivity',
    },
    {
      id: 'img-def-3',
      url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
      alt: 'Advanced Quantum Computing Terminal',
    },
    {
      id: 'img-def-4',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
      alt: 'High-Tech Intelligent Workspace',
    },
  ];
}

export const MessageTopImageGallery: React.FC<MessageTopImageGalleryProps> = ({
  promptOrTopic,
  customImages,
}) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const images = customImages && customImages.length >= 3 ? customImages : getRelatedImagesForTopic(promptOrTopic);

  const handleDownloadImage = async (e: React.MouseEvent, img: GalleryImage) => {
    e.stopPropagation();
    setDownloadingId(img.id);
    try {
      const response = await fetch(img.url, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const cleanName = img.alt.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `${cleanName || 'visual-asset'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      setDownloadSuccessId(img.id);
      setTimeout(() => setDownloadSuccessId(null), 2500);
    } catch {
      // Direct anchor fallback
      const link = document.createElement('a');
      link.href = img.url;
      link.target = '_blank';
      link.download = `${img.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccessId(img.id);
      setTimeout(() => setDownloadSuccessId(null), 2500);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="w-full mb-6 select-none">
      {/* 4 Clean Image Grid - Strictly NO Links, NO text URLs, NO clutter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {images.slice(0, 4).map((img, idx) => {
          const isDownloading = downloadingId === img.id;
          const isSuccess = downloadSuccessId === img.id;

          return (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              onClick={() => setSelectedImage(img)}
              className="group relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-black/60 border border-white/15 hover:border-[#ff1828]/60 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(255,24,40,0.25)] transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              {/* Image with subtle hover zoom */}
              <img
                src={img.url}
                alt={img.alt}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
              />

              {/* Sleek subtle dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-40 group-hover:opacity-60 transition-opacity" />

              {/* Hover Action Controls: Expand & Direct Download (NO links, NO text URLs) */}
              <div className="absolute inset-0 p-2.5 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30 backdrop-blur-[2px]">
                {/* Wide Expand Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(img);
                  }}
                  className="w-9 h-9 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-lg"
                  title="Expand Wide Screen"
                  aria-label="Expand Wide Screen"
                >
                  <Maximize2 size={15} />
                </button>

                {/* Direct Download Button */}
                <button
                  type="button"
                  onClick={(e) => handleDownloadImage(e, img)}
                  className="w-9 h-9 rounded-full bg-[#ff1828] hover:bg-[#e01423] text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-[0_0_15px_rgba(255,24,40,0.6)]"
                  title="Download Image"
                  aria-label="Download Image"
                >
                  {isSuccess ? (
                    <Check size={16} className="text-white" />
                  ) : isDownloading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download size={15} />
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Wide Lightbox Modal (Expand Image & Download without links) */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full max-h-[92vh] bg-[#0c0204] border border-white/20 rounded-3xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.9),0_0_30px_rgba(255,24,40,0.2)] flex flex-col"
            >
              {/* Lightbox Header Bar (No link, purely title and controls) */}
              <div className="px-5 py-3.5 bg-[#140306] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff1828] animate-pulse" />
                  <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                    {selectedImage.alt}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Download Button */}
                  <button
                    type="button"
                    onClick={(e) => handleDownloadImage(e, selectedImage)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ff1828] hover:bg-[#e01423] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,24,40,0.5)] transition-all cursor-pointer"
                  >
                    {downloadSuccessId === selectedImage.id ? (
                      <>
                        <Check size={14} />
                        <span>Downloaded</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>Download</span>
                      </>
                    )}
                  </button>

                  {/* Close Lightbox */}
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Wide Image View */}
              <div className="relative flex-1 min-h-[350px] max-h-[75vh] flex items-center justify-center p-3 sm:p-6 bg-black">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl select-none"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
