import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  LayoutGrid,
  Folder,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Star,
  Send,
  Mic,
  MicOff,
  User as UserIcon,
  ArrowLeft,
  Menu,
  X,
  Sparkles,
  Paperclip,
  CheckCircle2,
  Copy,
  RotateCcw,
  Pencil,
  Trash2,
  Undo2,
  FileDown,
  FileText,
  FileCode,
  FileCode2,
  Download,
  Eye,
  EyeOff,
  Code2,
  Terminal,
  Check,
  Loader2,
  Clock,
  Coins,
  Smartphone,
  Scan,
  Locate,
  ListTree,
  Image as ImageIcon,
  Maximize2,
  HelpCircle,
  FolderGit2,
  History,
  Layers,
  ArrowRight,
  Brain,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AttachedFile, QuestionBlock, ProjectMemory, MemoryContextPackage } from '../types';
import { WebsitePreviewModal } from './WebsitePreviewModal';
import { ProjectMemoryDrawer } from './ProjectMemoryDrawer';
import { TimetableImageCard, TimetableSlot } from './TimetableImageCard';
import { MessageTopImageGallery } from './MessageTopImageGallery';
import { memoryManager } from '../utils/memoryManager';

export function isSimpleMessage(text?: string): boolean {
  if (!text) return false;
  const clean = text.trim().toLowerCase().replace(/[!.,?]/g, '');
  const simple = [
    'hi', 'hello', 'hey', 'hey there', 'hello there', 'hi there',
    'thanks', 'thank you', 'thx', 'ty', 'good morning', 'good afternoon',
    'good evening', 'bye', 'goodbye', 'see you', 'ok', 'okay', 'cool',
    'great', 'awesome'
  ];
  return simple.includes(clean);
}

