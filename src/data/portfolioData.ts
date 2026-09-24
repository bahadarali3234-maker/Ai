import heroAvatarImg from '../assets/images/avatar_cutout.png';
import shadowsImg from '../assets/images/ai_shadows_streetwear_1789852712824.jpg';
import zaynSpicesImg from '../assets/images/ai_zayn_packaging_1789852729989.jpg';
import voltraImg from '../assets/images/ai_voltra_hardware_1789852745863.jpg';
import voltImg from '../assets/images/ai_volt_athletic_1789852764213.jpg';
import brandCraftMacroImg from '../assets/images/ai_neural_craft_1789852784169.jpg';
import studioVisionGridImg from '../assets/images/ai_workspace_ui_1789852801571.jpg';
import { Project, ServiceItem, FaqItem } from '../types';

export const HERO_AVATAR = heroAvatarImg;
export const CRAFT_MACRO_IMAGE = brandCraftMacroImg;
export const STUDIO_VISION_IMAGE = studioVisionGridImg;

export const CLIENT_BRANDS = [
  'GEMINI ULTRA',
  'DEEPMIND',
  'VOLTRA AI',
  'NEURAL SYNC',
  'PULSE LABS',
  'SYNTHESIS',
  'XTRA INTELLIGENCE',
  'NAKAMA',
  'VOLT DYNAMICS',
  'HOODVIBE',
  'SHADOWS'
];

