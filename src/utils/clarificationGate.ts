/**
 * Clarification Gate Architecture
 * Evaluates incoming user prompts for Validity and Completeness
 * Generates dynamic, context-specific questions when information is missing.
 */

export interface ClarificationQuestion {
  id: string;
  question: string;
  why_it_matters: string;
  type: 'single_choice' | 'multi_choice' | 'text';
  options?: string[];
  default?: string | null;
}

export type TaskType =
  | 'website'
  | 'app'
  | 'document'
  | 'code'
  | 'design'
  | 'image'
  | 'video'
  | 'writing'
  | 'research'
  | 'business'
  | 'data'
  | 'question'
  | 'chat'
  | 'other';

export interface ClarificationDecision {
  validity: 'valid' | 'invalid';
  task_type: TaskType;
  completeness: 'complete' | 'incomplete';
  decision: 'PROCEED' | 'ASK' | 'REDIRECT';
  detected_info: Record<string, string>;
  missing_critical: string[];
  assumptions_if_skipped: string[];
  questions: ClarificationQuestion[];
  redirect_message?: string;
}

export interface ClarificationState {
  askedQuestions: string[];
  answeredQuestions: Record<string, string>;
  detectedInfo: Record<string, string>;
  pendingDecision: ClarificationDecision | null;
  enabled: boolean;
  strictness: 'minimal' | 'balanced' | 'thorough';
}

/**
 * Gate System Prompt for the Clarification Gate AI
 */
export const CLARIFICATION_GATE_SYSTEM_PROMPT = `
You are the Clarification Gate for a high-performance AI workspace.
Your job is to analyze the user's message, conversation context, and attachments, and evaluate:
1. Validity: Is this an actionable request?
2. Completeness: Does it have enough information to produce an exceptional result?

For EVERY message, choose exactly one of THREE OUTCOMES:

OUTCOME A: "PROCEED"
- Choose when the user message has enough information to produce a good result.
- Choose when the message is casual conversation, greetings, simple facts, small edits, follow-ups, or clear instructions.
- Choose if missing details have obvious industry standard defaults.
- Decision: "PROCEED", questions: [].

OUTCOME B: "ASK"
- Choose when the message is a valid creation/generation task (such as creating a website, app, logo, business plan, document, database, video script, marketing campaign, dashboard, timetable) BUT critical requirements (e.g. purpose, branding, target audience, core features, or format) are completely unstated.
- Formulate 1 to 4 (maximum 4, ideally 2-3) high-impact, specific, non-boilerplate questions.
- NEVER ask anything already mentioned in the message, conversation history, attachments, or ALREADY ASKED QUESTIONS.
- CRITICAL LANGUAGE RULE: Match the user's language and vocabulary! If the user writes in Roman Urdu ("website bana do", "logo chahiye"), Hindi, Urdu, or English, ask the questions in that EXACT language style!
- Decision: "ASK", completeness: "incomplete".

OUTCOME C: "REDIRECT"
- Choose when the message is empty, random characters ("asdfgh", "qwerty", "zzz"), or a fragment with no recoverable intent ("do it", "go", "make that" with no previous context).
- Decision: "REDIRECT", validity: "invalid", provide a polite redirect_message asking what they want to achieve and offering 2-3 brief examples.

JSON OUTPUT SCHEMA (Strictly output this JSON format and nothing else):
{
  "validity": "valid" | "invalid",
  "task_type": "website" | "app" | "document" | "code" | "design" | "image" | "video" | "writing" | "research" | "business" | "data" | "question" | "chat" | "other",
  "completeness": "complete" | "incomplete",
  "decision": "PROCEED" | "ASK" | "REDIRECT",
  "detected_info": { "key": "value already provided" },
  "missing_critical": ["list of missing critical items"],
  "assumptions_if_skipped": ["reasonable default assumption 1"],
  "questions": [
    {
      "id": "q1",
      "question": "Clear, contextual question matching user language",
      "why_it_matters": "Brief 1-sentence explanation of why this matters",
      "type": "single_choice",
      "options": ["Option 1", "Option 2", "Option 3", "Other"],
      "default": "Option 1"
    }
  ],
  "redirect_message": "Friendly prompt if decision is REDIRECT"
}
`.trim();

/**
 * Fast detection of skip intent in English and Roman Urdu / Hindi
 */
