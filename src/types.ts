export type Subject = "Physics" | "Chemistry" | "Mathematics";
export type ClassLevel = "Class 11" | "Class 12";
export type Difficulty = "Foundation" | "Moderate" | "High-Yield Board" | "Competitive/Exemplar";
export type ReviewStatus = "Mastered" | "Needs Revision" | "CBSE High-Yield";

export interface FormulaVariable {
  symbol: string;
  name: string;
  unit: string;
}

export interface Formula {
  id: string;
  title: string;
  subject: Subject;
  classLevel: ClassLevel;
  chapter: string;
  latex: string;
  explanation: string;
  variables: FormulaVariable[];
  cbseExamTip: string;
  tags: string[];
  exampleProblemId?: string;
}

export interface ProblemStep {
  stepNumber: number;
  description: string;
  latexEquation?: string;
  explanation?: string;
}

export interface Problem {
  id: string;
  title: string;
  subject: Subject;
  classLevel: ClassLevel;
  chapter: string;
  difficulty: Difficulty;
  statement: string;
  diagramHint?: string;
  givenVariables: string;
  targetUnknown: string;
  level1Hint: string;
  formulaReveal: {
    governingLaw: string;
    latexFormulas: string[];
    conceptSummary: string;
  };
  solution: {
    steps: ProblemStep[];
    finalAnswer: string;
    unit: string;
  };
  cbseTrapAlert: string;
  isCustom?: boolean;
}

export interface NotebookEntry {
  id: string;
  problemId?: string;
  problemTitle: string;
  subject: Subject;
  classLevel: ClassLevel;
  chapter: string;
  statement: string;
  studentAttempt: string;
  scratchpadSnapshot?: string;
  level1Hint?: string;
  formulaReveal?: string;
  solutionSteps?: string[];
  finalAnswer?: string;
  status: ReviewStatus;
  mistakeNotes?: string;
  dateAdded: string;
}

export interface SavedFormulaBookmark {
  formulaId: string;
  addedAt: string;
  personalNotes?: string;
}

export type DrawingTool = "pen" | "line" | "arrow" | "rect" | "circle" | "eraser";
export type CanvasGrid = "blank" | "graph" | "dot" | "isometric";

export interface StemSymbol {
  symbol: string;
  name: string;
  category: "Math" | "Physics" | "Chemistry";
  latexEquivalent?: string;
}
