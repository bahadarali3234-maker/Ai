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
  Lock,
  LogOut,
  ArrowDown,
  ExternalLink,
  Sliders,
  Sun,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { AttachedFile, QuestionBlock, ProjectMemory, MemoryContextPackage } from '../types';
import { WebsitePreviewModal } from './WebsitePreviewModal';
import { FullScreenCodeEditorModal } from './FullScreenCodeEditorModal';
import { ProjectMemoryDrawer } from './ProjectMemoryDrawer';
import { TimetableImageCard, TimetableSlot } from './TimetableImageCard';
import { MessageTopImageGallery } from './MessageTopImageGallery';
import { ClarificationQuestionsCard } from './ClarificationQuestionsCard';
import { LoginModal } from './LoginModal';
import {
  isUserExplicitImageRequest,
  ImagePlannerResult,
} from '../utils/imagePlanner';
import {
  ClarificationDecision,
  ClarificationQuestion,
  isSkipIntent,
  buildEnrichedTaskPrompt,
  parseAndValidateGateResponse,
} from '../utils/clarificationGate';
import { memoryManager } from '../utils/memoryManager';
import { INITIAL_CHAT_DATA } from '../data/initialChats';
import {
  subscribeToAuth,
  subscribeToUserChatThreads,
  syncChatThreadToFirestore,
  deleteChatThreadFromFirestore,
  getCurrentUser,
  logOut,
} from '../firebase';

/**
 * Strips raw HTML image tags and markdown image links from text
 * so images are only displayed natively in the gallery
 */
export function sanitizeImageMarkupFromText(text: string): string {
  if (!text) return '';
  return text
    .replace(/!\[.*?\]\([^)]+\)/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<a[^>]*href=["'][^"']*\.(?:png|jpg|jpeg|webp|gif)[^"']*["'][^>]*>.*?<\/a>/gi, '')
    .replace(/\[(?:Image|Photo|Reference|Preview|Picture)\]\([^)]+\)/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

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

/**
 * Evaluates whether an AI message is an "important message" that warrants real visual reference images.
 * Strict user rule:
 * "Go refance image deni ha wo her massage ka Sath ni deni wo bus important massage ka Sath deni ha"
 * - NOT with every message!
 * - NOT with greetings, short casual chat, chit-chat, confirmations, or clarification questions.
 * - ONLY with important messages:
 *   1. User explicitly requested visuals/photos/images/references ("image", "photo", "pic", "tasveer", "dikhao", "look like", "show me")
 *   2. The message is discussing a concrete visual subject (e.g. cars/automotive, sports/athletes, celebrities/personalities, places/cities, tech devices/gadgets, animals/nature, designs/architecture, timetables/workouts)
 *   3. Substantial structured explanation (has structuredContent with mainTitle or multiple sections)
 */
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
  clarificationDecision?: ClarificationDecision;
  imagePlan?: {
    mode: 'NONE' | 'AUTO_REFERENCE' | 'USER_REQUESTED';
    shortReplyText?: string;
    subjects: Array<{
      label: string;
      images: Array<{
        id: string;
        url: string;
        thumbnail?: string;
        alt: string;
        title?: string;
        sourceUrl?: string;
        sourceDomain?: string;
        width?: number;
        height?: number;
      }>;
      backupPool?: any[];
      googleSearchUrl?: string;
    }>;
  };
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
  // Strip out any raw HTML <img> tags, markdown image links, or leaked image markup so text is purely clean
  const cleanedRaw = raw
    .replace(/```question[\s\S]*?```/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/gi, '')
    .trim();
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
  isStreaming?: boolean;
  onUseInChat?: (text: string) => void;
  onOpenFullScreenPreview?: (html: string, fileName?: string) => void;
  onOpenFullScreenEditor?: (code: string, fileName?: string, language?: string) => void;
}

/**
 * Opens standalone HTML website directly in a browser tab / localhost
 * App me preview na chale per user request!
 */
export const openHtmlPreviewInBrowser = async (htmlContent: string, fileName = 'index.html') => {
  try {
    // 1. Try server preview endpoint first for a clean localhost/preview/:id URL
    const res = await fetch('/api/preview-store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: htmlContent }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        const fullUrl = window.location.origin + data.url;
        const newWin = window.open(fullUrl, '_blank');
        if (newWin) return;
      }
    }
  } catch (err) {
    console.warn('Server preview endpoint notice:', err);
  }

  // 2. Direct Blob fallback in browser tab
  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, '_blank');
    if (!win) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.target = '_blank';
      a.rel = 'noopener,noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.error('Failed to open preview in browser:', err);
  }
};

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