export const PROJECTS: Project[] = [
  {
    id: 'shadows',
    title: 'Shadows™ — AI Streetwear Identity',
    subtitle: 'Autonomous Generative Aesthetics & Global Culture',
    year: '2025',
    tags: ['AI Identity', 'Neural Design'],
    image: shadowsImg,
    accentColor: '#a855f7',
    client: 'Shadows Apparel Co.',
    description:
      'Complete generative brand identity architecture crafted via AI visual intelligence. Synthesized hooded phantom iconography, algorithmic geometric typography, merchandise packaging, and immersive digital graphics.',
    deliverables: [
      'Neural Identity System',
      'Algorithmic Monogram Generation',
      'Automated Apparel Packaging Specs',
      'Lookbook AI Direction & Graphics'
    ]
  },
  {
    id: 'zayn-spices',
    title: 'Zayn Spices — Botanical AI Vision Synthesis',
    subtitle: 'Multimodal Organic Packaging & Visual Heritage',
    year: '2025',
    tags: ['AI Packaging', 'Vision Synthesis'],
    image: zaynSpicesImg,
    accentColor: '#10b981',
    client: 'Zayn Organic Food Group',
    description:
      'Generative sustainable packaging architecture developed with multimodal vision synthesis. Modeled organic kraft tubes, botanical prompt-driven flora art, rich earthen color palettes, and production-ready dielines.',
    deliverables: [
      'Generative Kraft Packaging Suite',
      'Botanical Flora AI Vector Emblems',
      'Automated Nutrition & Badge Compliance',
      'Photorealistic 3D Spatial Renders'
    ]
  },
  {
    id: 'voltra',
    title: 'Voltra™ — Future Tech Electronics',
    subtitle: 'Engineered Precision • Hardware Design Intelligence',
    year: '2024',
    tags: ['AI Design System', 'Hardware Intelligence'],
    image: voltraImg,
    accentColor: '#f41151',
    client: 'Voltra Electronics Corp.',
    description:
      'AI-assisted industrial design identity for next-generation hardware electronics. Designed minimalist stationery collaterals, electric red brand contrast accents, technical packaging, and automated design guidelines.',
    deliverables: [
      'Autonomous Brand Book & Tokens',
      'AI-Generated Executive Stationery',
      'Sustainable Unboxing Structural Design',
      'Hardware Laser-Etched Emblem Design'
    ]
  },
  {
    id: 'volt',
    title: 'Volt — Athletic & Performance Neural System',
    subtitle: 'Algorithmic Power • Relentless Performance',
    year: '2024',
    tags: ['Generative Identity', 'Activewear AI'],
    image: voltImg,
    accentColor: '#ef4444',
    client: 'Volt Athletic Group',
    description:
      'High-energy generative design system for a modern athletic apparel powerhouse. Built with raw contrast, high-energy typographic layouts, 3D gym gear branding, shaker bottles, and dynamic activewear assets.',
    deliverables: [
      'Dynamic Poster & Typographic Series',
      'AI Apparel Heat-Transfer Assets',
      'Photorealistic Shaker & Bottle Branding',
      'Social Campaign Generative Visuals'
    ]
  }
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'brand-identity',
    title: 'Neural Branding & Generative Systems',
    tagline: 'Algorithmic marks, scalable visual architectures, and prompts',
    description:
      'Autonomous logo suites, typographic pairings, vector token hierarchies, and comprehensive brand frameworks generated with sub-second precision.',
    deliverables: ['Generative Vector Logos & Emblems', 'Autonomous Brand Guidelines', 'Algorithmic Color & Font Systems', 'High-Res Digital Assets'],
    iconName: 'Sparkles',
    image: voltraImg
  },
  {
    id: 'packaging-design',
    title: 'Multimodal Packaging & 3D Synthesis',
    tagline: 'Tactile packaging, unboxing logic, and 3D modeling',
    description:
      'AI-synthesized packaging models, photorealistic structural unboxing layouts, foil stamping dielines, and retail-ready manufacturing specifications.',
    deliverables: ['Custom 3D Structural Box Renders', 'Foil & Emboss Layer Separations', 'Print Production Automation', '4K Photorealistic Spatial Previews'],
    iconName: 'Package',
    image: zaynSpicesImg
  },
  {
    id: 'art-direction',
    title: 'Vision Art Direction & Spatial Imagery',
    tagline: 'Cinematic world-building, neural lighting, and materials',
    description:
      'High-impact visual narratives, deep prompt-crafted scenes, cinematic lighting simulations, and campaign imagery created with leading-edge vision models.',
    deliverables: ['Multimodal Campaign Concepts', 'Spatial 3D Asset Generation', 'Editorial Lookbook Synthesis', 'Dynamic Motion Storyboards'],
    iconName: 'Layers',
    image: brandCraftMacroImg
  },
  {
    id: 'digital-experience',
    title: 'Code & Autonomous Web Architecture',
    tagline: 'Intelligent full-stack interfaces and interaction design',
    description:
      'Next-generation web applications, micro-interactions, responsive architectures, and accessible UI frameworks built with modern code intelligence.',
    deliverables: ['Autonomous UI/UX Architecture', 'Interactive Web Prototypes', 'Design Token Integration', 'High-Conversion Responsive Layouts'],
    iconName: 'Monitor',
    image: studioVisionGridImg
  }
];

export const FAQS: FaqItem[] = [
  {
    question: 'How does the AI generate project solutions?',
    answer:
      'Gemini AI combines multimodal reasoning with strict design heuristics. From your initial prompt, it analyzes category trends, generates visual moodboards, explores vector topologies, and creates cohesive identity assets.'
  },
  {
    question: 'How does the collaborative AI session work?',
    answer:
      'Engagements operate like a live creative sandbox. You input prompts or strategic goals, and the AI instantly generates iterations, interactive previews, and refined options for you to inspect in real time.'
  },
  {
    question: 'Are the AI deliverables production-ready?',
    answer:
      'Yes, completely. Every output is calibrated for actual production, providing scalable vector assets (SVG, EPS, AI), standard web tokens, 3D meshes, and print-ready CMYK separations with precise bleeds.'
  },
  {
    question: 'Can Gemini AI be integrated into ongoing creative workflows?',
    answer:
      'Yes, Gemini AI works continuously as an intelligent co-pilot, supporting ongoing sprint requests, seasonal campaigns, automated design token updates, and real-time visual direction.'
  }
];
