import { ProjectMemory, Artifact, ArtifactVersion, MemoryContextPackage } from '../types';
import { syncProjectMemoryToFirestore } from '../firebase';

const STORAGE_KEY_PROJECTS = 'gemini_project_memory_v2';
const STORAGE_KEY_ACTIVE_PROJECT = 'gemini_active_project_id_v2';

// High-fidelity pre-seeded projects matching the user training specifications
export const SEED_PROJECTS: ProjectMemory[] = [
  {
    id: 'proj-bmw-telemetry',
    name: 'BMW AI Interface / CreativeDrive AI',
    description: 'Autonomous luxury automotive telemetry dashboard and vehicle HUD interface with real-time performance instrumentation.',
    threadId: 'website-discovery',
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-09-18T14:30:00.000Z',
    decisions: [
      'Visual Style: Minimal Premium Dark with Crimson Neon accents',
      'Architecture: Zero-dependency single-file HTML5 + CSS Grid + Canvas Telemetry',
      'Navigation: Multi-tab responsive header with Live Telemetry, Aerodynamics, and Diagnostics',
      'Simulation: Client-side RPM/Velocity boost engine with keyboard and click accelerators',
    ],
    tags: ['bmw', 'creativedrive', 'automotive', 'telemetry', 'dashboard', 'hud', 'html', 'canvas'],
    summary: 'Single-file high-frequency automotive telemetry portal designed for next-gen BMW track analysis with live boost controls and responsive glassmorphism.',
    references: [
      {
        id: 'ref-bmw-1',
        name: 'BMW M Vision Concept Render',
        type: 'image/png',
        role: 'Vehicle aesthetic and color baseline',
        createdAt: '2026-08-15T10:05:00.000Z',
      },
    ],
    artifacts: [
      {
        id: 'art-bmw-1',
        projectId: 'proj-bmw-telemetry',
        name: 'bmw-telemetry.html',
        title: 'BMW AI Interface — Telemetry HUD',
        type: 'html',
        version: 3,
        createdAt: '2026-08-15T10:15:00.000Z',
        updatedAt: '2026-09-18T14:30:00.000Z',
        tags: ['html', 'bmw', 'telemetry', 'dashboard', 'canvas'],
        description: 'Single-file luxury automotive telemetry application featuring responsive top navigation, gauges, and boost simulator.',
        userDecisions: [
          'Changed hero button to crimson glow',
          'Added prompt box for telemetry telemetry triggers',
          'Changed navigation to top-anchored glass bar',
          'Added dynamic RPM dial animation',
        ],
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BMW CreativeDrive AI — Telemetry Matrix</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #060608; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; min-height: 100vh; overflow-x: hidden; }
    nav { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 18px 36px; background: rgba(12, 12, 16, 0.85); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(255, 24, 40, 0.25); }
    .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 1.15rem; letter-spacing: 0.5px; }
    .brand-dot { width: 10px; height: 10px; border-radius: 50%; background: #ff1828; box-shadow: 0 0 12px #ff1828; }
    .nav-links { display: flex; gap: 24px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
    .nav-links a { color: #a1a1aa; text-decoration: none; transition: color 0.2s; }
    .nav-links a:hover, .nav-links a.active { color: #ff1828; }
    .hero { max-width: 1100px; margin: 40px auto; padding: 0 24px; text-align: center; }
    .pill { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 24px; background: rgba(255, 24, 40, 0.12); border: 1px solid rgba(255, 24, 40, 0.35); color: #ff1828; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 24px; }
    h1 { font-size: 3.2rem; font-weight: 800; letter-spacing: -1px; margin-bottom: 16px; line-height: 1.1; }
    h1 span { color: #ff1828; text-shadow: 0 0 30px rgba(255,24,40,0.5); }
    p.subtitle { color: #a1a1aa; font-size: 17px; max-width: 680px; margin: 0 auto 36px; line-height: 1.6; }
    .telemetry-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 40px; text-align: left; }
    .gauge-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 24px; backdrop-filter: blur(12px); position: relative; overflow: hidden; }
    .gauge-card::before { content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 3px; background: linear-gradient(90deg, #ff1828, transparent); }
    .gauge-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; margin-bottom: 8px; }
    .gauge-val { font-size: 2.4rem; font-weight: 800; color: #fff; font-variant-numeric: tabular-nums; }
    .gauge-unit { font-size: 14px; font-weight: 600; color: #ff1828; margin-left: 6px; }
    .controls { display: flex; justify-content: center; gap: 16px; margin-bottom: 60px; }
    .btn-boost { background: #ff1828; color: #fff; border: none; padding: 16px 36px; font-size: 15px; font-weight: 700; border-radius: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 0 25px rgba(255,24,40,0.4); text-transform: uppercase; letter-spacing: 0.5px; }
    .btn-boost:hover { background: #e01221; transform: translateY(-2px); box-shadow: 0 0 35px rgba(255,24,40,0.7); }
    .btn-boost:active { transform: translateY(0); }
  </style>
</head>
<body>
  <nav>
    <div class="brand"><div class="brand-dot"></div>BMW CreativeDrive AI</div>
    <div class="nav-links">
      <a href="#" class="active">Telemetry</a>
      <a href="#">Aerodynamics</a>
      <a href="#">Diagnostics</a>
      <a href="#">Track Mode</a>
    </div>
  </nav>
  <div class="hero">
    <div class="pill">● M-Performance Matrix Online</div>
    <h1>CreativeDrive <span>AI Engine</span></h1>
    <p class="subtitle">Real-time predictive vehicle dynamics, intelligent lateral torque management, and high-frequency telemetry simulation.</p>
    <div class="telemetry-grid">
      <div class="gauge-card">
        <div class="gauge-label">Engine Speed</div>
        <div class="gauge-val" id="rpm">6,850<span class="gauge-unit">RPM</span></div>
      </div>
      <div class="gauge-card">
        <div class="gauge-label">Ground Velocity</div>
        <div class="gauge-val" id="vel">284<span class="gauge-unit">KM/H</span></div>
      </div>
      <div class="gauge-card">
        <div class="gauge-label">Braking Pressure</div>
        <div class="gauge-val" id="brake">0.0<span class="gauge-unit">BAR</span></div>
      </div>
    </div>
    <div class="controls">
      <button class="btn-boost" onclick="boost()">Engage Telemetry Boost</button>
    </div>
  </div>
  <script>
    function boost() {
      const vel = document.getElementById("vel");
      const rpm = document.getElementById("rpm");
      let currentVel = parseInt(vel.innerText);
      vel.innerHTML = (currentVel + 8) + '<span class="gauge-unit">KM/H</span>';
      rpm.innerHTML = (7100 + Math.floor(Math.random() * 400)) + '<span class="gauge-unit">RPM</span>';
    }
  </script>
</body>
</html>`,
        versions: [
          {
            version: 1,
            content: `<!-- v1: Initial BMW Telemetry prototype without navigation bar -->`,
            timestamp: '2026-08-15T10:15:00.000Z',
            changelog: 'Initial prototype with RPM and speed gauge.',
          },
          {
            version: 2,
            content: `<!-- v2: Added glassmorphic cards and crimson neon styling -->`,
            timestamp: '2026-08-28T16:20:00.000Z',
            changelog: 'Added glassmorphic cards and crimson neon styling.',
          },
          {
            version: 3,
            content: `<!DOCTYPE html>...`,
            timestamp: '2026-09-18T14:30:00.000Z',
            changelog: 'Changed navigation to top-anchored glass bar and added boost button.',
          },
        ],
      },
    ],
  },
  {
    id: 'proj-creative-builder',
    name: 'Creative AI Builder',
    description: 'High-end interactive creative prompt generator and visual studio interface.',
    threadId: 'landing-page-design',
    createdAt: '2026-08-01T12:00:00.000Z',
    updatedAt: '2026-09-10T11:15:00.000Z',
    decisions: [
      'Visual Style: Editorial Monochrome with Ruby accents',
      'Components: Prompt gallery with copy-to-clipboard badges and aspect ratio selectors',
    ],
    tags: ['creative', 'ai-builder', 'prompts', 'gallery', 'html'],
    summary: 'Single-file creative prompt workstation for image and video synthesis.',
    references: [],
    artifacts: [
      {
        id: 'art-cab-1',
        projectId: 'proj-creative-builder',
        name: 'creative-ai-builder.html',
        title: 'Creative AI Builder — Workstation',
        type: 'html',
        version: 2,
        createdAt: '2026-08-01T12:30:00.000Z',
        updatedAt: '2026-09-10T11:15:00.000Z',
        tags: ['html', 'prompts', 'builder'],
        description: 'Single-file studio interface for generating Midjourney and Imagen prompts.',
        content: `<!DOCTYPE html><html><head><title>Creative AI Builder</title></head><body><h1>Creative AI Builder</h1></body></html>`,
        versions: [
          {
            version: 1,
            content: `<!-- v1 -->`,
            timestamp: '2026-08-01T12:30:00.000Z',
            changelog: 'Initial builder scaffold.',
          },
          {
            version: 2,
            content: `<!DOCTYPE html>...`,
            timestamp: '2026-09-10T11:15:00.000Z',
            changelog: 'Added prompt cards and copy button.',
          },
        ],
      },
    ],
  },
  {
    id: 'proj-ecocycle',
    name: 'EcoCycle Landing Page',
    description: 'Smart recycling bin product landing page with interactive copy and benefits.',
    threadId: 'landing-page-design',
    createdAt: '2026-07-20T09:00:00.000Z',
    updatedAt: '2026-09-02T15:45:00.000Z',
    decisions: [
      'Design: Tailwind CSS clean aesthetic with emerald & charcoal palette',
      'Sections: Hero, Features, Impact Calculator, CTA',
    ],
    tags: ['ecocycle', 'landing-page', 'sustainability', 'react', 'tailwind'],
    summary: 'High-converting sustainable hardware landing page layout and copy.',
    references: [],
    artifacts: [
      {
        id: 'art-eco-1',
        projectId: 'proj-ecocycle',
        name: 'ecocycle-landing.tsx',
        title: 'EcoCycle Landing Page Component',
        type: 'tsx',
        version: 2,
        createdAt: '2026-07-20T09:20:00.000Z',
        updatedAt: '2026-09-02T15:45:00.000Z',
        tags: ['tsx', 'landing', 'react'],
        description: 'React Tailwind component showcasing hero, feature grid, and call to action.',
        content: `export function EcoCycleHero() { return <div>EcoCycle</div>; }`,
        versions: [
          {
            version: 1,
            content: `// v1`,
            timestamp: '2026-07-20T09:20:00.000Z',
            changelog: 'Initial draft copy and hero layout.',
          },
          {
            version: 2,
            content: `export function EcoCycleHero()...`,
            timestamp: '2026-09-02T15:45:00.000Z',
            changelog: 'Added impact calculator and interactive CTA.',
          },
        ],
      },
    ],
  },
];

/**
 * MemoryManager Class:
 * Implements persistent conversation memory, semantic project/artifact retrieval,
 * version control, and model context packaging.
 */
class MemoryManager {
  private projects: ProjectMemory[] = [];
  private activeProjectId: string | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') {
      this.projects = [...SEED_PROJECTS];
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge seed projects if not present
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const merged = [...parsed];
          for (const s of SEED_PROJECTS) {
            if (!existingIds.has(s.id)) {
              merged.push(s);
            }
          }
          this.projects = merged;
        } else {
          this.projects = [...SEED_PROJECTS];
          this.persist();
        }
      } else {
        this.projects = [...SEED_PROJECTS];
        this.persist();
      }

      this.activeProjectId = localStorage.getItem(STORAGE_KEY_ACTIVE_PROJECT) || this.projects[0]?.id || null;
    } catch {
      this.projects = [...SEED_PROJECTS];
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(this.projects));
    } catch (e) {
      console.warn('MemoryManager persist error:', e);
    }
  }

  public getProjects(): ProjectMemory[] {
    return this.projects;
  }

  public getProject(id: string): ProjectMemory | undefined {
    return this.projects.find((p) => p.id === id);
  }

  public getActiveProjectId(): string | null {
    return this.activeProjectId;
  }

  public setActiveProjectId(id: string) {
    this.activeProjectId = id;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ACTIVE_PROJECT, id);
    }
  }

  public getActiveProject(): ProjectMemory | undefined {
    return this.projects.find((p) => p.id === this.activeProjectId) || this.projects[0];
  }

  /**
   * Detects whether user prompt explicitly or semantically references previous work/artifacts
   */
  public detectReferenceIntent(prompt: string): {
    hasReference: boolean;
    referenceType: 'code_edit' | 'project_recall' | 'file_recovery' | 'general';
    matchedKeywords: string[];
  } {
    const lower = prompt.toLowerCase();

    const editPhrases = [
      'edit the code',
      'change that website',
      'modify the previous',
      'change the navigation',
      'add this to the app',
      'change the button',
      'update the code',
      'modify the html',
      'change the prompt',
      'only change',
      'in that code',
    ];

    const recallPhrases = [
      'the old one',
      'that code',
      'the previous one',
      'the app we made',
      'my last project',
      'the bmw one',
      'bmw',
      'the code from last month',
      'the version before this',
      'the design i sent earlier',
      'that website code you made',
      'previous project',
      'find the website',
      'creative ai',
      'ecocycle',
    ];

    const matchedEdit = editPhrases.filter((p) => lower.includes(p));
    const matchedRecall = recallPhrases.filter((p) => lower.includes(p));

    if (matchedEdit.length > 0) {
      return {
        hasReference: true,
        referenceType: 'code_edit',
        matchedKeywords: matchedEdit,
      };
    }

    if (matchedRecall.length > 0) {
      return {
        hasReference: true,
        referenceType: 'project_recall',
        matchedKeywords: matchedRecall,
      };
    }

    return {
      hasReference: false,
      referenceType: 'general',
      matchedKeywords: [],
    };
  }

  /**
   * Semantic & Multi-Factor Memory Search
   * Evaluates project name, description, artifact title, code contents, user wording, and dates.
   */
  public searchMemory(query: string): Array<{
    project: ProjectMemory;
    artifact?: Artifact;
    score: number;
    matchReason: string;
  }> {
    if (!query || !query.trim()) return [];

    const terms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1 && !['the', 'and', 'for', 'you', 'made', 'that', 'this'].includes(t));

    const results: Array<{
      project: ProjectMemory;
      artifact?: Artifact;
      score: number;
      matchReason: string;
    }> = [];

    for (const project of this.projects) {
      let projectScore = 0;
      let reasons: string[] = [];

      const pName = project.name.toLowerCase();
      const pDesc = project.description.toLowerCase();
      const pSummary = project.summary.toLowerCase();
      const pTags = project.tags.map((t) => t.toLowerCase());

      for (const term of terms) {
        if (pName.includes(term)) {
          projectScore += 30;
          reasons.push(`Project name matched '${term}'`);
        }
        if (pTags.some((t) => t.includes(term))) {
          projectScore += 25;
          reasons.push(`Tag matched '${term}'`);
        }
        if (pDesc.includes(term)) {
          projectScore += 15;
        }
        if (pSummary.includes(term)) {
          projectScore += 10;
        }
      }

      // Semantic automotive/BMW association check
      const queryLower = query.toLowerCase();
      if ((queryLower.includes('bmw') || queryLower.includes('car') || queryLower.includes('automotive') || queryLower.includes('telemetry')) &&
          (pName.includes('bmw') || pTags.includes('bmw') || pTags.includes('automotive'))) {
        projectScore += 50;
        reasons.push('Semantic topic correlation (Automotive/BMW)');
      }

      // Semantic creative/prompt builder correlation
      if ((queryLower.includes('creative') || queryLower.includes('image app') || queryLower.includes('prompt gallery')) &&
          (pName.includes('creative') || pTags.includes('creative') || pTags.includes('ai-builder'))) {
        projectScore += 45;
        reasons.push('Semantic topic correlation (Creative Studio)');
      }

      // Search through artifacts
      for (const artifact of project.artifacts) {
        let artScore = projectScore;
        let artReasons = [...reasons];

        const aName = artifact.name.toLowerCase();
        const aTitle = artifact.title.toLowerCase();
        const aTags = artifact.tags.map((t) => t.toLowerCase());

        for (const term of terms) {
          if (aName.includes(term)) {
            artScore += 35;
            artReasons.push(`Artifact file matched '${term}'`);
          }
          if (aTitle.includes(term)) {
            artScore += 30;
            artReasons.push(`Artifact title matched '${term}'`);
          }
          if (aTags.some((t) => t.includes(term))) {
            artScore += 20;
          }
        }

        // Code content checks (e.g. searching for 'navigation', 'rpm', 'boost')
        if (queryLower.includes('navigation') && artifact.content.includes('<nav')) {
          artScore += 25;
          artReasons.push('Code contains navigation structure');
        }
        if (queryLower.includes('button') && artifact.content.includes('<button')) {
          artScore += 20;
        }

        if (artScore > 20) {
          results.push({
            project,
            artifact,
            score: artScore,
            matchReason: artReasons.slice(0, 2).join(', '),
          });
        }
      }

      if (project.artifacts.length === 0 && projectScore > 20) {
        results.push({
          project,
          score: projectScore,
          matchReason: reasons.slice(0, 2).join(', '),
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Save or Update an Artifact with Version Control (Rule 4 & 5 & 16)
   */
  public saveOrUpdateArtifact(
    projectId: string,
    artifactData: {
      name: string;
      title: string;
      type: 'html' | 'tsx' | 'prompt' | 'file' | 'code';
      content: string;
      description?: string;
      tags?: string[];
      userDecisions?: string[];
    },
    changelog: string = 'Updated artifact content'
  ): { project: ProjectMemory; artifact: Artifact; isNewVersion: boolean } {
    let project = this.projects.find((p) => p.id === projectId);

    if (!project) {
      // Create new project if none exists
      project = {
        id: projectId,
        name: artifactData.title || artifactData.name,
        description: artifactData.description || 'User-generated AI project workspace',
        threadId: projectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        artifacts: [],
        decisions: artifactData.userDecisions || [],
        references: [],
        summary: `Project maintaining ${artifactData.title}`,
        tags: artifactData.tags || ['custom', artifactData.type],
      };
      this.projects.unshift(project);
    }

    project.updatedAt = new Date().toISOString();

    const existingIndex = project.artifacts.findIndex(
      (a) => a.name.toLowerCase() === artifactData.name.toLowerCase() || a.title === artifactData.title
    );

    let resultingArtifact: Artifact;
    let isNewVersion = false;

    if (existingIndex >= 0) {
      const existing = project.artifacts[existingIndex];
      const newVersionNum = existing.version + 1;
      isNewVersion = true;

      const newVersionEntry: ArtifactVersion = {
        version: existing.version,
        content: existing.content,
        timestamp: existing.updatedAt,
        changelog,
        author: 'ai',
      };

      resultingArtifact = {
        ...existing,
        version: newVersionNum,
        content: artifactData.content,
        updatedAt: new Date().toISOString(),
        description: artifactData.description || existing.description,
        tags: Array.from(new Set([...existing.tags, ...(artifactData.tags || [])])),
        userDecisions: [
          ...(existing.userDecisions || []),
          ...(artifactData.userDecisions || []),
        ],
        versions: [...existing.versions, newVersionEntry],
      };

      project.artifacts[existingIndex] = resultingArtifact;
    } else {
      resultingArtifact = {
        id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        projectId: project.id,
        name: artifactData.name,
        title: artifactData.title,
        type: artifactData.type,
        version: 1,
        content: artifactData.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: artifactData.description || '',
        tags: artifactData.tags || [artifactData.type],
        userDecisions: artifactData.userDecisions || [],
        versions: [
          {
            version: 1,
            content: artifactData.content,
            timestamp: new Date().toISOString(),
            changelog: 'Initial version created',
            author: 'ai',
          },
        ],
      };
      project.artifacts.push(resultingArtifact);
    }

    this.persist();
    syncProjectMemoryToFirestore(project).catch((e) => console.warn('Memory sync warning:', e));
    return { project, artifact: resultingArtifact, isNewVersion };
  }

  /**
   * Reverts an artifact to an earlier version (Rule 16)
   */
  public revertArtifactVersion(
    projectId: string,
    artifactId: string,
    targetVersion: number
  ): Artifact | null {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) return null;

    const artifact = project.artifacts.find((a) => a.id === artifactId);
    if (!artifact) return null;

    const targetVersionObj = artifact.versions.find((v) => v.version === targetVersion);
    if (!targetVersionObj) return null;

    // Archive current before reverting
    const archiveCurrent: ArtifactVersion = {
      version: artifact.version,
      content: artifact.content,
      timestamp: artifact.updatedAt,
      changelog: `Saved before reverting to v${targetVersion}`,
    };

    artifact.version = targetVersion;
    artifact.content = targetVersionObj.content;
    artifact.updatedAt = new Date().toISOString();
    artifact.versions.push(archiveCurrent);

    this.persist();
    return artifact;
  }

  /**
   * Build Model Context Package (Rule 13)
   * Constructs the structured context package before sending to Groq or Gemini fallback.
   */
  public buildContextPackage(
    currentRequest: string,
    currentThreadId: string,
    recentMessages: Array<{ sender: 'user' | 'ai'; text: string; timestamp?: string }> = []
  ): MemoryContextPackage {
    const searchMatches = this.searchMemory(currentRequest);
    const activeProject = this.getActiveProject();

    // Collect relevant projects (max 3)
    const relevantProjects = Array.from(
      new Set([
        ...(searchMatches.slice(0, 3).map((m) => m.project)),
        ...(activeProject ? [activeProject] : []),
      ])
    ).slice(0, 3);

    // Collect relevant artifacts
    const relevantArtifacts: MemoryContextPackage['relevant_artifacts'] = [];
    const latestVersions: MemoryContextPackage['latest_versions'] = [];
    const allDecisions: string[] = [];

    for (const proj of relevantProjects) {
      if (proj.decisions) {
        allDecisions.push(...proj.decisions);
      }
      for (const art of proj.artifacts) {
        relevantArtifacts.push({
          id: art.id,
          projectId: proj.id,
          name: art.name,
          title: art.title,
          version: art.version,
          type: art.type,
          contentSnippet: art.content.slice(0, 800),
          fullContent: art.content,
          versionsCount: art.versions.length,
        });
        latestVersions.push({
          artifactName: art.name,
          version: art.version,
        });
      }
    }

    // Determine active task and required output
    const isEdit = this.detectReferenceIntent(currentRequest).referenceType === 'code_edit';
    const isHtml = currentRequest.toLowerCase().includes('website') || currentRequest.toLowerCase().includes('html');

    return {
      current_request: currentRequest,
      conversation_summary: activeProject?.summary || 'User engaged in high-performance application synthesis.',
      relevant_previous_messages: recentMessages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
        timestamp: m.timestamp,
      })),
      relevant_projects: relevantProjects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        summary: p.summary,
      })),
      relevant_artifacts: relevantArtifacts.slice(0, 3),
      latest_versions: latestVersions,
      user_decisions: Array.from(new Set(allDecisions)).slice(0, 8),
      active_task: isEdit ? 'Incremental Artifact Modification' : 'High-End Artifact Synthesis',
      required_output: isHtml ? 'Single-file complete HTML + CSS + JS' : 'Structured high-precision response',
    };
  }
}

export const memoryManager = new MemoryManager();
