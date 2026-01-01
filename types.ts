
export enum QuestionType {
  MCQ = 'MCQ',
  TF = 'TF',
  SHORT_ANSWER = 'SHORT_ANSWER',
  VOCABULARY = 'VOCABULARY',
  CHARACTER_DRILL = 'CHARACTER_DRILL',
  SYMBOL_DRILL = 'SYMBOL_DRILL',
  SENTENCE_DRILL = 'SENTENCE_DRILL',
  PAGE_BREAK = 'PAGE_BREAK'
}

export enum VariationLevel {
  STRICT = 'STRICT', // Slightly Alter
  REPHRASE = 'REPHRASE', // Significantly Rephrase
  CREATIVE = 'CREATIVE' // Generate Similar
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  isChallenge: boolean;
}

export interface Worksheet {
  id?: string;
  title: string;
  topic: string;
  educationalLevel: string;
  questions: Question[];
  coloringImage?: string; // Base64 image data for preschool coloring pages
  diagramImage?: string;  // Base64 image data for technical diagrams
  savedAt?: number;
}

export enum AppMode {
  GENERATOR = 'GENERATOR',
  WORKSHEET = 'WORKSHEET',
  QUIZ = 'QUIZ'
}

export enum ThemeType {
  CLASSIC = 'CLASSIC',
  CREATIVE = 'CREATIVE'
}

export enum InputMethod {
  PROMPT = 'PROMPT',
  PASTE = 'PASTE',
  UPLOAD = 'UPLOAD'
}
