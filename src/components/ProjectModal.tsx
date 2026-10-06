import React from 'react';
import { Project } from '../types';
import { X, CheckCircle2, ArrowUpRight, Calendar, User, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  const isLight = theme === 'light';

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
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl border rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl z-10 my-auto max-h-[90vh] flex flex-col transition-colors duration-300"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: 'var(--surface-soft)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            <X size={20} />
          </button>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
            {/* Hero Image in Modal */}
            <div
              className="relative aspect-[16/9] rounded-2xl sm:rounded-3xl overflow-hidden border"
              style={{
                backgroundColor: 'var(--surface-soft)',
                borderColor: 'var(--border)',
              }}
            >
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4">
                <span
                  className="px-3.5 py-1.5 rounded-full text-xs font-mono font-medium backdrop-blur-md border shadow"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
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
                    className="px-3 py-1 text-xs font-medium rounded-full border"
                    style={{
                      backgroundColor: 'var(--surface-soft)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-black transition-colors"
                style={{ fontFamily: "'Syne', sans-serif", color: 'var(--text)' }}
              >
                {project.title}
              </h2>
              <p className="font-medium text-sm sm:text-base mt-1" style={{ color: 'var(--primary)' }}>
                {project.subtitle}
              </p>
            </div>

            {/* Quick Metadata Bar */}
            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl border"
              style={{
                backgroundColor: 'var(--surface-soft)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-center gap-2.5 text-xs sm:text-sm" style={{ color: 'var(--text)' }}>
                <User size={16} style={{ color: 'var(--primary)' }} />
                <div>
                  <div className="text-[10px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Client</div>
                  <div className="font-semibold">{project.client}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm" style={{ color: 'var(--text)' }}>
                <Calendar size={16} style={{ color: 'var(--primary)' }} />
                <div>
                  <div className="text-[10px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Year</div>
                  <div className="font-semibold">{project.year}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm col-span-2 sm:col-span-1" style={{ color: 'var(--text)' }}>
                <Tag size={16} style={{ color: 'var(--primary)' }} />
                <div>
                  <div className="text-[10px] uppercase font-mono" style={{ color: 'var(--text-muted)' }}>Category</div>
                  <div className="font-semibold">{project.tags[0]}</div>
                </div>
              </div>
            </div>

            {/* Overview & Deliverables */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              <div className="md:col-span-7">
                <h4 className="font-bold text-sm tracking-wider uppercase mb-2" style={{ color: 'var(--text)' }}>
                  AI Creation Overview
                </h4>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </p>
              </div>

              <div
                className="md:col-span-5 p-4 sm:p-5 rounded-2xl border"
                style={{
                  backgroundColor: 'var(--surface-soft)',
                  borderColor: 'var(--border)',
                }}
              >
                <h4 className="font-bold text-sm tracking-wider uppercase mb-3" style={{ color: 'var(--text)' }}>
                  Scope &amp; Model Deliverables
                </h4>
                <div className="space-y-2">
                  {project.deliverables.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} className="shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div
              className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ borderColor: 'var(--border)' }}
            >
              <p className="text-xs sm:text-sm text-center sm:text-left" style={{ color: 'var(--text-secondary)' }}>
                Need a similar generative identity or packaging system?
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onInquire(project.title);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-full text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer theme-button-primary"
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
