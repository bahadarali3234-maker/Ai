/**
 * Master Question Intelligence & Memory Manager
 *
 * Implements the core principle:
 * "ASK ONCE. REMEMBER THE ANSWER. REUSE IT. ASK ONLY FOR NEW INFORMATION. NEVER MAKE THE USER REPEAT THEMSELVES."
 */

export interface StoredQuestion {
  questionId: string;
  questionText: string;
  normalizedQuestion: string;
  topic: string;
  options: string[];
  selectedAnswer?: string;
  customAnswer?: string;
  timestamp: string;
  projectId?: string;
  chatId?: string;
  status: 'unasked' | 'asked' | 'answered' | 'skipped' | 'not_applicable';
}

class QuestionMemoryManager {
  private questions: Map<string, StoredQuestion> = new Map();
  private knownRequirements: Map<string, Record<string, string>> = new Map(); // projectId or 'global' -> requirements

  constructor() {
    this.loadFromStorage();
  }

  private getStorageKey(uid?: string): string {
    return uid ? `cache:user:${uid}:questions` : 'think_creative_guest_questions';
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('think_creative_guest_questions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((q: StoredQuestion) => {
            this.questions.set(q.questionId, q);
          });
        }
      }
    } catch {}
  }

  public saveToStorage(uid?: string) {
    if (typeof window === 'undefined') return;
    try {
      const arr = Array.from(this.questions.values());
      localStorage.setItem(this.getStorageKey(uid), JSON.stringify(arr));
    } catch {}
  }

  public clear(uid?: string) {
    this.questions.clear();
    this.knownRequirements.clear();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.getStorageKey(uid));
      } catch {}
    }
  }

  public normalize(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Semantic topic extraction from question text
   */
  public extractTopic(questionText: string): string {
    const norm = this.normalize(questionText);
    if (/color|palette|accent|theme|visual theme|dark|light|obsidian|vibe/i.test(norm)) return 'theme_colors';
    if (/name|branding|brand name|identity|title/i.test(norm)) return 'branding_name';
    if (/layout|structure|bento|grid|navbar|dock|cards/i.test(norm)) return 'layout_structure';
    if (/time|hour|schedule|wake|morning|start/i.test(norm)) return 'timetable_time';
    if (/focus|fitness|study|routine|target|objective/i.test(norm)) return 'routine_focus';
    if (/single\s*file|multi\s*file|architecture|file\s*count/i.test(norm)) return 'file_architecture';
    return norm.slice(0, 30);
  }

  /**
   * Checks if the user's prompt text ALREADY contains the answer to this question
   */
  public isAnswerInPrompt(promptText: string, topic: string): string | null {
    const lower = promptText.toLowerCase();

    // If topic is theme/colors
    if (topic === 'theme_colors') {
      if (/dark|obsidian|black|neon|crimson|red|cyber/i.test(lower)) {
        return 'Dark Obsidian & Crimson (Extracted from prompt)';
      }
      if (/light|clean white|minimal/i.test(lower)) {
        return 'Minimal Clean Light (Extracted from prompt)';
      }
      if (/glassmorphic|glass|bento/i.test(lower)) {
        return 'Modern Glassmorphic & Bento (Extracted from prompt)';
      }
    }

    // If topic is file architecture
    if (topic === 'file_architecture') {
      if (/single\s*file|one\s*file|index\.html|standalone/i.test(lower)) {
        return 'Single Complete HTML File';
      }
    }

    // If timetable focus
    if (topic === 'routine_focus') {
      if (/workout|gym|fitness|training|muscle/i.test(lower)) {
        return 'High-Performance Work & Fitness';
      }
      if (/study|exam|revision|academic/i.test(lower)) {
        return 'Study, Revision & Skill Growth';
      }
    }

    return null;
  }

  /**
   * Determines if a question has already been answered
   */
  public isQuestionAnswered(questionText: string, topic?: string, currentPrompt?: string): boolean {
    const effTopic = topic || this.extractTopic(questionText);

    // 1. Check if current prompt already provided the answer
    if (currentPrompt) {
      const promptAnswer = this.isAnswerInPrompt(currentPrompt, effTopic);
      if (promptAnswer) return true;
    }

    // 2. Check semantic topic in stored questions
    for (const q of this.questions.values()) {
      if (q.status === 'answered' && (q.topic === effTopic || this.normalize(q.questionText) === this.normalize(questionText))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Records a question that was asked
   */
  public recordQuestion(
    questionId: string,
    questionText: string,
    options: string[],
    topic?: string,
    projectId?: string,
    chatId?: string
  ): StoredQuestion {
    const effTopic = topic || this.extractTopic(questionText);
    const stored: StoredQuestion = {
      questionId,
      questionText,
      normalizedQuestion: this.normalize(questionText),
      topic: effTopic,
      options,
      timestamp: new Date().toISOString(),
      projectId,
      chatId,
      status: 'asked',
    };
    this.questions.set(questionId, stored);
    this.saveToStorage();
    return stored;
  }

  /**
   * Records an answer given by the user
   */
  public recordAnswer(questionIdOrTopic: string, answer: string, isCustom = false, uid?: string) {
    let matched = this.questions.get(questionIdOrTopic);
    if (!matched) {
      // Find by topic or normalized question
      const effTopic = this.extractTopic(questionIdOrTopic);
      for (const q of this.questions.values()) {
        if (q.topic === effTopic || q.questionId === questionIdOrTopic) {
          matched = q;
          break;
        }
      }
    }

    if (matched) {
      matched.status = 'answered';
      if (isCustom) {
        matched.customAnswer = answer;
      } else {
        matched.selectedAnswer = answer;
      }
      matched.timestamp = new Date().toISOString();
    } else {
      // Create new answered record directly
      const effTopic = this.extractTopic(questionIdOrTopic);
      this.questions.set(`q-${Date.now()}`, {
        questionId: `q-${Date.now()}`,
        questionText: questionIdOrTopic,
        normalizedQuestion: this.normalize(questionIdOrTopic),
        topic: effTopic,
        options: [],
        selectedAnswer: isCustom ? undefined : answer,
        customAnswer: isCustom ? answer : undefined,
        timestamp: new Date().toISOString(),
        status: 'answered',
      });
    }

    this.saveToStorage(uid);
  }

  /**
   * Returns all known requirements extracted from answered questions
   */
  public getKnownRequirements(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const q of this.questions.values()) {
      if (q.status === 'answered') {
        const val = q.customAnswer || q.selectedAnswer;
        if (val) {
          result[q.topic] = val;
        }
      }
    }
    return result;
  }
}

export const questionMemory = new QuestionMemoryManager();
