import React, { useRef } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Project } from '../types';
import { motion, useScroll, useTransform } from 'motion/react';

interface ProjectsSectionProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

interface StickyCardProps {
  project: Project;
  index: number;
  total: number;
  onSelectProject: (project: Project) => void;
}

const StickyProjectCard: React.FC<StickyCardProps> = ({
  project,
  index,
  total,
  onSelectProject,
}) => {
  const cardContainerRef = useRef<HTMLDivElement>(null);

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
        style={{ scale, opacity }}
        id={`project-card-${project.id}`}
        onClick={() => onSelectProject(project)}
        className="bg-[#0e0e16]/95 backdrop-blur-3xl border border-white/10 hover:border-[#f41151]/50 rounded-[28px] sm:rounded-[36px] p-5 sm:p-7 lg:p-9 shadow-[0_-15px_40px_rgba(0,0,0,0.85),0_25px_60px_rgba(0,0,0,0.95)] transition-colors duration-300 group cursor-pointer overflow-hidden relative"
      >
        {/* Subtle accent glow behind card */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#f41151]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-[#f41151]/15 transition-all" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
          {/* Left Column: Information, Tags, & Action */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4 sm:space-y-6">
            {/* Top Indicator & Year Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-[#f41151] font-mono text-sm sm:text-base font-bold tracking-wider">
                  0{index + 1} / 0{total}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                <span className="text-zinc-400 text-xs sm:text-sm font-medium uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-[#f41151]" />
                  <span>Featured AI Creation</span>
                </span>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium text-white/90 bg-white/5 border border-white/10">
                {project.year}
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h3
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight group-hover:text-zinc-100 transition-colors"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {project.title}
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1 text-zinc-300">
                {project.subtitle}
              </p>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed mt-3 line-clamp-3">
                {project.description}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium text-zinc-300 bg-white/[0.05] rounded-full border border-white/[0.08]"
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
                  onSelectProject(project);
                }}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#f41151] hover:bg-[#ff1e5d] active:scale-95 text-white font-semibold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(244,17,81,0.4)] cursor-pointer"
              >
                <span>Open Conversation</span>
                <ArrowUpRight size={15} />
              </button>

              <span className="text-zinc-500 text-xs hidden sm:inline">
                Click to inspect generative parameters &amp; outputs
              </span>
            </div>
          </div>

          {/* Right Column: Large Cinematic Visual Preview */}
          <div className="lg:col-span-6 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] rounded-[22px] sm:rounded-[26px] overflow-hidden bg-[#12121c] border border-white/10 group-hover:border-white/20 transition-all shadow-xl">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover object-center transform group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              referrerPolicy="no-referrer"
            />
            {/* Soft overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 pointer-events-none" />

            {/* Floating zoom indicator */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white group-hover:bg-[#f41151] transition-all">
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
}) => {
  return (
    <section id="work" className="py-20 sm:py-24 bg-[#070709] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Stacking Instruction */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[#f41151] font-semibold text-xs sm:text-sm tracking-widest uppercase flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#f41151] animate-pulse" />
              <span>Recent AI Sessions</span>
            </span>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Featured <span className="text-[#f41151]">Creations</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-zinc-400 text-xs sm:text-sm max-w-sm"
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
            />
          ))}
        </div>
      </div>
    </section>
  );
};
