export interface Paper {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
  abstract?: string;
  relevance: string;
  url?: string;
}

export interface AnalysisResult {
  summary: string;
  mainField: string;
  subFields: string[];
  keyTerms: string[];
  recommendations: Paper[];
  advice: string[];
  suggestions: string[];
}

export interface PaperSummary {
  paperId: string;
  summary: string;
  keyFindings: string[];
  methodology: string;
  implications: string;
}

export interface ResearchPlan {
  objective: string;
  phases: {
    name: string;
    duration: string;
    tasks: string[];
    deliverables: string[];
  }[];
  resources: string[];
  expectedOutcomes: string[];
}

export interface FundamentalKnowledge {
  topic: string;
  description: string;
  concepts: {
    term: string;
    definition: string;
    importance: string;
  }[];
  recommendedResources: string[];
}

// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
}

// Experiment Data types
export interface ExperimentData {
  id: string;
  projectName: string;
  topic: string;
  purpose: string;
  managerName: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  columns: string[];
  rows: Record<string, string>[];
  aiAnalysis?: ExperimentAIAnalysis;
}

export interface ExperimentAIAnalysis {
  summary: string;
  insights: string[];
  recommendations: string[];
  dataQuality: string;
}
