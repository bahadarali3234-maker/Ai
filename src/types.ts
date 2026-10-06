import type { ClarificationDecision } from './utils/clarificationGate';

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  year: string;
  tags: string[];
  image: string;
  description: string;
  client: string;
  deliverables: string[];
  accentColor: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  deliverables: string[];
  iconName: string;
  image: string;
  tagline?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ClientBrand {
  name: string;
  category?: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  size?: number;
  type: string;
  preview?: string;
  isImage: boolean;
}

export interface QuestionBlock {
  id: string;
  title: string;
  description?: string;
  options: string[];
  selectedOption?: string;
  customAnswer?: string;
  isAnswered?: boolean;
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

export interface ArtifactVersion {
  version: number;
  content: string;
  timestamp: string;
  changelog: string;
  diffSummary?: string;
  author?: 'ai' | 'user';
}

export interface Artifact {
  id: string;
  projectId: string;
  name: string;
  title: string;
  type: 'html' | 'tsx' | 'prompt' | 'file' | 'code' | 'css' | 'js';
  version: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  tags: string[];
  userDecisions?: string[];
  versions: ArtifactVersion[];
}

export interface ProjectReference {
  id: string;
  name: string;
  type: string;
  preview?: string;
  role?: string;
  createdAt: string;
}

export interface ProjectMemory {
  id: string;
  name: string;
  description: string;
  threadId: string;
  createdAt: string;
  updatedAt: string;
  artifacts: Artifact[];
  decisions: string[];
  references: ProjectReference[];
  summary: string;
  tags: string[];
}

export interface MemoryContextPackage {
  current_request: string;
  conversation_summary: string;
  relevant_previous_messages: Array<{ role: string; content: string; timestamp?: string }>;
  relevant_projects: Array<{ id: string; name: string; description: string; summary: string }>;
  relevant_artifacts: Array<{
    id: string;
    projectId: string;
    name: string;
    title: string;
    version: number;
    type: string;
    contentSnippet: string;
    fullContent?: string;
    versionsCount: number;
  }>;
  latest_versions: Array<{ artifactName: string; version: number }>;
  user_decisions: string[];
  active_task: string;
  required_output: string;
}
