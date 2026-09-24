import React, { useState } from 'react';
import {
  X,
  Search,
  FolderGit2,
  FileCode2,
  Clock,
  History,
  ExternalLink,
  RotateCcw,
  Copy,
  Check,
  Download,
  Eye,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Code2,
  FileText,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectMemory, Artifact, ArtifactVersion } from '../types';
import { memoryManager } from '../utils/memoryManager';

interface ProjectMemoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArtifactForPreview: (htmlContent: string, title: string) => void;
  onSelectProjectForChat: (project: ProjectMemory, promptSnippet?: string) => void;
  showToast: (msg: string) => void;
}

export const ProjectMemoryDrawer: React.FC<ProjectMemoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectArtifactForPreview,
  onSelectProjectForChat,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'html' | 'code' | 'recent'>('all');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [viewingVersionArtifact, setViewingVersionArtifact] = useState<Artifact | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const projects = memoryManager.getProjects();

  // Search filter
  const filteredProjects = projects.filter((proj) => {
    if (!searchQuery.trim()) {
      if (activeTab === 'html') {
        return proj.artifacts.some((a) => a.type === 'html');
      }
      if (activeTab === 'code') {
        return proj.artifacts.some((a) => a.type === 'tsx' || a.type === 'code');
      }
      return true;
    }
    const q = searchQuery.toLowerCase();
    const matchName = proj.name.toLowerCase().includes(q);
    const matchDesc = proj.description.toLowerCase().includes(q);
    const matchSummary = proj.summary.toLowerCase().includes(q);
    const matchTags = proj.tags.some((t) => t.toLowerCase().includes(q));
    const matchArtifacts = proj.artifacts.some(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q)
    );
    return matchName || matchDesc || matchSummary || matchTags || matchArtifacts;
  });

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    showToast('Code copied to clipboard');
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleDownload = (artifact: Artifact) => {
    const blob = new Blob([artifact.content], {
      type: artifact.type === 'html' ? 'text/html' : 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = artifact.name || 'code.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${artifact.name}`);
  };

  const handleRevertVersion = (
    projectId: string,
    artifactId: string,
    versionNumber: number
  ) => {
    const updated = memoryManager.revertArtifactVersion(
      projectId,
      artifactId,
      versionNumber
    );
    if (updated) {
      showToast(`Reverted ${updated.name} to v${versionNumber}`);
      setViewingVersionArtifact(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, x: 380 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 380 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="w-full max-w-2xl h-full bg-[#0a0a0c] border-l border-zinc-800 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(255,24,40,0.25)]">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Persistent Project Memory & Artifacts
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800/40 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Long-term conversation storage, multi-version artifacts, and code recovery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/40 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, code, artifacts, BMW telemetry, websites, versions..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/90 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-600 transition"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'all'
                  ? 'bg-red-950/60 border border-red-800/50 text-red-400'
                  : 'bg-zinc-800/40 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All Projects ({projects.length})
            </button>
            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'html'
                  ? 'bg-red-950/60 border border-red-800/50 text-red-400'
                  : 'bg-zinc-800/40 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Websites (HTML)
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'code'
                  ? 'bg-red-950/60 border border-red-800/50 text-red-400'
                  : 'bg-zinc-800/40 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Components (TSX/Code)
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FolderGit2 className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-zinc-400">
                No matching projects or artifacts found
              </p>
              <p className="text-xs text-zinc-600 mt-1 max-w-sm mx-auto">
                Try searching for "BMW", "CreativeDrive", "Telemetry", "Landing Page", or generate a new single-file website.
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const isExpanded =
                expandedProjectId === project.id || filteredProjects.length === 1;

              return (
                <div
                  key={project.id}
                  className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-lg transition hover:border-zinc-700/80"
                >
                  {/* Project Summary Header */}
                  <div
                    onClick={() =>
                      setExpandedProjectId(isExpanded ? null : project.id)
                    }
                    className="p-4 cursor-pointer flex items-start justify-between gap-3 hover:bg-zinc-800/30 transition"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/40">
                          {project.id}
                        </span>
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {project.name}
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Updated{' '}
                          {new Date(project.updatedAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span>{project.artifacts.length} Artifact(s)</span>
                        <span>•</span>
                        <span className="text-red-400 font-semibold">
                          v{Math.max(...project.artifacts.map((a) => a.version), 1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProjectForChat(
                            project,
                            `Modify the code for ${project.name}: `
                          );
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-red-950/60 border border-red-800/40 text-red-400 hover:bg-red-900/60 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Open in Chat to edit"
                      >
                        Modify in Chat
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-zinc-500 p-1">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Artifacts and Decisions */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800/60 bg-zinc-950/50 p-4 space-y-4">
                      {/* Preserved User Decisions */}
                      {project.decisions && project.decisions.length > 0 && (
                        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-red-500" />
                            Preserved Requirements & Decisions
                          </div>
                          <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                            {project.decisions.map((dec, i) => (
                              <li key={i}>{dec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Artifacts List */}
                      <div className="space-y-3">
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          Artifacts & Versions
                        </div>

                        {project.artifacts.map((art) => (
                          <div
                            key={art.id}
                            className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
                                  {art.type === 'html' ? (
                                    <FileCode2 className="w-4 h-4 text-red-400" />
                                  ) : (
                                    <Code2 className="w-4 h-4 text-zinc-300" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-white">
                                      {art.name}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800/50 text-[10px] font-bold text-red-300">
                                      v{art.version} (Latest)
                                    </span>
                                  </div>
                                  <div className="text-xs text-zinc-400 mt-0.5">
                                    {art.title}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {art.type === 'html' && (
                                  <button
                                    onClick={() =>
                                      onSelectArtifactForPreview(
                                        art.content,
                                        art.title
                                      )
                                    }
                                    className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-[0_0_12px_rgba(255,24,40,0.3)]"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    Preview
                                  </button>
                                )}
                                <button
                                  onClick={() => handleCopy(art.id, art.content)}
                                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition"
                                  title="Copy Code"
                                >
                                  {copiedCodeId === art.id ? (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDownload(art)}
                                  className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition"
                                  title="Download File"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Version History Drawer Toggle */}
                            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                              <span className="flex items-center gap-1.5">
                                <History className="w-3.5 h-3.5 text-zinc-500" />
                                {art.versions.length} version(s) in history
                              </span>
                              <button
                                onClick={() =>
                                  setViewingVersionArtifact(
                                    viewingVersionArtifact?.id === art.id
                                      ? null
                                      : art
                                  )
                                }
                                className="text-red-400 hover:text-red-300 font-medium transition"
                              >
                                {viewingVersionArtifact?.id === art.id
                                  ? 'Hide Version History'
                                  : 'View All Versions'}
                              </button>
                            </div>

                            {/* Detailed Version History List */}
                            {viewingVersionArtifact?.id === art.id && (
                              <div className="mt-3 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80 space-y-2">
                                <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                                  Version History for {art.name}
                                </div>
                                <div className="space-y-2">
                                  {art.versions.map((v) => (
                                    <div
                                      key={v.version}
                                      className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800/60 flex items-center justify-between text-xs"
                                    >
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-white">
                                            Version {v.version}
                                          </span>
                                          {v.version === art.version && (
                                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                                              Current
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-zinc-400 text-[11px] mt-0.5">
                                          {v.changelog || 'Saved version'}
                                        </p>
                                        <span className="text-[10px] text-zinc-500">
                                          {new Date(v.timestamp).toLocaleString()}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        {art.type === 'html' && (
                                          <button
                                            onClick={() =>
                                              onSelectArtifactForPreview(
                                                v.content,
                                                `${art.title} (v${v.version})`
                                              )
                                            }
                                            className="p-1 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1"
                                          >
                                            <Eye className="w-3 h-3" />
                                            Preview
                                          </button>
                                        )}
                                        {v.version !== art.version && (
                                          <button
                                            onClick={() =>
                                              handleRevertVersion(
                                                project.id,
                                                art.id,
                                                v.version
                                              )
                                            }
                                            className="p-1 px-2 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/40 text-[11px] flex items-center gap-1"
                                            title="Revert back to this version"
                                          >
                                            <RotateCcw className="w-3 h-3" />
                                            Revert
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 flex items-center justify-between text-xs text-zinc-500">
          <span>Continuous Memory Engine Active</span>
          <span className="text-zinc-400">Groq Primary + Gemini Failover</span>
        </div>
      </motion.div>
    </div>
  );
};
