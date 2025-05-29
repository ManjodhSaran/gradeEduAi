export interface Question {
  id: string;
  userId: string;
  prompt: string;
  type: 'text' | 'image' | 'pdf' | 'audio';
  sourceUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Solution {
  id: string;
  questionId: string;
  steps: SolutionStep[];
  isCorrect: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SolutionStep {
  id: string;
  content: string;
  order: number;
}

export interface QuestionSubmitRequest {
  prompt: string;
  type: 'text' | 'image' | 'pdf' | 'audio';
  file?: File | Blob;
}

export interface TranscriptionResponse {
  id: string;
  text: string;
  status: string;
  error?: string;
}