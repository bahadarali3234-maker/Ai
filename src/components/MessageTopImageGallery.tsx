import React, { useState } from 'react';
import {
  Download,
  Maximize2,
  X,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Copy,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface GalleryImage {
  id: string;
  url: string;
  thumbnail?: string;
  alt: string;
  title?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  sourceDomain?: string;
  width?: number;
  height?: number;
  score?: number;
}

export interface SubjectGalleryGroup {
  label: string;
  intent?: string;
  shortReplyText?: string;
  images: GalleryImage[];
  backupPool?: GalleryImage[];
  googleSearchUrl?: string;
}

export interface MessageTopImageGalleryProps {
  promptOrTopic?: string;
  subjects?: SubjectGalleryGroup[];
  customImages?: GalleryImage[];
  mode?: 'NONE' | 'AUTO_REFERENCE' | 'USER_REQUESTED';
  shortReplyText?: string;
  googleSearchUrl?: string;
}

/**
 * Message Top Image Gallery
 * Displays real photographic references curated by Image Planner & Multi-source Crawler.
 * Features:
 * - Multi-subject labeled galleries (e.g. "Ferrari SF90" & "Lamborghini Revuelto")
 * - Source domain chips on every card (e.g. "wikimedia.org")
 * - Silent auto-replace on broken image (onError pulls from backupPool)
 * - Full-screen interactive lightbox with zoom, pan, copy link, and direct download
 * - "Open in Google Images" chip link
 * - "Aur dikhao / Show more" expansion
 */
export const MessageTopImageGallery: React.FC<MessageTopImageGalleryProps> = ({
  promptOrTopic = '',
  subjects,
  customImages,
  mode = 'AUTO_REFERENCE',
  shortReplyText,
  googleSearchUrl,
}) => {
  // If subjects were passed directly by planner
  const [galleryGroups, setGalleryGroups] = useState<SubjectGalleryGroup[]>(() => {
    if (subjects && subjects.length > 0) {
      return subjects;
    }
    if (customImages && customImages.length > 0) {
      return [
        {
          label: promptOrTopic || 'Visual Reference',
          images: customImages,
          backupPool: [],
          googleSearchUrl,
        },
      ];
    }
    return [];
  });

  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // If initial groups are empty and we have a promptOrTopic, fetch from /api/reference-images
  React.useEffect(() => {
    if ((!subjects || subjects.length === 0) && (!customImages || customImages.length === 0) && promptOrTopic.trim()) {
      let isCancelled = false;
      const cleanQ = promptOrTopic
        .replace(/^(find|show|give|search|get|display|me|a|an|the|reference|image|photo|picture|pictures|photos|of|about)\s+/gi, '')
        .trim();

      if (cleanQ.length >= 2) {
        fetch(`/api/reference-images?q=${encodeURIComponent(cleanQ)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (!isCancelled && data?.images && data.images.length > 0) {
              setGalleryGroups([
                {
                  label: promptOrTopic,
                  images: data.images,
                  backupPool: data.backupPool || [],
                  googleSearchUrl: data.googleSearchUrl,
                },
              ]);
            }
          })
          .catch((err) => {
            console.warn('Reference images error:', err);
          });
      }

      return () => {
        isCancelled = true;
      };
    }
  }, [promptOrTopic, subjects, customImages]);

  // Handle broken image: silently swap with next candidate from backup pool
  const handleImageError = (groupIndex: number, imgIndex: number, failedUrl: string) => {
    setGalleryGroups((prev) => {
      const updated = [...prev];
      const grp = { ...updated[groupIndex] };
      const backup = [...(grp.backupPool || [])];

      if (backup.length > 0) {
        // Pop next available backup image
        const nextImg = backup.shift()!;
        const updatedImages = [...grp.images];
        updatedImages[imgIndex] = nextImg;
        grp.images = updatedImages;
        grp.backupPool = backup;
        updated[groupIndex] = grp;
      } else {
        // Fallback to image-proxy if no backup pool item left
        const targetImg = grp.images[imgIndex];
        if (targetImg && !targetImg.url.includes('/api/image-proxy')) {
          const proxiedImg = {
            ...targetImg,
            url: `/api/image-proxy?url=${encodeURIComponent(failedUrl)}`,
            thumbnail: `/api/image-proxy?url=${encodeURIComponent(failedUrl)}`,
          };
          const updatedImages = [...grp.images];
          updatedImages[imgIndex] = proxiedImg;
          grp.images = updatedImages;
          updated[groupIndex] = grp;
        }
      }

      return updated;
    });
  };

  // "Aur dikhao / Show more" expansion
  const handleLoadMoreForGroup = (groupIndex: number) => {
    setGalleryGroups((prev) => {
      const updated = [...prev];
      const grp = { ...updated[groupIndex] };
      const backup = [...(grp.backupPool || [])];
      if (backup.length > 0) {
        const nextBatch = backup.splice(0, 4);
        grp.images = [...grp.images, ...nextBatch];
        grp.backupPool = backup;
        updated[groupIndex] = grp;
      }
      return updated;
    });
  };

  const handleDownload = async (e: React.MouseEvent, img: GalleryImage) => {
    e.stopPropagation();
    setDownloadingId(img.id);
    try {
      const res = await fetch(img.url, { mode: 'cors' });
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const cleanName = (img.title || img.alt || 'reference-image')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 40);
      link.download = `${cleanName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Proxy fallback
      const link = document.createElement('a');
      link.href = `/api/image-proxy?url=${encodeURIComponent(img.url)}`;
      link.target = '_blank';
      link.download = `${img.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent, img: GalleryImage) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(img.url);
      setCopiedId(img.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  // Rule: AUTO_REFERENCE requires at least 3 images; otherwise show nothing silently
  if (mode === 'AUTO_REFERENCE') {
    const totalImages = galleryGroups.reduce((acc, g) => acc + (g.images?.length || 0), 0);
    if (totalImages < 3) {
      return null;
    }
  }

  if (galleryGroups.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-6 select-none space-y-6">
      {/* Short reply text for USER_REQUESTED */}
      {shortReplyText && (
        <div className="text-zinc-200 text-sm font-medium leading-relaxed px-1">
          {shortReplyText}
        </div>
      )}

      {galleryGroups.map((group, gIdx) => {
        const imagesToShow = group.images || [];
        if (imagesToShow.length === 0) return null;

        const defaultGoogleUrl =
          group.googleSearchUrl ||
          googleSearchUrl ||
          `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(group.label)}`;

        return (
          <div key={gIdx} className="space-y-3">
            {/* Group Header Badge & Count */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00a6ff] shadow-[0_0_8px_#00a6ff] animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-zinc-100 tracking-wide">
                  {mode === 'USER_REQUESTED' ? group.label : `Visual reference: ${group.label}`}
                </span>
                <span className="text-[10px] sm:text-xs font-mono bg-zinc-800/90 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700/60 font-semibold">
                  {imagesToShow.length} photos
                </span>
              </div>

              {/* Open in Google Images Chip */}
              <a
                href={defaultGoogleUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[11px] sm:text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors font-medium hover:underline bg-zinc-900/60 px-2.5 py-1 rounded-lg border border-zinc-800"
                title="Search more in Google Images"
              >
                <span>Google Images</span>
                <ExternalLink size={11} className="opacity-70" />
              </a>
            </div>

            {/* Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
              {imagesToShow.map((img, idx) => {
                return (
                  <motion.div
                    key={img.id || `${gIdx}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    onClick={() => {
                      setLightboxImage(img);
                      setZoomLevel(1);
                    }}
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900/90 border border-zinc-800/80 hover:border-[#00a6ff]/70 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_8px_30px_rgba(0,166,255,0.25)] cursor-pointer"
                  >
                    {/* Image */}
                    <img
                      src={img.thumbnail || img.url}
                      alt={img.alt || group.label}
                      loading="lazy"
                      onError={() => handleImageError(gIdx, idx, img.url)}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

                    {/* Source Domain Chip (Top-left) */}
                    {img.sourceDomain && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="text-[10px] font-mono font-medium text-zinc-300 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 shadow-sm truncate max-w-[120px] block">
                          {img.sourceDomain}
                        </span>
                      </div>
                    )}

                    {/* Bottom Caption / Title */}
                    <div className="absolute bottom-2 left-2 right-2 z-10">
                      <p className="text-[11px] font-medium text-white/95 line-clamp-1 leading-tight drop-shadow-md">
                        {img.title || img.alt || group.label}
                      </p>
                    </div>

                    {/* Hover Action Overlay */}
                    <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage(img);
                          setZoomLevel(1);
                        }}
                        className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 transition-all active:scale-95"
                        title="View Fullscreen"
                      >
                        <Maximize2 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(e, img)}
                        className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 transition-all active:scale-95"
                        title="Copy direct image link"
                      >
                        {copiedId === img.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDownload(e, img)}
                        className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 transition-all active:scale-95"
                        title="Download photo"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Aur dikhao / Load more button if backup pool has more images */}
            {group.backupPool && group.backupPool.length > 0 && (
              <div className="pt-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleLoadMoreForGroup(gIdx)}
                  className="px-4 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold border border-zinc-700/80 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-sm"
                >
                  <RefreshCw size={12} />
                  <span>Aur dikhao ({group.backupPool.length} more available)</span>
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* High-Resolution Interactive Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6"
          >
            {/* Top Toolbar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-zinc-800 z-10"
            >
              <div className="flex items-center gap-3 truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00a6ff]" />
                <h3 className="text-sm sm:text-base font-bold truncate">
                  {lightboxImage.title || lightboxImage.alt || 'High-Resolution Reference'}
                </h3>
                {lightboxImage.sourceDomain && (
                  <span className="text-xs font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md border border-zinc-700">
                    {lightboxImage.sourceDomain}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Zoom controls */}
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.25))}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-700 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-mono text-zinc-400 w-10 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-700 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>

                {/* Source link */}
                {lightboxImage.sourceUrl && (
                  <a
                    href={lightboxImage.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-700 flex items-center gap-1.5 text-xs font-medium"
                    title="View Source Page"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}

                {/* Copy Link */}
                <button
                  type="button"
                  onClick={(e) => handleCopyLink(e, lightboxImage)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-700 cursor-pointer"
                  title="Copy Direct Link"
                >
                  {copiedId === lightboxImage.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>

                {/* Download */}
                <button
                  type="button"
                  onClick={(e) => handleDownload(e, lightboxImage)}
                  className="p-2 rounded-xl bg-[#00a6ff] hover:bg-[#0094e6] text-white transition-colors font-bold shadow-[0_0_15px_rgba(0,166,255,0.5)] cursor-pointer"
                  title="Download Image"
                >
                  <Download size={16} />
                </button>

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer ml-2"
                  title="Close (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Lightbox Center Image with zoom */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex-1 w-full flex items-center justify-center overflow-auto p-2"
            >
              <motion.img
                key={lightboxImage.id}
                src={lightboxImage.url}
                alt={lightboxImage.alt}
                animate={{ scale: zoomLevel }}
                transition={{ duration: 0.2 }}
                onError={(e) => {
                  const target = e.currentTarget;
                  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(lightboxImage.url)}`;
                  if (target.src !== proxyUrl && !target.src.includes('/api/image-proxy')) {
                    target.src = proxyUrl;
                  }
                }}
                className="max-h-[82vh] max-w-[90vw] object-contain rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] cursor-grab active:cursor-grabbing border border-zinc-800"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
