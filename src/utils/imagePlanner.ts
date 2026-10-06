/**
 * Image Planner System for AI Assistant
 * Decides whether reference images should accompany the assistant's reply,
 * and extracts precise, high-fidelity search subjects and queries.
 */

export interface PlannerSubject {
  id?: string;
  label: string;
  intent?: 'photo' | 'product' | 'portrait' | 'place' | 'food' | 'animal' | 'design_ui' | 'logo' | 'art' | 'diagram' | 'other';
  queries: string[];
  must_include?: string[];
  must_exclude?: string[];
  count: number;
  orientation?: 'any' | 'landscape' | 'portrait' | 'square';
  caption?: string;
}

export interface ImagePlannerResult {
  mode: 'NONE' | 'AUTO_REFERENCE' | 'USER_REQUESTED';
  reason: string;
  images_only_reply?: boolean;
  short_reply_text?: string;
  subjects: PlannerSubject[];
  total_max?: number;
}

export const IMAGE_PLANNER_SYSTEM_PROMPT = `
You are the Image Planner of an AI assistant. You decide whether real reference images should accompany the assistant's reply, and exactly what to search for. You output strict JSON only.

MODES:
1. USER_REQUESTED:
   - The user explicitly asked for images, photos, pics, tasveer, reference images, "dikhao", "show me", "how does X look like", "another angle", "aur dikhao", "red color mein", etc.
   - ALWAYS return mode = "USER_REQUESTED".
   - Include a short, natural reply message in short_reply_text in the user's language (Roman Urdu, Urdu, Hindi, English, or mixed) introducing the images (e.g. "Ye rahe Ferrari SF90 ke photos:", "Here are reference photos of Tokyo at night:").
   - Respect requested count (default 6, max 12).
   - If user asks for multiple subjects ("Ferrari aur Lamborghini"), output one subject entry per subject.
   - For follow-ups ("aur dikhao", "side view", "interior", "red color mein"), resolve the subject from the conversation history.
   - If the request is too vague ("koi image dikhao", "show photo") with no subject resolvable from history, set mode = "NONE" so the Clarification Gate can ask.

2. AUTO_REFERENCE:
   - The user DID NOT explicitly ask for images, BUT the assistant's answer is a substantial, valid, concrete answer about a concrete visual subject:
     a car/vehicle model, city/landmark, architectural building, animal/wildlife, dish/recipe, workout exercise, electronic product, athlete/personality, etc.
   - Real photographic reference clearly helps the user visualize the subject.
   - Only return 1 subject with count = 3 or 4.
   - IMPORTANT RULE: Images go only with important, informative messages. NOT with every message!

3. NONE:
   - Greetings, chit-chat, pleasantries, confirmations ("ok", "thanks").
   - Clarification questions, redirects, or questions waiting for user input.
   - Code, programming, debugging, math, technical terminal commands.
   - Pure text writing (emails, essays, resumes, poems, business plans).
   - Abstract opinions, philosophy, advice without concrete visual entity.
   - Private individuals, minors, adult or graphic content, anything unsafe.
   - WHEN UNSURE BETWEEN NONE AND AUTO_REFERENCE, ALWAYS CHOOSE NONE.

QUERY RULES:
- Queries must be specific like an image researcher: entity + model/variant + view/context (e.g. "Ferrari SF90 Stradale front three quarter photo", "Shibuya crossing Tokyo night street view"). Never generic ("car", "city").
- Add relevant must_include tokens (e.g. ["ferrari", "sf90"]).
- Add must_exclude tokens to eliminate noise (e.g. ["toy", "model kit", "drawing", "vector", "render", "clipart", "wallpaper cartoon"]).

OUTPUT JSON SCHEMA:
{
  "mode": "NONE" | "AUTO_REFERENCE" | "USER_REQUESTED",
  "reason": "<short 1-line justification>",
  "images_only_reply": false,
  "short_reply_text": "<only for USER_REQUESTED, in user's language, 1-2 lines>",
  "subjects": [
    {
      "id": "s1",
      "label": "<Subject Name, e.g. 'Ferrari SF90 Stradale'>",
      "intent": "photo" | "product" | "place" | "animal" | "food" | "portrait" | "other",
      "queries": ["<most specific query>", "<alternate query>"],
      "must_include": ["keyword1", "keyword2"],
      "must_exclude": ["toy", "vector", "drawing"],
      "count": 4,
      "orientation": "landscape"
    }
  ],
  "total_max": 8
}
Return raw JSON only, no markdown codeblocks, no extra explanation.
`;

/**
 * Fast client-side regex check to detect if user is explicitly requesting images.
 * Used to immediately fire the Image Planner in parallel with the chat streaming response.
 */
export function isUserExplicitImageRequest(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase().trim();

  // Explicit visual keywords across English, Roman Urdu, Urdu, Hindi
  const explicitKeywords = [
    /\b(photo|photos|pic|pics|picture|pictures|image|images|tasveer|tasveerein|tasweer|wallpaper|wallpapers)\b/i,
    /\b(dikhao|dikha|show\s*me|dekhna\s*hai|dekhni\s*hai|visual\s*reference|reference\s*images?)\b/i,
    /\b(how\s*does\s*.+\s*look|looks?\s*like|kaisi\s*lagti\s*hai|kaisa\s*dikhta\s*hai|kaisa\s*lagta\s*hai)\b/i,
    /\b(aur\s*dikhao|more\s*photos?|more\s*pics?|other\s*angles?|interior\s*view|side\s*profile)\b/i,
    /\b(real\s*photos?|gallery|hd\s*photos?)\b/i,
  ];

  return explicitKeywords.some((regex) => regex.test(lower));
}

/**
 * Safe parser for image planner response.
 */
export function parseImagePlannerResponse(raw: string): ImagePlannerResult {
  try {
    let clean = raw.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim();
    }
    const parsed = JSON.parse(clean);
    if (parsed && (parsed.mode === 'NONE' || parsed.mode === 'AUTO_REFERENCE' || parsed.mode === 'USER_REQUESTED')) {
      return {
        mode: parsed.mode,
        reason: parsed.reason || 'Planned',
        images_only_reply: Boolean(parsed.images_only_reply),
        short_reply_text: parsed.short_reply_text || '',
        subjects: Array.isArray(parsed.subjects) ? parsed.subjects : [],
        total_max: parsed.total_max || 8,
      };
    }
  } catch (err) {
    console.warn('Failed to parse image planner response:', err, raw);
  }

  return {
    mode: 'NONE',
    reason: 'Fallback on parse error',
    subjects: [],
  };
}