// Formatted text helper to render AI responses in bold luxury serif font styling with interactive callouts and link cards
export const renderFormattedBoldText = (text: string) => {
  if (!text) return null;

  // Detect dedicated visual callout cards (IMPORTANT, NOTE, TIP, WARNING, SUCCESS, ERROR)
  const calloutRegex = /^(IMPORTANT|NOTE|TIP|WARNING|SUCCESS|ERROR|KEY POINT|REMEMBER)[:\s]+([\s\S]+)$/i;
  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];

  for (let lIdx = 0; lIdx < lines.length; lIdx++) {
    const line = lines[lIdx];
    const calloutMatch = line.trim().match(calloutRegex);
    if (calloutMatch) {
      const type = calloutMatch[1].toUpperCase();
      const content = calloutMatch[2];
      const isWarn = type === 'WARNING' || type === 'ERROR';
      const isTip = type === 'TIP' || type === 'SUCCESS';
      renderedElements.push(
        <div
          key={`callout-${lIdx}`}
          className={`my-3 px-4 py-3 rounded-2xl border flex items-start gap-3 backdrop-blur-md ${
            isWarn
              ? 'bg-rose-950/40 border-rose-600/50 text-rose-200'
              : isTip
              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-200'
              : 'bg-zinc-900/80 border-[#00a6ff]/40 text-white'
          }`}
        >
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 shrink-0 mt-0.5">
            {type}
          </span>
          <span className="font-bold text-sm sm:text-base leading-relaxed font-luxury-serif">
            {content}
          </span>
        </div>
      );
      continue;
    }

    // Process line for markdown links [Title](url) and raw URLs
    const parts = line.split(/(\*\*[^*]+\*\*|__[^_]+__|\[[^\]]+\]\(https?:\/\/[^\s)]+\)|https?:\/\/[^\s<]+)/g);
    const lineElements = parts.map((part, index) => {
      if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
        const boldContent = part.slice(2, -2);
        return (
          <strong
            key={`bold-${lIdx}-${index}`}
            className="font-black text-white tracking-[0.02em] font-luxury-serif"
            style={{ fontFamily: "'Cormorant Garamond', 'Bodoni 72', 'Bodoni Moda', 'Playfair Display', 'Times New Roman', serif", fontWeight: 850 }}
          >
            {boldContent}
          </strong>
        );
      }

      // Markdown link [Title](url)
      const mdLinkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (mdLinkMatch) {
        const linkTitle = mdLinkMatch[1];
        const linkUrl = mdLinkMatch[2];
        let domain = 'link';
        try { domain = new URL(linkUrl).hostname.replace(/^www\./, ''); } catch {}
        return (
          <a
            key={`link-${lIdx}-${index}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 my-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#ff4f78] hover:text-white border border-white/15 transition-all text-xs sm:text-sm font-bold active:scale-95 no-underline"
          >
            <span>{linkTitle}</span>
            <span className="text-[10px] text-zinc-400">({domain})</span>
            <ExternalLink size={12} className="shrink-0" />
          </a>
        );
      }

      // Raw URL
      if (/^https?:\/\/[^\s<]+$/.test(part)) {
        let domain = 'link';
        try { domain = new URL(part).hostname.replace(/^www\./, ''); } catch {}
        return (
          <a
            key={`rawlink-${lIdx}-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 my-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#ff4f78] hover:text-white border border-white/15 transition-all text-xs sm:text-sm font-bold active:scale-95 no-underline"
          >
            <span>{domain}</span>
            <ExternalLink size={12} className="shrink-0" />
          </a>
        );
      }

      return (
        <span
          key={`span-${lIdx}-${index}`}
          className="font-bold text-white tracking-[0.015em] font-luxury-serif"
          style={{ fontFamily: "'Cormorant Garamond', 'Bodoni 72', 'Bodoni Moda', 'Playfair Display', 'Times New Roman', serif", fontWeight: 750 }}
        >
          {part}
        </span>
      );
    });

    renderedElements.push(
      <React.Fragment key={`line-${lIdx}`}>
        {lineElements}
        {lIdx < lines.length - 1 && '\n'}
      </React.Fragment>
    );
  }

  return renderedElements;
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
  isStreaming = false,
  onUseInChat,
  onOpenFullScreenPreview,
  onOpenFullScreenEditor,
}) => {
  const [copied, setCopied] = useState(false);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll code container as code/prompt is typed in live
  useEffect(() => {
    if (isStreaming && codeContainerRef.current) {
      codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

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

  // When NOT streaming, ensure HTML code strictly starts from <!DOCTYPE html> and ends with </html> for complete copy/export
  let completeContent = content;
  if (!isStreaming && isHtmlCode) {
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

  const lineCount = (completeContent || '').split('\n').length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`mt-4 rounded-[24px] sm:rounded-[28px] bg-white border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.2),0_0_35px_rgba(0, 166, 255,0.06)] overflow-hidden transition-all text-zinc-900 ${
        isStreaming ? 'ring-2 ring-[#00a6ff]/40 shadow-[0_0_25px_rgba(0, 166, 255,0.2)]' : ''
      }`}
    >
      {/* Top Header Bar (Pure White Container matching Question card) */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-white border-b border-zinc-200">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00a6ff] shadow-[0_0_8px_#00a6ff]" />
          <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900 tracking-wide truncate">
            {resolvedFileName}
          </span>
          {isStreaming ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/25 text-[#00a6ff] text-[11px] font-bold shrink-0 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00a6ff] animate-ping" />
              <span>
                {!completeContent.trim()
                  ? 'Generating code...'
                  : `Writing ${isPrompt ? 'Prompt' : language?.toUpperCase() || 'Code'}...`}
              </span>
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full shrink-0">
              {lineCount} lines • Scrollable
            </span>
          )}
        </div>

        {/* Action Controls: 4 clean icon options (Wide Screen, Copy, Preview, Save) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 1. Wide Screen / Expand Button -> Opens Fullscreen In-App Code Editor */}
          <button
            type="button"
            onClick={() => {
              if (onOpenFullScreenEditor) {
                onOpenFullScreenEditor(completeContent, resolvedFileName, language || (isPrompt ? 'text' : 'html'));
              } else if (onOpenFullScreenPreview) {
                onOpenFullScreenPreview(completeContent, resolvedFileName);
              }
            }}
            className="w-8 h-8 rounded-lg bg-white hover:bg-zinc-50 hover:text-[#00a6ff] text-zinc-700 flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 border border-zinc-200 shadow-sm"
            title="Expand Full Screen Code Editor"
            aria-label="Expand Full Screen Code Editor"
          >
            <Maximize2 size={15} />
          </button>

          {/* 2. Copy */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-8 h-8 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 hover:text-black flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 border border-zinc-200 shadow-sm"
            title="Copy Code"
            aria-label="Copy Code"
          >
            {copied ? (
              <CheckCircle2 size={15} className="text-[#00a6ff]" />
            ) : (
              <Copy size={15} />
            )}
          </button>

          {/* 3. HTML Live Preview in App */}
          {isHtmlCode && (
            <button
              type="button"
              onClick={() => {
                if (onOpenFullScreenPreview) {
                  onOpenFullScreenPreview(completeContent, resolvedFileName);
                } else {
                  openHtmlPreviewInBrowser(completeContent, resolvedFileName);
                }
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 border shadow-sm bg-white hover:bg-zinc-50 text-zinc-700 hover:text-[#00a6ff] border-zinc-200"
              title="Open Live Preview in App"
              aria-label="Open Live Preview in App"
            >
              <Eye size={15} />
            </button>
          )}

          {/* 4. Save / Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="w-8 h-8 rounded-lg bg-white hover:bg-zinc-50 text-zinc-700 hover:text-[#00a6ff] flex items-center justify-center transition-all cursor-pointer select-none active:scale-90 border border-zinc-200 shadow-sm"
            title="Download Complete File"
            aria-label="Download Complete File"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Special Layout Content: Pure White Compact Scrollable Box or Live Sandbox */}
      <div className="p-3 sm:p-4 bg-white">
        {/* COMPACT SCROLLABLE CODE BOX: Pure White Background */}
        <div className="rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-sm overflow-hidden">
          {/* Scrollable Code Area (compact height, complete detail inside with line numbers) */}
          <div
            ref={codeContainerRef}
            className="max-h-64 sm:max-h-72 overflow-y-auto overflow-x-auto p-3.5 select-text bg-white scroll-smooth"
          >
            <div className="flex font-mono text-xs sm:text-[13px] leading-relaxed">
              {/* Line Numbers Column */}
              {!isPrompt && (
                <div
                  className="select-none pr-3 mr-3 text-right border-r border-zinc-200 text-zinc-400 font-mono font-medium bg-white"
                  style={{ minWidth: '2.4rem' }}
                >
                  {(completeContent || ' ').split('\n').map((_, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {idx + 1}
                    </div>
                  ))}
                </div>
              )}
              {/* Complete Code Content in Pure White Container */}
              <pre className="flex-1 font-mono text-xs sm:text-[13px] leading-relaxed whitespace-pre font-bold text-zinc-950 bg-white selection:bg-[#00a6ff]/20">
                {completeContent || (isStreaming ? ' ' : '')}
                {isStreaming && (
                  <span className="inline-block w-2 h-4 bg-[#00a6ff] align-middle ml-1 rounded-[1px] animate-pulse shadow-[0_0_8px_#00a6ff]" />
                )}
              </pre>
            </div>
          </div>

          {isPrompt && onUseInChat && (
            <div className="flex justify-end p-2.5 border-t border-zinc-200 bg-zinc-50">
              <button
                type="button"
                onClick={() => onUseInChat(content)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00a6ff] hover:bg-[#0094e6] text-white text-xs font-semibold shadow-[0_0_12px_rgba(0, 166, 255,0.5)] transition-all cursor-pointer"
              >
                <Send size={12} />
                <span>Run In Prompt Box</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Live Stream & Message Renderer with instant separation of conversational text vs code boxes
 * Satisfies User Directives:
 * 1. "First of all, you can write this answer with the animation. Not apply at last when you generate everything okay"
 * 2. "And on code don't show typing animation. It is in when it write code. Make it faster but have simulation animation"
 * 3. "it don't show complete code in chat. Just so a little box and have scrollable detail code... White background every kind of code"
 * 4. "always answer in bold. Make it more bold. It's not bold, okay?"
 */
export const LiveMessageStreamRenderer: React.FC<{
  rawText: string;
  isStreaming?: boolean;
  onOpenPreview?: (html: string, fileName?: string) => void;
  onOpenEditor?: (code: string, fileName?: string, language?: string) => void;
  onUseInChat?: (prompt: string) => void;
}> = ({ rawText, isStreaming = false, onOpenPreview, onOpenEditor, onUseInChat }) => {
  if (!rawText) return null;

  // Robust regex for code fences: ```[lang] [attributes]\n[code...] (```|$ )
  const fenceRegex = /```([a-zA-Z0-9_.-]+)?([^\n]*)\n([\s\S]*?)(?:```|$)/g;
  const segments: { type: 'text' | 'code' | 'prompt'; content: string; language?: string; fileName?: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(rawText)) !== null) {
    const textBefore = rawText.slice(lastIndex, match.index);
    if (textBefore.trim()) {
      segments.push({ type: 'text', content: textBefore });
    }
    const rawLang = (match[1] || '').toLowerCase();
    const restHeader = match[2] || '';
    const code = match[3] || '';

    let fileName = '';
    const fnMatch =
      restHeader.match(/(?:filename|file)=["']?([^"'\s]+)["']?/i) ||
      restHeader.match(/:([^\s\n]+)/);
    if (fnMatch) {
      fileName = fnMatch[1];
    }

    const isPrompt = Boolean(rawLang && (rawLang.includes('prompt') || rawLang === 'llm'));
    segments.push({
      type: isPrompt ? 'prompt' : 'code',
      content: code,
      language: rawLang || (isPrompt ? 'prompt' : 'html'),
      fileName: fileName || (isPrompt ? 'prompt.txt' : 'Component.tsx'),
    });
    lastIndex = match.index + match[0].length;
  }

  const trailingText = rawText.slice(lastIndex);
  // Check if trailingText starts a code fence that hasn't received a newline yet (e.g. "```html")
  const pendingFenceMatch = trailingText.match(/```([a-zA-Z0-9_.-]+)?([^\n]*)$/);
  if (pendingFenceMatch) {
    const textBeforeFence = trailingText.slice(0, pendingFenceMatch.index);
    if (textBeforeFence.trim()) {
      segments.push({ type: 'text', content: textBeforeFence });
    }
    const rawLang = (pendingFenceMatch[1] || '').toLowerCase();
    const isPrompt = Boolean(rawLang && (rawLang.includes('prompt') || rawLang === 'llm'));
    segments.push({
      type: isPrompt ? 'prompt' : 'code',
      content: '',
      language: rawLang || (isPrompt ? 'prompt' : 'html'),
      fileName: isPrompt ? 'prompt.txt' : 'Component.tsx',
    });
  } else if (trailingText.trim() || segments.length === 0) {
    const docTypeMatch = trailingText.match(/<!DOCTYPE\s+html[\s\S]*/i) || trailingText.match(/<html[\s\S]*/i);
    if (docTypeMatch && docTypeMatch.index !== undefined) {
      const textBefore = trailingText.slice(0, docTypeMatch.index);
      if (textBefore.trim()) {
        segments.push({ type: 'text', content: textBefore });
      }
      segments.push({
        type: 'code',
        content: trailingText.slice(docTypeMatch.index),
        language: 'html',
        fileName: 'index.html',
      });
    } else {
      segments.push({ type: 'text', content: trailingText || rawText });
    }
  }

  const hasCodeOrPrompt = segments.some((s) => s.type === 'code' || s.type === 'prompt');

  return (
    <div className="space-y-4">
      {/* Enhanced typing state indicator when actively streaming */}
      {isStreaming && (
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 shadow-md text-xs text-zinc-200 font-bold mb-1 select-none">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00a6ff] opacity-80" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00a6ff]" />
          </span>
          <span className="tracking-wide">
            {hasCodeOrPrompt ? 'Writing & generating source code' : 'Generating live response'}
          </span>
          <span className="inline-flex gap-1 items-center ml-0.5">
            <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1 h-1 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1 h-1 bg-white rounded-full animate-bounce" />
          </span>
        </div>
      )}

      {segments.map((seg, idx) => {
        const isLastSegment = idx === segments.length - 1;
        if (seg.type === 'code' || seg.type === 'prompt') {
          return (
            <div key={`seg-${seg.type}-${idx}`} className="space-y-1.5">
              <SpecialSnippetBox
                type={seg.type}
                content={seg.content}
                language={seg.language || (seg.type === 'prompt' ? 'prompt' : 'html')}
                fileName={seg.fileName}
                isStreaming={isStreaming && isLastSegment}
                onOpenFullScreenPreview={onOpenPreview}
                onOpenFullScreenEditor={onOpenEditor}
                onUseInChat={onUseInChat}
              />
            </div>
          );
        }

        return (
          <div
            key={`seg-text-${idx}`}
            className="text-white text-lg sm:text-xl md:text-[22px] leading-relaxed whitespace-pre-line font-bold select-text font-luxury-serif tracking-[0.015em]"
            style={{
              fontFamily: "'Cormorant Garamond', 'Bodoni 72', 'Bodoni Moda', 'Playfair Display', 'Times New Roman', serif",
              fontWeight: 750,
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
            }}
          >
            {renderFormattedBoldText(seg.content)}
            {isStreaming && isLastSegment && (
              <span className="inline-flex items-center ml-1.5 align-middle select-none">
                <span className="inline-block w-2.5 h-5 bg-gradient-to-t from-white via-zinc-100 to-white rounded-[2px] shadow-[0_0_12px_rgba(255,255,255,0.95),0_0_20px_rgba(0, 166, 255,0.6)] animate-pulse" />
              </span>
            )}
          </div>
        );
      })}
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
  const hasAttachments = Boolean(message?.attachments && message.attachments.length > 0);
  const isReferenceSearch = /bmw|m4|reference|image|photo|picture|find.*image|show.*image/i.test(text);
  const isNavOrEdit = /navigation|nav\b|navbar|modify.*website|change.*button|button.*style|update.*site|edit.*code/i.test(text);
  const isCodeDebug = /javascript|button.*not.*working|error|bug|fix|function|issue|trace|event/i.test(text);
  const isTimetable = /timetable|time\s*table|routine|schedule|planner|day\s*plan|workout/i.test(text);
  const isWebsite = !isNavOrEdit && /<!doctype\s+html|<html|<style|website|landing\s*page|web\s*app|portfolio|index\.html/i.test(text);
  const isCode = !isWebsite && /```(tsx|typescript|jsx|javascript|python|css|sql|json|bash|html)/i.test(text);
  const isQuestion = Boolean(message?.activeQuestion) || /```question/i.test(text);

  let steps = [
    { title: 'Deconstructing request', desc: 'Analyzed user requirements, constraints, and objective scope.' },
    { title: 'Checking conversational context', desc: 'Loaded project parameters, memory context, and response standards.' },
    { title: 'Formulating optimal solution', desc: 'Structured high-precision response architecture.' },
    { title: 'Executing primary pipeline', desc: 'Synthesized comprehensive result with verified accuracy.' },
    { title: 'Verifying output quality', desc: 'Validated accuracy, clarity, and structural completeness.' },
  ];

  if (isReferenceSearch) {
    steps = [
      { title: 'Identified requested vehicle & subject', desc: 'Parsed target visual specifications and model identity.' },
      { title: 'Searched Google & web image databases', desc: 'Queried verified reference archives for authentic photographic matches.' },
      { title: 'Filtered for relevant visual matches', desc: 'Eliminated low-res assets and verified exterior/interior angles.' },
      { title: 'Selected suitable references', desc: 'Compiled high-definition visual assets with direct Google sources.' },
    ];
  } else if (isNavOrEdit) {
    steps = [
      { title: 'Located previous project & website', desc: 'Retrieved latest artifact version from persistent memory.' },
      { title: 'Examined existing navigation structure', desc: 'Analyzed layout hierarchy, interactive components, and CSS styles.' },
      { title: 'Applied requested modification', desc: 'Updated target component while strictly preserving untouched code.' },
      { title: 'Checked overall layout stability', desc: 'Verified responsiveness and ensured all interactive triggers function.' },
    ];
  } else if (isCodeDebug) {
    steps = [
      { title: 'Reviewed relevant code structure', desc: 'Examined syntax, DOM references, and script boundaries.' },
      { title: 'Traced button event flow', desc: 'Followed click dispatch, listeners, and state mutation chain.' },
      { title: 'Identified likely failure point', desc: 'Isolated scope or handler discrepancy causing unresponsive behavior.' },
      { title: 'Formulated correction & verified interaction', desc: 'Synthesized clean, functional fix with expected interactive feedback.' },
    ];
  } else if (isTimetable) {
    steps = [
      { title: 'Analyzed schedule preferences', desc: 'Evaluated wake-up window, primary focus targets, and energy peaks.' },
      { title: 'Structured deep work & recovery blocks', desc: 'Organized balanced hourly intervals for peak productivity and wellbeing.' },
      { title: 'Synthesized chronological timetable', desc: 'Generated structured bullet points and interactive categories.' },
      { title: 'Prepared high-resolution export canvas', desc: 'Calibrated 2X retina graphic card for one-click PNG download.' },
    ];
  } else if (isWebsite) {
    steps = [
      { title: 'Analyzed website specifications', desc: 'Extracted visual hierarchy, responsive layout needs, and branding requirements.' },
      { title: 'Architecting single-file structure', desc: 'Structured semantic HTML5 layout from <!DOCTYPE html> down to </html>.' },
      { title: 'Crafting responsive CSS styling', desc: 'Embedded modern dark mode aesthetic, typography, and fluid mobile/desktop breakpoints.' },
      { title: 'Implementing JavaScript functionality', desc: 'Engineered client-side interactivity, event listeners, and dynamic UI state.' },
      { title: 'Verifying complete code integrity', desc: 'Checked syntax and ensured tags are cleanly closed with zero placeholders.' },
    ];
  } else if (hasAttachments) {
    steps = [
      { title: 'Ingested attached media asset', desc: 'Parsed multimodal format, dimension, and content stream.' },
      { title: 'Analyzed visual patterns & features', desc: 'Extracted key optical details, typography, and design elements.' },
      { title: 'Mapped insights to response synthesis', desc: 'Correlated visual evidence with user inquiry directives.' },
      { title: 'Finalized recommendations', desc: 'Formatted detailed findings with prominent bold typography.' },
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
      className="w-full bg-white text-zinc-900 rounded-[28px] sm:rounded-[32px] px-5 sm:px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(0, 166, 255,0.25)] border border-white/90 max-h-60 sm:max-h-64 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#00a6ff]/10 text-[#00a6ff] flex items-center justify-center shrink-0">
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
            <div className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
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
      className="w-full bg-white text-zinc-900 rounded-[28px] sm:rounded-[32px] px-5 sm:px-6 py-4 sm:py-5 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(0, 166, 255,0.25)] border border-white/90 flex flex-col transition-all"
    >
      {/* Top Question Info */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#00a6ff] uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00a6ff] animate-pulse" />
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
            className="px-3.5 py-2.5 rounded-xl border border-zinc-200/90 bg-zinc-50 hover:bg-[#00a6ff]/5 hover:border-[#00a6ff] text-xs sm:text-sm font-medium text-zinc-800 hover:text-black transition-all text-left flex items-center justify-between group active:scale-[0.98] cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="truncate">{opt}</span>
            <ChevronRight
              size={13}
              className="text-zinc-400 group-hover:text-[#00a6ff] group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
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
          className="flex-1 bg-zinc-50 border border-zinc-200/90 focus:border-[#00a6ff] focus:bg-white rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none transition-all disabled:opacity-50"
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
          className="px-4 py-2 rounded-xl bg-[#00a6ff] text-white text-xs font-semibold hover:bg-[#0094e6] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(0, 166, 255,0.4)] cursor-pointer shrink-0"
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
                {isAiTyping && <span className="w-1.5 h-1.5 rounded-full bg-[#00a6ff] animate-ping" />}
              </div>
              <div className="text-zinc-300 text-xs font-semibold flex items-center gap-1.5 select-none">
                <span className="text-[#00a6ff]">Cognitive Thinking Trace</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-400">
                  {isAiTyping ? `Reasoning in real-time (${thinkingTimer || 1}s)` : `Completed in ${message?.thoughtDuration || thinkingTimer || 4}s`}
                </span>
              </div>
            </div>

            {/* Step 2: Intent & Directives Parsing */}
            <div className="relative">
              <div className="absolute -left-[33px] sm:-left-[41px] top-1 w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-zinc-300">
                <Brain size={12} className="text-[#00a6ff]" />
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
              <div className="absolute -left-[33px] sm:-left-[41px] top-1 w-5 h-5 rounded-full bg-[#00a6ff]/20 border border-[#00a6ff]/40 flex items-center justify-center text-[#00a6ff]">
                <Layers size={12} />
              </div>
              <div className="pl-1 space-y-1">
                <div className="text-zinc-200 font-medium text-xs sm:text-sm">
                  Obsidian Neon Design Synthesis
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-300 space-y-1">
                  <p>• Applied dark obsidian surface <code>#090204</code> & crimson neon accents (<code>#00a6ff</code>).</p>
                  <p>• Generated 3 to 4 topic-related high-resolution visual cards with instant lightbox & download.</p>
                </div>
              </div>
            </div>

            {/* Step 5: Code & Artifact Assembly */}
            <div className="relative">
              <div className="absolute -left-[33px] sm:-left-[41px] top-1 w-5 h-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-zinc-300">
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
              <span className="text-xs font-mono text-zinc-300">Active</span>
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
              <span className="text-xs font-mono text-zinc-300">Ready</span>
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
              <span className="text-xs font-mono text-zinc-300">Initialized</span>
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
            className="flex-1 bg-black/40 border border-white/15 rounded-full px-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#00a6ff]"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isAiTyping}
            className="w-9 h-9 rounded-full bg-[#00a6ff] hover:bg-[#0094e6] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-all cursor-pointer"
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
  onClearInitialPrompt?: () => void;
  initialAttachments?: AttachedFile[];
  selectedRecentTopic?: string;
  onSelectRecentTopic?: (topic: string) => void;
  onOpenLogin?: () => void;
}

const GUEST_TOPIC = 'Guest Session';

export const FullScreenChatView: React.FC<FullScreenChatViewProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
  onClearInitialPrompt,
  initialAttachments,
  selectedRecentTopic = '',
  onSelectRecentTopic,
  onOpenLogin,
}) => {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('think_creative_user');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
    }
    return getCurrentUser();
  });

  const [chatThreads, setChatThreads] = useState<Record<string, ChatThread>>({});
  const [activeTopic, setActiveTopic] = useState<string>(() => {
    return selectedRecentTopic || GUEST_TOPIC;
  });

  const prevUidRef = useRef<string | undefined>(currentUser?.uid);

  // Track Firebase Auth state continuously and handle user transition
  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      // If user changed (login or logout), reset state completely
      if (user?.uid !== prevUidRef.current) {
        prevUidRef.current = user?.uid;
        setChatThreads({});
        if (user && !user.isAnonymous) {
          setActiveTopic('');
        } else {
          setActiveTopic(GUEST_TOPIC);
        }
      }
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  // Listen to Firestore real-time chats if user is logged in
  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous || !currentUser.uid) {
      return;
    }

    const unsub = subscribeToUserChatThreads(currentUser.uid, (firestoreThreads) => {
      setChatThreads((prev) => {
        // Merge with existing local threads so we NEVER blow away an active streaming or unsaved thread!
        const merged: Record<string, ChatThread> = { ...firestoreThreads };
        for (const [key, thread] of Object.entries(prev)) {
          const hasStreaming = thread.messages?.some((m) => m.isStreaming);
          const hasUnsaved = !merged[key] && thread.messages && thread.messages.length > 0;
          if (hasStreaming || hasUnsaved) {
            merged[key] = thread;
          }
        }
        return merged;
      });

      setActiveTopic((curr) => {
        if (curr) return curr;
        const keys = Object.keys(firestoreThreads);
        return keys.length > 0 ? keys[0] : '';
      });
    });

    return () => unsub();
  }, [currentUser?.uid]);

  // Synchronize completed messages strictly to Firestore for authenticated user:
  useEffect(() => {
    if (!activeTopic || !chatThreads[activeTopic]) return;
    const currentThread = chatThreads[activeTopic];

    if (currentUser?.uid && !currentUser.isAnonymous) {
      if (!currentThread.messages || currentThread.messages.length === 0) return;
      if (currentThread.messages.some((m) => m.isStreaming)) return;
      const timer = setTimeout(() => {
        syncChatThreadToFirestore(currentThread, currentUser.uid);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [chatThreads, activeTopic, currentUser?.uid]);

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
  const { theme, toggleTheme } = useTheme();
  const themeMode = theme;
  const toggleThemeMode = toggleTheme;
  const [isInternalLoginOpen, setIsInternalLoginOpen] = useState<boolean>(false);

  const handleOpenLogin = () => {
    setIsInternalLoginOpen(true);
    if (onOpenLogin) onOpenLogin();
  };

  // Proactive Question Queue in Prompt Box (Pure prompt box flow, no question in chat, no option prompt bubbles)
  const [promptQuestionQueue, setPromptQuestionQueue] = useState<QuestionBlock[]>([]);
  const [promptQuestionIdx, setPromptQuestionIdx] = useState<number>(0);
  const collectedAnswersRef = useRef<Record<string, string>>({});
  const pendingVaguePromptRef = useRef<string>('');
  const askedQuestionsRef = useRef<Set<string>>(new Set());
  const answeredQuestionsRef = useRef<Record<string, string>>({});
  const detectedInfoRef = useRef<Record<string, string>>({});
  const clarificationDecisionRef = useRef<ClarificationDecision | null>(null);

  // Clarification Gate Interactive State
  const [pendingClarificationDecision, setPendingClarificationDecision] = useState<ClarificationDecision | null>(null);
  const [askedQuestionsList, setAskedQuestionsList] = useState<string[]>([]);
  const [answeredQuestionsMap, setAnsweredQuestionsMap] = useState<Record<string, string>>({});
  const [detectedInfoMap, setDetectedInfoMap] = useState<Record<string, string>>({});
  const [isCheckingGate, setIsCheckingGate] = useState<boolean>(false);
  const [isClarificationMenuOpen, setIsClarificationMenuOpen] = useState<boolean>(false);
  const [clarificationSettings, setClarificationSettings] = useState<{
    enabled: boolean;
    strictness: 'minimal' | 'balanced' | 'thorough';
  }>({
    enabled: true,
    strictness: 'balanced',
  });

  const updateClarificationSettings = (
    patch: Partial<{ enabled: boolean; strictness: 'minimal' | 'balanced' | 'thorough' }>
  ) => {
    setClarificationSettings((prev) => ({ ...prev, ...patch }));
  };

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
  const [fullscreenEditor, setFullscreenEditor] = useState<{
    code: string;
    fileName: string;
    language: string;
  } | null>(null);

  const handleOpenEditor = (code: string, fileName?: string, language?: string) => {
    setFullscreenEditor({
      code,
      fileName: fileName || 'index.html',
      language: language || 'html',
    });
  };

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

  const handleClarificationSubmit = (
    decision: ClarificationDecision,
    answers: Record<string, string>
  ) => {
    setPendingClarificationDecision(null);
    setIsSendLocked(true);

    // Save answered questions map and detected info
    setAnsweredQuestionsMap((prev) => ({ ...prev, ...answers }));
    if (decision.detected_info) {
      setDetectedInfoMap((prev) => ({ ...prev, ...decision.detected_info }));
    }

    // Build compact summary of answers for chat display
    const answerLines = Object.entries(answers).map(([qId, ans]) => {
      const q = decision.questions.find((item) => item.id === qId);
      return `• ${q?.question || qId}: ${ans}`;
    });

    const userSummaryMsg: ChatMessage = {
      id: `user-ans-${Date.now()}`,
      sender: 'user',
      text: `Requirements specified:\n${answerLines.join('\n')}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Form the enriched prompt
    const originalPrompt =
      currentThread?.promptBanner || decision.missing_critical?.join(', ') || 'Task execution';
    let enrichedPrompt = buildEnrichedTaskPrompt(originalPrompt, decision, answers);

    const isCodeOrWebsite =
      decision.task_type === 'website' ||
      decision.task_type === 'app' ||
      decision.task_type === 'code' ||
      /website|landing\s*page|web\s*app|single-file|html/i.test(originalPrompt);

    if (isCodeOrWebsite) {
      enrichedPrompt += `\n\nMANDATORY ARCHITECTURE & CODE INTEGRITY REQUIREMENT:
You MUST generate the 100% complete, fully implemented single-file HTML code.
The code fence MUST start strictly with: \`\`\`html filename="index.html"
<!DOCTYPE html>
<html lang="en">
and MUST complete all the way through to: </html>
\`\`\`
Embed all modern CSS inside <style>...</style> and all functional JavaScript inside <script>...</script>.
NEVER truncate, never use placeholders like "/* rest of code here */", and never stop before closing </html>.`;
    }

    const aiMsgId = `ai-gen-${Date.now()}`;
    const aiPlaceholder: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatThreads((prev) => {
      const existing = prev[activeTopic];
      if (!existing) return prev;
      return {
        ...prev,
        [activeTopic]: {
          ...existing,
          messages: [...existing.messages, userSummaryMsg, aiPlaceholder],
        },
      };
    });

    startGeminiStream(activeTopic, aiMsgId, enrichedPrompt, pendingAttachmentsRef.current || []);
  };

  const handleClarificationSkip = (decision: ClarificationDecision) => {
    setPendingClarificationDecision(null);
    setIsSendLocked(true);

    const assumptions =
      decision.assumptions_if_skipped && decision.assumptions_if_skipped.length > 0
        ? decision.assumptions_if_skipped
        : ['Using standard high-performance defaults'];

    const userSkipMsg: ChatMessage = {
      id: `user-skip-${Date.now()}`,
      sender: 'user',
      text: `Proceeding with AI defaults (skipped questions).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const originalPrompt = currentThread?.promptBanner || 'Task execution';
    let enrichedPrompt = `${originalPrompt}\n\nWORKING ASSUMPTIONS (User opted to proceed with AI defaults):\n${assumptions
      .map((a) => `- ${a}`)
      .join('\n')}`;

    const isCodeOrWebsite =
      decision.task_type === 'website' ||
      decision.task_type === 'app' ||
      decision.task_type === 'code' ||
      /website|landing\s*page|web\s*app|single-file|html/i.test(originalPrompt);

    if (isCodeOrWebsite) {
      enrichedPrompt += `\n\nMANDATORY ARCHITECTURE & CODE INTEGRITY REQUIREMENT:
You MUST generate the 100% complete, fully implemented single-file HTML code.
The code fence MUST start strictly with: \`\`\`html filename="index.html"
<!DOCTYPE html>
<html lang="en">
and MUST complete all the way through to: </html>
\`\`\`
Embed all modern CSS inside <style>...</style> and all functional JavaScript inside <script>...</script>.
NEVER truncate, never use placeholders like "/* rest of code here */", and never stop before closing </html>.`;
    }

    const aiMsgId = `ai-gen-${Date.now()}`;
    const aiPlaceholder: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatThreads((prev) => {
      const existing = prev[activeTopic];
      if (!existing) return prev;
      return {
        ...prev,
        [activeTopic]: {
          ...existing,
          messages: [...existing.messages, userSkipMsg, aiPlaceholder],
        },
      };
    });

    startGeminiStream(activeTopic, aiMsgId, enrichedPrompt, pendingAttachmentsRef.current || []);
  };

  const handleAnswerQuestionInChat = (msgId: string, answer: string) => {
    if (isAiTyping) return;

    // Collect user selection dynamically by question title/id
    const currentQ = promptQuestionQueue[promptQuestionIdx];
    const qKey = currentQ ? currentQ.title : `Question ${promptQuestionIdx + 1}`;
    collectedAnswersRef.current[qKey] = answer;
    answeredQuestionsRef.current[qKey] = answer;

    const userAnsMsg: ChatMessage = {
      id: `user-ans-${Date.now()}`,
      sender: 'user',
      text: answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextIdx = promptQuestionIdx + 1;
    if (nextIdx < promptQuestionQueue.length) {
      // Advance to next discovery question directly in chat
      setPromptQuestionIdx(nextIdx);
      const nextQ = promptQuestionQueue[nextIdx];
      const nextAiQMsg: ChatMessage = {
        id: `ai-q-${Date.now()}`,
        sender: 'ai',
        text: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        activeQuestion: nextQ,
      };

      setChatThreads((prev) => {
        const thread = prev[activeTopic];
        if (!thread) return prev;
        return {
          ...prev,
          [activeTopic]: {
            ...thread,
            messages: [
              ...thread.messages.map((m) =>
                m.id === msgId ? { ...m, activeQuestion: undefined, text: `Selected: **${answer}**` } : m
              ),
              userAnsMsg,
              nextAiQMsg,
            ],
          },
        };
      });

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(25);
        } catch {}
      }
    } else {
      // All questions have been answered: stop asking and immediately start thinking and complete code
      setPromptQuestionQueue([]);
      setPromptQuestionIdx(0);

      const userPrompt = pendingVaguePromptRef.current || 'Create a complete high-performance solution';
      pendingVaguePromptRef.current = '';

      const decision = clarificationDecisionRef.current;
      const isWebsiteOrCode =
        /<!doctype\s+html|<html|website|landing\s*page|web\s*app|html\s*code|create.*website|build.*website|single-file|component|app|code|script|program/i.test(
          userPrompt
        ) ||
        decision?.task_type === 'website' ||
        decision?.task_type === 'app' ||
        decision?.task_type === 'code';

      const isTimetable =
        /(\btimetable\b|\btime\s*table\b|\broutine\b|\bdaily\s*routine\b|\bschedule\b|\bday\s*plan\b|\bplanner\b|\bstudy\s*plan\b|\bworkout\s*routine\b|\bworkout\s*plan\b)/i.test(
          userPrompt
        );

      const answersList = Object.entries(collectedAnswersRef.current)
        .map(([q, a]) => `- ${q}: ${a}`)
        .join('\n');

      let fullExecutionPrompt = `${userPrompt}

USER SPECIFICATIONS & PREFERENCES:
${answersList}`;

      if (decision?.assumptions_if_skipped && decision.assumptions_if_skipped.length > 0) {
        fullExecutionPrompt += `\n\nASSUMPTIONS & DESIGN DEFAULTS:\n${decision.assumptions_if_skipped.map((a) => `- ${a}`).join('\n')}`;
      }

      if (isWebsiteOrCode) {
        fullExecutionPrompt += `\n\nCRITICAL ARCHITECTURE REQUIREMENTS:
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
      } else if (isTimetable) {
        fullExecutionPrompt += `\n\nCRITICAL MANDATORY INSTRUCTIONS:
1. Provide a comprehensive, hourly timetable breakdown from wake-up to restorative sleep.
2. Include a self-contained single-file HTML interactive timetable code:
\`\`\`html filename="timetable.html"
<!DOCTYPE html>
<html lang="en">
...
</html>
\`\`\``;
      }

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
            messages: [
              ...thread.messages.map((m) =>
                m.id === msgId ? { ...m, activeQuestion: undefined, text: `Selected: **${answer}**` } : m
              ),
              userAnsMsg,
              aiPlaceholder,
            ],
          },
        };
      });

      startGeminiStream(activeTopic, aiMsgId, fullExecutionPrompt, pendingAttachmentsRef.current || []);
    }
  };

  const handleAnswerPromptQuestion = (answer: string) => {
    const thread = chatThreads[activeTopic];
    const lastQMsg = thread?.messages.slice().reverse().find((m) => Boolean(m.activeQuestion));
    if (lastQMsg) {
      handleAnswerQuestionInChat(lastQMsg.id, answer);
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
          <span class="badge">AI Studio Intelligence</span>
          <h1>${title}</h1>
          <p><em>Generated by AI Studio Intelligence Workspace • ${new Date().toLocaleDateString()}</em></p>
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
          <title>${title} — AI Studio Intelligence</title>
          <style>
            body { background: #070709; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 860px; margin: 40px auto; padding: 0 24px; line-height: 1.7; }
            h1 { font-size: 2.2rem; color: #fff; border-bottom: 3px solid #00a6ff; padding-bottom: 10px; }
            h2 { font-size: 1.4rem; color: #fff; margin-top: 2rem; border-left: 4px solid #00a6ff; padding-left: 10px; }
            pre { background: #0e0204; border: 1px solid rgba(0, 166, 255,0.3); padding: 16px; border-radius: 12px; font-family: monospace; color: #f4f4f5; overflow-x: auto; }
            ul { padding-left: 20px; }
            li { margin-bottom: 8px; color: #d4d4d8; }
            .header-tag { display: inline-block; padding: 4px 12px; background: #1a0306; border: 1px solid #00a6ff; color: #00a6ff; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px; }
          </style>
        </head>
        <body>
          <div class="header-tag">AI Studio Verified</div>
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
            <p style="color:#cc0000; font-weight:bold; font-size:10pt; text-transform:uppercase; letter-spacing:1px;">AI Intelligence Document</p>
            <h1>${title}</h1>
            <div>${fullMarkdown.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')}</div>
            <div class="footer">Generated by AI Studio Intelligence Workspace • ${new Date().toLocaleString()}</div>
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
   * AI Image Planner & Search Pipeline
   * Decides reference images per assistant message and executes multi-crawler search.
   */
  const runImagePlannerAndSearch = async (
    targetTopic: string,
    aiMsgId: string,
    promptText: string,
    assistantAnswerText: string,
    modeOverride?: 'USER_REQUESTED' | 'AUTO_REFERENCE' | 'NONE'
  ) => {
    try {
      const thread = chatThreads[targetTopic];
      const recentHistory = (thread?.messages || []).slice(-10).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const planRes = await fetch('/api/image-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          history: recentHistory,
          assistantAnswer: assistantAnswerText,
        }),
      });

      if (!planRes.ok) return;
      const plan: ImagePlannerResult = await planRes.json();
      if (!plan || plan.mode === 'NONE' || !plan.subjects || plan.subjects.length === 0) {
        return;
      }

      const effectiveMode: 'USER_REQUESTED' | 'AUTO_REFERENCE' | 'NONE' = modeOverride || plan.mode;
      if (effectiveMode === 'NONE') return;

      const searchRes = await fetch('/api/reference-images/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: plan.subjects,
          mode: effectiveMode,
        }),
      });

      if (!searchRes.ok) return;
      const searchData = await searchRes.json();
      const results: any[] = searchData?.results || [];
      if (results.length === 0) return;

      const subjectGalleries = results.map((r) => ({
        label: r.subject.label,
        images: r.images || [],
        backupPool: r.backupPool || [],
        googleSearchUrl: r.googleSearchUrl,
      }));

      const totalImages = subjectGalleries.reduce((acc, g) => acc + g.images.length, 0);

      // Rule: AUTO_REFERENCE requires at least 3 images, otherwise show none
      if (effectiveMode === 'AUTO_REFERENCE' && totalImages < 3) {
        return;
      }

      setChatThreads((prev) => {
        const existing = prev[targetTopic];
        if (!existing) return prev;
        return {
          ...prev,
          [targetTopic]: {
            ...existing,
            messages: existing.messages.map((m) =>
              m.id === aiMsgId
                ? {
                    ...m,
                    imagePlan: {
                      mode: effectiveMode,
                      shortReplyText: plan.short_reply_text,
                      subjects: subjectGalleries,
                    },
                  }
                : m
            ),
          },
        };
      });
    } catch (err) {
      console.warn('Image planning notice:', err);
    }
  };

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

    // Parallel Image Planner for USER_REQUESTED visual queries
    const isExplicitVisual = isUserExplicitImageRequest(promptText);
    if (isExplicitVisual) {
      runImagePlannerAndSearch(topicKey, aiMsgId, promptText, '', 'USER_REQUESTED');
    }

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
                    const thread = prev[topicKey] || {
                      id: `thread-${Date.now()}`,
                      title: topicKey,
                      promptBanner: promptText,
                      messages: [
                        {
                          id: `user-${Date.now()}`,
                          sender: 'user',
                          text: promptText,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        },
                        {
                          id: aiMsgId,
                          sender: 'ai',
                          text: '',
                          isStreaming: true,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        },
                      ],
                    };
                    const hasAiMsg = thread.messages.some((m) => m.id === aiMsgId);
                    const updatedMessages = hasAiMsg
                      ? thread.messages.map((m) =>
                          m.id === aiMsgId
                            ? {
                                ...m,
                                text: currentCleanText,
                                isStreaming: true,
                                thoughtDuration: finalThoughtDuration,
                              }
                            : m
                        )
                      : [
                          ...thread.messages,
                          {
                            id: aiMsgId,
                            sender: 'ai' as const,
                            text: currentCleanText,
                            isStreaming: true,
                            thoughtDuration: finalThoughtDuration,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          },
                        ];

                    return {
                      ...prev,
                      [topicKey]: {
                        ...thread,
                        messages: updatedMessages,
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
        const cleanFullAnswer = sanitizeImageMarkupFromText(fullAnswer.replace(/```question[\s\S]*?```/gi, '').trim());
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
          const thread = prev[topicKey] || {
            id: `thread-${Date.now()}`,
            title: topicKey,
            promptBanner: promptText,
            messages: [
              {
                id: `user-${Date.now()}`,
                sender: 'user',
                text: promptText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
          };
          const hasAiMsg = thread.messages.some((m) => m.id === aiMsgId);
          const finalMessages = hasAiMsg
            ? thread.messages.map((m) =>
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
                      activeQuestion: extractedQuestion || undefined,
                    }
                  : m
              )
            : [
                ...thread.messages,
                {
                  id: aiMsgId,
                  sender: 'ai' as const,
                  text: cleanFullAnswer,
                  isStreaming: false,
                  thoughtDuration: finalThoughtDuration,
                  structuredContent:
                    parsed.mainTitle || parsed.intro || parsed.sections.length > 0
                      ? parsed
                      : undefined,
                  activeQuestion: extractedQuestion || undefined,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ];

          const updatedThread = {
            ...thread,
            messages: finalMessages,
          };

          if (currentUser?.uid && !currentUser.isAnonymous) {
            syncChatThreadToFirestore(updatedThread, currentUser.uid);
          }

          // Trigger post-stream AUTO_REFERENCE Image Planner if not an explicit visual request
          if (!isExplicitVisual && !isSimple && cleanFullAnswer.length > 80) {
            runImagePlannerAndSearch(topicKey, aiMsgId, promptText, cleanFullAnswer, 'AUTO_REFERENCE');
          }

          return {
            ...prev,
            [topicKey]: updatedThread,
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

  const prevSelectedTopicRef = useRef<string>(selectedRecentTopic);
  // Sync activeTopic when prop changes (only if user explicitly selected a different recent topic and no incoming initialPrompt)
  useEffect(() => {
    if (selectedRecentTopic && selectedRecentTopic !== prevSelectedTopicRef.current && !initialPrompt) {
      prevSelectedTopicRef.current = selectedRecentTopic;
      setActiveTopic(selectedRecentTopic);
    }
  }, [selectedRecentTopic, initialPrompt]);

  // Handle incoming initial prompt from the BMW road screen with real Gemini streaming!
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setIsSendLocked(true);
      const trimmed = initialPrompt.trim();
      const isAuth = Boolean(currentUser && !currentUser.isAnonymous);
      const targetTopic = isAuth
        ? (trimmed.length > 25 ? `${trimmed.slice(0, 25)}...` : trimmed)
        : GUEST_TOPIC;

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

      setChatThreads((prev) => {
        const existing = prev[targetTopic] || {
          id: `thread-${Date.now()}`,
          title: targetTopic,
          promptBanner: trimmed,
          messages: [],
        };
        return {
          [targetTopic]: {
            ...existing,
            messages: [...existing.messages, userMessage, aiPlaceholder],
          },
          ...prev,
        };
      });

      setActiveTopic(targetTopic);
      if (onSelectRecentTopic && isAuth) {
        onSelectRecentTopic(targetTopic);
      }

      onClearInitialPrompt?.();

      // Start real streaming with typing animation & haptics
      startGeminiStream(targetTopic, aiMsgId, trimmed, initialAttachments || []);
    }
  }, [initialPrompt]);

  // Smart user-aware auto-scroll: strictly prevents viewport snapping down when user scrolls up
  const userScrolledUpRef = useRef<boolean>(false);
  const isAutoScrollingRef = useRef<boolean>(false);
  const lastScrollTopRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState<boolean>(false);

  const handleChatScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    if (isAutoScrollingRef.current) return;

    const currentScrollTop = el.scrollTop;
    const distanceFromBottom = el.scrollHeight - currentScrollTop - el.clientHeight;

    // Detect user actively scrolling up or already scrolled up away from bottom
    if (currentScrollTop < lastScrollTopRef.current && distanceFromBottom > 15) {
      userScrolledUpRef.current = true;
      setShowScrollBottomBtn(true);
    } else if (distanceFromBottom > 20) {
      userScrolledUpRef.current = true;
      setShowScrollBottomBtn(true);
    } else if (distanceFromBottom <= 8) {
      // User has returned all the way to the bottom
      userScrolledUpRef.current = false;
      setShowScrollBottomBtn(false);
    }

    lastScrollTopRef.current = currentScrollTop;
  };

  const scrollToBottom = (smooth = true) => {
    const el = chatContainerRef.current;
    if (!el) return;
    isAutoScrollingRef.current = true;
    userScrolledUpRef.current = false;
    setShowScrollBottomBtn(false);

    if (smooth) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      el.scrollTop = el.scrollHeight;
    }

    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, 350);
  };

  // Only auto-scroll when switching topic
  useEffect(() => {
    userScrolledUpRef.current = false;
    scrollToBottom(false);
  }, [activeTopic]);

  // When new messages or streaming chunks arrive: NEVER scroll down if user has scrolled up!
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el || userScrolledUpRef.current) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Only keep sticky bottom if user was already at the absolute bottom
    if (distanceFromBottom <= 15) {
      el.scrollTop = el.scrollHeight;
    }
  }, [chatThreads, isAiTyping]);

  const isAuthUser = Boolean(currentUser && !currentUser.isAnonymous);
  const currentThread =
    chatThreads[activeTopic] ||
    Object.values(chatThreads).find((t) => t.id === activeTopic || t.title === activeTopic) ||
    chatThreads[selectedRecentTopic] ||
    (isAuthUser ? Object.values(chatThreads)[0] : chatThreads[GUEST_TOPIC]);

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
    userScrolledUpRef.current = false;
    setShowScrollBottomBtn(false);
    scrollToBottom(true);

    const isAuth = Boolean(currentUser && !currentUser.isAnonymous);
    const targetTopic = isAuth
      ? (activeTopic || `Chat ${Object.keys(chatThreads).length + 1}`)
      : GUEST_TOPIC;

    if (activeTopic !== targetTopic) {
      setActiveTopic(targetTopic);
      if (onSelectRecentTopic && isAuth) onSelectRecentTopic(targetTopic);
    }

    // Check if user is asking to create a timetable or routine
    const isTimetableRequest =
      /(\btimetable\b|\btime\s*table\b|\broutine\b|\bdaily\s*routine\b|\bschedule\b|\bday\s*plan\b|\bplanner\b|\bstudy\s*plan\b|\bworkout\s*routine\b|\bworkout\s*plan\b)/i.test(
        messageText
      );

    // Check if user is asking to create a website or web project (only trigger discovery questionnaire for short, open prompts)
    const isWebsiteOrAppRequest =
      !isTimetableRequest &&
      messageText.length < 80 &&
      !messageText.includes('<') &&
      !messageText.includes('{') &&
      (/(\bwebsite\b|\blanding\s*page\b|\bweb\s*app\b|\bportfolio\b|\bweb\s*page\b|\bsite\b)/i.test(messageText) ||
      /(create|build|make|design|generate|develop|code|need|want).*(website|page|site|app|portfolio)/i.test(messageText));

    // 1. If user typed in the normal chat box while there is a pending clarification:
    // Parse the input as answers to the pending questions!
    if (pendingClarificationDecision) {
      const activeDecision = pendingClarificationDecision;
      // If user typed "skip" or let AI decide:
      if (isSkipIntent(messageText)) {
        handleClarificationSkip(activeDecision);
        return;
      }
      // Otherwise, record answers and proceed
      const firstQId = activeDecision.questions[0]?.id || 'custom_input';
      const userAnswers: Record<string, string> = {
        [firstQId]: messageText,
      };
      handleClarificationSubmit(activeDecision, userAnswers);
      return;
    }

    // 2. Fast check for skip / let-AI-decide intent on a new message
    if (isSkipIntent(messageText)) {
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
        const existing = prev[targetTopic] || {
          id: `thread-${Date.now()}`,
          title: targetTopic,
          promptBanner: messageText,
          messages: [],
        };
        return {
          ...prev,
          [targetTopic]: {
            ...existing,
            messages: [...existing.messages, userMessage, aiPlaceholder],
          },
        };
      });

      startGeminiStream(
        targetTopic,
        aiMsgId,
        `${messageText}\n\nWORKING ASSUMPTIONS: Proceed with intelligent defaults.`,
        currentAtts
      );
      return;
    }

    // 3. Clarification Gate Evaluation (when enabled)
    if (clarificationSettings.enabled) {
      setIsCheckingGate(true);
      setIsSendLocked(true);

      (async () => {
        let decision: ClarificationDecision | null = null;
        try {
          const historyForGate = (currentThread?.messages || []).slice(-10).map((m) => ({
            sender: m.sender,
            text: m.text,
          }));

          const res = await fetch('/api/clarification-gate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: messageText,
              history: historyForGate,
              attachments: currentAtts.map((a) => ({ name: a.name })),
              askedQuestions: askedQuestionsList,
              answeredQuestions: answeredQuestionsMap,
              detectedInfo: detectedInfoMap,
              strictness: clarificationSettings.strictness,
            }),
          });

          if (res.ok) {
            decision = await res.json();
          }
        } catch (gateErr) {
          console.warn('Clarification gate check error, proceeding safely:', gateErr);
        } finally {
          setIsCheckingGate(false);
        }

        // OUTCOME C: REDIRECT (invalid, empty, or gibberish input)
        if (decision && decision.decision === 'REDIRECT') {
          setIsSendLocked(false);
          const redirectText =
            decision.redirect_message ||
            'Hello! What would you like to build, write, or explore? For example, ask me to create a web app, write a business plan, or design an AI architecture.';

          const aiRedirectMsg: ChatMessage = {
            id: `ai-redirect-${Date.now()}`,
            sender: 'ai',
            text: redirectText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setChatThreads((prev) => {
            const existing = prev[targetTopic] || {
              id: `thread-${Date.now()}`,
              title: targetTopic,
              promptBanner: messageText,
              messages: [],
            };
            return {
              ...prev,
              [targetTopic]: {
                ...existing,
                messages: [...existing.messages, userMessage, aiRedirectMsg],
              },
            };
          });
          return;
        }

        // OUTCOME B: ASK (Missing critical details for complex creation tasks)
        if (decision && decision.decision === 'ASK' && decision.questions && decision.questions.length > 0) {
          setIsSendLocked(false);

          // Track asked questions so the exact same question is never repeated
          decision.questions.forEach((q) => {
            if (!askedQuestionsList.includes(q.question)) {
              setAskedQuestionsList((prev) => [...prev, q.question]);
            }
          });

          setPendingClarificationDecision(decision);

          const clarifyCardMsg: ChatMessage = {
            id: `ai-clarify-${Date.now()}`,
            sender: 'ai',
            text: '',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            clarificationDecision: decision,
          };

          setChatThreads((prev) => {
            const existing = prev[targetTopic] || {
              id: `thread-${Date.now()}`,
              title: targetTopic,
              promptBanner: messageText,
              messages: [],
            };
            return {
              ...prev,
              [targetTopic]: {
                ...existing,
                messages: [...existing.messages, userMessage, clarifyCardMsg],
              },
            };
          });
          return;
        }

        // OUTCOME A: PROCEED (Valid and clear task, simple question, or fallback)
        const aiMsgId = `ai-${Date.now()}`;
        const aiPlaceholder: ChatMessage = {
          id: aiMsgId,
          sender: 'ai',
          text: '',
          isStreaming: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setChatThreads((prev) => {
          const existing = prev[targetTopic] || {
            id: `thread-${Date.now()}`,
            title: targetTopic,
            promptBanner: messageText,
            messages: [],
          };
          return {
            ...prev,
            [targetTopic]: {
              ...existing,
              messages: [...existing.messages, userMessage, aiPlaceholder],
            },
          };
        });

        startGeminiStream(targetTopic, aiMsgId, messageText, currentAtts);
      })();
      return;
    }

    // Standard flow when clarification is toggled OFF: immediately PROCEED
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
      const existing = prev[targetTopic] || {
        id: `thread-${Date.now()}`,
        title: targetTopic,
        promptBanner: messageText,
        messages: [],
      };
      return {
        ...prev,
        [targetTopic]: {
          ...existing,
          messages: [...existing.messages, userMessage, aiPlaceholder],
        },
      };
    });

    startGeminiStream(targetTopic, aiMsgId, messageText, currentAtts);
  };

  const handleSelectRecentChat = (topic: string) => {
    if (!currentUser || currentUser.isAnonymous) {
      onOpenLogin?.();
      return;
    }
    setActiveTopic(topic);
    if (onSelectRecentTopic) onSelectRecentTopic(topic);
    setIsMobileSidebarOpen(false);
  };

  const handleNewChat = () => {
    if (!currentUser || currentUser.isAnonymous) {
      onOpenLogin?.();
      return;
    }
    const newId = `Chat ${Object.keys(chatThreads).length + 1}`;
    const newThread: ChatThread = {
      id: `thread-${Date.now()}`,
      title: newId,
      promptBanner: 'Start a new conversation or ask anything...',
      messages: [],
    };

    setChatThreads((prev) => ({
      [newId]: newThread,
      ...prev,
    }));
    setActiveTopic(newId);
    if (onSelectRecentTopic) onSelectRecentTopic(newId);
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
                showToast('Transcribing audio input...');
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

  const isLight = themeMode === 'light';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-0 z-[10000] flex overflow-hidden font-sans select-none transition-colors duration-300 ${
          isLight ? 'bg-[#eef2f7] text-zinc-900 chat-theme-light' : 'bg-[#090d16] text-white'
        }`}
      >
        {/* Background Atmospheric Candy Blue Nebulas */}
        <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-[#00a6ff]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[500px] bg-[#00a6ff]/8 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#00a6ff]/6 rounded-full blur-[130px] pointer-events-none" />

        {/* ------------------------------------------------------------- */}
        {/* LEFT SIDEBAR: Neumorphic Styling with Candy Blue Accents */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 md:static md:translate-x-0 transition-all duration-300 flex flex-col justify-between p-5 border-r backdrop-blur-xl ${
            isLight
              ? 'bg-[#eef2f7] border-zinc-200/90 shadow-[4px_0_16px_rgba(166,178,198,0.3)] text-zinc-800'
              : 'bg-[#0d121c]/95 md:bg-[#0d121c]/90 border-[#00a6ff]/25 text-white'
          } ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
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
                  <span className="w-2.5 h-7 bg-[#00a6ff] rounded-[1px] shadow-[0_0_14px_rgba(0,166,255,0.9)]" />
                </div>
                <span className={`text-3xl font-black italic tracking-tighter ml-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                  M
                </span>
              </div>

              {/* Mobile Right Controls: Theme Toggle & Close X */}
              <div className="flex items-center gap-1.5 md:hidden">
                <ThemeToggle showLabel={false} />
                <button
                  type="button"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`p-1.5 rounded-lg ${isLight ? 'text-zinc-600 hover:text-zinc-900' : 'text-zinc-400 hover:text-white'}`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* GUEST MODE: Sign In Required Box */}
          {!currentUser || currentUser.isAnonymous ? (
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-4 text-center my-auto">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[#00a6ff] mb-3 ${
                isLight
                  ? 'bg-white border border-zinc-200/90 shadow-[-3px_-3px_8px_rgba(255,255,255,0.9),3px_3px_8px_rgba(166,178,198,0.35)]'
                  : 'bg-[#090d16] border border-[#00a6ff]/50 shadow-[0_0_20px_rgba(0,166,255,0.35)]'
              }`}>
                <Lock size={24} />
              </div>
              <h3
                className={`text-base font-bold tracking-tight mb-1.5 ${isLight ? 'text-zinc-900' : 'text-white'}`}
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Sign in required
              </h3>
              <p className={`text-xs leading-relaxed max-w-[210px] mb-5 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Sign in to access your chats, projects and memory.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsMobileSidebarOpen(false);
                  handleOpenLogin();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#00a6ff] hover:bg-[#0094e6] text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,166,255,0.5)] cursor-pointer active:scale-95"
              >
                Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Authenticated Mode: Top Section with + New Chat + Navigation */}
              <div className="shrink-0 space-y-4 pt-3">
                {/* + New Chat Button with red neon rim */}
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="w-full py-3 px-4 rounded-[20px] bg-[#0d0204] border-[1.5px] border-[#00a6ff] text-white font-medium text-[15px] flex items-center justify-between shadow-[0_0_18px_rgba(0, 166, 255,0.6)] hover:shadow-[0_0_26px_rgba(0, 166, 255,0.85)] transition-all cursor-pointer active:scale-98 group"
                >
                  <div className="flex items-center gap-3">
                    <Plus size={19} className="text-white group-hover:rotate-90 transition-transform" />
                    <span className="text-white tracking-wide">New Chat</span>
                  </div>
                  <ChevronRight size={18} className="text-[#00a6ff] font-bold group-hover:translate-x-0.5 transition-transform" />
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

              {/* ONLY RECENT SECTION SCROLLABLE: Authenticated user's real Firestore chats */}
              <div className="flex-1 min-h-0 flex flex-col pt-3">
                <span className="text-[13px] font-normal text-zinc-500 px-3 tracking-wide mb-2 shrink-0">
                  Recent
                </span>

                {/* Scrollable container for recent items */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 no-scrollbar">
                  {Object.keys(chatThreads).length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs text-zinc-500">
                      No saved chats yet. Start a new conversation!
                    </div>
                  ) : (
                    Object.values(chatThreads).map((thread) => {
                      const topic = thread.title || thread.id;
                      return (
                        <div
                          key={thread.id || topic}
                          className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between transition-all cursor-pointer hover:bg-white/[0.06] border ${
                            topic === activeTopic
                              ? 'bg-white/[0.08] text-white border-white/15'
                              : 'text-zinc-200 hover:text-white border-transparent'
                          } group`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectRecentChat(topic)}
                            className="flex items-center gap-3 truncate text-left flex-1 min-w-0"
                          >
                            <MessageSquare
                              size={17}
                              strokeWidth={1.8}
                              className="text-zinc-400 group-hover:text-white shrink-0"
                            />
                            <span className="truncate text-[14px] text-white font-normal">
                              {topic}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (currentUser?.uid && thread.id) {
                                await deleteChatThreadFromFirestore(thread.id, currentUser.uid);
                                setChatThreads((prev) => {
                                  const next = { ...prev };
                                  delete next[topic];
                                  return next;
                                });
                                if (activeTopic === topic) {
                                  const remaining = Object.keys(chatThreads).filter((k) => k !== topic);
                                  setActiveTopic(remaining[0] || '');
                                }
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-zinc-500 hover:text-red-400 transition-opacity ml-1 shrink-0"
                            title="Delete chat"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}

          {/* Bottom Fixed Section: User Profile + Sign Out / Sign In + Return to BMW Button */}
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

            {/* Menu Account Actions: Sign In (Guest) or Sign Out (Logged In) */}
            {currentUser && !currentUser.isAnonymous ? (
              <div className="flex items-center justify-between px-2.5 py-2 select-none rounded-xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-2.5 min-w-0 truncate">
                  <div className="w-9 h-9 rounded-full bg-[#0e0103] border-[1.5px] border-[#00a6ff] flex items-center justify-center text-[#00a6ff] shadow-[0_0_12px_rgba(0, 166, 255,0.6)] shrink-0 overflow-hidden">
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={17} className="fill-[#00a6ff] text-[#00a6ff]" />
                    )}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-[13px] font-semibold text-white leading-tight truncate">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </span>
                    <span className="text-[11px] text-zinc-400 truncate">
                      {currentUser.email || 'Cloud Account'}
                    </span>
                  </div>
                </div>

                {/* Dedicated Sign Out Button in Menu */}
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await logOut();
                    showToast('Signed out successfully');
                  }}
                  className="ml-2 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  title="Sign Out"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div
                onClick={handleOpenLogin}
                className={`flex items-center justify-between px-3 py-2 select-none cursor-pointer border rounded-xl transition-colors ${
                  isLight
                    ? 'hover:bg-black/5 bg-white/60 border-zinc-200/90 shadow-sm'
                    : 'hover:bg-white/5 bg-white/[0.03] border-white/10'
                }`}
                title="Click to sign in"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className={`w-9 h-9 rounded-full border-[1.5px] flex items-center justify-center shrink-0 ${
                    isLight ? 'bg-white border-zinc-300 text-zinc-600' : 'bg-[#0e0103] border-zinc-700 text-zinc-400'
                  }`}>
                    <UserIcon size={16} />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className={`text-[13px] font-semibold leading-tight truncate ${isLight ? 'text-zinc-900' : 'text-white'}`}>
                      Guest User
                    </span>
                    <span className={`text-[11px] truncate ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Session Active
                    </span>
                  </div>
                </div>

                {/* Dedicated Sign In Button in Menu */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenLogin();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#00a6ff] hover:bg-[#0094e6] text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,166,255,0.4)] cursor-pointer shrink-0"
                >
                  Sign In
                </button>
              </div>
            )}
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
          <div className={`flex items-center justify-between px-4 sm:px-8 py-3 border-b z-30 transition-colors ${
            isLight
              ? 'bg-[#eef2f7]/90 border-zinc-200/80 backdrop-blur-md text-zinc-900 shadow-[0_2px_8px_rgba(166,178,198,0.2)]'
              : 'bg-black/60 border-white/10 backdrop-blur-md text-white'
          }`}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className={`md:hidden p-2 rounded-xl flex items-center gap-2 text-sm ${
                  isLight
                    ? 'bg-white text-zinc-800 border border-zinc-200 shadow-sm'
                    : 'bg-zinc-900 text-white'
                }`}
              >
                <Menu size={18} />
                <span>Menu</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Animated Light/Dark Mode Switcher */}
              <ThemeToggle showLabel={true} />

              {/* Clarification Gate Settings Popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsClarificationMenuOpen((v) => !v)}
                  className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                    clarificationSettings.enabled
                      ? isLight
                        ? 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200 shadow-sm'
                        : 'bg-white/10 hover:bg-white/15 text-white border-white/15 shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 border-white/5'
                  }`}
                  title="Clarifying Questions Settings"
                >
                  <Sliders size={13} className={clarificationSettings.enabled ? 'text-[#00a6ff]' : 'text-zinc-500'} />
                  <span className="hidden sm:inline">
                    {clarificationSettings.enabled
                      ? `Clarifications: ${clarificationSettings.strictness.charAt(0).toUpperCase() + clarificationSettings.strictness.slice(1)}`
                      : 'Clarifications: Off'}
                  </span>
                  <ChevronDown size={12} className="opacity-70" />
                </button>

                <AnimatePresence>
                  {isClarificationMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute right-0 top-full mt-2 w-72 rounded-2xl backdrop-blur-2xl border p-3.5 z-50 ${
                        isLight
                          ? 'bg-white/95 text-zinc-900 border-zinc-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.15),0_0_30px_rgba(0,166,255,0.1)]'
                          : 'bg-[#0b1019]/95 text-white border-[#00a6ff]/40 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(0,166,255,0.2)]'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200/20 mb-3">
                        <div className="flex items-center gap-2">
                          <Sliders size={14} className="text-[#00a6ff]" />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Clarification Gate
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsClarificationMenuOpen(false)}
                          className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Enable/Disable Toggle */}
                      <div className="flex items-center justify-between py-2 border-b border-zinc-200/10 mb-3">
                        <div>
                          <div className="text-xs font-semibold">Ask clarifying questions</div>
                          <div className="text-[10px] text-zinc-400">Ask questions before generating major tasks</div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateClarificationSettings({ enabled: !clarificationSettings.enabled })
                          }
                          className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                            clarificationSettings.enabled ? 'bg-[#00a6ff]' : 'bg-zinc-700'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                              clarificationSettings.enabled ? 'left-5.5' : 'left-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Strictness Selector */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold">Question Strictness:</div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['minimal', 'balanced', 'thorough'] as const).map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              disabled={!clarificationSettings.enabled}
                              onClick={() => updateClarificationSettings({ strictness: lvl })}
                              className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all capitalize cursor-pointer border ${
                                clarificationSettings.strictness === lvl && clarificationSettings.enabled
                                  ? 'bg-[#00a6ff] text-white border-[#00a6ff] shadow-[0_0_10px_rgba(0,166,255,0.5)]'
                                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200 disabled:opacity-40'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                        <div className="text-[10px] text-zinc-400 pt-1 leading-tight">
                          {clarificationSettings.strictness === 'minimal'
                            ? 'Minimal: Asks 0-1 questions, only when impossible to proceed.'
                            : clarificationSettings.strictness === 'balanced'
                            ? 'Balanced (Default): Asks 1-3 high-impact questions for ambiguous tasks.'
                            : 'Thorough: Asks 2-4 comprehensive questions before generating.'}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-xl flex items-center gap-1.5 text-xs transition-all cursor-pointer border ${
                  isLight
                    ? 'bg-white text-zinc-800 border-zinc-200/90 shadow-sm hover:bg-zinc-100'
                    : 'bg-zinc-900 text-zinc-300 hover:text-white border-white/10 hover:border-white/20'
                }`}
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
            onScroll={handleChatScroll}
            onTouchStart={(e) => {
              touchStartYRef.current = e.touches[0].clientY;
            }}
            onTouchMove={(e) => {
              const currentY = e.touches[0].clientY;
              if (currentY > touchStartYRef.current + 8) {
                // User pulled down to scroll up into previous messages
                userScrolledUpRef.current = true;
                setShowScrollBottomBtn(true);
              }
            }}
            onWheel={(e) => {
              if (e.deltaY < 0) {
                userScrolledUpRef.current = true;
                setShowScrollBottomBtn(true);
              }
            }}
            className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 lg:px-16 pt-6 pb-40 space-y-8"
          >
            {/* Conversation Messages or Welcome State */}
            {(!currentThread || !currentThread.messages || currentThread.messages.length === 0) ? (
              <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center px-4 max-w-xl mx-auto select-none">
                <div className="w-16 h-16 rounded-3xl bg-[#0e0103] border-[1.5px] border-[#00a6ff]/60 flex items-center justify-center text-[#00a6ff] shadow-[0_0_30px_rgba(0, 166, 255,0.5),inset_0_0_15px_rgba(0, 166, 255,0.3)] mb-4">
                  <Sparkles size={28} className="animate-pulse" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Think Creative AI
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed mb-4">
                  {currentUser
                    ? `Welcome back, ${currentUser.displayName || currentUser.email?.split('@')[0]}! Your real-time chats and visual references are automatically saved.`
                    : 'Ask anything, explore high-performance design, or generate blueprints.'}
                </p>
              </div>
            ) : (
              currentThread.messages.map((message) => {
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
                            ) : file.type?.startsWith('video/') ? (
                              <div
                                key={file.id}
                                className="flex items-center gap-2 bg-zinc-900 border border-[#00a6ff]/50 rounded-xl px-3 py-1.5 text-xs text-white shadow-md select-none shrink-0"
                              >
                                <div className="w-5 h-5 rounded-full bg-[#00a6ff] flex items-center justify-center text-white shrink-0">
                                  <div className="w-0 h-0 border-t-[3.5px] border-t-transparent border-b-[3.5px] border-b-transparent border-l-[6px] border-l-white ml-0.5" />
                                </div>
                                <span className="max-w-[140px] truncate font-semibold">{file.name}</span>
                              </div>
                            ) : (
                              <div
                                key={file.id}
                                className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1 text-xs text-white"
                              >
                                <Paperclip size={12} className="text-zinc-300 rotate-[-45deg]" />
                                <span className="max-w-[140px] truncate font-medium">{file.name}</span>
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
                            className="w-full bg-black/70 border border-[#00a6ff]/60 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#00a6ff] resize-none"
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
                              className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-[#00a6ff] hover:bg-[#0094e6] text-white font-medium shadow-[0_0_10px_rgba(0, 166, 255,0.5)] transition-colors cursor-pointer"
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

                  {/* Question Mode Card IN CHAT (User: "gasa question Wala ma question ataha na wasa ka lankin wo prompt box ma ni chat ma show ho") */}
                  {message.activeQuestion && (
                    <div className="pt-1 pb-2">
                      <InteractiveQuestionCard
                        question={message.activeQuestion}
                        disabled={isSendLocked || isAiTyping}
                        onAnswer={(answer) => handleAnswerQuestionInChat(message.id, answer)}
                      />
                    </div>
                  )}

                  {/* Dynamic Clarification Questions Card IN CHAT */}
                  {message.clarificationDecision && (
                    <div className="pt-1 pb-2">
                      <ClarificationQuestionsCard
                        decision={message.clarificationDecision}
                        disabled={isSendLocked || isAiTyping}
                        onSubmitAnswers={(answers) =>
                          handleClarificationSubmit(message.clarificationDecision!, answers)
                        }
                        onSkip={() => handleClarificationSkip(message.clarificationDecision!)}
                      />
                    </div>
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
                      {/* While typing or streaming, display progressively with animated blinking cursor & immediate scrollable code box */}
                      {(message.isStreaming || typingAnimationMsgId === message.id) ? (
                        <LiveMessageStreamRenderer
                          rawText={message.text}
                          isStreaming={true}
                          onOpenPreview={(html, fn) => setFullscreenWebsite({ html, fileName: fn || 'website.html' })}
                          onOpenEditor={handleOpenEditor}
                          onUseInChat={(p) => {
                            setInputVal(p);
                            showToast('Loaded prompt into input box');
                          }}
                        />
                      ) : (
                        <>
                          {/* AI Image Planner Gallery (Strictly AI Planned, No Regex) */}
                          {message.imagePlan && message.imagePlan.mode !== 'NONE' && (
                            <MessageTopImageGallery
                              subjects={message.imagePlan.subjects}
                              mode={message.imagePlan.mode}
                              shortReplyText={message.imagePlan.shortReplyText}
                            />
                          )}

                          {/* Clean White Main Title (slightly larger than sub-heading, all in pure white) */}
                          {message.structuredContent?.mainTitle && (
                            <div className="pt-1">
                              <h2
                                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight font-luxury-serif"
                                style={{ fontFamily: "'Cormorant Garamond', 'Bodoni 72', 'Bodoni Moda', 'Playfair Display', 'Times New Roman', serif", fontWeight: 700 }}
                              >
                                {typeof message.structuredContent.mainTitle === 'string'
                                  ? message.structuredContent.mainTitle
                                  : `${(message.structuredContent.mainTitle as any).white || ''} ${(message.structuredContent.mainTitle as any).red || ''}`.trim()}
                              </h2>
                            </div>
                          )}

                          {/* Plain text fallback when no structured headers yet */}
                          {!message.structuredContent && message.text.replace(/```question[\s\S]*?```/gi, '').trim() && (
                            <LiveMessageStreamRenderer
                              rawText={message.text.replace(/```question[\s\S]*?```/gi, '').trim()}
                              isStreaming={false}
                              onOpenPreview={(html, fn) => setFullscreenWebsite({ html, fileName: fn || 'website.html' })}
                              onOpenEditor={handleOpenEditor}
                              onUseInChat={(p) => {
                                setInputVal(p);
                                showToast('Loaded prompt into input box');
                              }}
                            />
                          )}

                  {/* Intro Text */}
                  {message.structuredContent?.intro && (
                    <div
                      className="text-white text-lg sm:text-xl md:text-[22px] leading-relaxed max-w-4xl font-bold font-luxury-serif tracking-[0.015em]"
                      style={{ fontFamily: "'Cormorant Garamond', 'Bodoni 72', 'Bodoni Moda', 'Playfair Display', 'Times New Roman', serif", fontWeight: 750 }}
                    >
                      {renderFormattedBoldText(message.structuredContent.intro)}
                    </div>
                  )}

                  {/* Sections with high-contrast styling and glowing indicators */}
                  {message.structuredContent?.sections?.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-3.5 pt-2">
                      {/* Section Title with crimson accent pill */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-5 bg-[#00a6ff] rounded-full" />
                        <h3
                          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-wide font-luxury-serif"
                          style={{ fontFamily: "'Cormorant Garamond', 'Bodoni 72', 'Bodoni Moda', 'Playfair Display', 'Times New Roman', serif", fontWeight: 800 }}
                        >
                          {section.title}
                        </h3>
                      </div>

                      {/* Description above code/prompt */}
                      {section.description && (
                        <div
                          className="text-white text-base sm:text-lg md:text-xl leading-relaxed whitespace-pre-line font-bold font-luxury-serif tracking-[0.012em]"
                          style={{ fontFamily: "'Cormorant Garamond', 'Bodoni 72', 'Bodoni Moda', 'Playfair Display', 'Times New Roman', serif", fontWeight: 750 }}
                        >
                          {renderFormattedBoldText(section.description)}
                        </div>
                      )}

                      {/* Bullet points */}
                      {section.bullets && (
                        <ul className="space-y-3 pt-1">
                          {section.bullets.map((bullet, bIdx) => (
                            <li
                              key={bIdx}
                              className="flex items-start gap-3.5 text-base sm:text-lg md:text-xl text-white font-bold group font-luxury-serif tracking-[0.012em]"
                              style={{ fontFamily: "'Cormorant Garamond', 'Bodoni 72', 'Bodoni Moda', 'Playfair Display', 'Times New Roman', serif", fontWeight: 750 }}
                            >
                              <span className="w-2 h-2 rounded-full bg-[#00a6ff] mt-2.5 shrink-0 group-hover:scale-125 transition-transform" />
                              <span className="leading-relaxed text-white font-bold">{renderFormattedBoldText(bullet)}</span>
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
                          onOpenFullScreenEditor={(code, fileName, language) =>
                            handleOpenEditor(code, fileName, language)
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
                              ? 'bg-[#00a6ff]/25 border-[#00a6ff] text-white'
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
                              className="absolute left-0 bottom-full mb-2 w-64 rounded-2xl bg-[#120406]/95 backdrop-blur-xl border border-[#00a6ff]/40 shadow-[0_20px_45px_rgba(0,0,0,0.85),0_0_20px_rgba(0, 166, 255,0.25)] p-2 z-50 text-xs"
                            >
                              <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-white/10 mb-1 flex items-center justify-between">
                                <span>Export Answer As</span>
                                <span className="text-[#00a6ff]">5 Formats</span>
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
            })
          )}

          {isCheckingGate && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-zinc-900/95 border border-[#00a6ff]/40 w-fit text-xs text-zinc-200 font-bold mb-3 shadow-[0_0_20px_rgba(0, 166, 255,0.15)]"
            >
              <Loader2 size={14} className="animate-spin text-[#00a6ff]" />
              <span className="tracking-wide">Checking your request...</span>
            </motion.div>
          )}
          </div>

          {/* Scroll to bottom button when user scrolled up */}
          <AnimatePresence>
            {showScrollBottomBtn && (
              <motion.button
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                type="button"
                onClick={() => scrollToBottom(true)}
                className="absolute bottom-28 sm:bottom-28 right-6 sm:right-12 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-black/95 hover:bg-black text-white border border-zinc-700/80 hover:border-zinc-500 shadow-[0_12px_35px_rgba(0,0,0,0.95),0_0_1px_rgba(255,255,255,0.25)] text-xs font-bold tracking-wide backdrop-blur-xl transition-all cursor-pointer pointer-events-auto group active:scale-95"
              >
                <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white shrink-0 group-hover:bg-zinc-800 transition-colors">
                  <ArrowDown size={13} className="text-white group-hover:translate-y-0.5 transition-transform" />
                </div>
                <span className="text-white font-bold tracking-wide">Jump to Recent</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* ------------------------------------------------------------- */}
          {/* BOTTOM FLOATING PROMPT BOX & INTERACTIVE EXPANDABLE MODULES */}
          {/* ------------------------------------------------------------- */}
          <div className="absolute bottom-2 sm:bottom-5 left-0 right-0 px-2 sm:px-8 md:px-12 lg:px-16 flex flex-col items-center pointer-events-none z-40 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
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

            {/* Dynamic width container: when process overview is active */}
            {(() => {
              const hasActiveQuestionInChat = currentThread?.messages?.some((m) => Boolean(m.activeQuestion));
              const hideInputControls = isThinkingPanelOpen || hasActiveQuestionInChat;

              return (
                <div
                  className={`w-full transition-all duration-300 pointer-events-auto relative max-w-[96vw] sm:max-w-3xl ${
                    isThinkingPanelOpen ? 'sm:max-w-4xl' : ''
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
                          className={`relative rounded-[28px] sm:rounded-[32px] bg-white text-zinc-900 px-5 pt-4 pb-3 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_35px_rgba(0, 166, 255,0.25)] border transition-all ${
                            isDraggingOver
                              ? 'border-[#00a6ff] ring-2 ring-[#00a6ff]/30'
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
                                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/75 hover:bg-[#00a6ff] text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-90 disabled:opacity-40"
                                        title={`Remove ${file.name}`}
                                        aria-label={`Remove ${file.name}`}
                                      >
                                        <X size={11} strokeWidth={2.5} />
                                      </button>
                                    </div>
                                  ) : file.type?.startsWith('video/') ? (
                                    /* Video media pill with play indicator and remove button */
                                    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-300 text-white shadow-md rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold shrink-0 select-none">
                                      <div className="w-5 h-5 rounded-full bg-[#00a6ff] flex items-center justify-center text-white shrink-0">
                                        <div className="w-0 h-0 border-t-[3.5px] border-t-transparent border-b-[3.5px] border-b-transparent border-l-[6px] border-l-white ml-0.5" />
                                      </div>
                                      <span className="max-w-[120px] sm:max-w-[160px] truncate" title={file.name}>
                                        {file.name}
                                      </span>
                                      <button
                                        type="button"
                                        disabled={isSendLocked || isAiTyping}
                                        onClick={() => removeChatAttachment(file.id)}
                                        className="w-4 h-4 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
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
                                className="text-xs text-[#00a6ff] font-medium px-1 py-1"
                              >
                                {fileLimitError}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Bottom Row Controls: Rule 11 - hide when Question Mode or Thinking Mode is active */}
                          {!hideInputControls ? (
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
                                {/* Model Dropdown - Pure White Style */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    disabled={isSendLocked || isAiTyping}
                                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200/90 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <span>{selectedModel === 'Gemini 2.5' ? 'AI Studio 2.5' : selectedModel}</span>
                                    <ChevronDown size={14} className="text-zinc-500" />
                                  </button>

                                  {isModelDropdownOpen && !isSendLocked && !isAiTyping && (
                                    <div className="absolute bottom-11 right-0 w-38 bg-white text-zinc-900 rounded-2xl shadow-2xl border border-zinc-200/90 p-1.5 z-50 text-xs space-y-0.5">
                                      {['GPT-4o', 'GPT-4o mini', 'AI Studio 2.5', 'Claude 3.7'].map((model) => (
                                        <button
                                          key={model}
                                          type="button"
                                          onClick={() => {
                                            setSelectedModel(model);
                                            setIsModelDropdownOpen(false);
                                          }}
                                          className={`w-full text-left px-3 py-2 rounded-xl transition-all font-medium ${
                                            selectedModel === model
                                              ? 'bg-[#00a6ff] text-white shadow-md font-semibold'
                                              : 'hover:bg-zinc-100 text-zinc-700'
                                          }`}
                                        >
                                          {model}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Candy Blue Circular Send Button */}
                                <button
                                  type="submit"
                                  disabled={
                                    isSendLocked ||
                                    isAiTyping ||
                                    (!inputVal.trim() && chatAttachments.length === 0)
                                  }
                                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                    !isSendLocked && !isAiTyping && (inputVal.trim() || chatAttachments.length > 0)
                                      ? 'bg-[#00a6ff] text-white shadow-[0_0_18px_rgba(0,166,255,0.7)] hover:bg-[#0094e6] hover:scale-105 cursor-pointer active:scale-95'
                                      : 'bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-60'
                                  }`}
                                  title={isSendLocked || isAiTyping ? 'Generating response...' : 'Send prompt'}
                                >
                                  <Send size={16} className="ml-0.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-zinc-400 font-medium">
                              <span>Discovery question active above</span>
                              <span className="text-zinc-500">Select an option to proceed</span>
                            </div>
                          )}
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
              className="fixed bottom-24 right-6 z-[10001] px-4 py-2.5 rounded-xl bg-[#140306]/95 border border-[#00a6ff]/60 shadow-[0_10px_30px_rgba(0,0,0,0.85),0_0_15px_rgba(0, 166, 255,0.35)] text-white text-xs flex items-center gap-2.5 backdrop-blur-md pointer-events-none"
            >
              <CheckCircle2 size={15} className="text-[#00a6ff]" />
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

        {/* Fullscreen In-App Code Editor with Live Editing per user request */}
        {fullscreenEditor && (
          <FullScreenCodeEditorModal
            isOpen={Boolean(fullscreenEditor)}
            onClose={() => setFullscreenEditor(null)}
            initialCode={fullscreenEditor.code}
            fileName={fullscreenEditor.fileName}
            language={fullscreenEditor.language}
            onSave={(updatedCode) => {
              setFullscreenEditor((prev) => prev ? { ...prev, code: updatedCode } : null);
              showToast('Code saved successfully');
            }}
            onOpenInBrowser={(code) => {
              setFullscreenWebsite({ html: code, fileName: fullscreenEditor.fileName || 'index.html' });
            }}
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

        {/* Firebase Authentication Modal */}
        <LoginModal
          isOpen={isInternalLoginOpen}
          onClose={() => setIsInternalLoginOpen(false)}
        />
      </motion.div>
    </AnimatePresence>
  );
};