export function isSkipIntent(text: string): boolean {
  if (!text) return false;
  const normalized = text.trim().toLowerCase();
  const skipPatterns = [
    /^skip$/i,
    /^skip\b/i,
    /just do it/i,
    /you decide/i,
    /tum decide karo/i,
    /tum khud karo/i,
    /apni marzi se/i,
    /kuch bhi bana do/i,
    /proceed/i,
    /continue/i,
    /whatever/i,
    /whatever you think/i,
    /don't ask/i,
    /no questions/i,
    /use defaults/i,
    /default/i,
    /chordo/i,
    /direct bana do/i,
    /bana do/i,
  ];

  return skipPatterns.some((pattern) => pattern.test(normalized));
}

/**
 * Validates, repairs, and sanitizes the JSON output from the Clarification Gate
 */
export function parseAndValidateGateResponse(rawResponse: string): ClarificationDecision {
  const fallbackDecision: ClarificationDecision = {
    validity: 'valid',
    task_type: 'other',
    completeness: 'complete',
    decision: 'PROCEED',
    detected_info: {},
    missing_critical: [],
    assumptions_if_skipped: [],
    questions: [],
  };

  if (!rawResponse || typeof rawResponse !== 'string') {
    return fallbackDecision;
  }

  try {
    let clean = rawResponse.trim();
    // Strip markdown code fences if model wrapped in ```json ... ```
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```[a-zA-Z0-9_-]*\s*\n?/, '').replace(/```\s*$/, '').trim();
    }

    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      clean = clean.slice(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(clean);

    // Validate essential keys
    const decision = parsed.decision === 'ASK' || parsed.decision === 'REDIRECT' ? parsed.decision : 'PROCEED';
    const validity = parsed.validity === 'invalid' ? 'invalid' : 'valid';
    const completeness = parsed.completeness === 'incomplete' ? 'incomplete' : 'complete';

    const questions: ClarificationQuestion[] = Array.isArray(parsed.questions)
      ? parsed.questions
          .filter((q: any) => q && typeof q.question === 'string' && q.question.trim().length > 0)
          .map((q: any, idx: number) => ({
            id: q.id || `q-${idx + 1}`,
            question: q.question.trim(),
            why_it_matters: q.why_it_matters || '',
            type: q.type === 'multi_choice' || q.type === 'text' ? q.type : 'single_choice',
            options: Array.isArray(q.options) && q.options.length > 0 ? q.options.map(String) : undefined,
            default: q.default ? String(q.default) : null,
          }))
      : [];

    return {
      validity,
      task_type: parsed.task_type || 'other',
      completeness,
      decision: decision === 'ASK' && questions.length === 0 ? 'PROCEED' : decision,
      detected_info: parsed.detected_info && typeof parsed.detected_info === 'object' ? parsed.detected_info : {},
      missing_critical: Array.isArray(parsed.missing_critical) ? parsed.missing_critical.map(String) : [],
      assumptions_if_skipped: Array.isArray(parsed.assumptions_if_skipped)
        ? parsed.assumptions_if_skipped.map(String)
        : [],
      questions,
      redirect_message: parsed.redirect_message || undefined,
    };
  } catch (err) {
    console.warn('Clarification Gate JSON parse error, falling back to PROCEED:', err);
    return fallbackDecision;
  }
}

/**
 * Builds an enriched prompt incorporating user answers and assumptions
 */
export function buildEnrichedTaskPrompt(
  originalPrompt: string,
  decision: ClarificationDecision,
  answers: Record<string, string>
): string {
  const parts: string[] = [originalPrompt.trim()];

  const answeredEntries = Object.entries(answers).filter(([_, val]) => val && val.trim());
  if (answeredEntries.length > 0) {
    parts.push('\nUSER-SPECIFIED SPECIFICATIONS & REQUIREMENTS:');
    answeredEntries.forEach(([qId, ans]) => {
      const qObj = decision.questions.find((q) => q.id === qId);
      const qText = qObj ? qObj.question : qId;
      parts.push(`- ${qText}: ${ans}`);
    });
  }

  if (decision.assumptions_if_skipped && decision.assumptions_if_skipped.length > 0) {
    parts.push('\nWORKING ASSUMPTIONS:');
    decision.assumptions_if_skipped.forEach((assumption) => {
      parts.push(`- ${assumption}`);
    });
  }

  return parts.join('\n');
}
