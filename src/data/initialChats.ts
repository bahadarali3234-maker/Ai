import { ChatThread } from '../types';

export const INITIAL_CHAT_DATA: Record<string, ChatThread> = {
  'Landing Page Design': {
    id: 'thread-landing-page',
    title: 'Landing Page Design',
    promptBanner: 'How to design a high-conversion luxury landing page?',
    messages: [
      {
        id: 'msg-lp-u1',
        sender: 'user',
        text: 'How can I design a high-converting, luxury aerodynamic landing page with dark obsidian theme and crimson accents?',
        timestamp: '10:00 AM',
      },
      {
        id: 'msg-lp-a1',
        sender: 'ai',
        text: `## High-Impact Aerodynamic Landing Page Architecture

Engineered for precision, high visual contrast, and immediate engagement.

### 1. Structural Blueprint & Visual Flow
• **Obsidian Foundation**: Deep #070709 black palette preventing eye strain while amplifying vibrant neon crimson (#ff1828) highlights.
• **Spatial Bento Grids**: Modular containers grouping metrics, capabilities, and interactive sandboxes with clean border glassmorphism.
• **Instant Conversion Anchors**: Zero-distraction above-the-fold CTA pairing magnetic headline typography with interactive previews.

### 2. Implementation Prompt
\`\`\`prompt
Build a high-performance landing page with deep obsidian background, crimson neon glows, sleek bento grid metrics, interactive code sandbox, and frictionless CTA flow.
\`\`\`

### 3. Production Single-File HTML / CSS Template
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apex Performance Landing</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #070709; color: #fff; }
    h1, h2, h3 { font-family: 'Syne', sans-serif; }
    .crimson-glow { box-shadow: 0 0 35px rgba(255, 24, 40, 0.45); }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between selection:bg-[#ff1828]">
  <header class="max-w-7xl mx-auto w-full px-6 py-8 flex justify-between items-center">
    <div class="flex items-center gap-2">
      <div class="w-3 h-7 bg-[#ff1828] -skew-x-12"></div>
      <span class="text-2xl font-black tracking-tight">APEX /// M</span>
    </div>
    <button class="px-6 py-2.5 rounded-full bg-[#ff1828] hover:bg-[#e01423] text-white text-sm font-bold transition-all shadow-[0_0_20px_rgba(255,24,40,0.5)]">
      Launch Console
    </button>
  </header>

  <main class="max-w-6xl mx-auto px-6 py-16 text-center">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 mb-6">
      <span class="w-2 h-2 rounded-full bg-[#ff1828] animate-ping"></span>
      Next-Generation Aerodynamic Architecture
    </div>
    <h1 class="text-5xl md:text-7xl font-black uppercase tracking-tight leading-tight mb-6">
      Unleash Peak <span class="text-[#ff1828]">Velocity</span>
    </h1>
    <p class="max-w-2xl mx-auto text-zinc-400 text-lg mb-10 leading-relaxed">
      Obsidian dark interface engineered with precision geometry, sub-millisecond responsiveness, and relentless visual hierarchy.
    </p>
    <div class="flex flex-wrap justify-center gap-4">
      <button class="px-8 py-3.5 rounded-2xl bg-[#ff1828] text-white font-bold hover:shadow-[0_0_30px_rgba(255,24,40,0.8)] transition-all">
        Start Project
      </button>
      <button class="px-8 py-3.5 rounded-2xl bg-zinc-900 border border-white/10 text-white font-semibold hover:bg-zinc-800 transition-all">
        View Telemetry
      </button>
    </div>
  </main>

  <footer class="border-t border-white/10 py-6 text-center text-xs text-zinc-500">
    © 2026 Apex Intelligent Systems. All rights reserved.
  </footer>
</body>
</html>
\`\`\``,
        timestamp: '10:01 AM',
        thoughtDuration: 3,
        structuredContent: {
          mainTitle: 'High-Impact Aerodynamic Landing Page Architecture',
          intro: 'Engineered for precision, high visual contrast, and immediate engagement.',
          sections: [
            {
              title: '1. Structural Blueprint & Visual Flow',
              description: 'Key principles for architecting luxury dark-mode landing pages that captivate visitors.',
              bullets: [
                'Obsidian Foundation: Deep #070709 black palette preventing eye strain while amplifying vibrant neon crimson (#ff1828) highlights.',
                'Spatial Bento Grids: Modular containers grouping metrics, capabilities, and interactive sandboxes with clean border glassmorphism.',
                'Instant Conversion Anchors: Zero-distraction above-the-fold CTA pairing magnetic headline typography with interactive previews.',
              ],
            },
            {
              title: '2. Implementation Prompt',
              description: 'Use this optimized prompt to generate consistent aerodynamic layouts:',
              promptSnippet: 'Build a high-performance landing page with deep obsidian background, crimson neon glows, sleek bento grid metrics, interactive code sandbox, and frictionless CTA flow.',
            },
            {
              title: '3. Production Single-File HTML / CSS Template',
              description: 'Standalone, responsive, production-ready landing page template with Tailwind styling.',
              fileName: 'landing-page.html',
              codeLanguage: 'html',
              codeSnippet: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apex Performance Landing</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #070709; color: #fff; }
    h1, h2, h3 { font-family: 'Syne', sans-serif; }
    .crimson-glow { box-shadow: 0 0 35px rgba(255, 24, 40, 0.45); }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between selection:bg-[#ff1828]">
  <header class="max-w-7xl mx-auto w-full px-6 py-8 flex justify-between items-center">
    <div class="flex items-center gap-2">
      <div class="w-3 h-7 bg-[#ff1828] -skew-x-12"></div>
      <span class="text-2xl font-black tracking-tight">APEX /// M</span>
    </div>
    <button class="px-6 py-2.5 rounded-full bg-[#ff1828] hover:bg-[#e01423] text-white text-sm font-bold transition-all shadow-[0_0_20px_rgba(255,24,40,0.5)]">
      Launch Console
    </button>
  </header>

  <main class="max-w-6xl mx-auto px-6 py-16 text-center">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 mb-6">
      <span class="w-2 h-2 rounded-full bg-[#ff1828] animate-ping"></span>
      Next-Generation Aerodynamic Architecture
    </div>
    <h1 class="text-5xl md:text-7xl font-black uppercase tracking-tight leading-tight mb-6">
      Unleash Peak <span class="text-[#ff1828]">Velocity</span>
    </h1>
    <p class="max-w-2xl mx-auto text-zinc-400 text-lg mb-10 leading-relaxed">
      Obsidian dark interface engineered with precision geometry, sub-millisecond responsiveness, and relentless visual hierarchy.
    </p>
    <div class="flex flex-wrap justify-center gap-4">
      <button class="px-8 py-3.5 rounded-2xl bg-[#ff1828] text-white font-bold hover:shadow-[0_0_30px_rgba(255,24,40,0.8)] transition-all">
        Start Project
      </button>
      <button class="px-8 py-3.5 rounded-2xl bg-zinc-900 border border-white/10 text-white font-semibold hover:bg-zinc-800 transition-all">
        View Telemetry
      </button>
    </div>
  </main>

  <footer class="border-t border-white/10 py-6 text-center text-xs text-zinc-500">
    © 2026 Apex Intelligent Systems. All rights reserved.
  </footer>
</body>
</html>`,
            },
          ],
        },
      },
    ],
  },

  'Website Layout Ideas': {
    id: 'thread-website-layout',
    title: 'Website Layout Ideas',
    promptBanner: 'Modern layout ideas for high-end web applications',
    messages: [
      {
        id: 'msg-wl-u1',
        sender: 'user',
        text: 'What are the best modern layout systems for luxury and tech web apps in 2026?',
        timestamp: '11:15 AM',
      },
      {
        id: 'msg-wl-a1',
        sender: 'ai',
        text: `## Architectural Layout Paradigms for Next-Gen Web Apps

Explore five progressive grid methodologies transforming web ergonomics.

### 1. Dominant Layout Concepts
• **Asymmetric Bento Matrix**: Unequal rectangular cards that naturally guide ocular scanning through data density contrast.
• **Split-Canvas Parallax Stacking**: Fixed left-hand narrative column paired with dynamically accelerating right-side interactive cards.
• **Floating Command Hub**: Centered floating action dock keeping secondary navigation accessible with minimal chrome intrusion.

### 2. Quick Layout Prompt
\`\`\`prompt
Create an asymmetric Bento Matrix dashboard featuring a 3x3 layout with KPI cards, live telemetry graph, and interactive action center.
\`\`\`

### 3. Interactive Bento Grid Demo
\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bento Grid Matrix</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090a0f] text-white p-8 min-h-screen">
  <div class="max-w-5xl mx-auto space-y-6">
    <h2 class="text-3xl font-black tracking-tight">System Matrix Overview</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2 bg-zinc-900/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
        <span class="text-xs text-[#ff1828] font-bold uppercase tracking-wider">Primary Vector</span>
        <h3 class="text-2xl font-bold mt-2">Continuous Latency Tracking</h3>
        <p class="text-zinc-400 text-sm mt-2">Zero-drop packet pipeline operating at 99.998% uptime efficiency.</p>
      </div>
      <div class="bg-gradient-to-br from-[#ff1828]/20 to-black border border-[#ff1828]/30 rounded-3xl p-6">
        <span class="text-xs text-zinc-400 font-bold uppercase">Telemetry</span>
        <div class="text-4xl font-black mt-2 text-white">0.42<span class="text-sm font-normal text-zinc-400">ms</span></div>
        <p class="text-xs text-zinc-400 mt-2">Sub-millisecond compute cycle</p>
      </div>
    </div>
  </div>
</body>
</html>
\`\`\``,
        timestamp: '11:16 AM',
        thoughtDuration: 3,
        structuredContent: {
          mainTitle: 'Architectural Layout Paradigms for Next-Gen Web Apps',
          intro: 'Explore five progressive grid methodologies transforming web ergonomics.',
          sections: [
            {
              title: '1. Dominant Layout Concepts',
              description: 'Leading interface layouts used in luxury automotive and fintech platforms.',
              bullets: [
                'Asymmetric Bento Matrix: Unequal rectangular cards that naturally guide ocular scanning through data density contrast.',
                'Split-Canvas Parallax Stacking: Fixed left-hand narrative column paired with dynamically accelerating right-side interactive cards.',
                'Floating Command Hub: Centered floating action dock keeping secondary navigation accessible with minimal chrome intrusion.',
              ],
            },
            {
              title: '2. Quick Layout Prompt',
              promptSnippet: 'Create an asymmetric Bento Matrix dashboard featuring a 3x3 layout with KPI cards, live telemetry graph, and interactive action center.',
            },
            {
              title: '3. Interactive Bento Grid Demo',
              fileName: 'bento-grid.html',
              codeLanguage: 'html',
              codeSnippet: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Bento Grid Matrix</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#090a0f] text-white p-8 min-h-screen">
  <div class="max-w-5xl mx-auto space-y-6">
    <h2 class="text-3xl font-black tracking-tight">System Matrix Overview</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2 bg-zinc-900/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
        <span class="text-xs text-[#ff1828] font-bold uppercase tracking-wider">Primary Vector</span>
        <h3 class="text-2xl font-bold mt-2">Continuous Latency Tracking</h3>
        <p class="text-zinc-400 text-sm mt-2">Zero-drop packet pipeline operating at 99.998% uptime efficiency.</p>
      </div>
      <div class="bg-gradient-to-br from-[#ff1828]/20 to-black border border-[#ff1828]/30 rounded-3xl p-6">
        <span class="text-xs text-zinc-400 font-bold uppercase">Telemetry</span>
        <div class="text-4xl font-black mt-2 text-white">0.42<span class="text-sm font-normal text-zinc-400">ms</span></div>
        <p class="text-xs text-zinc-400 mt-2">Sub-millisecond compute cycle</p>
      </div>
    </div>
  </div>
</body>
</html>`,
            },
          ],
        },
      },
    ],
  },

  'UI/UX Best Practices': {
    id: 'thread-ui-ux',
    title: 'UI/UX Best Practices',
    promptBanner: 'Essential UI/UX rules for luxury web engineering',
    messages: [
      {
        id: 'msg-ux-u1',
        sender: 'user',
        text: 'What are the top UI/UX rules for creating immersive tactile web experiences?',
        timestamp: '01:20 PM',
      },
      {
        id: 'msg-ux-a1',
        sender: 'ai',
        text: `## The Immutable Laws of Tactile UI/UX Design

Engineered feedback, optical balance, and frictionless cognitive flow.

### 1. Core Principles of Polish
• **Subtle Tactile Feedback**: Every key action should combine micro-animations, physical hover scaling (98% on click), and optional haptic confirmation.
• **Zero-Slop Rule**: Avoid redundant badge pills and generic floating cards; every element must serve content hierarchy.
• **Optical Typography Hierarchy**: Contrast deep blacks against pure white headers and muted steel-zinc body text for effortless legibility.`,
        timestamp: '01:21 PM',
        thoughtDuration: 3,
        structuredContent: {
          mainTitle: 'The Immutable Laws of Tactile UI/UX Design',
          intro: 'Engineered feedback, optical balance, and frictionless cognitive flow.',
          sections: [
            {
              title: '1. Core Principles of Polish',
              bullets: [
                'Subtle Tactile Feedback: Every key action should combine micro-animations, physical hover scaling (98% on click), and optional haptic confirmation.',
                'Zero-Slop Rule: Avoid redundant badge pills and generic floating cards; every element must serve content hierarchy.',
                'Optical Typography Hierarchy: Contrast deep blacks against pure white headers and muted steel-zinc body text for effortless legibility.',
              ],
            },
          ],
        },
      },
    ],
  },

  'Tailwind CSS Guide': {
    id: 'thread-tailwind',
    title: 'Tailwind CSS Guide',
    promptBanner: 'Modern Tailwind CSS design tokens and performance styling',
    messages: [
      {
        id: 'msg-tw-u1',
        sender: 'user',
        text: 'How can I master modern Tailwind CSS for high-contrast luxury web interfaces?',
        timestamp: '02:40 PM',
      },
      {
        id: 'msg-tw-a1',
        sender: 'ai',
        text: `## Modern Tailwind CSS Architecture & Token Discipline

Harnessing Tailwind CSS utility elegance for editorial precision.

### 1. Key Performance Patterns
• **Arbitrary Values & Custom Shadows**: Use box-shadow blends like \`shadow-[0_0_25px_rgba(255,24,40,0.6)]\` for signature neon depth.
• **Backdrop Filter Optimization**: Pair \`backdrop-blur-xl\` with translucent borders \`border-white/10\` for sleek glass surfaces.
• **Fluid Responsive Grids**: Employ \`grid-cols-1 md:grid-cols-12\` with asymmetric column spans for magazine-grade layouts.`,
        timestamp: '02:41 PM',
        thoughtDuration: 2,
        structuredContent: {
          mainTitle: 'Modern Tailwind CSS Architecture & Token Discipline',
          intro: 'Harnessing Tailwind CSS utility elegance for editorial precision.',
          sections: [
            {
              title: '1. Key Performance Patterns',
              bullets: [
                'Arbitrary Values & Custom Shadows: Use box-shadow blends like shadow-[0_0_25px_rgba(255,24,40,0.6)] for signature neon depth.',
                'Backdrop Filter Optimization: Pair backdrop-blur-xl with translucent borders border-white/10 for sleek glass surfaces.',
                'Fluid Responsive Grids: Employ grid-cols-1 md:grid-cols-12 with asymmetric column spans for magazine-grade layouts.',
              ],
            },
          ],
        },
      },
    ],
  },

  'Product Marketing Plan': {
    id: 'thread-marketing',
    title: 'Product Marketing Plan',
    promptBanner: 'High-velocity go-to-market and positioning blueprint',
    messages: [
      {
        id: 'msg-pm-u1',
        sender: 'user',
        text: 'Give me a structured Go-To-Market and launch roadmap for a premier tech product.',
        timestamp: '03:15 PM',
      },
      {
        id: 'msg-pm-a1',
        sender: 'ai',
        text: `## High-Velocity Go-To-Market Blueprint

A phased roadmap from alpha validation to global market penetration.

### 1. Phase-by-Phase Execution
• **Phase 1: VIP Private Beta (Days 1–30)**: Onboard 100 power users to test edge cases, benchmark core performance, and harvest qualitative testimonials.
• **Phase 2: Product Hunt & Developer Showcase (Days 31–45)**: Public release with interactive live sandboxes, social proof showcase, and high-impact cinematic trailer.
• **Phase 3: Scale & Retention Loops (Days 46–90)**: Establish referral engine, SEO landing pages for high-intent keywords, and direct developer integration docs.`,
        timestamp: '03:16 PM',
        thoughtDuration: 3,
        structuredContent: {
          mainTitle: 'High-Velocity Go-To-Market Blueprint',
          intro: 'A phased roadmap from alpha validation to global market penetration.',
          sections: [
            {
              title: '1. Phase-by-Phase Execution',
              bullets: [
                'Phase 1: VIP Private Beta (Days 1–30): Onboard 100 power users to test edge cases, benchmark core performance, and harvest qualitative testimonials.',
                'Phase 2: Product Hunt & Developer Showcase (Days 31–45): Public release with interactive live sandboxes, social proof showcase, and high-impact cinematic trailer.',
                'Phase 3: Scale & Retention Loops (Days 46–90): Establish referral engine, SEO landing pages for high-intent keywords, and direct developer integration docs.',
              ],
            },
          ],
        },
      },
    ],
  },
};