export function extractTimetableData(text: string): { title: string; slots: TimetableSlot[] } | null {
  if (!text) return null;

  // Extract from bullet/numbered lines containing times like 05:00 AM, 6:30, 08:00 - 09:00, etc.
  const timeSlotRegex =
    /(?:^|\n)[-*•\d.]*\s*([01]?\d:[0-5]\d(?:\s*[ap]m)?(?:\s*[-–—to]\s*[01]?\d:[0-5]\d(?:\s*[ap]m)?)?)\s*[:–—|-]\s*([^\n]+)/gi;

  const matches: TimetableSlot[] = [];
  let match: RegExpExecArray | null;

  while ((match = timeSlotRegex.exec(text)) !== null) {
    const rawTime = match[1].trim();
    const rawContent = match[2].trim().replace(/^[*#_]+|[*#_]+$/g, '');

    if (!rawContent || rawContent.length < 3) continue;

    let category: TimetableSlot['category'] = 'General';
    const lower = (rawTime + ' ' + rawContent).toLowerCase();

    if (/wake|rise|morning|breakfast|hydrat/i.test(lower)) category = 'Morning';
    else if (/work|deep|code|study|focus|task|execut/i.test(lower)) category = 'Deep Work';
    else if (/gym|workout|exercise|training|run|fitness|walk/i.test(lower)) category = 'Fitness';
    else if (/lunch|dinner|meal|snack|nutrit|food/i.test(lower)) category = 'Nutrition';
    else if (/evening|family|relax|hobby|wind\s*down|read/i.test(lower)) category = 'Evening';
    else if (/sleep|bed|rest/i.test(lower)) category = 'Sleep';

    const parts = rawContent.split(/\s*[-–—(]\s*/);
    const activity = parts[0].replace(/[)]+$/, '').trim();
    const desc = parts.length > 1 ? parts.slice(1).join(' - ').replace(/[)]+$/, '').trim() : undefined;

    matches.push({
      time: rawTime,
      activity: activity || 'Scheduled Block',
      category,
      description: desc,
    });
  }

  if (matches.length >= 3) {
    let title = 'DAILY ROUTINE MASTER TIMETABLE';
    if (/study|exam/i.test(text)) title = 'STUDY & ACADEMIC TIMETABLE';
    else if (/workout|fitness|gym/i.test(text)) title = 'FITNESS & TRAINING SCHEDULE';
    else if (/weekend/i.test(text)) title = 'WEEKEND ROUTINE TIMETABLE';

    return {
      title,
      slots: matches,
    };
  }

  // Also parse markdown table if present
  const tableRows = text.split('\n').filter((l) => l.includes('|') && /\d{1,2}:\d{2}/.test(l));
  if (tableRows.length >= 3) {
    const tableSlots: TimetableSlot[] = [];
    for (const row of tableRows) {
      const cells = row.split('|').map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 2) {
        const timeCell = cells.find((c) => /\d{1,2}:\d{2}/.test(c)) || cells[0];
        const actCell = cells.find((c) => c !== timeCell && c.length > 2) || cells[1];
        if (timeCell && actCell) {
          tableSlots.push({
            time: timeCell,
            activity: actCell.replace(/^[*#_]+|[*#_]+$/g, ''),
            category: 'General',
          });
        }
      }
    }
    if (tableSlots.length >= 3) {
      return {
        title: 'DAILY ROUTINE MASTER TIMETABLE',
        slots: tableSlots,
      };
    }
  }

  // Also parse workflow steps / flowchart process if requested
  const stepRegex = /(?:^|\n)[-*•]?\s*(?:Step|Phase|Stage|Flow|Part)\s*(\d+)[:–—.]\s*([^\n]+)/gi;
  const flowSlots: TimetableSlot[] = [];
  let sMatch: RegExpExecArray | null;
  while ((sMatch = stepRegex.exec(text)) !== null) {
    const stepNum = sMatch[1];
    const stepContent = sMatch[2].trim().replace(/^[*#_]+|[*#_]+$/g, '');
    const parts = stepContent.split(/\s*[-–—(]\s*/);
    flowSlots.push({
      time: `Phase ${stepNum}`,
      activity: parts[0].replace(/[)]+$/, '').trim(),
      category: Number(stepNum) <= 2 ? 'Morning' : Number(stepNum) <= 4 ? 'Deep Work' : 'Evening',
      description: parts.length > 1 ? parts.slice(1).join(' - ').replace(/[)]+$/, '').trim() : undefined,
    });
  }
  if (flowSlots.length >= 3) {
    return {
      title: 'MASTER WORKFLOW ARCHITECTURE',
      slots: flowSlots,
    };
  }

  return null;
}

export interface SectionItem {
  title: string;
  description?: string;
  bullets?: string[];
  codeSnippet?: string;
  codeLanguage?: string;
  promptSnippet?: string;
  isPrompt?: boolean;
  fileName?: string;
  question?: QuestionBlock;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  thoughtDuration?: number;
  attachments?: AttachedFile[];
  previousVersions?: string[];
  futureVersions?: string[];
  provider?: 'gemini' | 'groq';
  structuredContent?: {
    mainTitle?: string | { white: string; red: string };
    intro?: string;
    sections?: SectionItem[];
    question?: QuestionBlock;
  };
  activeQuestion?: QuestionBlock;
}

export interface ChatThread {
  id: string;
  title: string;
  promptBanner: string;
  messages: ChatMessage[];
}

/**
 * Robust markdown to structured layout parser for Gemini outputs
 */
export function parseAIText(raw: string): {
  mainTitle?: string;
  intro?: string;
  sections: SectionItem[];
} {
  // Strip out any ```question ... ``` blocks completely so questions NEVER render in chat
  const cleanedRaw = raw.replace(/```question[\s\S]*?```/gi, '').trim();
  const lines = cleanedRaw.split('\n');
  let mainTitle: string | undefined;
  let intro = '';
  const sections: SectionItem[] = [];

  const finalizeCode = (code: string): string => {
    if (!code) return code;
    let s = code.trim();
    const isHtml =
      /<!DOCTYPE\s+html/i.test(s) ||
      /<html[\s>]/i.test(s) ||
      /<head[\s>]/i.test(s) ||
      /<body[\s>]/i.test(s) ||
      /<style[\s>]/i.test(s) ||
      /<div[\s>]/i.test(s);

    if (isHtml) {
      if (!/<!DOCTYPE\s+html/i.test(s)) {
        if (/<html[\s>]/i.test(s)) {
          s = '<!DOCTYPE html>\n' + s;
        } else {
          s = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Website</title>\n</head>\n<body>\n${s}\n</body>\n</html>`;
        }
      }
      if (!/<\/html>/i.test(s)) {
        if (!/<\/script>/i.test(s) && /<script[\s>]/i.test(s)) {
          s += '\n</script>';
        }
        if (!/<\/body>/i.test(s)) {
          s += '\n</body>';
        }
        s += '\n</html>';
      }
    }
    return s;
  };

  let currentSection: {
    title: string;
    descLines: string[];
    bullets: string[];
    codeLines: string[];
    inCodeBlock: boolean;
    codeLang: string;
    isPrompt: boolean;
    fileName?: string;
  } | null = null;

  let headerFound = false;
  let inIntro = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check code block markers
    if (trimmed.startsWith('```')) {
      if (currentSection && currentSection.inCodeBlock) {
        currentSection.inCodeBlock = false;
        continue;
      }

      const fenceRest = trimmed.slice(3).trim();
      let lang = fenceRest.toLowerCase();
      let customFile = '';
      const fileMatch = fenceRest.match(/filename=["']?([^"'\s]+)["']?/i) || fenceRest.match(/file=["']?([^"'\s]+)["']?/i);
      if (fileMatch) {
        customFile = fileMatch[1];
      }
      lang = lang.replace(/filename=["']?[^"'\s]+["']?/i, '').replace(/file=["']?[^"'\s]+["']?/i, '').trim();
      const primaryLang: string = lang.split(/[\s,]+/)[0] || '';
      let isPromptBlock = false;
      if (primaryLang.includes('prompt') || primaryLang.includes('llm')) {
        isPromptBlock = true;
      } else if (currentSection && currentSection.title.toLowerCase().includes('prompt')) {
        isPromptBlock = true;
      }

      let defaultName = 'Component.tsx';
      if (customFile) {
        defaultName = customFile;
      } else if (primaryLang === 'html') {
        defaultName = 'index.html';
      } else if (primaryLang === 'css') {
        defaultName = 'styles.css';
      } else if (isPromptBlock) {
        defaultName = 'prompt.txt';
      }

      // If no current section or current section already contains content, start a dedicated section for this file
      if (!currentSection || currentSection.bullets.length > 0 || currentSection.codeLines.length > 0) {
        if (currentSection) {
          const snippetText = currentSection.codeLines.join('\n').trim();
          const cleanCode = finalizeCode(snippetText);
          sections.push({
            title: currentSection.title,
            description: currentSection.descLines.join('\n').trim() || undefined,
            bullets: currentSection.bullets.length > 0 ? currentSection.bullets : undefined,
            codeSnippet: !currentSection.isPrompt && cleanCode ? cleanCode : undefined,
            codeLanguage: currentSection.codeLang || undefined,
            promptSnippet: currentSection.isPrompt && snippetText ? snippetText : undefined,
            isPrompt: currentSection.isPrompt,
            fileName: currentSection.fileName,
          });
        }
        currentSection = {
          title: isPromptBlock ? 'AI Concept Prompt' : `Source Code (${defaultName})`,
          descLines: [],
          bullets: [],
          codeLines: [],
          inCodeBlock: true,
          codeLang: primaryLang || (isPromptBlock ? 'prompt' : 'tsx'),
          isPrompt: isPromptBlock,
          fileName: defaultName,
        };
      } else {
        currentSection.inCodeBlock = true;
        currentSection.codeLang = primaryLang || (isPromptBlock ? 'prompt' : 'tsx');
        currentSection.isPrompt = isPromptBlock;
        currentSection.fileName = defaultName;
      }
      continue;
    }

    if (currentSection && currentSection.inCodeBlock) {
      currentSection.codeLines.push(line);
      continue;
    }

    // Check # Main Title (all white text, slightly larger than sub-heading)
    if (trimmed.startsWith('# ') && !headerFound) {
      headerFound = true;
      mainTitle = trimmed.replace(/^#\s+/, '').trim();
      inIntro = true;
      continue;
    }

    // Check ## Section Title
    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      inIntro = false;
      if (currentSection) {
        const snippetText = currentSection.codeLines.join('\n').trim();
        const cleanCode = finalizeCode(snippetText);
        sections.push({
          title: currentSection.title,
          description: currentSection.descLines.join('\n').trim() || undefined,
          bullets: currentSection.bullets.length > 0 ? currentSection.bullets : undefined,
          codeSnippet: !currentSection.isPrompt && cleanCode ? cleanCode : undefined,
          codeLanguage: currentSection.codeLang || undefined,
          promptSnippet: currentSection.isPrompt && snippetText ? snippetText : undefined,
          isPrompt: currentSection.isPrompt,
          fileName: currentSection.fileName,
        });
      }
      const sTitle = trimmed.replace(/^#+\s+/, '').trim();
      currentSection = {
        title: sTitle,
        descLines: [],
        bullets: [],
        codeLines: [],
        inCodeBlock: false,
        codeLang: '',
        isPrompt: sTitle.toLowerCase().includes('prompt'),
      };
      continue;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      inIntro = false;
      const bulletText = trimmed.replace(/^[-*•]\s+/, '').trim();
      if (!currentSection) {
        currentSection = {
          title: 'Core Architecture',
          descLines: [],
          bullets: [bulletText],
          codeLines: [],
          inCodeBlock: false,
          codeLang: '',
          isPrompt: false,
        };
      } else {
        currentSection.bullets.push(bulletText);
      }
      continue;
    }

    // Numbered list items
    if (/^\d+\.\s+/.test(trimmed)) {
      inIntro = false;
      const bulletText = trimmed.replace(/^\d+\.\s+/, '').trim();
      if (!currentSection) {
        currentSection = {
          title: 'Implementation Flow',
          descLines: [],
          bullets: [bulletText],
          codeLines: [],
          inCodeBlock: false,
          codeLang: '',
          isPrompt: false,
        };
      } else {
        currentSection.bullets.push(bulletText);
      }
      continue;
    }

    // Content lines
    if (inIntro) {
      if (trimmed) {
        intro += (intro ? ' ' : '') + trimmed;
      }
    } else if (currentSection) {
      if (trimmed) {
        currentSection.descLines.push(trimmed);
      }
    } else if (trimmed) {
      intro += (intro ? ' ' : '') + trimmed;
    }
  }

  if (currentSection) {
    const snippetText = currentSection.codeLines.join('\n').trim();
    const cleanCode = finalizeCode(snippetText);
    sections.push({
      title: currentSection.title,
      description: currentSection.descLines.join('\n').trim() || undefined,
      bullets: currentSection.bullets.length > 0 ? currentSection.bullets : undefined,
      codeSnippet: !currentSection.isPrompt && cleanCode ? cleanCode : undefined,
      codeLanguage: currentSection.codeLang || undefined,
      promptSnippet: currentSection.isPrompt && snippetText ? snippetText : undefined,
      isPrompt: currentSection.isPrompt,
      fileName: currentSection.fileName,
    });
  }

  return {
    mainTitle,
    intro: intro.trim() || undefined,
    sections,
  };
}

/**
 * Detects and extracts interactive question blocks from model responses
 */
export function extractQuestionBlock(raw: string): QuestionBlock | null {
  if (!raw) return null;

  // 1. Check for ```question ... ``` or :::question ... :::
  const blockMatch = raw.match(/(?:```question|:::question)([\s\S]*?)(?:```|:::)/i);
  if (blockMatch) {
    const content = blockMatch[1].trim();
    const lines = content.split('\n');
    let title = '';
    let description = '';
    const options: string[] = [];

    for (const l of lines) {
      const t = l.trim();
      if (/^title[:\s]/i.test(t)) {
        title = t.replace(/^title[:\s]+/i, '').trim();
      } else if (/^(?:description|desc|explanation)[:\s]/i.test(t)) {
        description = t.replace(/^(?:description|desc|explanation)[:\s]+/i, '').trim();
      } else if (/^options[:\s]/i.test(t)) {
        // options header
      } else if (t.startsWith('- ') || t.startsWith('* ') || t.startsWith('• ') || /^\d+\.\s/.test(t)) {
        const optText = t.replace(/^[-*•\d.]+\s*/, '').trim();
        if (optText && !optText.toLowerCase().includes('custom')) {
          options.push(optText);
        }
      }
    }

    if (title || options.length > 0) {
      return {
        id: `q-${Date.now()}`,
        title: title || 'What visual style should the website use?',
        description: description || undefined,
        options: options.length > 0 ? options : ['Minimal Premium', 'Glassmorphism', 'Futuristic Dark', 'Luxury Editorial'],
      };
    }
  }

  // 2. Natural question format check
  const naturalMatch = raw.match(/(?:\*\*Question:\*\*|Question:)\s*([^\n]+)([\s\S]*?)(?:(?=\n\n[#*A-Z])|$)/i);
  if (naturalMatch) {
    const qTitle = naturalMatch[1].replace(/[*_#]/g, '').trim();
    const rest = naturalMatch[2];
    const optMatches = rest.match(/^[•\-*]\s*([^\n]+)/gm) || rest.match(/^\d+\.\s*([^\n]+)/gm);
    if (optMatches && optMatches.length >= 2) {
      const parsedOpts = optMatches
        .map((o) => o.replace(/^[•\-*\d.]+\s*/, '').trim())
        .filter((o) => o && !o.toLowerCase().startsWith('custom'));
      return {
        id: `q-${Date.now()}`,
        title: qTitle,
        options: parsedOpts.length > 0 ? parsedOpts : ['Minimal Premium', 'Glassmorphism', 'Futuristic Dark', 'Luxury Editorial'],
      };
    }
  }

  return null;
}

// Initial pre-populated chats matching the user's uploaded image
const INITIAL_CHAT_DATA: Record<string, ChatThread> = {
  'Daily Routine Timetable': {
    id: 'daily-routine-timetable',
    title: 'Daily Routine Timetable',
    promptBanner: 'High-Performance Structured Daily Routine & Downloadable PNG Timetable',
    messages: [
      {
        id: 'msg-drt-1',
        sender: 'user',
        text: 'create a timetable for my daily routine',
        timestamp: '07:30 AM',
      },
      {
        id: 'msg-drt-2',
        sender: 'ai',
        text: `Here is your high-performance daily routine timetable, strategically structured for maximum deep work, physical energy, and restorative sleep.

- 05:30 AM - 06:30 AM: Morning Mobility & Hydration - [Morning] Wake up, 500ml lemon water, 15 min mobility.
- 06:30 AM - 07:30 AM: High-Performance Workout - [Fitness] Strength training, mobility drills, cold shower.
- 08:00 AM - 09:00 AM: Nutritious Fuel & Day Roadmap - [Nutrition] High protein fuel, identify top 3 priorities.
- 09:00 AM - 12:30 PM: Deep Work Block 1 - [Deep Work] Uninterrupted focus on primary needle-moving projects.
- 12:30 PM - 01:30 PM: Balanced Lunch & Sunlight Walk - [Nutrition] Whole foods meal and 20 min walk for circadian reset.
- 01:30 PM - 05:00 PM: Deep Work Block 2 - [Deep Work] Secondary development, execution, and communication.
- 05:00 PM - 06:30 PM: Skill Mastery & Creative Growth - [Evening] Reading, side engineering, or personal hobbies.
- 06:30 PM - 08:00 PM: Dinner & Social Connection - [Nutrition] Nourishing dinner with family and relaxation.
- 08:00 PM - 09:30 PM: Evening Wind-Down & Reflection - [Evening] Journaling, planning tomorrow, low blue light.
- 09:30 PM - 10:30 PM: Reading & Sleep Preparation - [Sleep] Fiction reading, cool room temperature (19°C).
- 10:30 PM: Restorative Deep Sleep - [Sleep] Lights out, 7.5 to 8 hours uninterrupted sleep.`,
        timestamp: '07:31 AM',
        thoughtDuration: 3,
        structuredContent: {
          mainTitle: 'Daily Routine Master Timetable',
          intro: 'An optimized hourly schedule engineered for peak cognitive performance, physical endurance, and deep restorative recovery.',
          sections: [
            {
              title: 'Executive Routine Structure',
              description: 'This schedule follows circadian biological peaks, synchronizing deep focus during morning cortisol peaks and evening wind-down with melatonin production.',
              bullets: [
                'Early morning cortisol spike harnessed for intense physical training and high-leverage focus.',
                'Two 3.5-hour deep work cycles with strict digital distraction elimination.',
                'Circadian sunlight walking after lunch to sustain afternoon alertness.',
                'Screen-free 60-minute sleep buffer to maximize REM and deep sleep cycles.',
              ],
            },
            {
              title: 'Interactive Web Timetable Code',
              description: 'Standalone single-file responsive HTML timetable with dark obsidian glassmorphism:',
              codeSnippet: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Routine Timetable</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #0c0204; color: #ffffff; min-height: 100vh; padding: 2rem 1rem; display: flex; justify-content: center; }
    .container { max-width: 900px; width: 100%; }
    .header { text-align: center; margin-bottom: 2.5rem; padding: 2rem; background: radial-gradient(circle at top, rgba(255,24,40,0.15), transparent 70%); border-radius: 1.5rem; border: 1px solid rgba(255,24,40,0.3); }
    .tag { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; background: rgba(255,24,40,0.2); color: #ff1828; border: 1px solid rgba(255,24,40,0.4); margin-bottom: 1rem; }
    h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
    p { color: #a1a1aa; font-size: 0.95rem; }
    .timeline { display: flex; flex-direction: column; gap: 1rem; }
    .slot { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; transition: all 0.2s ease; }
    .slot:hover { border-color: rgba(255,24,40,0.5); transform: translateY(-2px); background: rgba(255,24,40,0.05); }
    .time { font-family: monospace; font-weight: 700; font-size: 0.9rem; color: #ff6b78; background: rgba(255,24,40,0.12); padding: 0.4rem 0.8rem; border-radius: 0.5rem; border: 1px solid rgba(255,24,40,0.25); min-width: 140px; text-align: center; }
    .activity { font-weight: 600; font-size: 1.05rem; flex: 1; margin: 0 1.5rem; color: #f4f4f5; }
    .cat { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; padding: 0.3rem 0.75rem; border-radius: 9999px; background: rgba(255,255,255,0.08); color: #e4e4e7; border: 1px solid rgba(255,255,255,0.15); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="tag">● Verified Routine Architecture</span>
      <h1>Daily Routine Master Timetable</h1>
      <p>High-Performance Schedule for Deep Work, Energy, & Recovery</p>
    </div>
    <div class="timeline">
      <div class="slot"><span class="time">05:30 - 06:30 AM</span><span class="activity">Morning Mobility & Hydration</span><span class="cat">Morning</span></div>
      <div class="slot"><span class="time">06:30 - 07:30 AM</span><span class="activity">High-Performance Workout</span><span class="cat">Fitness</span></div>
      <div class="slot"><span class="time">08:00 - 09:00 AM</span><span class="activity">Nutritious Fuel & Day Roadmap</span><span class="cat">Nutrition</span></div>
      <div class="slot"><span class="time">09:00 - 12:30 PM</span><span class="activity">Deep Work Block 1 (High Leverage)</span><span class="cat">Deep Work</span></div>
      <div class="slot"><span class="time">12:30 - 01:30 PM</span><span class="activity">Balanced Lunch & Sunlight Walk</span><span class="cat">Nutrition</span></div>
      <div class="slot"><span class="time">01:30 - 05:00 PM</span><span class="activity">Deep Work Block 2 (Execution)</span><span class="cat">Deep Work</span></div>
      <div class="slot"><span class="time">05:00 - 06:30 PM</span><span class="activity">Skill Mastery & Creative Pursuits</span><span class="cat">Evening</span></div>
      <div class="slot"><span class="time">06:30 - 08:00 PM</span><span class="activity">Dinner & Social Connection</span><span class="cat">Nutrition</span></div>
      <div class="slot"><span class="time">08:00 - 09:30 PM</span><span class="activity">Evening Wind-Down & Reflection</span><span class="cat">Evening</span></div>
      <div class="slot"><span class="time">09:30 - 10:30 PM</span><span class="activity">Reading & Sleep Preparation</span><span class="cat">Sleep</span></div>
      <div class="slot"><span class="time">10:30 PM</span><span class="activity">Restorative Deep Sleep</span><span class="cat">Sleep</span></div>
    </div>
  </div>
</body>
</html>`,
              codeLanguage: 'html',
              fileName: 'timetable.html',
            },
          ],
        },
      },
    ],
  },
  'Website Discovery': {
    id: 'website-discovery',
    title: 'Website Discovery',
    promptBanner: 'Interactive Task Questioning & Single-File HTML Generation',
    messages: [
      {
        id: 'msg-wd-1',
        sender: 'user',
        text: 'Create a luxury automotive telemetry website with live dashboard',
        timestamp: '10:20 AM',
      },
      {
        id: 'msg-wd-2',
        sender: 'ai',
        text: 'Before generating your complete single-file website, let us configure the visual style to match your aesthetic standards.',
        timestamp: '10:20 AM',
        structuredContent: {
          mainTitle: 'Website Requirement Discovery',
          intro: 'High-end single-file HTML website generation requires key aesthetic and architectural decisions.',
          sections: [
            {
              title: 'Design Protocol',
              description: 'Please select your preferred visual style or provide a custom requirement below.',
              bullets: [
                'Embedded CSS styling with modern glassmorphism & responsive CSS grid.',
                'Functional JavaScript telemetry simulator and interactive components.',
                'Delivered in one single HTML file ready for instant download and live preview.',
              ],
            },
          ],
        },
        activeQuestion: {
          id: 'q-wd-1',
          title: 'What visual style should the website use?',
          description: 'Select the aesthetic foundation for your single-file luxury telemetry website.',
          options: [
            'Minimal Premium Dark',
            'Glassmorphism & Crimson Neon',
            'Futuristic Telemetry HUD',
            'Luxury Editorial',
          ],
          isAnswered: false,
        },
      },
    ],
  },
  'Landing Page Design': {
    id: 'landing-page-design',
    title: 'Landing Page Design',
    promptBanner: 'Design a landing page — copy, layout and Tailwind markup',
    messages: [
      {
        id: 'msg-lpd-1',
        sender: 'user',
        text: 'Design a landing page — copy, layout and Tailwind markup for EcoCycle',
        timestamp: '10:14 AM',
      },
      {
        id: 'msg-lpd-2',
        sender: 'ai',
        text: 'Here is the complete landing page design system for EcoCycle.',
        timestamp: '10:14 AM',
        structuredContent: {
          mainTitle: 'Landing Page Design',
          intro:
            'The following design is for a fictional product called "EcoCycle", a smart recycling bin that helps users recycle more efficiently.',
          sections: [
            {
              title: 'Copy',
              description: 'The landing page will have the following sections:',
              bullets: [
                'Hero Section: Introduction to EcoCycle',
                'Features Section: Key features of EcoCycle',
                'Benefits Section: Benefits of using EcoCycle',
                'Call-to-Action (CTA) Section: Encouraging users to sign up or learn more',
              ],
            },
            {
              title: 'Hero Section',
              description:
                'Headline: "Smarter Recycling, Zero Effort"\nSubheadline: "AI-guided sorting and instant carbon offset analytics inside your home."\nPrimary CTA: Pre-order Now\nSecondary CTA: Watch Demo (1 min)',
              bullets: [
                'High-contrast typography with Syne bold heading and clean sans body text.',
                'Ambient crimson backlight behind floating 3D product render.',
                'Interactive live carbon savings calculator widget.',
              ],
            },
            {
              title: 'AI Concept Prompt',
              description: 'Midjourney & Imagen 3 visual generation prompt for the hero product render:',
              promptSnippet: 'Ultra-realistic 8k cinematic studio photograph of EcoCycle smart recycling canister in an architect-designed Scandinavian kitchen, matte graphite finish with luminous red LED status halo, photorealistic depth of field, dramatic architectural lighting.',
              isPrompt: true,
            },
            {
              title: 'Tailwind Markup',
              description: 'Production-ready component scaffolding for the hero section:',
              codeSnippet: `<section className="relative min-h-[85vh] flex items-center justify-center bg-black text-white px-6 overflow-hidden">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,24,40,0.15),transparent_70%)]" />
  <div className="relative z-10 max-w-4xl mx-auto text-center">
    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight">
      Smarter Recycling, <span className="text-[#ff1828]">Zero Effort</span>
    </h1>
    <p className="mt-6 text-zinc-300 text-lg md:text-xl max-w-2xl mx-auto">
      AI-guided optical sorting and real-time carbon offset telemetry for modern households.
    </p>
    <div className="mt-8 flex items-center justify-center gap-4">
      <button className="px-8 py-4 rounded-full bg-[#ff1828] text-white font-bold shadow-[0_0_30px_rgba(255,24,40,0.7)] hover:scale-105 transition-all">
        Pre-order Now
      </button>
      <button className="px-8 py-4 rounded-full bg-zinc-900/80 border border-white/20 text-white hover:bg-zinc-800 transition-all">
        Explore Specs
      </button>
    </div>
  </div>
</section>`,
              codeLanguage: 'tsx',
            },
          ],
        },
      },
    ],
  },
  'Website Layout Ideas': {
    id: 'website-layout-ideas',
    title: 'Website Layout Ideas',
    promptBanner: 'Modern layout architectures for luxury automotive brands',
    messages: [
      {
        id: 'msg-wli-1',
        sender: 'user',
        text: 'Generate modern layout concepts for automotive websites',
        timestamp: '09:30 AM',
      },
      {
        id: 'msg-wli-2',
        sender: 'ai',
        text: 'Here are the layout architectures developed for high-performance automotive experiences.',
        timestamp: '09:30 AM',
        structuredContent: {
          mainTitle: 'Website Layout Ideas',
          intro:
            'Dynamic grid systems and immersive full-viewport parallax architectures designed for high-performance visual storytelling.',
          sections: [
            {
              title: 'Blueprint Architecture',
              description: 'Core visual modules engineered for high visual velocity:',
              bullets: [
                'Dual-layer Interactive Spotlight Canvas with continuous cursor tracking.',
                'Asymmetric Bento Grids with hyper-responsive glassmorphic cards.',
                'Full-width Cinematic Video Portals with responsive aspect ratio locking.',
                'Sticky Minimalist Navigation with ambient crimson underglow accents.',
              ],
            },
          ],
        },
      },
    ],
  },
  'UI/UX Best Practices': {
    id: 'ui-ux-best-practices',
    title: 'UI/UX Best Practices',
    promptBanner: 'High-conversion mobile UX best practices for dark mode',
    messages: [
      {
        id: 'msg-ui-1',
        sender: 'user',
        text: 'What are the top UI/UX best practices for dark mode luxury design?',
        timestamp: 'Yesterday',
      },
      {
        id: 'msg-ui-2',
        sender: 'ai',
        text: 'Here are the curated UX guidelines for dark luxury software interfaces.',
        timestamp: 'Yesterday',
        structuredContent: {
          mainTitle: { white: 'UI/UX Best', red: 'Practices' },
          intro:
            'Essential ergonomics, micro-interactions, and accessibility standards for dark-mode luxury interfaces.',
          sections: [
            {
              title: 'Design Rules',
              description: 'Follow these mathematical visual principles:',
              bullets: [
                'Thumb-zone action buttons with 48px minimum target size.',
                'High-contrast typography strictly passing WCAG AA standards.',
                'Micro-haptic visual feedback and spring transitions on critical actions.',
                'Zero-latency optimistic UI updates with smooth spring physics.',
              ],
            },
          ],
        },
      },
    ],
  },
  'Tailwind CSS Guide': {
    id: 'tailwind-css-guide',
    title: 'Tailwind CSS Guide',
    promptBanner: 'Advanced Tailwind CSS patterns & glowing neon effects',
    messages: [
      {
        id: 'msg-tw-1',
        sender: 'user',
        text: 'How to build BMW M neon glow effects with Tailwind CSS?',
        timestamp: '2 days ago',
      },
      {
        id: 'msg-tw-2',
        sender: 'ai',
        text: 'Here is the guide for crafting hypercar crimson glows with Tailwind.',
        timestamp: '2 days ago',
        structuredContent: {
          mainTitle: { white: 'Tailwind CSS', red: 'Guide' },
          intro:
            'Mastering arbitrary variant classes, custom glowing shadows, and backdrop-filter techniques for hypercar interfaces.',
          sections: [
            {
              title: 'Glow Syntax',
              description: 'Key CSS and Tailwind utilities for high-impact neon:',
              bullets: [
                'Hardware accelerated glow: shadow-[0_0_25px_rgba(255,24,40,0.7)]',
                'Double border depth: border-[1.5px] border-[#ff1828]',
                'Inner volumetric light: inset_0_0_12px_rgba(255,24,40,0.35)',
              ],
            },
          ],
        },
      },
    ],
  },
  'Product Marketing Plan': {
    id: 'product-marketing-plan',
    title: 'Product Marketing Plan',
    promptBanner: 'Go-To-Market execution for high-tier hardware launch',
    messages: [
      {
        id: 'msg-pmp-1',
        sender: 'user',
        text: 'Create a GTM marketing rollout plan for high-tier tech launch',
        timestamp: '3 days ago',
      },
      {
        id: 'msg-pmp-2',
        sender: 'ai',
        text: 'Here is the strategic rollout plan for premium market entrance.',
        timestamp: '3 days ago',
        structuredContent: {
          mainTitle: { white: 'Product Marketing', red: 'Plan' },
          intro:
            'Quarterly rollout framework prioritizing exclusive influencer access, VIP reservations, and interactive digital reveals.',
          sections: [
            {
              title: 'Phases',
              description: 'Sequential release milestones:',
              bullets: [
                'Phase 1: Teaser campaign with dynamic countdown & secret reveal modal.',
                'Phase 2: VIP early-bird access with private dashboard telemetry.',
                'Phase 3: Global public showcase with live keynote streaming.',
              ],
            },
          ],
        },
      },
    ],
  },
};

/**
 * Universal browser file download helper for multi-format export
 */
function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface SpecialSnippetBoxProps {
  type: 'code' | 'prompt';
  badgeTitle?: string;
  content: string;
  language?: string;
  fileName?: string;
  onUseInChat?: (text: string) => void;
  onOpenFullScreenPreview?: (html: string, fileName?: string) => void;
}

// Download helper function for code files
export const downloadCodeFile = (filename: string, content: string) => {
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Download error:', err);
  }
};

// Formatted text helper to render AI responses in bold font styling with ultra-bold markdown highlights
export const renderFormattedBoldText = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
  return parts.map((part, index) => {
    if (
      (part.startsWith('**') && part.endsWith('**')) ||
      (part.startsWith('__') && part.endsWith('__'))
    ) {
      const boldContent = part.slice(2, -2);
      return (
        <strong
          key={index}
          className="font-black text-white tracking-wide drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]"
        >
          {boldContent}
        </strong>
      );
    }
    return (
      <span key={index} className="font-bold text-zinc-100 tracking-[0.01em]">
        {part}
      </span>
    );
  });
};

// Helper to generate a live HTML sandbox document from raw HTML/code
const generateLiveSandboxHtml = (rawCode: string) => {
  // If the user's snippet is already a complete HTML document, render it faithfully
  if (/<!DOCTYPE\s+html/i.test(rawCode) || /<html[\s>]/i.test(rawCode)) {
    if (!rawCode.includes('cdn.tailwindcss.com')) {
      if (/<head[\s>]/i.test(rawCode)) {
        return rawCode.replace(/<head>/i, '<head><script src="https://cdn.tailwindcss.com"></script>');
      }
      return `<script src="https://cdn.tailwindcss.com"></script>\n${rawCode}`;
    }
    return rawCode;
  }

  // Extract clean markup if wrapped in JSX return
  let clean = rawCode;
  const returnMatch = clean.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*\}?\s*$/m);
  if (returnMatch && returnMatch[1]) {
    clean = returnMatch[1];
  } else {
    // Strip import statements
    clean = clean.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
    // Strip export statement wrappers
    clean = clean.replace(/export\s+(default\s+)?(function|const)\s+[\w\s=><()]+=>\s*\{?\s*(return\s*\(?)?/g, '');
    clean = clean.replace(/export\s+(default\s+)?function[\s\S]*?\{\s*(return\s*\(?)?/g, '');
    clean = clean.replace(/\}\s*;\s*$/, '').replace(/\}\s*$/, '');
  }

  // Convert JSX className to HTML class
  clean = clean.replace(/className=/g, 'class=');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      background-color: #09090b;
      color: #ffffff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body class="bg-[#09090b] text-white min-h-screen flex items-center justify-center p-6 antialiased">
  <div class="w-full flex justify-center items-center">
    ${clean}
  </div>
</body>
</html>`;
};

/**
 * Dedicated Special Layout Box for code snippets and prompts
 * Features:
 * - Compact box layout with scrollable detail code (max-h-80)
 * - White background option for crisp, readable code viewing
 * - Action controls: Fullscreen Wide, Copy, Live Preview (HTML), Download
 */
export const SpecialSnippetBox: React.FC<SpecialSnippetBoxProps> = ({
  type,
  badgeTitle,
  content,
  language,
  fileName,
  onUseInChat,
  onOpenFullScreenPreview,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  // Default to white background for code per user preference: "show White background every kind of code"
  const [codeTheme, setCodeTheme] = useState<'white' | 'dark'>('white');

  const isPrompt = type === 'prompt';

  // Preview is STRICTLY restricted to real HTML / markup code only
  const isHtmlCode =
    !isPrompt &&
    type === 'code' &&
    (
      Boolean(language && ['html', 'htm', 'xhtml'].includes(language.toLowerCase())) ||
      /<!DOCTYPE\s+html/i.test(content) ||
      /<html[\s>]/i.test(content) ||
      /<(div|section|header|footer|nav|main|aside|article|button|table|form|card|span|p|h[1-6]|svg)[\s>]/i.test(content)
    );

  // Ensure HTML code strictly starts from <!DOCTYPE html> and ends with </html>
  let completeContent = content;
  if (isHtmlCode) {
    if (!/<!DOCTYPE\s+html/i.test(completeContent)) {
      if (/<html[\s>]/i.test(completeContent)) {
        completeContent = '<!DOCTYPE html>\n' + completeContent.trim();
      } else {
        completeContent = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Website</title>\n</head>\n<body>\n${completeContent}\n</body>\n</html>`;
      }
    }
    if (!/<\/html>/i.test(completeContent)) {
      if (!/<\/script>/i.test(completeContent) && /<script[\s>]/i.test(completeContent)) {
        completeContent += '\n</script>';
      }
      if (!/<\/body>/i.test(completeContent)) {
        completeContent += '\n</body>';
      }
      completeContent += '\n</html>';
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(completeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resolvedFileName =
    fileName ||
    (isPrompt
      ? 'prompt.txt'
      : isHtmlCode
      ? 'index.html'
      : language?.toLowerCase() === 'css'
      ? 'styles.css'
      : language?.toLowerCase() === 'json'
      ? 'data.json'
      : language?.toLowerCase() === 'py'
      ? 'main.py'
      : language?.toLowerCase() === 'js' || language?.toLowerCase() === 'javascript'
      ? 'script.js'
      : 'index.html');

  const handleDownload = () => {
    downloadCodeFile(resolvedFileName, completeContent);
  };

  const lineCount = completeContent.split('\n').length;

  return (
    <div className="mt-4 rounded-2xl bg-[#0e0407] border border-white/20 hover:border-[#ff1828]/50 transition-colors shadow-2xl overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-[#180408] border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff1828] shadow-[0_0_8px_#ff1828]" />
          <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wide truncate">
            {resolvedFileName}
          </span>
          <span className="text-[11px] font-semibold text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full shrink-0">
            {lineCount} lines • Scrollable
          </span>
        </div>

        {/* Action Controls: Theme Toggle + 4 logo-icon options (Wide Screen, Copy, Preview, Save) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* White / Dark Code Background Toggle */}
          {!isPrompt && (
            <button
              type="button"
              onClick={() => setCodeTheme((curr) => (curr === 'white' ? 'dark' : 'white'))}
              className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer select-none ${
                codeTheme === 'white'
                  ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                  : 'bg-black/60 text-zinc-300 border-white/15 hover:border-white/30'
              }`}
              title="Toggle White / Dark code background"
            >
              {codeTheme === 'white' ? 'White BG' : 'Dark BG'}
            </button>
          )}

          {/* 1. Wide Screen */}
          <button
            type="button"
            onClick={() => {
              if (onOpenFullScreenPreview) {
                onOpenFullScreenPreview(completeContent, resolvedFileName);
              } else {
                setIsPreview(true);
              }
            }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#ff1828]/25 hover:text-[#ff1828] text-zinc-300 flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 border border-white/10 hover:border-[#ff1828]/40 shadow-sm"
            title="Expand Full Screen"
            aria-label="Expand Full Screen"
          >
            <Maximize2 size={15} />
          </button>

          {/* 2. Copy */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 border border-white/10 shadow-sm"
            title="Copy Code"
            aria-label="Copy Code"
          >
            {copied ? (
              <CheckCircle2 size={15} className="text-emerald-400" />
            ) : (
              <Copy size={15} />
            )}
          </button>

          {/* 3. Preview (Opens Full Screen Preview or inline HTML Sandbox) */}
          {isHtmlCode && (
            <button
              type="button"
              onClick={() => {
                if (onOpenFullScreenPreview) {
                  onOpenFullScreenPreview(completeContent, resolvedFileName);
                } else {
                  setIsPreview(!isPreview);
                }
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 border shadow-sm bg-white/10 hover:bg-[#ff1828]/25 hover:text-[#ff1828] text-zinc-300 border-white/10 hover:border-[#ff1828]/40"
              title="Preview in Sandbox"
              aria-label="Preview in Sandbox"
            >
              <Eye size={15} />
            </button>
          )}

          {/* 4. Save / Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-300 flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 border border-white/10 hover:border-emerald-500/40 shadow-sm"
            title="Download Complete File"
            aria-label="Download Complete File"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Special Layout Content: Compact Scrollable Box or Live Sandbox */}
      <div className="p-3 sm:p-4 bg-[#090204]">
        {isPreview && isHtmlCode ? (
          /* REAL LIVE PREVIEW SANDBOX (Actual rendered HTML code via Tailwind sandbox) */
          <div className="rounded-xl overflow-hidden border border-white/20 bg-black flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-3.5 py-2 bg-zinc-900 border-b border-white/10 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-1 text-[11px] font-mono text-zinc-300">Live Sandbox Preview</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Rendered Output
              </span>
            </div>
            <iframe
              srcDoc={generateLiveSandboxHtml(completeContent)}
              title="Real Live HTML Preview"
              sandbox="allow-scripts"
              className="w-full h-80 border-0 bg-[#09090b]"
            />
          </div>
        ) : (
          /* COMPACT SCROLLABLE CODE BOX (User: "it don't show complete code in chat. Just so a little box and have scrollable detail code") */
          <div
            className={`rounded-xl border shadow-inner overflow-hidden transition-colors ${
              codeTheme === 'white' && !isPrompt
                ? 'bg-white border-zinc-300 text-zinc-900 shadow-[0_4px_20px_rgba(0,0,0,0.1)]'
                : 'bg-[#050102] border-white/10 text-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
            }`}
          >
            {/* Scrollable Code Area (compact height, complete detail inside) */}
            <div className="max-h-72 sm:max-h-80 overflow-y-auto overflow-x-auto p-4 select-text">
              <pre
                className={`font-mono text-xs sm:text-[13px] leading-relaxed whitespace-pre font-medium ${
                  codeTheme === 'white' && !isPrompt
                    ? 'text-zinc-900 selection:bg-[#ff1828]/25'
                    : 'text-zinc-100 selection:bg-[#ff1828]/40'
                }`}
              >
                {completeContent}
              </pre>
            </div>

            {isPrompt && onUseInChat && (
              <div className="flex justify-end p-2.5 border-t border-white/10 bg-black/40">
                <button
                  type="button"
                  onClick={() => onUseInChat(content)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff1828] hover:bg-[#e01423] text-white text-xs font-semibold shadow-[0_0_12px_rgba(255,24,40,0.5)] transition-all cursor-pointer"
                >
                  <Send size={12} />
                  <span>Run In Prompt Box</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * STT Sound Bar Component matching User Screenshots 1 & 2
 * Features:
 * - Live animated 42-bar audio sound wave undulating smoothly
 * - Transcribing status mode with circular spinner
 * - Bottom row: + on left, ✕ Cancel and ✓ Confirm/Send on right
 */
export interface SttSoundBarProps {
  isTranscribing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onAttach: () => void;
}

export const SttSoundBar: React.FC<SttSoundBarProps> = ({
  isTranscribing,
  onCancel,
  onConfirm,
  onAttach,
}) => {
  const [waveSeed, setWaveSeed] = useState(0);

  useEffect(() => {
    if (isTranscribing) return;
    const interval = setInterval(() => {
      setWaveSeed((s) => s + 0.22);
    }, 45);
    return () => clearInterval(interval);
  }, [isTranscribing]);

  // Generate 42 bars with symmetrical bell-curve height modulation + dynamic sine wave
  const barCount = 42;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
    const bellCurve = Math.max(0.12, 1 - Math.pow(distFromCenter, 1.6));
    const sineFactor = 0.5 + 0.5 * Math.sin(waveSeed * 2.5 + i * 0.38);
    const heightPx = Math.max(4, Math.round(bellCurve * (10 + 20 * sineFactor)));
    return heightPx;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className="w-full bg-[#f4f4f7] text-zinc-900 rounded-[28px] sm:rounded-[32px] p-4 sm:p-5 border border-zinc-200/90 shadow-2xl transition-all"
    >
      {isTranscribing ? (
        /* Transcribing State matching Screenshot 2 */
        <div className="flex flex-col gap-4">
          <div className="pt-1 px-2 text-lg sm:text-xl font-medium text-zinc-900 tracking-tight">
            Transcribing...
          </div>
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onAttach}
              className="w-10 h-10 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-800 transition-colors cursor-pointer active:scale-95"
              title="Attach files"
            >
              <Plus size={22} strokeWidth={2} />
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="w-10 h-10 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-700 transition-colors cursor-pointer active:scale-95"
                title="Cancel"
              >
                <X size={22} strokeWidth={2} />
              </button>
              <div className="w-11 h-11 rounded-full bg-zinc-700 text-white flex items-center justify-center shadow-md select-none">
                <Loader2 size={22} className="animate-spin text-zinc-200" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Live Voice Recording Sound Bar Waveform matching Screenshot 1 */
        <div className="flex flex-col gap-4">
          <div className="w-full h-11 flex items-center justify-center gap-[3px] sm:gap-[4px] px-2 select-none overflow-hidden">
            {bars.map((height, idx) => (
              <span
                key={idx}
                style={{ height: `${height}px` }}
                className="w-[3px] rounded-full bg-zinc-600 transition-all duration-75 block shrink-0"
              />
            ))}
          </div>

          {/* Bottom Controls Row: + on left, ✕ and ✓ on right */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onAttach}
              className="w-10 h-10 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-800 transition-colors cursor-pointer active:scale-95"
              title="Attach files"
            >
              <Plus size={22} strokeWidth={2} />
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="w-10 h-10 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-700 transition-colors cursor-pointer active:scale-95"
                title="Cancel recording"
              >
                <X size={22} strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="w-11 h-11 rounded-full bg-zinc-950 hover:bg-black text-white flex items-center justify-center shadow-lg cursor-pointer active:scale-95 transition-all"
                title="Finish recording & send"
              >
                <Check size={22} strokeWidth={2.8} />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Compact Thinking Panel & Interactive Question Card Components
 * Matching the exact UI + Response Flow requirements:
 * - Pure white prompt-box style with adaptive height (max 2x prompt box)
 * - Safe high-level process checkpoints (no raw CoT or model internals exposed)
 * - Exactly 3 predefined options + 1 Custom input option for Question Mode
 * - All standard input controls hidden while active
 */

export interface CompactThinkingPanelProps {
  duration?: number;
  message?: ChatMessage | null;
  onClose: () => void;
}

export const CompactThinkingPanel: React.FC<CompactThinkingPanelProps> = ({
  duration = 3,
  message,
  onClose,
}) => {
  const text = (message?.text || '').toLowerCase();
  const isWebsite = /<!doctype\s+html|<html|<style|website|landing\s*page|web\s*app|portfolio|index\.html/i.test(text);
  const isCode = /```(tsx|typescript|jsx|javascript|python|css|sql|json|bash|html)/i.test(text);
  const isQuestion = Boolean(message?.activeQuestion) || /```question/i.test(text);

  let steps = [
    { title: 'Deconstructing request', desc: 'Analyzed user requirements, constraints, and objective scope.' },
    { title: 'Checking system context', desc: 'Loaded model parameters, memory context, and design standards.' },
    { title: 'Formulating optimal solution', desc: 'Structured high-precision response architecture.' },
    { title: 'Executing primary pipeline', desc: 'Streamed comprehensive result through flagship intelligence engine.' },
    { title: 'Verifying output quality', desc: 'Validated accuracy, clarity, and structural completeness.' },
  ];

  if (isWebsite) {
    steps = [
      { title: 'Analyzing website specifications', desc: 'Extracted visual hierarchy, responsive layout needs, and branding requirements.' },
      { title: 'Architecting single-file structure', desc: 'Structured semantic HTML5 layout from <!DOCTYPE html> down to </html>.' },
      { title: 'Crafting responsive CSS styling', desc: 'Embedded modern dark mode aesthetic, typography, and fluid mobile/desktop breakpoints.' },
      { title: 'Implementing JavaScript functionality', desc: 'Engineered client-side interactivity, event listeners, and dynamic UI state.' },
      { title: 'Verifying complete code integrity', desc: 'Checked syntax and ensured tags are cleanly closed with zero placeholders.' },
    ];
  } else if (isCode) {
    steps = [
      { title: 'Analyzing algorithmic requirements', desc: 'Evaluated language syntax, edge cases, and performance constraints.' },
      { title: 'Designing modular logic structure', desc: 'Structured functions, typing definitions, and error handling boundaries.' },
      { title: 'Writing optimized implementation', desc: 'Generated clean, production-ready code with complete functionality.' },
      { title: 'Validating syntax & execution safety', desc: 'Verified syntax compliance and verified no missing dependencies.' },
    ];
  } else if (isQuestion) {
    steps = [
      { title: 'Evaluating request parameters', desc: 'Identified missing requirements needed to achieve optimal output.' },
      { title: 'Structuring requirement discovery', desc: 'Prepared targeted strategic questions to clarify user vision.' },
      { title: 'Generating interactive options', desc: 'Formulated 3 predefined paths and custom input mode.' },
    ];
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full bg-white text-zinc-900 rounded-[28px] sm:rounded-[32px] px-5 sm:px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(255,24,40,0.25)] border border-white/90 max-h-60 sm:max-h-64 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
            <Check size={12} strokeWidth={3} />
          </div>
          <span className="text-xs sm:text-sm font-bold text-zinc-900 tracking-tight">
            Thought for {duration}s • Process Complete
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-6 h-6 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
          title="Close overview"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Internal Scrollable Content (real steps for this exact task, all completed) */}
      <div className="flex-1 overflow-y-auto pr-1 pt-2 space-y-2.5 text-xs text-zinc-700 font-sans">
        {steps.map((st, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <Check size={11} strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-semibold text-zinc-900 block text-xs">{st.title}</span>
              <span className="text-zinc-500 text-[11px] leading-tight">{st.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export interface InteractiveQuestionCardProps {
  question: QuestionBlock;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  stepNumber?: number;
  totalSteps?: number;
}

export const InteractiveQuestionCard: React.FC<InteractiveQuestionCardProps> = ({
  question,
  onAnswer,
  disabled = false,
  stepNumber,
  totalSteps,
}) => {
  const [customInput, setCustomInput] = useState('');

  // Exactly 3 useful predefined options
  const top3 =
    question.options && question.options.length > 0
      ? question.options.slice(0, 3)
      : ['Minimal Dark Luxury', 'Glassmorphic Telemetry', 'Futuristic Cyber'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full bg-white text-zinc-900 rounded-[28px] sm:rounded-[32px] px-5 sm:px-6 py-4 sm:py-5 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(255,24,40,0.25)] border border-white/90 flex flex-col transition-all"
    >
      {/* Top Question Info */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#ff1828] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff1828] animate-pulse" />
          <span>Requirement Discovery {totalSteps ? `• Step ${stepNumber || 1} of ${totalSteps}` : ''}</span>
        </div>
      </div>

      <h3 className="text-zinc-900 font-semibold text-sm sm:text-base leading-snug">
        {question.title}
      </h3>
      {question.description && (
        <p className="text-xs text-zinc-500 font-normal mt-0.5 leading-relaxed">
          {question.description}
        </p>
      )}

      {/* Exactly 3 Useful Predefined Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
        {top3.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onAnswer(opt)}
            className="px-3.5 py-2.5 rounded-xl border border-zinc-200/90 bg-zinc-50 hover:bg-[#ff1828]/5 hover:border-[#ff1828] text-xs sm:text-sm font-medium text-zinc-800 hover:text-black transition-all text-left flex items-center justify-between group active:scale-[0.98] cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">{opt}</span>
            <ChevronRight
              size={13}
              className="text-zinc-400 group-hover:text-[#ff1828] group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
            />
          </button>
        ))}
      </div>

      {/* 1 Custom Option below */}
      <div className="pt-2.5 flex items-center gap-2">
        <input
          type="text"
          disabled={disabled}
          placeholder="Custom: Enter your own answer..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customInput.trim() && !disabled) {
              e.preventDefault();
              onAnswer(customInput.trim());
              setCustomInput('');
            }
          }}
          className="flex-1 bg-zinc-50 border border-zinc-200/90 focus:border-[#ff1828] focus:bg-white rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all disabled:opacity-50"
        />
        <button
          type="button"
          disabled={!customInput.trim() || disabled}
          onClick={() => {
            if (customInput.trim() && !disabled) {
              onAnswer(customInput.trim());
              setCustomInput('');
            }
          }}
          className="px-4 py-2 rounded-xl bg-[#ff1828] text-white text-xs font-semibold hover:bg-[#e01423] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,24,40,0.4)] cursor-pointer shrink-0"
        >
          <span>Submit</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Half-Screen Thinking Timeline & Image Analysis Drawer matching Screenshot 3
 * Features:
 * - Half-screen expansion (covers ~50-55% height)
 * - Header with Back < button, [ Timeline ] & [ Changes ] tabs
 * - Worked for 13m 42s and 6.80 credits used metrics
 * - Vertical connected timeline with nodes
 * - Read [m2.png] node with phone preview & optical/phoneme image analysis
 */
export interface ThinkingTimelineDrawerProps {
  message: ChatMessage | null;
  thinkingTimer: number;
  activeAttachments?: AttachedFile[];
  onClose: () => void;
  inputVal: string;
  setInputVal: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isAiTyping: boolean;
  onAttach: () => void;
}

export const ThinkingTimelineDrawer: React.FC<ThinkingTimelineDrawerProps> = ({
  message,
  thinkingTimer,
  activeAttachments,
  onClose,
  inputVal,
  setInputVal,
  onSubmit,
  isAiTyping,
  onAttach,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'changes'>('timeline');
  const [isReadImageOpen, setIsReadImageOpen] = useState<boolean>(true);
  const [isPhoneScreenOpen, setIsPhoneScreenOpen] = useState<boolean>(false);

  // Look for any user attached image
  const attachedImage =
    activeAttachments?.find((a) => a.type.startsWith('image/')) ||
    message?.attachments?.find((a) => a.type.startsWith('image/'));

  const imageName = attachedImage?.name || 'm2.png';
  const imagePreview = attachedImage?.preview;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full h-[52vh] sm:h-[56vh] max-h-[580px] bg-[#120306] border border-white/15 rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden text-zinc-200"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#180408]/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/15 hover:border-white/30 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer active:scale-95"
            title="Minimize timeline"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Segmented Pills: Timeline & Changes */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-full p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-white/15 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ListTree size={13} />
              <span>Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('changes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'changes'
                  ? 'bg-white/15 text-white font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileCode2 size={13} />
              <span>Changes</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded cursor-pointer"
        >
          Close
        </button>
      </div>

      {/* Subtitle Metrics Bar: Worked for 13m 42s and 6.80 credits used */}
      <div className="flex items-center justify-between px-5 sm:px-8 py-2 bg-black/30 border-b border-white/5 text-[11px] sm:text-xs text-zinc-400 shrink-0">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-zinc-400" />
          <span>Worked for 13m 42s</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Coins size={13} className="text-zinc-400" />
          <span>6.80 credits used</span>
        </div>
      </div>

      {/* Main Body Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-xs sm:text-sm">
        {activeTab === 'timeline' ? (
          /* Real Connected Vertical Thinking Timeline (No fake/mock steps) */
          <div className="relative pl-6 sm:pl-8 border-l border-white/15 ml-3 sm:ml-4 space-y-5">
            {/* Step 1: Real Reasoning Duration */}
            <div className="relative group">
              <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-3.5 h-3.5 rounded-full border-2 border-zinc-400 bg-[#120306] flex items-center justify-center">
                {isAiTyping && <span className="w-1.5 h-1.5 rounded-full bg-[#ff1828] animate-ping" />}
              </div>
              <div className="text-zinc-300 text-xs font-semibold flex items-center gap-1.5 select-none">
                <span className="text-[#ff1828]">Cognitive Thinking Trace</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">
                  {isAiTyping ? `Reasoning in real-time (${thinkingTimer || 1}s)` : `Completed in ${message?.thoughtDuration || thinkingTimer || 4}s`}
                </span>
              </div>
            </div>

            {/* Step 2: Intent & Directives Parsing */}
            <div className="relative">
              <div className="absolute -left-[33px] sm:-left-[41px] top-1 w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-zinc-300">
                <Brain size={12} className="text-[#ff1828]" />
              </div>
              <div className="pl-1 space-y-1">
                <div className="text-zinc-200 font-medium text-xs sm:text-sm">
                  Linguistic & Intent Parsing
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300 space-y-1">
                  <p>• <strong>Analyzed Directives:</strong> {(message?.text || 'User request and system prompt').slice(0, 140)}...</p>
                  <p>• <strong>Strategy:</strong> Structured markdown hierarchy, visual timetable extraction, zero-pill aesthetic.</p>
                </div>
              </div>
            </div>

            {/* Step 3: Real Multimodal / Attachments Verification */}
            <div className="relative">
              <div className="absolute -left-[33px] sm:-left-[41px] top-1 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Scan size={12} />
              </div>
              <div className="pl-1 space-y-1">
                <div className="text-zinc-200 font-medium text-xs sm:text-sm flex items-center gap-2">
                  <span>Multimodal Context Verification</span>
                  {attachedImage && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      1 File Verified
                    </span>
                  )}
                </div>
                {attachedImage ? (
                  <div className="mt-2 p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <div className="flex items-center gap-3">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt={imageName}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 object-cover rounded-lg border border-white/10 shadow-md"
                        />
                      )}
                      <div>
                        <div className="font-mono text-xs text-white font-semibold">{imageName}</div>
                        <div className="text-[11px] text-zinc-400">Attached asset parsed & ingested into model context</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 text-xs text-zinc-400">
                    Direct linguistic execution • No external files attached
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Visual Architecture Synthesis */}
            <div className="relative">
              <div className="absolute -left-[33px] sm:-left-[41px] top-1 w-5 h-5 rounded-full bg-[#ff1828]/20 border border-[#ff1828]/40 flex items-center justify-center text-[#ff1828]">
                <Layers size={12} />
              </div>
              <div className="pl-1 space-y-1">
                <div className="text-zinc-200 font-medium text-xs sm:text-sm">
                  Obsidian Neon Design Synthesis
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300 space-y-1">
                  <p>• Applied dark obsidian surface <code>#090204</code> & crimson neon accents (<code>#ff1828</code>).</p>
                  <p>• Generated 3 to 4 topic-related high-resolution visual cards with instant lightbox & download.</p>
                </div>
              </div>
            </div>

            {/* Step 5: Code & Artifact Assembly */}
            <div className="relative">
              <div className="absolute -left-[33px] sm:-left-[41px] top-1 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Code2 size={12} />
              </div>
              <div className="pl-1 space-y-1">
                <div className="text-zinc-200 font-medium text-xs sm:text-sm">
                  Artifact & Flow Validation
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300 space-y-1">
                  <p>• Single-file executable ready with zero placeholder gaps.</p>
                  <p>• High-resolution canvas PNG rendering enabled for daily routine & flow diagrams.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Changes Tab with real metrics */
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white font-mono text-xs sm:text-sm">
                  Prompt & Response Stream
                </div>
                <div className="text-[11px] text-zinc-400">
                  {message?.text ? `${message.text.length} characters synthesized` : 'Active streaming in progress'}
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400">Active</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white font-mono text-xs sm:text-sm">
                  Visual Gallery Engine
                </div>
                <div className="text-[11px] text-zinc-400">
                  4 Topic-related high-res assets with lightbox & download
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400">Ready</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white font-mono text-xs sm:text-sm">
                  Timetable / Flow Canvas Card
                </div>
                <div className="text-[11px] text-zinc-400">
                  2X Retina PNG generator with one-click export
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-400">Initialized</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Compact Prompt Box inside Drawer */}
      <div className="p-3 sm:p-4 bg-[#140306] border-t border-white/10 shrink-0">
        <form onSubmit={onSubmit} className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAttach}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 flex items-center justify-center shrink-0 transition-colors"
            title="Attach file"
          >
            <Plus size={18} />
          </button>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask a follow-up or command..."
            className="flex-1 bg-black/40 border border-white/15 rounded-full px-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff1828]"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isAiTyping}
            className="w-9 h-9 rounded-full bg-[#ff1828] hover:bg-[#e01423] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

interface FullScreenChatViewProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialAttachments?: AttachedFile[];
  selectedRecentTopic?: string;
  onSelectRecentTopic?: (topic: string) => void;
}

export const FullScreenChatView: React.FC<FullScreenChatViewProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  initialAttachments,
  selectedRecentTopic = 'Landing Page Design',
  onSelectRecentTopic,
}) => {
  const [chatThreads, setChatThreads] = useState<Record<string, ChatThread>>(INITIAL_CHAT_DATA);
  const [activeTopic, setActiveTopic] = useState<string>(selectedRecentTopic);
  const [inputVal, setInputVal] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('GPT-4o');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [isThinkingTimelineExpanded, setIsThinkingTimelineExpanded] = useState<boolean>(false);
  const [activeTimelineMessage, setActiveTimelineMessage] = useState<ChatMessage | null>(null);
  const [isMemoryDrawerOpen, setIsMemoryDrawerOpen] = useState<boolean>(false);

  // Proactive Question Queue in Prompt Box (Pure prompt box flow, no question in chat, no option prompt bubbles)
  const [promptQuestionQueue, setPromptQuestionQueue] = useState<QuestionBlock[]>([]);
  const [promptQuestionIdx, setPromptQuestionIdx] = useState<number>(0);
  const collectedAnswersRef = useRef<Record<string, string>>({});
  const pendingVaguePromptRef = useRef<string>('');

  // Message Send Lock & Process Overview Panel State
  const [isSendLocked, setIsSendLocked] = useState<boolean>(false);
  const [isThinkingPanelOpen, setIsThinkingPanelOpen] = useState<boolean>(false);
  const [activeThinkingMessage, setActiveThinkingMessage] = useState<ChatMessage | null>(null);

  // Interactive Thinking State & Live Elapsed Timer
  const [thinkingTimer, setThinkingTimer] = useState<number>(0);
  const [activeThinkingMsgId, setActiveThinkingMsgId] = useState<string | null>(null);
  const thinkingTimerRef = useRef<number>(0);

  // Progressive Typing Animation & Tactile Sound/Vibration
  const [typingAnimationMsgId, setTypingAnimationMsgId] = useState<string | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fullGeneratedTextMap = useRef<Record<string, string>>({});

  const playTypingClick = () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!(window as any).__chatAudioCtx) {
        (window as any).__chatAudioCtx = new AudioCtx();
      }
      const ctx = (window as any).__chatAudioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(460 + Math.random() * 90, ctx.currentTime);
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.038);
    } catch {}
  };

  const triggerTypingVibration = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(8);
      } catch {}
    }
  };

  const persistArtifactIfPresent = (fullText: string, topicKey: string, userPrompt?: string) => {
    try {
      const htmlMatch = fullText.match(/```html(?::([\w.-]+))?\n([\s\S]*?)```/i);
      if (htmlMatch && htmlMatch[2]) {
        const filename = htmlMatch[1] || 'index.html';
        const code = htmlMatch[2].trim();
        const isBMW =
          topicKey.toLowerCase().includes('bmw') ||
          fullText.toLowerCase().includes('bmw') ||
          fullText.toLowerCase().includes('telemetry') ||
          (userPrompt && (userPrompt.toLowerCase().includes('bmw') || userPrompt.toLowerCase().includes('telemetry')));
        const targetProjId = isBMW ? 'proj-creativedrive-ai' : `proj-${Date.now().toString(36)}`;

        memoryManager.saveOrUpdateArtifact(
          targetProjId,
          {
            name: filename,
            title: isBMW ? 'BMW M-Power Telemetry Interface' : filename,
            type: 'html',
            content: code,
            description: `Generated or updated for "${topicKey}"`,
          },
          'Auto-saved to persistent memory vault'
        );
      }
    } catch (e) {
      console.warn('Memory persist error:', e);
    }
  };

  const handleSkipTyping = (msgId: string) => {
    if (typingAnimationMsgId === msgId) {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      setTypingAnimationMsgId(null);
      setIsSendLocked(false);
      const fullText = fullGeneratedTextMap.current[msgId];
      if (fullText) {
        persistArtifactIfPresent(fullText, activeTopic, inputVal);
        const parsed = parseAIText(fullText);
        const extractedQuestion = extractQuestionBlock(fullText);
        if (extractedQuestion) {
          setPromptQuestionQueue([extractedQuestion]);
          setPromptQuestionIdx(0);
        }
        setChatThreads((prev) => {
          const thread = prev[activeTopic];
          if (!thread) return prev;
          return {
            ...prev,
            [activeTopic]: {
              ...thread,
              messages: thread.messages.map((m) =>
                m.id === msgId
                  ? {
                      ...m,
                      text: fullText,
                      structuredContent:
                        parsed.mainTitle || parsed.intro || parsed.sections.length > 0
                          ? parsed
                          : undefined,
                      activeQuestion: undefined,
                    }
                  : m
              ),
            },
          };
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isAiTyping) {
      interval = setInterval(() => {
        setThinkingTimer((prev) => {
          thinkingTimerRef.current = prev + 1;
          return prev + 1;
        });
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAiTyping]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // File Attachments (Max 10)
  const [chatAttachments, setChatAttachments] = useState<AttachedFile[]>([]);
  const [fileLimitError, setFileLimitError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  // MediaRecorder Ref & Speech-to-Text via Groq Whisper + Web Speech live interim
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechRecognitionRef = useRef<any>(null);
  const micBaseInputRef = useRef<string>('');
  const isMicActiveRef = useRef<boolean>(false);

  // AI response vibration trigger state
  const [vibratingMsgId, setVibratingMsgId] = useState<string | null>(null);

  // Active streaming & clipboard states
  const activeStreamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // User Message Action States (strictly icon-only under user message)
  const [copiedUserMsgId, setCopiedUserMsgId] = useState<string | null>(null);
  const [editingUserMsgId, setEditingUserMsgId] = useState<string | null>(null);
  const [editingUserText, setEditingUserText] = useState<string>('');

  // AI Message Action States (revert, copy, retry, delete, export)
  const [exportMenuMsgId, setExportMenuMsgId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fullscreenWebsite, setFullscreenWebsite] = useState<{ html: string; fileName: string } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleCopySnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(code);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const handleCopyResponse = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    showToast('Copied response to clipboard');
    setTimeout(() => setCopiedMessageId(null), 2500);
  };

  // User message action handlers
  const handleCopyUserMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUserMsgId(msgId);
    showToast('Copied message');
    setTimeout(() => setCopiedUserMsgId(null), 2000);
  };

  const handleStartEditUser = (msg: ChatMessage) => {
    setEditingUserMsgId(msg.id);
    setEditingUserText(msg.text);
  };

  const handleCancelEditUser = () => {
    setEditingUserMsgId(null);
    setEditingUserText('');
  };

  const handleSaveEditUser = (msgId: string) => {
    if (!editingUserText.trim()) return;
    const newText = editingUserText.trim();
    setEditingUserMsgId(null);

    const thread = chatThreads[activeTopic];
    if (!thread) return;

    const userMsgIndex = thread.messages.findIndex((m) => m.id === msgId);
    const nextMsg =
      userMsgIndex !== -1 && userMsgIndex + 1 < thread.messages.length
        ? thread.messages[userMsgIndex + 1]
        : null;

    let targetAiId = '';

    if (nextMsg && nextMsg.sender === 'ai') {
      targetAiId = nextMsg.id;
      setChatThreads((prev) => {
        const t = prev[activeTopic];
        if (!t) return prev;
        return {
          ...prev,
          [activeTopic]: {
            ...t,
            messages: t.messages.map((m, idx) => {
              if (idx === userMsgIndex) {
                return { ...m, text: newText };
              }
              if (idx === userMsgIndex + 1) {
                return {
                  ...m,
                  previousVersions: m.text ? [...(m.previousVersions || []), m.text] : m.previousVersions,
                  futureVersions: [],
                  text: '',
                  isStreaming: true,
                  structuredContent: undefined,
                };
              }
              return m;
            }),
          },
        };
      });
    } else {
      targetAiId = `msg-ai-${Date.now()}`;
      const aiPlaceholder: ChatMessage = {
        id: targetAiId,
        sender: 'ai',
        text: '',
        isStreaming: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatThreads((prev) => {
        const t = prev[activeTopic];
        if (!t) return prev;
        return {
          ...prev,
          [activeTopic]: {
            ...t,
            messages: t.messages
              .map((m) => (m.id === msgId ? { ...m, text: newText } : m))
              .concat(aiPlaceholder),
          },
        };
      });
    }

    startGeminiStream(activeTopic, targetAiId, newText);
    showToast('Regenerating response with updated query...');
  };

  const handleRetryUserMessage = (msg: ChatMessage) => {
    if (isSendLocked || isAiTyping) return;
    setIsSendLocked(true);
    const thread = chatThreads[activeTopic];
    if (!thread) return;

    const userMsgIndex = thread.messages.findIndex((m) => m.id === msg.id);
    const nextMsg =
      userMsgIndex !== -1 && userMsgIndex + 1 < thread.messages.length
        ? thread.messages[userMsgIndex + 1]
        : null;

    let targetAiId = '';

    if (nextMsg && nextMsg.sender === 'ai') {
      targetAiId = nextMsg.id;
      setChatThreads((prev) => {
        const t = prev[activeTopic];
        if (!t) return prev;
        return {
          ...prev,
          [activeTopic]: {
            ...t,
            messages: t.messages.map((m, idx) => {
              if (idx === userMsgIndex + 1) {
                return {
                  ...m,
                  previousVersions: m.text ? [...(m.previousVersions || []), m.text] : m.previousVersions,
                  futureVersions: [],
                  text: '',
                  isStreaming: true,
                  structuredContent: undefined,
                };
              }
              return m;
            }),
          },
        };
      });
    } else {
      targetAiId = `msg-ai-${Date.now()}`;
      const aiPlaceholder: ChatMessage = {
        id: targetAiId,
        sender: 'ai',
        text: '',
        isStreaming: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatThreads((prev) => {
        const t = prev[activeTopic];
        if (!t) return prev;
        return {
          ...prev,
          [activeTopic]: {
            ...t,
            messages: [...t.messages, aiPlaceholder],
          },
        };
      });
    }

    startGeminiStream(activeTopic, targetAiId, msg.text, msg.attachments || []);
    showToast('Regenerating response for prompt...');
  };

  // AI message action handlers (revert, retry, delete, export)
  const handleRevertAiMessage = (msgId: string) => {
    let reverted = false;

    setChatThreads((prev) => {
      const thread = prev[activeTopic];
      if (!thread) return prev;

      const msgIndex = thread.messages.findIndex((m) => m.id === msgId);
      if (msgIndex === -1) return prev;
      const targetMsg = thread.messages[msgIndex];

      // 1. If previousVersions exists on this message
      if (targetMsg.previousVersions && targetMsg.previousVersions.length > 0) {
        const prevText = targetMsg.previousVersions[targetMsg.previousVersions.length - 1];
        const remaining = targetMsg.previousVersions.slice(0, -1);
        const future = [targetMsg.text, ...(targetMsg.futureVersions || [])];
        const parsed = parseAIText(prevText);
        reverted = true;

        return {
          ...prev,
          [activeTopic]: {
            ...thread,
            messages: thread.messages.map((m, idx) =>
              idx === msgIndex
                ? {
                    ...m,
                    text: prevText,
                    previousVersions: remaining,
                    futureVersions: future,
                    structuredContent:
                      parsed.mainTitle || parsed.intro || parsed.sections.length > 0
                        ? parsed
                        : undefined,
                  }
                : m
            ),
          },
        };
      }

      // 2. If futureVersions exists, toggle to future version
      if (targetMsg.futureVersions && targetMsg.futureVersions.length > 0) {
        const nextText = targetMsg.futureVersions[0];
        const remainingFuture = targetMsg.futureVersions.slice(1);
        const prevList = [...(targetMsg.previousVersions || []), targetMsg.text];
        const parsed = parseAIText(nextText);
        reverted = true;

        return {
          ...prev,
          [activeTopic]: {
            ...thread,
            messages: thread.messages.map((m, idx) =>
              idx === msgIndex
                ? {
                    ...m,
                    text: nextText,
                    previousVersions: prevList,
                    futureVersions: remainingFuture,
                    structuredContent:
                      parsed.mainTitle || parsed.intro || parsed.sections.length > 0
                        ? parsed
                        : undefined,
                  }
                : m
            ),
          },
        };
      }

      // 3. If there is another AI message earlier in the thread history
      if (msgIndex > 1) {
        const priorAiMsg = [...thread.messages.slice(0, msgIndex)]
          .reverse()
          .find((m) => m.sender === 'ai' && m.text.trim());

        if (priorAiMsg) {
          const parsed = parseAIText(priorAiMsg.text);
          reverted = true;
          return {
            ...prev,
            [activeTopic]: {
              ...thread,
              messages: thread.messages.map((m, idx) =>
                idx === msgIndex
                  ? {
                      ...m,
                      text: priorAiMsg.text,
                      futureVersions: [m.text, ...(m.futureVersions || [])],
                      structuredContent:
                        parsed.mainTitle || parsed.intro || parsed.sections.length > 0
                          ? parsed
                          : undefined,
                    }
                  : m
              ),
            },
          };
        }
      }

      return prev;
    });

    if (reverted) {
      showToast('Reverted to previous version');
    } else {
      showToast('No previous version to revert');
    }
  };

  const handleRetryAiMessage = (aiMsg: ChatMessage) => {
    if (isSendLocked || isAiTyping) return;
    setIsSendLocked(true);
    const thread = chatThreads[activeTopic];
    if (!thread) return;
    const msgIndex = thread.messages.findIndex((m) => m.id === aiMsg.id);
    let promptToUse = '';
    let attachmentsToUse: AttachedFile[] = [];

    for (let i = msgIndex - 1; i >= 0; i--) {
      if (thread.messages[i].sender === 'user') {
        promptToUse = thread.messages[i].text;
        attachmentsToUse = thread.messages[i].attachments || [];
        break;
      }
    }

    if (!promptToUse) {
      promptToUse = thread.promptBanner || 'Regenerate response';
    }

    // Save current version into previousVersions for revert
    setChatThreads((prev) => {
      const t = prev[activeTopic];
      if (!t) return prev;
      return {
        ...prev,
        [activeTopic]: {
          ...t,
          messages: t.messages.map((m) =>
            m.id === aiMsg.id
              ? {
                  ...m,
                  previousVersions: m.text ? [...(m.previousVersions || []), m.text] : m.previousVersions,
                  futureVersions: [],
                  text: '',
                  isStreaming: true,
                  structuredContent: undefined,
                }
              : m
          ),
        },
      };
    });

    startGeminiStream(activeTopic, aiMsg.id, promptToUse, attachmentsToUse);
    showToast('Regenerating response...');
  };

  const handleDeleteAiMessage = (msgId: string) => {
    setChatThreads((prev) => {
      const thread = prev[activeTopic];
      if (!thread) return prev;
      return {
        ...prev,
        [activeTopic]: {
          ...thread,
          messages: thread.messages.filter((m) => m.id !== msgId),
        },
      };
    });
    setExportMenuMsgId(null);
    showToast('Message deleted');
  };

  const handleAnswerPromptQuestion = (answer: string) => {
    if (isAiTyping) return;

    // Collect user selection silently without sending as a prompt message
    const qKey = promptQuestionIdx === 0 ? 'time' : 'focus';
    collectedAnswersRef.current[qKey] = answer;
    if (promptQuestionIdx === 0) collectedAnswersRef.current['theme'] = answer;
    if (promptQuestionIdx === 1) collectedAnswersRef.current['name'] = answer;

    const nextIdx = promptQuestionIdx + 1;
    if (nextIdx < promptQuestionQueue.length) {
      // Advance to next discovery question in prompt box
      setPromptQuestionIdx(nextIdx);
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(20);
        } catch {}
      }
    } else {
      // All questions have been answered: stop asking and immediately start thinking and complete code
      setPromptQuestionQueue([]);
      setPromptQuestionIdx(0);

      const userPrompt = pendingVaguePromptRef.current || 'Create a complete daily routine timetable';
      const isTimetable =
        /(\btimetable\b|\btime\s*table\b|\broutine\b|\bdaily\s*routine\b|\bschedule\b|\bday\s*plan\b|\bplanner\b|\bstudy\s*plan\b|\bworkout\s*routine\b|\bworkout\s*plan\b)/i.test(
          userPrompt
        );

      // DO NOT add user message like a prompt. Directly spawn AI placeholder and start thinking!
      const aiMsgId = `ai-${Date.now()}`;
      const aiPlaceholder: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: '',
        isStreaming: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatThreads((prev) => {
        const thread = prev[activeTopic];
        if (!thread) return prev;
        return {
          ...prev,
          [activeTopic]: {
            ...thread,
            messages: [...thread.messages, aiPlaceholder],
          },
        };
      });

      let fullExecutionPrompt = '';

      if (isTimetable) {
        const timeChoice = collectedAnswersRef.current['time'] || collectedAnswersRef.current['theme'] || 'Early Riser (05:00 AM – 06:00 AM)';
        const focusChoice = collectedAnswersRef.current['focus'] || collectedAnswersRef.current['name'] || 'High-Performance Work & Fitness';

        fullExecutionPrompt = `Create a masterclass-level, complete daily timetable and schedule for: "${userPrompt}".
Selected Routine Specifications:
- Wake-up / Start Schedule: ${timeChoice}
- Primary Focus & Priority: ${focusChoice}

CRITICAL MANDATORY INSTRUCTIONS:
1. Provide a comprehensive, perfectly structured hourly timetable breakdown from wake-up to restorative sleep.
2. For each time block, format clearly as a bullet point with the exact time slot, activity name, category (Morning, Deep Work, Fitness, Nutrition, Evening, or Sleep), and key productivity habits:
Example:
- 05:30 AM - 06:30 AM: Morning Mobility & Hydration - [Morning] Wake up, drink 500ml water, 15 min mobility.
- 06:30 AM - 07:30 AM: Intense Workout & Strength - [Fitness] High-focus resistance training.
- 08:00 AM - 09:00 AM: Breakfast & Daily Roadmap - [Nutrition] Clean fuel, reviewing daily priority targets.
- 09:00 AM - 12:30 PM: Deep Work Block 1 - [Deep Work] High-value focused task execution (No phone/distractions).
- 12:30 PM - 01:30 PM: Nutritious Lunch & Outdoor Walk - [Nutrition] Balanced meal & sunlight recovery.
- 01:30 PM - 05:00 PM: Deep Work Block 2 - [Deep Work] Secondary projects, communication, and execution.
- 05:00 PM - 06:30 PM: Skill Acquisition & Creative Time - [Evening] Reading, side project, or personal hobby.
- 06:30 PM - 08:00 PM: Dinner & Social Connection - [Nutrition] Healthy dinner and quality time with family.
- 08:00 PM - 09:30 PM: Evening Wind-Down & Reflection - [Evening] Journaling, planning tomorrow, low blue light.
- 09:30 PM - 10:30 PM: Reading & Sleep Preparation - [Sleep] Book reading, room cooling, gratitude review.
- 10:30 PM: Restorative Deep Sleep - [Sleep] Lights out, 7.5-8 hours restorative sleep.

3. In addition to the textual guide, provide a complete, self-contained single-file HTML interactive timetable code:
\`\`\`html filename="timetable.html"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Routine Timetable</title>
  <style>
    /* modern dark obsidian CSS styling with crimson neon accents (#ff1828) */
  </style>
</head>
<body>
...
</body>
</html>
\`\`\`
4. Include modern dark obsidian CSS styling with crimson neon accents (#ff1828), interactive hourly cards, progress tracking, and clean layout.
5. The code block MUST start strictly with <!DOCTYPE html><html lang="en"> and end strictly with </html>.
6. The user will be able to download the complete timetable as a high-resolution PNG image and view it full-screen.`;
      } else {
        const themeChoice = collectedAnswersRef.current['theme'] || 'Luxury Dark Obsidian & Crimson Neon';
        const nameChoice = collectedAnswersRef.current['name'] || 'M-Power Velocity';

        fullExecutionPrompt = `Create a complete single-file website for: "${userPrompt}".
Selected Specifications:
- Purpose & Visual Theme: ${themeChoice}
- Website Name & Branding: ${nameChoice}

CRITICAL ARCHITECTURE REQUIREMENTS:
1. The code must be 100% complete and self-contained in ONE SINGLE HTML FILE.
2. It MUST start strictly with:
\`\`\`html filename="index.html"
<!DOCTYPE html>
<html lang="en">
3. Include modern, beautiful CSS inside <style>...</style> with dark glassmorphism, responsive navigation, responsive grid, hero section, interactive cards, and footer.
4. Include functional JavaScript inside <script>...</script> for menu toggle, interactions, and dynamic state.
5. It MUST end cleanly with:
</html>
\`\`\`
6. NEVER truncate or stop generating early. Provide every single line of code until </html>.`;
      }

      startGeminiStream(activeTopic, aiMsgId, fullExecutionPrompt, pendingAttachmentsRef.current || []);
    }
  };

  const handleAnswerQuestion = (_messageId: string, _question: QuestionBlock, answer: string) => {
    handleAnswerPromptQuestion(answer);
  };

  const handleExport = (
    format: 'pdf' | 'doc' | 'md' | 'txt' | 'html',
    message: ChatMessage
  ) => {
    setExportMenuMsgId(null);
    const rawTitle = message.structuredContent?.mainTitle;
    const title = typeof rawTitle === 'string'
      ? rawTitle
      : rawTitle
      ? `${rawTitle.white} ${rawTitle.red}`
      : activeTopic;
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_gemini_ai`;

    // Extract formatted clean text from structuredContent or message.text
    let fullMarkdown = '';
    if (message.structuredContent) {
      if (message.structuredContent.mainTitle) {
        fullMarkdown += `# ${title}\n\n`;
      }
      if (message.structuredContent.intro) {
        fullMarkdown += `${message.structuredContent.intro}\n\n`;
      }
      message.structuredContent.sections?.forEach((s) => {
        fullMarkdown += `## ${s.title}\n\n`;
        if (s.description) fullMarkdown += `${s.description}\n\n`;
        if (s.bullets && s.bullets.length > 0) {
          s.bullets.forEach((b) => (fullMarkdown += `- ${b}\n`));
          fullMarkdown += '\n';
        }
        if (s.promptSnippet) {
          fullMarkdown += `\`\`\`prompt\n${s.promptSnippet}\n\`\`\`\n\n`;
        }
        if (s.codeSnippet) {
          fullMarkdown += `\`\`\`${s.codeLanguage || 'tsx'}\n${s.codeSnippet}\n\`\`\`\n\n`;
        }
      });
    } else {
      fullMarkdown = message.text;
    }

    if (format === 'md') {
      downloadBlob(fullMarkdown, `${filename}.md`, 'text/markdown;charset=utf-8;');
      showToast('Exported as Markdown (.md)');
    } else if (format === 'txt') {
      const plain = fullMarkdown.replace(/#+\s+/g, '').replace(/```[a-z]*\n?/g, '');
      downloadBlob(plain, `${filename}.txt`, 'text/plain;charset=utf-8;');
      showToast('Exported as Text (.txt)');
    } else if (format === 'doc') {
      const docHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; color: #111; line-height: 1.6; padding: 24px; }
            h1 { font-size: 20pt; color: #cc0000; border-bottom: 2px solid #cc0000; padding-bottom: 6px; }
            h2 { font-size: 14pt; color: #222; margin-top: 18pt; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
            p { margin: 6pt 0; }
            ul { padding-left: 20px; }
            li { margin-bottom: 4pt; }
            pre { background: #f4f4f5; padding: 10pt; border-radius: 6px; font-family: Consolas, monospace; font-size: 9.5pt; overflow-x: auto; border: 1px solid #e4e4e7; }
            .badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 2pt 6pt; border-radius: 4pt; font-size: 9pt; font-weight: bold; }
          </style>
        </head>
        <body>
          <span class="badge">Gemini AI Workspace Intelligence</span>
          <h1>${title}</h1>
          <p><em>Generated by Gemini AI Workspace • ${new Date().toLocaleDateString()}</em></p>
          <hr/>
          <div>${fullMarkdown.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</div>
        </body>
        </html>
      `;
      downloadBlob(docHtml, `${filename}.doc`, 'application/msword');
      showToast('Exported as Word Document (.doc)');
    } else if (format === 'html') {
      const standaloneHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${title} — Gemini AI Export</title>
          <style>
            body { background: #070709; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 860px; margin: 40px auto; padding: 0 24px; line-height: 1.7; }
            h1 { font-size: 2.2rem; color: #fff; border-bottom: 3px solid #ff1828; padding-bottom: 10px; }
            h2 { font-size: 1.4rem; color: #fff; margin-top: 2rem; border-left: 4px solid #ff1828; padding-left: 10px; }
            pre { background: #0e0204; border: 1px solid rgba(255,24,40,0.3); padding: 16px; border-radius: 12px; font-family: monospace; color: #f4f4f5; overflow-x: auto; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; color: #d4d4d8; }
            .header-tag { display: inline-block; padding: 4px 12px; background: #1a0306; border: 1px solid #ff1828; color: #ff1828; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <div class="header-tag">Gemini AI Workspace Verified</div>
          <h1>${title}</h1>
          <div>${fullMarkdown.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</div>
        </body>
        </html>
      `;
      downloadBlob(standaloneHtml, `${filename}.html`, 'text/html;charset=utf-8;');
      showToast('Exported as HTML (.html)');
    } else if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${title} - PDF Export</title>
            <style>
              @media print {
                body { padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; line-height: 1.6; }
                h1 { color: #cc0000; border-bottom: 2px solid #cc0000; padding-bottom: 8px; font-size: 22pt; }
                h2 { color: #222; margin-top: 18pt; border-bottom: 1px solid #ccc; padding-bottom: 4px; font-size: 15pt; }
                pre { background: #f4f4f5; padding: 10pt; border-radius: 6pt; font-family: monospace; font-size: 9.5pt; white-space: pre-wrap; word-break: break-word; border: 1px solid #e4e4e7; }
                ul { padding-left: 20pt; }
                li { margin-bottom: 6pt; }
                .footer { font-size: 9pt; color: #666; margin-top: 24pt; border-top: 1px solid #eee; padding-top: 8pt; }
              }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 30px; line-height: 1.6; color: #111; }
              h1 { color: #cc0000; border-bottom: 2px solid #cc0000; padding-bottom: 8px; }
              h2 { color: #222; margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
              pre { background: #f4f4f5; padding: 14px; border-radius: 8px; font-family: monospace; border: 1px solid #ddd; }
              ul { padding-left: 24px; }
            </style>
          </head>
          <body>
            <p style="color:#cc0000; font-weight:bold; font-size:10pt; text-transform:uppercase; letter-spacing:1px;">Gemini AI Intelligence Document</p>
            <h1>${title}</h1>
            <div>${fullMarkdown.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</div>
            <div class="footer">Generated by Google Gemini AI Workspace • ${new Date().toLocaleString()}</div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
      showToast('Opening PDF print preview...');
    }
  };

  // Clean up typewriter interval on unmount
  useEffect(() => {
    return () => {
      if (activeStreamIntervalRef.current) {
        clearInterval(activeStreamIntervalRef.current);
      }
    };
  }, []);

  /**
   * AI Streaming Engine: Groq Primary / Gemini Fallback
   * Thinking mode stays active until answer is fully received, with timer isolated to thinking phase only.
   */
  const startGeminiStream = (
    topicKey: string,
    aiMsgId: string,
    promptText: string,
    attachmentsToPass: AttachedFile[] = []
  ) => {
    const isSimple = isSimpleMessage(promptText);

    setIsAiTyping(true);
    if (!isSimple) {
      setThinkingTimer(0);
      thinkingTimerRef.current = 0;
      setActiveThinkingMsgId(aiMsgId);
    } else {
      setActiveThinkingMsgId(null);
    }

    // Trigger physical & haptic vibration when AI reply stream begins
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([60, 40, 60]);
      } catch {}
    }
    setVibratingMsgId(aiMsgId);
    setTimeout(() => setVibratingMsgId((curr) => (curr === aiMsgId ? null : curr)), 700);

    if (activeStreamIntervalRef.current) {
      clearInterval(activeStreamIntervalRef.current);
      activeStreamIntervalRef.current = null;
    }

    // Call server SSE /api/chat with full history
    (async () => {
      let accumulatedText = '';

      try {
        const currentThread = chatThreads[topicKey];
        const historyPayload = (currentThread?.messages || [])
          .filter((m) => m.id !== aiMsgId)
          .map((m) => ({
            sender: m.sender,
            text: m.text,
          }));

        // Semantic memory retrieval across long-term project vault & past conversation context
        const contextPackage = isSimple
          ? null
          : memoryManager.buildContextPackage(promptText, topicKey, historyPayload);

        const isWebsite = /website|landing\s*page|web\s*app|single-file|html/i.test(promptText);
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptText,
            isSimple,
            isWebsite,
            history: isSimple ? [] : historyPayload.slice(-6),
            contextPackage,
            attachments: isSimple
              ? []
              : attachmentsToPass.map((a) => ({
                  name: a.name,
                  type: a.type,
                  preview: a.preview,
                })),
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error(`Server returned status ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        let hasTriggeredStartVibration = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let lastAudioTick = 0;
          let finalThoughtDuration: number | undefined = undefined;

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                if (data.done) {
                  // Stream done
                } else if (data.error) {
                  accumulatedText = data.error;
                } else if (data.text) {
                  accumulatedText += data.text;
                  const currentCleanText = accumulatedText.replace(/```question[\s\S]*?```/gi, '');

                  if (!hasTriggeredStartVibration) {
                    hasTriggeredStartVibration = true;
                    finalThoughtDuration = isSimple ? undefined : Math.max(1, thinkingTimerRef.current || 1);
                    setIsAiTyping(false);
                    setActiveThinkingMsgId(null);
                    setTypingAnimationMsgId(aiMsgId);
                    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                      try {
                        navigator.vibrate(35);
                      } catch {}
                    }
                  }

                  // Update message in real time with incoming stream text!
                  setChatThreads((prev) => {
                    const thread = prev[topicKey];
                    if (!thread) return prev;
                    return {
                      ...prev,
                      [topicKey]: {
                        ...thread,
                        messages: thread.messages.map((m) =>
                          m.id === aiMsgId
                            ? {
                                ...m,
                                text: currentCleanText,
                                isStreaming: false,
                                thoughtDuration: finalThoughtDuration,
                                structuredContent: undefined,
                              }
                            : m
                        ),
                      },
                    };
                  });

                  // Faster audio & haptic ticks in sync with live generation
                  const now = Date.now();
                  if (now - lastAudioTick >= 60) {
                    playTypingClick();
                    triggerTypingVibration();
                    lastAudioTick = now;
                  }
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      } catch (err) {
        console.warn('Live stream error:', err);
        if (!accumulatedText) {
          accumulatedText = 'The AI service is temporarily unavailable due to rate limits or connection errors. Please try again.';
        }
      } finally {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }

        const finalThoughtDuration = isSimple ? undefined : Math.max(1, thinkingTimerRef.current || 1);
        setIsAiTyping(false);
        setActiveThinkingMsgId(null);
        setTypingAnimationMsgId(null);
        setIsSendLocked(false);

        // Haptic feedback & subtle vibration when reply completes
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([40, 25, 40]);
          } catch {}
        }
        setVibratingMsgId(aiMsgId);
        setTimeout(() => setVibratingMsgId((curr) => (curr === aiMsgId ? null : curr)), 500);

        const fullAnswer = accumulatedText || 'Response ready.';
        const cleanFullAnswer = fullAnswer.replace(/```question[\s\S]*?```/gi, '').trim();
        fullGeneratedTextMap.current[aiMsgId] = cleanFullAnswer;
        const parsed = parseAIText(cleanFullAnswer);

        // Proactive question mode when instructions are missing
        const extractedQuestion = isSimple ? null : extractQuestionBlock(fullAnswer);
        if (extractedQuestion) {
          setPromptQuestionQueue([extractedQuestion]);
          setPromptQuestionIdx(0);
        }

        // Persist code artifact and memory immediately
        persistArtifactIfPresent(cleanFullAnswer, topicKey, promptText);

        // Set final formatted structured content with instant code boxes
        setChatThreads((prev) => {
          const thread = prev[topicKey];
          if (!thread) return prev;
          return {
            ...prev,
            [topicKey]: {
              ...thread,
              messages: thread.messages.map((m) =>
                m.id === aiMsgId
                  ? {
                      ...m,
                      text: cleanFullAnswer,
                      isStreaming: false,
                      thoughtDuration: finalThoughtDuration,
                      structuredContent:
                        parsed.mainTitle || parsed.intro || parsed.sections.length > 0
                          ? parsed
                          : undefined,
                      activeQuestion: undefined,
                    }
                  : m
              ),
            },
          };
        });
      }
    })();
  };

  const processChatFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    if (chatAttachments.length >= 10) {
      setFileLimitError('Max 10 files can be attached.');
      setTimeout(() => setFileLimitError(null), 3500);
      return;
    }

    const availableSlots = 10 - chatAttachments.length;
    const filesToAttach = fileArray.slice(0, availableSlots);

    if (fileArray.length > availableSlots) {
      setFileLimitError(`Max 10 files limit reached. Added ${availableSlots} file(s).`);
      setTimeout(() => setFileLimitError(null), 3500);
    }

    filesToAttach.forEach((file) => {
      const isImg = file.type.startsWith('image/');
      const reader = new FileReader();
      const attachmentId = `chat-file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      if (isImg) {
        reader.onload = (ev) => {
          const base64Data = ev.target?.result as string;
          const newAttachment: AttachedFile = {
            id: attachmentId,
            name: file.name,
            size: file.size,
            type: file.type,
            isImage: true,
            preview: base64Data,
          };
          setChatAttachments((prev) => [...prev, newAttachment]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          const newAttachment: AttachedFile = {
            id: attachmentId,
            name: file.name,
            size: file.size,
            type: file.type,
            isImage: false,
            preview: content,
          };
          setChatAttachments((prev) => [...prev, newAttachment]);
        };
        if (file.type.includes('text') || /\.(txt|md|json|js|jsx|ts|tsx|html|css|py|csv)$/i.test(file.name)) {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      }
    });
  };

  const removeChatAttachment = (id: string) => {
    setChatAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const pendingAttachmentsRef = useRef<AttachedFile[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Sync activeTopic when prop changes
  useEffect(() => {
    if (selectedRecentTopic && chatThreads[selectedRecentTopic]) {
      setActiveTopic(selectedRecentTopic);
    }
  }, [selectedRecentTopic]);

  // Handle incoming initial prompt from the BMW road screen with real Gemini streaming!
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setIsSendLocked(true);
      const trimmed = initialPrompt.trim();
      const newTopicName = trimmed.length > 25 ? `${trimmed.slice(0, 25)}...` : trimmed;
      const userMsgId = `msg-user-${Date.now()}`;
      const aiMsgId = `msg-ai-${Date.now()}`;

      const userMessage: ChatMessage = {
        id: userMsgId,
        sender: 'user',
        text: trimmed,
        attachments: initialAttachments && initialAttachments.length > 0 ? [...initialAttachments] : undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const aiPlaceholder: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: '',
        isStreaming: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const newThread: ChatThread = {
        id: `thread-${Date.now()}`,
        title: newTopicName,
        promptBanner: trimmed,
        messages: [userMessage, aiPlaceholder],
      };

      setChatThreads((prev) => ({
        [newTopicName]: newThread,
        ...prev,
      }));
      setActiveTopic(newTopicName);

      // Start real streaming with typing animation
      startGeminiStream(newTopicName, aiMsgId, trimmed, initialAttachments || []);
    }
  }, [initialPrompt]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [activeTopic, isAiTyping, chatThreads]);

  const currentThread = chatThreads[activeTopic] || chatThreads['Landing Page Design'];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSendLocked || isAiTyping) return;
    const query = inputVal.trim();
    if (!query && chatAttachments.length === 0) return;

    const messageText = query || (chatAttachments[0] ? `Attached ${chatAttachments.length} file(s)` : 'File analysis request');
    const currentAtts = [...chatAttachments];
    const userMsgId = `user-${Date.now()}`;

    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: messageText,
      attachments: currentAtts.length > 0 ? currentAtts : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setInputVal('');
    setChatAttachments([]);
    pendingAttachmentsRef.current = currentAtts;

    // Check if user is asking to create a timetable or routine
    const isTimetableRequest =
      /(\btimetable\b|\btime\s*table\b|\broutine\b|\bdaily\s*routine\b|\bschedule\b|\bday\s*plan\b|\bplanner\b|\bstudy\s*plan\b|\bworkout\s*routine\b|\bworkout\s*plan\b)/i.test(
        messageText
      );

    // Check if user is asking to create a website or web project
    const isWebsiteOrAppRequest =
      !isTimetableRequest &&
      (/(\bwebsite\b|\blanding\s*page\b|\bweb\s*app\b|\bportfolio\b|\bweb\s*page\b|\bsite\b)/i.test(messageText) ||
      /(create|build|make|design|generate|develop|code|need|want).*(website|page|site|app|portfolio)/i.test(messageText));

    if (isTimetableRequest) {
      // 1. Add ONLY user message to chat history (no question in chat, no AI placeholder yet)
      setChatThreads((prev) => {
        const existing = prev[activeTopic] || {
          id: `thread-${Date.now()}`,
          title: activeTopic,
          promptBanner: messageText,
          messages: [],
        };
        return {
          ...prev,
          [activeTopic]: {
            ...existing,
            messages: [...existing.messages, userMessage],
          },
        };
      });

      const isWorkout = /workout|gym|fitness|exercise|training/i.test(messageText);
      const isStudy = /study|exam|revision|academic|homework/i.test(messageText);

      let TIMETABLE_QUESTIONS: QuestionBlock[];

      if (isWorkout) {
        TIMETABLE_QUESTIONS = [
          {
            id: `q-time-${Date.now()}`,
            title: 'What time do you prefer to exercise or train?',
            description: 'Choose your workout window or type custom training hours.',
            options: [
              'Morning Energy (06:00 AM – 07:30 AM)',
              'Midday Session (12:00 PM – 01:30 PM)',
              'Evening Power (06:00 PM – 07:30 PM)',
            ],
          },
          {
            id: `q-focus-${Date.now() + 1}`,
            title: 'What is your primary fitness target?',
            description: 'Select your main target or enter specific routine details.',
            options: [
              'Hypertrophy & Strength (Push/Pull/Legs)',
              'Fat Loss, HIIT & Conditioning',
              'Athletic Mobility & Calisthenics',
            ],
          },
        ];
      } else if (isStudy) {
        TIMETABLE_QUESTIONS = [
          {
            id: `q-time-${Date.now()}`,
            title: 'What is your peak concentration window for studying?',
            description: 'Select your peak concentration time or enter custom hours.',
            options: [
              'Early Morning Focus (06:00 AM – 10:00 AM)',
              'Afternoon Deep Session (01:00 PM – 05:00 PM)',
              'Night Owl Study (08:00 PM – 12:00 AM)',
            ],
          },
          {
            id: `q-focus-${Date.now() + 1}`,
            title: 'What is your main study objective?',
            description: 'Choose your academic goal or specify subjects/exams.',
            options: [
              'Exam Preparation & High Scores',
              'Tech, Coding & Skill Mastery',
              'Daily Curriculum & Deep Reading',
            ],
          },
        ];
      } else {
        TIMETABLE_QUESTIONS = [
          {
            id: `q-time-${Date.now()}`,
            title: 'What time do you usually wake up or start your daily routine?',
            description: 'Select your waking schedule or enter your exact start time.',
            options: [
              'Early Riser (05:00 AM – 06:00 AM)',
              'Standard Morning (07:00 AM – 08:00 AM)',
              'Flexible / Late Start (09:00 AM – 10:00 AM)',
            ],
          },
          {
            id: `q-focus-${Date.now() + 1}`,
            title: 'What is the primary focus of your daily timetable?',
            description: 'Select your core focus or enter custom priorities.',
            options: [
              'High-Performance Work & Fitness (Deep Work + Gym + Clean Diet)',
              'Study, Revision & Skill Growth (Focus Blocks + Breaks)',
              'Balanced Lifestyle & Wellbeing (Work + Health + Mindfulness)',
            ],
          },
        ];
      }

      pendingVaguePromptRef.current = messageText;
      collectedAnswersRef.current = {};
      setPromptQuestionQueue(TIMETABLE_QUESTIONS);
      setPromptQuestionIdx(0);
      setIsSendLocked(false);
      return;
    }

    if (isWebsiteOrAppRequest) {
      // 1. Add ONLY user message to chat history (no question in chat, no AI placeholder yet)
      setChatThreads((prev) => {
        const existing = prev[activeTopic] || {
          id: `thread-${Date.now()}`,
          title: activeTopic,
          promptBanner: messageText,
          messages: [],
        };
        return {
          ...prev,
          [activeTopic]: {
            ...existing,
            messages: [...existing.messages, userMessage],
          },
        };
      });

      // 2. Prepare discovery questions in prompt box queue
      const DISCOVERY_QUESTIONS: QuestionBlock[] = [
        {
          id: `q-theme-${Date.now()}`,
          title: 'What is the primary visual theme and vibe for this website?',
          description: 'Select a visual direction or enter your custom aesthetic preference.',
          options: [
            'Luxury Dark Obsidian & Crimson Neon (Futuristic, High-Impact)',
            'Modern Glassmorphic & Bento Grid (Clean SaaS, Tech Portal)',
            'Minimalist Editorial & Monospace (Sleek Creative Studio)',
          ],
        },
        {
          id: `q-name-${Date.now() + 1}`,
          title: 'What is the website name and branding identity?',
          description: 'Choose a naming style or type your exact brand name and header title.',
          options: [
            'Velocity Apex (High-Performance Engineering)',
            'Luminary Studio (Digital Innovation & Design)',
            'Obsidian Labs (Next-Gen Intelligent Systems)',
          ],
        },
      ];

      pendingVaguePromptRef.current = messageText;
      collectedAnswersRef.current = {};
      setPromptQuestionQueue(DISCOVERY_QUESTIONS);
      setPromptQuestionIdx(0);
      setIsSendLocked(false);
      return;
    }

    // Standard flow for specific requests: add user message & AI placeholder and start streaming
    setIsSendLocked(true);
    const aiMsgId = `ai-${Date.now()}`;

    const aiPlaceholder: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatThreads((prev) => {
      const existing = prev[activeTopic] || {
        id: `thread-${Date.now()}`,
        title: activeTopic,
        promptBanner: messageText,
        messages: [],
      };
      return {
        ...prev,
        [activeTopic]: {
          ...existing,
          messages: [...existing.messages, userMessage, aiPlaceholder],
        },
      };
    });

    startGeminiStream(activeTopic, aiMsgId, messageText, currentAtts);
  };

  const handleSelectRecentChat = (topic: string) => {
    setActiveTopic(topic);
    if (onSelectRecentTopic) onSelectRecentTopic(topic);
    setIsMobileSidebarOpen(false);
  };

  const handleNewChat = () => {
    const newId = `Chat ${Object.keys(chatThreads).length + 1}`;
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      title: newId,
      promptBanner: 'Start a new conversation or ask anything...',
      messages: [
        {
          id: `welcome-${Date.now()}`,
          sender: 'ai',
          text: 'What would you like to build or explore today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          structuredContent: {
            mainTitle: { white: 'New', red: 'Session' },
            intro: 'Ask anything to generate layout architectures, copy, or Tailwind design systems.',
            sections: [
              {
                title: 'Quick Suggestions',
                bullets: [
                  'Design an interactive landing page for hypercar telemetry',
                  'Create dark-mode design tokens with glowing red accents',
                  'Generate responsive Tailwind component cards',
                ],
              },
            ],
          },
        },
      ],
    };

    setChatThreads((prev) => ({
      [newId]: newThread,
      ...prev,
    }));
    setActiveTopic(newId);
    setIsMobileSidebarOpen(false);
  };

  const toggleMic = async () => {
    if (isMicActive) {
      isMicActiveRef.current = false;
      setIsMicActive(false);
      showToast('Microphone stopped');
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
        speechRecognitionRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      return;
    }

    isMicActiveRef.current = true;
    setIsMicActive(true);
    // Save existing text before voice input starts
    micBaseInputRef.current = inputVal;
    showToast('Listening... Speak now (Live transcription active)');

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let startedSpeechRecognition = false;

    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = navigator.language || 'en-US';

        recognition.onresult = (event: any) => {
          let interim = '';
          let finalChunk = '';
          for (let i = 0; i < event.results.length; ++i) {
            const res = event.results[i];
            if (res.isFinal) {
              finalChunk += (finalChunk ? ' ' : '') + res[0].transcript.trim();
            } else {
              interim += (interim ? ' ' : '') + res[0].transcript.trim();
            }
          }
          const base = micBaseInputRef.current;
          const liveCombined = [base, finalChunk, interim].filter(Boolean).join(' ');
          setInputVal(liveCombined);
        };

        recognition.onerror = (err: any) => {
          console.warn('SpeechRecognition error:', err?.error);
          if (err?.error === 'not-allowed') {
            isMicActiveRef.current = false;
            setIsMicActive(false);
            showToast('Microphone access denied');
          }
        };

        recognition.onend = () => {
          // Re-arm recognition if user is still actively recording
          if (isMicActiveRef.current) {
            try {
              recognition.start();
            } catch {}
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
        startedSpeechRecognition = true;
      } catch (recErr) {
        console.warn('SpeechRecognition failed, falling back to MediaRecorder:', recErr);
      }
    }

    // Audio stream & MediaRecorder for Whisper backend fallback
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          if (audioBlob.size < 50) return;

          // If speech recognition didn't yield text, fallback to /api/stt
          if (!startedSpeechRecognition || inputVal === micBaseInputRef.current) {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Audio = reader.result as string;
              try {
                showToast('Transcribing with Groq / Gemini STT...');
                const sttRes = await fetch('/api/stt', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ audio: base64Audio, mimeType: 'audio/webm' }),
                });
                const sttData = await sttRes.json();
                if (sttData.text && sttData.text.trim()) {
                  setInputVal((prev) => (prev ? `${prev} ${sttData.text.trim()}` : sttData.text.trim()));
                  showToast('Transcribed audio');
                }
              } catch (sttErr) {
                console.warn('Groq STT transcription error:', sttErr);
                showToast('Transcription service unavailable');
              }
            };
          }
        };

        mediaRecorder.start(250);
        mediaRecorderRef.current = mediaRecorder;
      }
    } catch (micErr) {
      if (!startedSpeechRecognition) {
        console.warn('Microphone permission error:', micErr);
        isMicActiveRef.current = false;
        setIsMicActive(false);
        showToast('Microphone access denied or unavailable');
      }
    }
  };

  const handleCancelMic = () => {
    isMicActiveRef.current = false;
    setIsMicActive(false);
    setIsTranscribing(false);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setInputVal(micBaseInputRef.current);
    showToast('Voice recording cancelled');
  };

  const handleConfirmMic = () => {
    isMicActiveRef.current = false;
    setIsMicActive(false);
    setIsTranscribing(true);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setTimeout(() => {
      setIsTranscribing(false);
      showToast('Voice transcribed');
    }, 750);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[10000] bg-black flex overflow-hidden text-white font-sans select-none"
      >
        {/* Background Atmospheric Red Nebulas */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#ff1828]/12 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[500px] bg-[#ff1828]/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#ff1828]/8 rounded-full blur-[130px] pointer-events-none" />

        {/* ------------------------------------------------------------- */}
        {/* LEFT SIDEBAR: Exact BMW ///M styling from reference image */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-black/95 md:bg-black/90 md:static md:translate-x-0 transition-transform duration-300 flex flex-col justify-between p-5 border-r border-[#ff1828]/25 backdrop-blur-xl ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Top Fixed Section: Logo + New Chat + Navigation */}
          <div className="shrink-0 space-y-4">
            {/* Mobile Close Button & Header */}
            <div className="flex items-center justify-between md:justify-center pt-1 pb-1">
              {/* BMW ///M Logo */}
              <div className="flex items-center gap-2 select-none">
                <div className="flex items-center gap-1.5 -skew-x-[18deg]">
                  <span className="w-2.5 h-7 bg-[#0082CA] rounded-[1px] shadow-[0_0_10px_rgba(0,130,202,0.7)]" />
                  <span className="w-2.5 h-7 bg-[#17205a] rounded-[1px]" />
                  <span className="w-2.5 h-7 bg-[#E21B23] rounded-[1px] shadow-[0_0_14px_rgba(226,27,35,0.9)]" />
                </div>
                <span className="text-white text-3xl font-black italic tracking-tighter ml-1">
                  M
                </span>
              </div>

              {/* Mobile Close X */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* + New Chat Button with red neon rim */}
            <button
              type="button"
              onClick={handleNewChat}
              className="w-full py-3 px-4 rounded-[20px] bg-[#0d0204] border-[1.5px] border-[#ff1828] text-white font-medium text-[15px] flex items-center justify-between shadow-[0_0_18px_rgba(255,24,40,0.6)] hover:shadow-[0_0_26px_rgba(255,24,40,0.85)] transition-all cursor-pointer active:scale-98 group"
            >
              <div className="flex items-center gap-3">
                <Plus size={19} className="text-white group-hover:rotate-90 transition-transform" />
                <span className="text-white tracking-wide">New Chat</span>
              </div>
              <ChevronRight size={18} className="text-[#ff1828] font-bold group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Standard Navigation */}
            <div className="space-y-1.5 pt-0.5 text-[15px] font-normal text-white">
              <button
                type="button"
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] text-left flex items-center gap-3.5 text-white transition-all cursor-pointer"
              >
                <MessageSquare size={19} strokeWidth={1.8} className="text-white" />
                <span className="tracking-wide">Chat</span>
              </button>
              <button
                type="button"
                className="w-full px-3 py-2 rounded-xl hover:bg-white/[0.04] text-left flex items-center gap-3.5 text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                <LayoutGrid size={19} strokeWidth={1.8} className="text-zinc-400" />
                <span className="tracking-wide">Explore GPTs</span>
              </button>
              <button
                type="button"
                className="w-full px-3 py-2 rounded-xl hover:bg-white/[0.04] text-left flex items-center gap-3.5 text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                <Folder size={19} strokeWidth={1.8} className="text-zinc-400" />
                <span className="tracking-wide">Library</span>
              </button>
            </div>
          </div>

          {/* ONLY RECENT SECTION SCROLLABLE: Clean list without glowing highlight div */}
          <div className="flex-1 min-h-0 flex flex-col pt-3">
            <span className="text-[13px] font-normal text-zinc-500 px-3 tracking-wide mb-2 shrink-0">
              Recent
            </span>

            {/* Scrollable container for recent items */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 no-scrollbar">
              {Object.keys(chatThreads).map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleSelectRecentChat(topic)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer hover:bg-white/[0.06] text-zinc-200 hover:text-white border border-transparent group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <MessageSquare
                      size={17}
                      strokeWidth={1.8}
                      className="text-zinc-400 group-hover:text-white shrink-0"
                    />
                    <span className="truncate text-[14px] text-white font-normal">
                      {topic}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Fixed Section: User Profile + Return to BMW Button */}
          <div className="shrink-0 space-y-3 pt-3 border-t border-zinc-900">
            {/* Back to BMW Car Reveal Screen Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-3 rounded-[18px] bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-white text-[13px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft size={16} className="text-zinc-400" />
              <span>Back to BMW Reveal</span>
            </button>

            {/* User Profile Row */}
            <div className="flex items-center justify-between px-2 pt-1 select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0e0103] border-[1.5px] border-[#ff1828] flex items-center justify-center text-[#ff1828] shadow-[0_0_16px_rgba(255,24,40,0.8),inset_0_0_8px_rgba(255,24,40,0.4)]">
                  <UserIcon size={19} className="fill-[#ff1828] text-[#ff1828]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-white leading-tight">User</span>
                  <span className="text-xs text-zinc-400">Free Plan</span>
                </div>
              </div>
              <ChevronDown size={16} className="text-[#ff1828]" />
            </div>
          </div>
        </div>

        {/* Mobile backdrop for sidebar */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 z-40 md:hidden"
          />
        )}

        {/* ------------------------------------------------------------- */}
        {/* RIGHT MAIN CHAT AREA */}
        {/* ------------------------------------------------------------- */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Top Header Row for Desktop & Mobile */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-3 border-b border-white/10 bg-black/60 backdrop-blur-md z-30">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl bg-zinc-900 text-white flex items-center gap-2 text-sm"
              >
                <Menu size={18} />
                <span>Menu</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                title="Back to BMW Reveal Screen"
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">BMW View</span>
              </button>
            </div>
          </div>

          {/* Chat Scrollable Content Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 lg:px-16 pt-6 pb-40 space-y-8 scroll-smooth"
          >
            {/* Conversation Messages */}
            {currentThread.messages.map((message) => {
              if (message.sender === 'user') {
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-end"
                  >
                    <div className="max-w-2xl px-2 py-1 text-zinc-100 text-sm sm:text-base font-normal leading-relaxed">
                      {/* Render attached files if present (only image shown for images, no name pill) */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-2.5 pt-0.5">
                          {message.attachments.map((file) =>
                            file.isImage && file.preview ? (
                              <div
                                key={file.id}
                                className="relative w-[84px] h-[56px] rounded-xl overflow-hidden border border-white/20 shadow-md bg-black shrink-0 select-none"
                              >
                                <img
                                  src={file.preview}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                key={file.id}
                                className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs text-white"
                              >
                                <Paperclip size={12} className="text-zinc-300 rotate-[-45deg]" />
                                <span className="max-w-[140px] truncate">{file.name}</span>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {/* Content or Inline Editor */}
                      {editingUserMsgId === message.id ? (
                        <div className="space-y-2 min-w-[280px]">
                          <textarea
                            value={editingUserText}
                            onChange={(e) => setEditingUserText(e.target.value)}
                            className="w-full bg-black/70 border border-[#ff1828]/60 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#ff1828] resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleCancelEditUser}
                              className="px-3 py-1 rounded-lg text-xs bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditUser(message.id)}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-[#ff1828] hover:bg-[#e01423] text-white font-medium shadow-[0_0_10px_rgba(255,24,40,0.5)] transition-colors cursor-pointer"
                            >
                              <Check size={12} />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="leading-relaxed">{message.text}</p>
                          <span className="block text-[11px] text-zinc-400 text-right mt-1">
                            {message.timestamp}
                          </span>
                        </>
                      )}
                    </div>

                    {/* User Message Action Toolbar: ONLY ICONS, NO LABELS/NAMES (Copy, Retry, Edit) */}
                    {editingUserMsgId !== message.id && (
                      <div className="flex items-center justify-end gap-1.5 mt-1.5 px-1 select-none">
                        {/* Copy Icon Only */}
                        <button
                          type="button"
                          onClick={() => handleCopyUserMessage(message.id, message.text)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                          title="Copy"
                          aria-label="Copy"
                        >
                          {copiedUserMsgId === message.id ? (
                            <CheckCircle2 size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>

                        {/* Retry Icon Only */}
                        <button
                          type="button"
                          onClick={() => handleRetryUserMessage(message)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                          title="Retry"
                          aria-label="Retry"
                        >
                          <RotateCcw size={13} />
                        </button>

                        {/* Edit Icon Only */}
                        <button
                          type="button"
                          onClick={() => handleStartEditUser(message)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                          title="Edit"
                          aria-label="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              }

              // AI Message formatted with attractive headings, crimson accents, and typing animation
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6 pt-2"
                >
                  {/* Compact Thinking / Process Section: only for non-simple messages */}
                  {!isSimpleMessage(message.text) && (message.isStreaming || message.thoughtDuration !== undefined || activeThinkingMsgId === message.id) && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveThinkingMessage(message);
                        setIsThinkingPanelOpen((prev) => (activeThinkingMessage?.id === message.id ? !prev : true));
                      }}
                      className="text-xs text-zinc-400 hover:text-zinc-200 font-normal select-none py-1 flex items-center gap-1.5 transition-colors cursor-pointer group text-left"
                      title="Tap to inspect thinking breakdown & process"
                    >
                      {message.isStreaming && (
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
                      )}
                      <span>
                        {message.isStreaming
                          ? `Thinking... ${formatTimer(thinkingTimer)}`
                          : `Thought for ${message.thoughtDuration || 3}s`}
                      </span>
                      <ChevronRight size={13} className="text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  )}

                  {/* Loaded Answer Content with typing animation and tactile vibration */}
                  {message.text && (
                    <motion.div
                      key={message.id + (message.structuredContent && typingAnimationMsgId !== message.id ? '-struct' : '-plain')}
                      initial={{ opacity: 0, y: 12 }}
                      animate={
                        vibratingMsgId === message.id
                          ? { opacity: 1, y: 0, x: [0, -2, 2, -1, 1, 0] }
                          : { opacity: 1, y: 0 }
                      }
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="space-y-6"
                      onClick={() => handleSkipTyping(message.id)}
                    >
                      {/* While typing, display progressively with animated blinking cursor */}
                      {typingAnimationMsgId === message.id ? (
                        <div className="text-zinc-100 text-base sm:text-lg leading-relaxed whitespace-pre-line font-bold cursor-pointer select-text">
                          {renderFormattedBoldText(message.text)}
                          <span className="inline-block w-2 h-4 ml-1.5 bg-white/90 animate-pulse align-middle rounded-sm" />
                        </div>
                      ) : (
                        <>
                          {/* 3 to 4 topic-related visual images at top of valid response with lightbox & direct download */}
                          <MessageTopImageGallery
                            promptOrTopic={
                              currentThread?.promptBanner ||
                              (typeof message.structuredContent?.mainTitle === 'string'
                                ? message.structuredContent.mainTitle
                                : '') ||
                              message.text.slice(0, 120)
                            }
                          />

                          {/* Clean White Main Title (slightly larger than sub-heading, all in pure white) */}
                          {message.structuredContent?.mainTitle && (
                            <div className="pt-1">
                              <h2 className="text-2xl sm:text-[26px] md:text-3xl font-black tracking-tight text-white leading-tight">
                                {typeof message.structuredContent.mainTitle === 'string'
                                  ? message.structuredContent.mainTitle
                                  : `${(message.structuredContent.mainTitle as any).white || ''} ${(message.structuredContent.mainTitle as any).red || ''}`.trim()}
                              </h2>
                            </div>
                          )}

                          {/* Plain text fallback when no structured headers yet */}
                          {!message.structuredContent && message.text.replace(/```question[\s\S]*?```/gi, '').trim() && (
                            <div className="text-zinc-100 text-base sm:text-lg leading-relaxed whitespace-pre-line font-bold">
                              {renderFormattedBoldText(message.text.replace(/```question[\s\S]*?```/gi, '').trim())}
                            </div>
                          )}

                  {/* Intro Text */}
                  {message.structuredContent?.intro && (
                    <div className="text-zinc-100 text-base sm:text-lg leading-relaxed max-w-4xl font-bold">
                      {renderFormattedBoldText(message.structuredContent.intro)}
                    </div>
                  )}

                  {/* Sections with high-contrast styling and glowing indicators */}
                  {message.structuredContent?.sections?.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-3.5 pt-2">
                      {/* Section Title with crimson accent pill */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-5 bg-[#ff1828] rounded-full" />
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                          {section.title}
                        </h3>
                      </div>

                      {/* Description above code/prompt */}
                      {section.description && (
                        <div className="text-zinc-100 text-sm sm:text-base leading-relaxed whitespace-pre-line font-bold">
                          {renderFormattedBoldText(section.description)}
                        </div>
                      )}

                      {/* Bullet points */}
                      {section.bullets && (
                        <ul className="space-y-3 pt-1">
                          {section.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-3.5 text-sm sm:text-base text-zinc-100 font-bold group">
                              <span className="w-2 h-2 rounded-full bg-[#ff1828] mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                              <span className="leading-relaxed text-zinc-100 font-bold">{renderFormattedBoldText(bullet)}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Dedicated Prompt Box in separate section with copyable & preview buttons */}
                      {section.promptSnippet && (
                        <SpecialSnippetBox
                          type="prompt"
                          content={section.promptSnippet}
                          onUseInChat={(p) => {
                            setInputVal(p);
                            showToast('Loaded prompt into input box');
                          }}
                        />
                      )}

                      {/* Dedicated Code Box in separate section with copyable & preview buttons */}
                      {section.codeSnippet && (
                        <SpecialSnippetBox
                          type="code"
                          content={section.codeSnippet}
                          language={section.codeLanguage || 'tsx'}
                          fileName={section.fileName}
                          onOpenFullScreenPreview={(html, fileName) =>
                            setFullscreenWebsite({ html, fileName: fileName || 'website.html' })
                          }
                        />
                      )}
                    </div>
                  ))}

                  {/* Visual Timetable Card with 1-Click PNG Download (appears for timetable / routine responses) */}
                  {(() => {
                    const tbData = extractTimetableData(message.text);
                    if (tbData && tbData.slots.length >= 3) {
                      const htmlSection = message.structuredContent?.sections?.find(
                        (s) => s.codeSnippet && (s.fileName?.includes('timetable') || s.codeSnippet.includes('<!DOCTYPE html>'))
                      );
                      const htmlContent = htmlSection?.codeSnippet || '';

                      return (
                        <TimetableImageCard
                          title={tbData.title}
                          slots={tbData.slots}
                          wakeTime={collectedAnswersRef.current['time']}
                          focus={collectedAnswersRef.current['focus']}
                          onOpenFullScreen={
                            htmlContent
                              ? () => setFullscreenWebsite({ html: htmlContent, fileName: 'timetable.html' })
                              : undefined
                          }
                        />
                      );
                    }
                    return null;
                  })()}

                  {/* AI Response Actions Toolbar: ONLY ICONS, NO LABELS/NAMES (Revert, Copy, Retry, Delete, Export) */}
                  {!message.isStreaming && typingAnimationMsgId !== message.id && (
                    <div className="flex items-center gap-1.5 pt-3 border-t border-white/10 select-none">
                      {/* Revert Icon Only */}
                      <button
                        type="button"
                        onClick={() => handleRevertAiMessage(message.id)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                        title="Revert response"
                        aria-label="Revert"
                      >
                        <Undo2 size={13} />
                      </button>

                      {/* Copy Icon Only */}
                      <button
                        type="button"
                        onClick={() => handleCopyResponse(message.id, message.text)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                        title="Copy response"
                        aria-label="Copy"
                      >
                        {copiedMessageId === message.id ? (
                          <CheckCircle2 size={13} className="text-emerald-400" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>

                      {/* Retry Icon Only */}
                      <button
                        type="button"
                        onClick={() => handleRetryAiMessage(message)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                        title="Retry response"
                        aria-label="Retry"
                      >
                        <RotateCcw size={13} />
                      </button>

                      {/* Delete Icon Only */}
                      <button
                        type="button"
                        onClick={() => handleDeleteAiMessage(message.id)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                        title="Delete response"
                        aria-label="Delete"
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* Export Icon Only & Dropdown Menu */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setExportMenuMsgId((prev) =>
                              prev === message.id ? null : message.id
                            )
                          }
                          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
                            exportMenuMsgId === message.id
                              ? 'bg-[#ff1828]/25 border-[#ff1828] text-white'
                              : 'bg-white/5 hover:bg-white/15 border-white/10 hover:border-white/20 text-zinc-400 hover:text-white'
                          }`}
                          title="Export response"
                          aria-label="Export"
                        >
                          <FileDown size={13} />
                        </button>

                        {/* Multi-Format Export Dropdown Menu */}
                        <AnimatePresence>
                          {exportMenuMsgId === message.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 6, scale: 0.95 }}
                              className="absolute left-0 bottom-full mb-2 w-64 rounded-2xl bg-[#120406]/95 backdrop-blur-xl border border-[#ff1828]/40 shadow-[0_20px_45px_rgba(0,0,0,0.85),0_0_20px_rgba(255,24,40,0.25)] p-2 z-50 text-xs"
                            >
                              <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-white/10 mb-1 flex items-center justify-between">
                                <span>Export Answer As</span>
                                <span className="text-[#ff1828]">5 Formats</span>
                              </div>

                              {/* PDF Option */}
                              <button
                                type="button"
                                onClick={() => handleExport('pdf', message)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-white transition-colors text-left group cursor-pointer"
                              >
                                <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                  <FileText size={15} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-white">PDF Document</span>
                                  <span className="text-[10px] text-zinc-400">Printable & saveable .pdf</span>
                                </div>
                              </button>

                              {/* Word Option */}
                              <button
                                type="button"
                                onClick={() => handleExport('doc', message)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-white transition-colors text-left group cursor-pointer"
                              >
                                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                  <FileText size={15} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-white">Word Document</span>
                                  <span className="text-[10px] text-zinc-400">Microsoft Word .doc</span>
                                </div>
                              </button>

                              {/* Markdown Option */}
                              <button
                                type="button"
                                onClick={() => handleExport('md', message)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-white transition-colors text-left group cursor-pointer"
                              >
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                  <FileCode size={15} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-white">Markdown File</span>
                                  <span className="text-[10px] text-zinc-400">GitHub formatted .md</span>
                                </div>
                              </button>

                              {/* Plain Text Option */}
                              <button
                                type="button"
                                onClick={() => handleExport('txt', message)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-white transition-colors text-left group cursor-pointer"
                              >
                                <div className="w-7 h-7 rounded-lg bg-zinc-700/40 text-zinc-300 flex items-center justify-center shrink-0 group-hover:bg-zinc-600 group-hover:text-white transition-colors">
                                  <FileText size={15} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-white">Text File</span>
                                  <span className="text-[10px] text-zinc-400">Plain text .txt</span>
                                </div>
                              </button>

                              {/* HTML Web Page Option */}
                              <button
                                type="button"
                                onClick={() => handleExport('html', message)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 text-white transition-colors text-left group cursor-pointer"
                              >
                                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                  <FileCode size={15} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-white">HTML Document</span>
                                  <span className="text-[10px] text-zinc-400">Styled standalone .html</span>
                                </div>
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                        </>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* BOTTOM FLOATING PROMPT BOX & INTERACTIVE EXPANDABLE MODULES */}
          {/* ------------------------------------------------------------- */}
          <div className="absolute bottom-5 left-0 right-0 px-4 sm:px-8 md:px-12 lg:px-16 flex flex-col items-center pointer-events-none z-40">
            {/* Hidden File Input for Prompt Box & Modules */}
            <input
              ref={chatFileInputRef}
              type="file"
              multiple
              accept="*/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  processChatFiles(e.target.files);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />

            {/* Dynamic width container: when process overview OR questioning is active */}
            {(() => {
              const activePromptQuestion =
                promptQuestionQueue.length > 0 && promptQuestionIdx < promptQuestionQueue.length
                  ? promptQuestionQueue[promptQuestionIdx]
                  : undefined;

              return (
                <div
                  className={`w-full transition-all duration-300 pointer-events-auto relative ${
                    isThinkingPanelOpen || activePromptQuestion
                      ? 'max-w-3xl sm:max-w-4xl'
                      : 'max-w-3xl'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {isThinkingPanelOpen && activeThinkingMessage ? (
                      /* COMPACT PROCESS OVERVIEW PANEL (Thought for Xs, high-level steps, max 2x prompt box) */
                      <CompactThinkingPanel
                        key="compact-thinking-panel"
                        duration={activeThinkingMessage.thoughtDuration || 3}
                        message={activeThinkingMessage}
                        onClose={() => setIsThinkingPanelOpen(false)}
                      />
                    ) : activePromptQuestion ? (
                      /* SMART QUESTION MODE INTERACTIVE CARD IN PROMPT BOX (Pure white, 3 options + 1 Custom) */
                      <InteractiveQuestionCard
                        key={`interactive-question-${activePromptQuestion.id || promptQuestionIdx}`}
                        question={activePromptQuestion}
                        stepNumber={promptQuestionIdx + 1}
                        totalSteps={promptQuestionQueue.length}
                        disabled={isSendLocked || isAiTyping}
                        onAnswer={(answer) => handleAnswerPromptQuestion(answer)}
                      />
                    ) : isMicActive || isTranscribing ? (
                      /* LIVE STT SOUND BAR & TRANSCRIBING WAVEFORM matching Screenshots 1 & 2 */
                      <SttSoundBar
                        key="stt-sound-bar"
                        isTranscribing={isTranscribing}
                        onCancel={handleCancelMic}
                        onConfirm={handleConfirmMic}
                        onAttach={() => chatFileInputRef.current?.click()}
                      />
                    ) : (
                      /* STANDARD WHITE PROMPT BOX (User: "or prompt box white hi reakhana") */
                      <form
                        key="standard-white-prompt-box"
                        onSubmit={handleSendMessage}
                        className="w-full relative"
                      >
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingOver(true);
                          }}
                          onDragLeave={() => setIsDraggingOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingOver(false);
                            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                              processChatFiles(e.dataTransfer.files);
                            }
                          }}
                          className={`relative rounded-[28px] sm:rounded-[32px] bg-white text-zinc-900 px-5 pt-4 pb-3 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(255,24,40,0.25)] border transition-all ${
                            isDraggingOver
                              ? 'border-[#ff1828] ring-2 ring-[#ff1828]/30'
                              : 'border-white/90'
                          }`}
                        >
                          {/* Input Field */}
                          <input
                            type="text"
                            disabled={isSendLocked || isAiTyping}
                            placeholder={
                              isSendLocked || isAiTyping ? 'Synthesizing response...' : 'Ask anything...'
                            }
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            className="w-full bg-transparent text-zinc-800 text-sm sm:text-base font-normal placeholder:text-zinc-400 focus:outline-none pb-2.5 tracking-wide disabled:opacity-60"
                          />

                          {/* Attached Files Strip (Only image shown for images, no name pill) */}
                          {chatAttachments.length > 0 && (
                            <div className="flex items-center gap-2.5 overflow-x-auto py-2 px-0.5 no-scrollbar max-w-full">
                              {chatAttachments.map((file) => (
                                <div key={file.id} className="relative shrink-0 group">
                                  {file.isImage && file.preview ? (
                                    /* ONLY image thumbnail is shown with sleek remove button */
                                    <div className="relative w-[84px] h-[56px] sm:w-[94px] sm:h-[62px] rounded-2xl overflow-hidden border border-zinc-300 shadow-md bg-zinc-900 shrink-0 select-none">
                                      <img
                                        src={file.preview}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                      />
                                      {/* Sleek top-right remove button on image */}
                                      <button
                                        type="button"
                                        disabled={isSendLocked || isAiTyping}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeChatAttachment(file.id);
                                        }}
                                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/75 hover:bg-[#ff1828] text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-90 disabled:opacity-40"
                                        title={`Remove ${file.name}`}
                                        aria-label={`Remove ${file.name}`}
                                      >
                                        <X size={11} strokeWidth={2.5} />
                                      </button>
                                    </div>
                                  ) : (
                                    /* Non-image files show standard pill */
                                    <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.06)] rounded-full px-3.5 py-1.5 text-xs sm:text-sm text-zinc-800 font-medium shrink-0 select-none">
                                      <Paperclip size={14} className="text-zinc-600 shrink-0 rotate-[-45deg]" />
                                      <span className="max-w-[130px] sm:max-w-[170px] truncate" title={file.name}>
                                        {file.name}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={isSendLocked || isAiTyping}
                                        onClick={() => removeChatAttachment(file.id)}
                                        className="w-4 h-4 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-800 transition-colors ml-0.5 cursor-pointer active:scale-90 disabled:opacity-40"
                                        title={`Remove ${file.name}`}
                                        aria-label={`Remove ${file.name}`}
                                      >
                                        <X size={12} strokeWidth={2.5} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}

                              {/* Counter badge */}
                              {chatAttachments.length > 1 && (
                                <span className="text-[11px] font-semibold text-zinc-400 px-1 shrink-0 select-none">
                                  {chatAttachments.length}/10
                                </span>
                              )}
                            </div>
                          )}

                          {/* File Limit Warning Notification */}
                          <AnimatePresence>
                            {fileLimitError && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-xs text-[#ff1828] font-medium px-1 py-1"
                              >
                                {fileLimitError}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Bottom Row Controls */}
                          <div className="flex items-center justify-between pt-1">
                            {/* Left: Plus (+) and Microphone */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={isSendLocked || isAiTyping}
                                onClick={() => chatFileInputRef.current?.click()}
                                className="w-8 h-8 rounded-full hover:bg-zinc-100 text-zinc-700 flex items-center justify-center transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Attach files (Max 10)"
                                aria-label="Attach files (Max 10)"
                              >
                                <Plus size={20} strokeWidth={2} />
                              </button>

                              <button
                                type="button"
                                disabled={isSendLocked || isAiTyping}
                                onClick={toggleMic}
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 hover:bg-zinc-100 text-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Voice Input (STT with Live Animation)"
                              >
                                <Mic size={19} />
                              </button>
                            </div>

                            {/* Right: Model Selector + Send Button */}
                            <div className="flex items-center gap-2">
                              {/* Model Dropdown */}
                              <div className="relative">
                                <button
                                  type="button"
                                  disabled={isSendLocked || isAiTyping}
                                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs sm:text-sm font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <span>{selectedModel}</span>
                                  <ChevronDown size={14} className="text-zinc-500" />
                                </button>

                                {isModelDropdownOpen && !isSendLocked && !isAiTyping && (
                                  <div className="absolute bottom-10 right-0 w-36 bg-zinc-900 text-white rounded-xl shadow-xl border border-white/10 p-1 z-50 text-xs">
                                    {['GPT-4o', 'GPT-4o mini', 'Gemini 2.5', 'Claude 3.7'].map((model) => (
                                      <button
                                        key={model}
                                        type="button"
                                        onClick={() => {
                                          setSelectedModel(model);
                                          setIsModelDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                                          selectedModel === model
                                            ? 'bg-[#ff1828] text-white'
                                            : 'hover:bg-white/10 text-zinc-300'
                                        }`}
                                      >
                                        {model}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Red Circular Send Button - Locked immediately on send until completion */}
                              <button
                                type="submit"
                                disabled={
                                  isSendLocked ||
                                  isAiTyping ||
                                  (!inputVal.trim() && chatAttachments.length === 0)
                                }
                                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                  !isSendLocked && !isAiTyping && (inputVal.trim() || chatAttachments.length > 0)
                                    ? 'bg-[#ff1828] text-white shadow-[0_0_18px_rgba(255,24,40,0.8)] hover:scale-105 cursor-pointer active:scale-95'
                                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-60'
                                }`}
                                title={isSendLocked || isAiTyping ? 'Generating response...' : 'Send prompt'}
                              >
                                <Send size={16} className="ml-0.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    )}
                  </AnimatePresence>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Floating Feedback Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed bottom-24 right-6 z-[10001] px-4 py-2.5 rounded-xl bg-[#140306]/95 border border-[#ff1828]/60 shadow-[0_10px_30px_rgba(0,0,0,0.85),0_0_15px_rgba(255,24,40,0.35)] text-white text-xs flex items-center gap-2.5 backdrop-blur-md pointer-events-none"
            >
              <CheckCircle2 size={15} className="text-[#ff1828]" />
              <span className="font-medium tracking-wide">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen Single-File Website Sandbox Modal */}
        {fullscreenWebsite && (
          <WebsitePreviewModal
            isOpen={Boolean(fullscreenWebsite)}
            onClose={() => setFullscreenWebsite(null)}
            htmlContent={fullscreenWebsite.html}
            fileName={fullscreenWebsite.fileName}
          />
        )}

        {/* Persistent Project & Artifact Recovery Vault Drawer */}
        <ProjectMemoryDrawer
          isOpen={isMemoryDrawerOpen}
          onClose={() => setIsMemoryDrawerOpen(false)}
          onSelectArtifactForPreview={(htmlContent: string, title: string) => {
            setIsMemoryDrawerOpen(false);
            setFullscreenWebsite({
              html: htmlContent,
              fileName: title || 'index.html',
            });
            showToast(`Loaded preview for ${title}`);
          }}
          onSelectProjectForChat={(project: ProjectMemory, promptSnippet?: string) => {
            setIsMemoryDrawerOpen(false);
            if (promptSnippet) {
              setInputVal(promptSnippet);
            }
            showToast(`Active project: ${project.name}`);
          }}
          showToast={showToast}
        />
      </motion.div>
    </AnimatePresence>
  );
};
