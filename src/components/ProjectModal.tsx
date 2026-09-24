import React from 'react';
import { Project } from '../types';
import { X, CheckCircle2, ArrowUpRight, Calendar, User, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onInquire: (projectName: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onInquire,
}) => {
  if (!project) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#0c0c12] border border-white/10 rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/15 transition-all duration-200 cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
            {/* Hero Image in Modal */}
            <div className="relative aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-black/40 border border-white/10">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium text-white bg-black/70 backdrop-blur-md border border-white/20">
                  {project.year} AI Session
                </span>
              </div>
            </div>

            {/* Header info */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium text-zinc-300 bg-white/[0.05] rounded-full border border-white/[0.08]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-black text-white"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {project.title}
              </h2>
              <p className="text-[#f41151] font-medium text-sm sm:text-base mt-1">
                {project.subtitle}
              </p>
            </div>

            {/* Quick Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-300">
                <User size={16} className="text-[#f41151]" />
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase font-mono">Client</div>
                  <div className="font-semibold">{project.client}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-300">
                <Calendar size={16} className="text-[#f41151]" />
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase font-mono">Year</div>
                  <div className="font-semibold">{project.year}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-zinc-300 col-span-2 sm:col-span-1">
                <Tag size={16} className="text-[#f41151]" />
                <div>
                  <div className="text-zinc-500 text-[10px] uppercase font-mono">Category</div>
                  <div className="font-semibold">{project.tags[0]}</div>
                </div>
              </div>
            </div>

            {/* Overview & Deliverables */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              <div className="md:col-span-7">
                <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-2">
                  AI Creation Overview
                </h4>
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="md:col-span-5 bg-white/[0.02] p-4 sm:p-5 rounded-2xl border border-white/[0.05]">
                <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-3">
                  Scope &amp; Model Deliverables
                </h4>
                <div className="space-y-2">
                  {project.deliverables.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <CheckCircle2 size={16} className="text-[#f41151] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-zinc-400 text-xs sm:text-sm text-center sm:text-left">
                Need a similar generative identity or packaging system?
              </p>
              <button
                onClick={() => {
                  onClose();
                  onInquire(project.title);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#f41151] hover:bg-[#ff1e5d] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#f41151]/30 transition-all cursor-pointer"
              >
                <span>Open Conversation</span>
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
