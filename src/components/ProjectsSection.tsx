import React, { useRef } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Project } from '../types';
import { motion, useScroll, useTransform } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

interface ProjectsSectionProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenProjectChat?: (project: Project) => void;
}

interface StickyCardProps {
  project: Project;
  index: number;
  total: number;
  onSelectProject: (project: Project) => void;
  onOpenProjectChat?: (project: Project) => void;
}

const StickyProjectCard: React.FC<StickyCardProps> = ({
  project,
  index,
  total,
  onSelectProject,
  onOpenProjectChat,
}) => {
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Scroll tracking for card depth stacking effect
  const { scrollYProgress } = useScroll({
    target: cardContainerRef,
    offset: ['start start', 'end start'],
  });

  // Previous card scales down subtly and dims as the next card stacks over it
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.65]);

  return (
    <div
      ref={cardContainerRef}
      className="sticky mb-12 sm:mb-20"
      style={{
        top: `calc(5.5rem + ${index * 1.5}rem)`,
        zIndex: index + 10,
      }}
    >
      <motion.div
        style={{
          scale,
          opacity,
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: isLight
            ? '0 10px 30px rgba(71, 105, 135, 0.12), -6px -6px 20px rgba(255, 255, 255, 0.95)'
            : '0 -15px 40px rgba(0,0,0,0.85), 0 25px 60px rgba(0,0,0,0.95)',
        }}
        id={`project-card-${project.id}`}
        onClick={() => onSelectProject(project)}
        className="backdrop-blur-3xl border rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 lg:p-9 transition-all duration-300 group cursor-pointer overflow-hidden relative"
      >
        {/* Subtle accent glow behind card */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 transition-all duration-500"
          style={{
            backgroundColor: isLight ? 'rgba(77, 163, 255, 0.12)' : 'rgba(255, 23, 68, 0.12)',
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
          {/* Left Column: Information, Tags, & Action */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4 sm:space-y-6">
            {/* Top Indicator & Year Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className="font-mono text-sm sm:text-base font-bold tracking-wider"
                  style={{ color: 'var(--primary)' }}
                >
                  0{index + 1} / 0{total}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--text-muted)' }}
                />
                <span
                  className="text-xs sm:text-sm font-medium uppercase tracking-wider flex items-center gap-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Sparkles size={12} style={{ color: 'var(--primary)' }} />
                  <span>Featured AI Creation</span>
                </span>
              </div>

              <span
                className="px-3 py-1 rounded-full text-xs font-mono font-medium border transition-colors"
                style={{
                  backgroundColor: 'var(--surface-soft)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                {project.year}
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h3
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight transition-colors"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  color: 'var(--text)',
                }}
              >
                {project.title}
              </h3>
              <p
                className="text-xs sm:text-sm font-medium mt-1 transition-colors"
                style={{ color: 'var(--primary)' }}
              >
                {project.subtitle}
              </p>
              <p
                className="text-xs sm:text-sm leading-relaxed mt-3 line-clamp-3 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {project.description}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium rounded-full border transition-colors"
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

            {/* Action Button */}
            <div className="pt-2 flex items-center gap-4">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenProjectChat) {
                    onOpenProjectChat(project);
                  } else {
                    onSelectProject(project);
                  }
                }}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 theme-button-primary"
              >
                <span>Open Conversation</span>
                <ArrowUpRight size={15} />
              </button>

              <span
                className="text-xs hidden sm:inline transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                Click card for case study or button to open conversation
              </span>
            </div>
          </div>

          {/* Right Column: Large Cinematic Visual Preview */}
          <div
            className="lg:col-span-6 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-[22px] sm:rounded-[26px] overflow-hidden border transition-all shadow-xl"
            style={{
              backgroundColor: 'var(--surface-soft)',
              borderColor: 'var(--border)',
            }}
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover object-center transform group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              referrerPolicy="no-referrer"
            />
            {/* Soft overlay gradient */}
            <div
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                background: isLight
                  ? 'linear-gradient(to top, rgba(244, 248, 252, 0.5), transparent)'
                  : 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              }}
            />

            {/* Floating zoom indicator */}
            <div
              className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-all group-hover:scale-105"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
              }}
            >
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  onSelectProject,
  onOpenProjectChat,
}) => {
  return (
    <section
      id="work"
      className="py-20 sm:py-24 relative transition-colors duration-380"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Stacking Instruction */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span
              className="font-semibold text-xs sm:text-sm tracking-widest uppercase flex items-center gap-1.5 mb-1"
              style={{ color: 'var(--primary)' }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--primary)' }}
              />
              <span>Recent AI Sessions</span>
            </span>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight transition-colors"
              style={{
                fontFamily: "'Syne', sans-serif",
                color: 'var(--text)',
              }}
            >
              Featured{' '}
              <span style={{ color: 'var(--primary)' }}>Creations</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xs sm:text-sm max-w-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            Scroll down to reveal each AI creation as it stacks in place. Click any creation to open the conversation.
          </motion.p>
        </div>

        {/* Sticky Stacking Cards Container */}
        <div className="relative pb-8 sm:pb-14">
          {projects.map((project, idx) => (
            <StickyProjectCard
              key={project.id}
              project={project}
              index={idx}
              total={projects.length}
              onSelectProject={onSelectProject}
              onOpenProjectChat={onOpenProjectChat}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
