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
  {
    id: 'proj-think-creative',
    name: 'Think Creative — AI Workspace (Master Design Reference)',
    description: 'Clean, neumorphic AI workspace for ideas, websites, writing and creative workflows with soft tactile surfaces, subtle noise texture, and vibrant crimson accents.',
    threadId: 'master-design-reference',
    createdAt: '2026-09-27T00:00:00.000Z',
    updatedAt: '2026-09-27T02:00:00.000Z',
    decisions: [
      'Visual Philosophy: Master Design DNA — Clean soft neumorphic aesthetic (--bg:#f3f5f8, --surface:#f7f8fa, --accent:#ff1450, --shadow1, --shadow2, --inset)',
      'Design DNA: Soft inset cards, floating blur navigation, pill badges, layered surfaces, micro-interactions, mobile drawer dialog',
      'Adaptability Rule: Preserve design quality and DNA, adapt to user request, never copy literally unless requested',
      'Architecture: Complete single-file HTML + embedded CSS + vanilla JS',
    ],
    tags: ['think-creative', 'master-reference', 'neumorphic', 'ai-workspace', 'html', 'design-dna', 'landing-page'],
    summary: 'The application Master Website Design Reference representing the design language and quality bar: soft neumorphism, tactile shadows, subtle SVG noise, crimson glow, interactive prompt typewriter, and mobile drawer.',
    references: [],
    artifacts: [
      {
        id: 'art-think-creative-master',
        projectId: 'proj-think-creative',
        name: 'think-creative-master.html',
        title: 'Think Creative — Master Design Reference',
        type: 'html',
        version: 1,
        createdAt: '2026-09-27T00:00:00.000Z',
        updatedAt: '2026-09-27T02:00:00.000Z',
        tags: ['master-reference', 'html', 'neumorphic', 'think-creative', 'design-dna'],
        description: 'Complete versioned source of the Master Design Reference containing complete HTML, typography, CSS tokens, neumorphic shadows, responsive layout, and vanilla JS interactions.',
        userDecisions: [
          'Preserved complete master source artifact with design tokens',
          'Established Design DNA extraction baseline for all generated web applications',
        ],
        content: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>Think Creative — AI Workspace</title>
<meta name="description" content="Think Creative is a clean, neumorphic AI workspace for ideas, websites, writing and creative workflows." />
<meta name="theme-color" content="#f3f5f8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#f3f5f8; --surface:#f7f8fa; --text:#14171c; --muted:#737983;
  --accent:#ff1450; --accent2:#ff4f78; --line:rgba(20,23,28,.08);
  --shadow1: 16px 16px 35px rgba(163,170,181,.32);
  --shadow2: -12px -12px 30px rgba(255,255,255,.95);
  --inset: inset 7px 7px 15px rgba(173,181,193,.25), inset -7px -7px 15px rgba(255,255,255,.9);
  --radius:22px;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth; scroll-padding-top:90px}
body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow-x:hidden;-webkit-font-smoothing:antialiased;line-height:1.5}
img{max-width:100%;display:block}
a{text-decoration:none;color:inherit}
button,input,textarea{font:inherit}
button{ -webkit-tap-highlight-color: transparent; }
.page{min-height:100vh;position:relative}
.noise{position:fixed;inset:0;pointer-events:none;opacity:.025;z-index:20;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E")}
.nav{position:fixed;top:18px;left:50%;transform:translateX(-50%);width:min(1160px,calc(100% - 28px));height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 14px 0 20px;border:1px solid rgba(255,255,255,.85);background:rgba(247,248,250,.76);backdrop-filter:blur(20px) saturate(1.2);-webkit-backdrop-filter:blur(20px) saturate(1.2);border-radius:22px;box-shadow:var(--shadow1),var(--shadow2);z-index:15;gap:12px}
.brand{display:flex;align-items:center;gap:10px;font-weight:900;letter-spacing:-.04em;flex-shrink:0}
.brand-dot{width:32px;height:32px;border-radius:11px;background:linear-gradient(145deg,#ff5a84,#ff0e49);box-shadow:inset 3px 3px 6px rgba(255,255,255,.35),5px 5px 12px rgba(255,20,80,.25);position:relative;flex-shrink:0}
.brand-dot:after{content:"";position:absolute;width:9px;height:9px;border-radius:50%;background:white;left:12px;top:8px;box-shadow:0 0 12px white}
.navlinks{display:flex;gap:26px;color:#646a73;font-size:14px;font-weight:700;align-items:center}
.navlinks a{padding:6px 2px;transition:.2s}
.navlinks a:hover{color:var(--text)}
.nav-actions{display:flex;gap:8px;align-items:center;flex-shrink:0}
.hamburger{display:none;width:42px;height:42px;border-radius:12px;border:0;background:var(--surface);box-shadow:5px 5px 11px rgba(160,168,180,.25),-5px -5px 11px white;cursor:pointer;font-size:20px;color:#636973;align-items:center;justify-content:center}
.btn{border:0;cursor:pointer;border-radius:15px;padding:12px 17px;font-weight:800;transition:.25s ease;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;white-space:nowrap;user-select:none}
.btn-soft{background:var(--surface);box-shadow:7px 7px 16px rgba(170,178,190,.27),-6px -6px 14px white;color:#2b3038}
.btn-soft:hover{transform:translateY(-2px)}
.btn-primary{color:white;background:linear-gradient(135deg,#ff174f,#ff416f);box-shadow:7px 9px 20px rgba(255,20,80,.25),inset 2px 2px 5px rgba(255,255,255,.22)}
.btn-primary:hover{transform:translateY(-2px) scale(1.01);box-shadow:10px 13px 26px rgba(255,20,80,.3)}
.hero{position:relative;min-height:920px;padding:145px 20px 70px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.hero-orb{position:absolute;width:620px;height:620px;max-width:90vw;max-height:90vw;border-radius:50%;background:radial-gradient(circle at 50% 40%,rgba(255,255,255,.95),rgba(238,241,246,.35) 58%,rgba(243,245,248,0) 70%);filter:blur(2px);pointer-events:none;top:10%;left:50%;transform:translateX(-50%)}
.hero-content{width:min(1180px,100%);position:relative;text-align:center;z-index:1}
.eyebrow{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:999px;color:#676d76;font-size:12px;font-weight:800;background:var(--surface);box-shadow:var(--inset),5px 5px 12px rgba(170,178,190,.15);animation:float 4s ease-in-out infinite}
.eyebrow i{width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 12px rgba(255,20,80,.7)}
.title-wrap{position:relative;margin:28px auto 0;max-width:1050px;padding:20px 0 40px}
.big-word{font-size:clamp(64px,12vw,174px);line-height:.82;font-weight:1000;letter-spacing:-.09em;color:#e8ebef;user-select:none;overflow-wrap:break-word}
.big-word span{color:#e7e9ec}
.big-word .pink{color:var(--accent)}
.hero-copy{max-width:720px;margin:70px auto 0;padding:0 10px}
.hero-copy h1{font-size:clamp(32px,5vw,68px);line-height:1.02;letter-spacing:-.055em;margin:0 0 18px;overflow-wrap:break-word}
.hero-copy h1 em{font-style:normal;color:var(--accent)}
.hero-copy p{font-size:18px;line-height:1.7;color:var(--muted);margin:0 auto;max-width:650px}
.prompt-shell{max-width:860px;margin:36px auto 0;padding:10px;border-radius:28px;background:var(--surface);box-shadow:var(--shadow1),var(--shadow2);border:1px solid rgba(255,255,255,.8);text-align:left;width:100%}
.prompt{min-height:108px;border-radius:20px;padding:18px 20px;box-shadow:var(--inset);display:flex;flex-direction:column;justify-content:space-between;gap:16px}
.prompt-top{color:#9aa0a9;font-size:16px;line-height:1.5;min-height:24px;word-break:break-word}
.prompt-bottom{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.prompt-tools{display:flex;gap:9px;align-items:center}
.icon{width:38px;height:38px;border:0;border-radius:12px;background:var(--surface);box-shadow:5px 5px 11px rgba(160,168,180,.25),-5px -5px 11px white;cursor:pointer;color:#636973;display:grid;place-items:center}
.mode{color:#626871;font-weight:800;font-size:14px;margin-left:auto;margin-right:8px}
.section{padding:100px 20px}
.container{width:min(1120px,100%);margin:auto}
.section-head{display:flex;justify-content:space-between;align-items:end;gap:30px;margin-bottom:36px;flex-wrap:wrap}
.section-head h2{font-size:clamp(32px,5vw,58px);line-height:1;letter-spacing:-.06em;margin:0}
.section-head p{max-width:430px;color:var(--muted);line-height:1.7;margin:0}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.card{border-radius:28px;padding:28px;background:var(--surface);box-shadow:var(--shadow1),var(--shadow2);border:1px solid rgba(255,255,255,.85);transition:.3s}
.card:hover{transform:translateY(-8px)}
.card-icon{width:56px;height:56px;border-radius:18px;display:grid;place-items:center;background:var(--surface);box-shadow:var(--inset),8px 8px 18px rgba(170,178,190,.18);font-size:24px;margin-bottom:22px}
.card h3{font-size:22px;margin:0 0 10px;letter-spacing:-.03em}
.card p{color:var(--muted);line-height:1.65;margin:0}
.demo{padding:24px;border-radius:34px;background:var(--surface);box-shadow:var(--shadow1),var(--shadow2);border:1px solid white;overflow:hidden}
.app-window{border-radius:27px;overflow:hidden;background:#eef1f5;box-shadow:var(--inset);display:grid;grid-template-columns:220px 1fr;min-height:520px;width:100%}
.sidebar{padding:22px;border-right:1px solid rgba(20,23,28,.06);background:rgba(255,255,255,.25)}
.side-title{font-weight:900;margin:5px 0 24px}
.side-item{padding:12px 13px;border-radius:13px;color:#747a83;font-size:13px;font-weight:750;margin:5px 0;cursor:pointer}
.side-item.active{color:#20242a;background:var(--surface);box-shadow:5px 5px 12px rgba(160,168,180,.18),-5px -5px 12px white}
.chat{padding:30px;display:flex;flex-direction:column}
.chat-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:10px}
.chat-head h3{margin:0;font-size:20px}
.status{font-size:12px;color:#777d85;background:var(--surface);padding:6px 10px;border-radius:999px;box-shadow:3px 3px 8px rgba(160,168,180,.18),-3px -3px 8px white;font-weight:700}
.message{max-width:700px;margin-top:20px;padding:22px;border-radius:22px;background:var(--surface);box-shadow:var(--shadow1),var(--shadow2);line-height:1.7;color:#555b64;word-break:break-word}
.chat-prompt{padding:9px;border-radius:21px;background:var(--surface);box-shadow:var(--shadow1),var(--shadow2);border:1px solid rgba(255,255,255,.9);display:flex;gap:10px;align-items:center;margin-top:28px}
#chatInput{flex:1;border:0;outline:0;background:transparent;padding:12px 14px;font-weight:600;color:var(--text);font-size:15px}
.cta{padding:110px 20px}
.cta-box{position:relative;overflow:hidden;text-align:center;padding:75px 30px;border-radius:38px;background:var(--surface);box-shadow:var(--shadow1),var(--shadow2);border:1px solid white}
.cta-box h2{font-size:clamp(32px,5vw,56px);line-height:.95;margin:0 0 16px}
.cta-box p{max-width:540px;margin:0 auto 24px;color:var(--muted);line-height:1.7}
footer{padding:30px 20px 45px}
.footer{width:min(1120px,100%);margin:auto;display:flex;justify-content:space-between;gap:20px;color:#7c828b;font-size:12px;font-weight:700;flex-wrap:wrap}
.toast{position:fixed;left:50%;bottom:25px;transform:translate(-50%,20px);opacity:0;pointer-events:none;padding:13px 18px;border-radius:16px;background:#20242a;color:white;font-size:13px;font-weight:800;z-index:100;transition:.3s}
.toast.show{opacity:1;transform:translate(-50%,0)}
@media(max-width:850px){.navlinks{display:none}.grid{grid-template-columns:1fr}.app-window{grid-template-columns:1fr}.sidebar{display:none}}
</style>
</head>
<body>
<div class="page">
<div class="noise"></div>
<nav class="nav">
  <a class="brand" href="#"><span class="brand-dot"></span><span>Think Creative</span></a>
  <div class="navlinks"><a href="#features">Features</a><a href="#workspace">Workspace</a><a href="#about">About</a></div>
  <div class="nav-actions"><button class="btn btn-soft" onclick="toast('Demo ready')">Log in</button><a class="btn btn-primary" href="#workspace">Try AI</a></div>
</nav>
<section class="hero" id="about">
  <div class="hero-orb"></div>
  <div class="hero-content">
    <div class="eyebrow"><i></i> Creative AI workspace</div>
    <div class="title-wrap"><div class="big-word"><span>THINK</span><br><span class="pink">CREATIVE</span></div></div>
    <div class="hero-copy">
      <h1>Turn a simple idea into <em>something real.</em></h1>
      <p>Chat, brainstorm, write, design and build with an AI workspace made for creative people.</p>
    </div>
  </div>
</section>
<section class="section" id="features">
  <div class="container">
    <div class="section-head"><h2>One AI.<br>Many workflows.</h2></div>
    <div class="grid">
      <article class="card"><div class="card-icon">✦</div><h3>Creative Chat</h3><p>Focused conversation workspace.</p></article>
      <article class="card"><div class="card-icon">⌘</div><h3>Build Mode</h3><p>Structured product generation.</p></article>
      <article class="card"><div class="card-icon">◌</div><h3>Smart Context</h3><p>Keep references together.</p></article>
    </div>
  </div>
</section>
<div class="toast" id="toast"></div>
<script>
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000);}
</script>
</div>
</body>
</html>`,
        versions: [
          {
            version: 1,
            content: `<!DOCTYPE html>...`,
            timestamp: '2026-09-27T00:00:00.000Z',
            changelog: 'Preserved complete Master Design Reference source with CSS tokens, neumorphic shadows, and responsive layout.',
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

      // Semantic master website reference correlation
      if ((queryLower.includes('think creative') || queryLower.includes('master website') || queryLower.includes('design reference') || queryLower.includes('neumorphic')) &&
          (pName.includes('think creative') || pTags.includes('master-reference'))) {
        projectScore += 60;
        reasons.push('Semantic topic correlation (Master Website Design Reference)');
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
