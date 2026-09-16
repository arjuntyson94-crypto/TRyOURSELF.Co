import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  BookmarkPlus,
  BookOpen,
  ArrowRight,
  Sparkles,
  Send,
  PlusCircle,
  Check,
  ChevronDown,
  Layers,
  GraduationCap,
  PenTool,
} from "lucide-react";
import { Problem, NotebookEntry, Subject, ClassLevel, ReviewStatus } from "../types";
import { CBSE_PROBLEMS } from "../data/cbseProblems";
import { MathRenderer } from "./MathRenderer";
import { Scratchpad } from "./Scratchpad";

interface PedagogicalSolverProps {
  onSaveToNotebook: (entry: Omit<NotebookEntry, "id" | "dateAdded">) => void;
  onOpenFormulaLibrary?: (subject?: Subject) => void;
  selectedProblemId?: string | null;
}

export const PedagogicalSolver: React.FC<PedagogicalSolverProps> = ({
  onSaveToNotebook,
  onOpenFormulaLibrary,
  selectedProblemId,
}) => {
  // Problems pool (curated + custom generated)
  const [problems, setProblems] = useState<Problem[]>(CBSE_PROBLEMS);
  const [activeProblemId, setActiveProblemId] = useState<string>(
    selectedProblemId || CBSE_PROBLEMS[0].id
  );

  // Subject and Class filters for problem selector
  const [filterSubject, setFilterSubject] = useState<"All" | Subject>("All");
  const [filterClass, setFilterClass] = useState<"All" | ClassLevel>("All");

  // Solver interactive 3-step states per problem
  const [studentAttempt, setStudentAttempt] = useState<string>("");
  const [scratchpadSnapshot, setScratchpadSnapshot] = useState<string | undefined>(undefined);
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [attemptSubmitted, setAttemptSubmitted] = useState<boolean>(false);

  const [hintUnlocked, setHintUnlocked] = useState<boolean>(false);
  const [formulaUnlocked, setFormulaUnlocked] = useState<boolean>(false);

  // Review status & notes for notebook saving
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>("Needs Revision");
  const [personalMistakeNotes, setPersonalMistakeNotes] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Custom problem creation state
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customProblemText, setCustomProblemText] = useState("");
  const [customSubject, setCustomSubject] = useState<Subject>("Physics");
  const [customClass, setCustomClass] = useState<ClassLevel>("Class 12");
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  // If selectedProblemId changes from external props
  React.useEffect(() => {
    if (selectedProblemId) {
      const exists = problems.find((p) => p.id === selectedProblemId);
      if (exists) {
        setActiveProblemId(selectedProblemId);
        resetStepState();
      }
    }
  }, [selectedProblemId, problems]);

  const activeProblem = problems.find((p) => p.id === activeProblemId) || problems[0];

  const resetStepState = () => {
    setStudentAttempt("");
    setScratchpadSnapshot(undefined);
    setAttemptSubmitted(false);
    setHintUnlocked(false);
    setFormulaUnlocked(false);
    setSavedSuccess(false);
    setPersonalMistakeNotes("");
    setReviewStatus("Needs Revision");
  };

  const handleSelectProblem = (id: string) => {
    setActiveProblemId(id);
    resetStepState();
  };

  // Step 1: Submit Attempt
  const handleSubmitAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAttempt.trim() && !scratchpadSnapshot) return;
    setAttemptSubmitted(true);
  };

  // Step 2: Unlock Hint
  const handleUnlockHint = () => {
    setHintUnlocked(true);
  };

  // Step 3: Unlock Formula
  const handleUnlockFormula = () => {
    setFormulaUnlocked(true);
    // Celebrate stepping up to formula reveal
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#10B981", "#EAB308", "#38BDF8"],
      });
    } catch {
      // ignore
    }
  };

  // Save into Revision Notebook
  const handleSaveNotebook = () => {
    onSaveToNotebook({
      problemId: activeProblem.id,
      problemTitle: activeProblem.title,
      subject: activeProblem.subject,
      classLevel: activeProblem.classLevel,
      chapter: activeProblem.chapter,
      statement: activeProblem.statement,
      studentAttempt: studentAttempt || "Scratchpad diagram attempt",
      scratchpadSnapshot: scratchpadSnapshot,
      level1Hint: activeProblem.level1Hint,
      formulaReveal: `${activeProblem.formulaReveal.governingLaw}: ${activeProblem.formulaReveal.latexFormulas.join(", ")}`,
      solutionSteps: activeProblem.solution.steps.map((s) => `${s.description}: ${s.latexEquation || ""}`),
      finalAnswer: activeProblem.solution.finalAnswer,
      status: reviewStatus,
      mistakeNotes: personalMistakeNotes,
    });

    setSavedSuccess(true);
    try {
      confetti({
        particleCount: 65,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10B981", "#EAB308", "#38BDF8"],
      });
    } catch {
      // ignore
    }
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Generate Custom Pedagogical Problem using AI / Engine
  const handleCreateCustomProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customProblemText.trim()) return;

    setIsGeneratingCustom(true);
    setCustomError(null);

    try {
      const response = await fetch("/api/pedagogy/solve-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemText: customProblemText,
          subject: customSubject,
          targetClass: customClass,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to formulate pedagogical breakdown");
      }

      const data = await response.json();

      const newCustomProblem: Problem = {
        id: `custom-${Date.now()}`,
        title: `${data.chapter || "Custom Problem"}: ${customProblemText.slice(0, 45)}...`,
        subject: (data.subject as Subject) || customSubject,
        classLevel: customClass,
        chapter: data.chapter || "Custom Topic",
        difficulty: "High-Yield Board",
        statement: customProblemText,
        givenVariables: data.givenVariables || "Given in problem statement",
        targetUnknown: data.targetUnknown || "Target solution",
        level1Hint: data.level1Hint || "Break the problem into primary equations and balance units.",
        formulaReveal: {
          governingLaw: data.chapter || "Core Scientific Law",
          latexFormulas: [data.formulaReveal || "Fundamental Equation"],
          conceptSummary: data.coreConcepts?.join(" • ") || "Key theoretical principles",
        },
        solution: {
          steps: Array.isArray(data.stepByStepSolution)
            ? data.stepByStepSolution.map((s: string, idx: number) => ({
                stepNumber: idx + 1,
                description: s,
                latexEquation: "",
                explanation: "",
              }))
            : [
                {
                  stepNumber: 1,
                  description: "Solve step by step",
                  latexEquation: "",
                  explanation: "",
                },
              ],
          finalAnswer: "Solved according to CBSE Board standard",
          unit: "",
        },
        cbseTrapAlert: data.cbseTrapAlert || "Remember to write proper SI units in final answer.",
        isCustom: true,
      };

      setProblems((prev) => [newCustomProblem, ...prev]);
      setActiveProblemId(newCustomProblem.id);
      resetStepState();
      setIsCustomModalOpen(false);
      setCustomProblemText("");
    } catch (err: any) {
      console.error(err);
      setCustomError("Could not generate solver. Please check your connection or try again.");
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const filteredProblems = problems.filter((p) => {
    if (filterSubject !== "All" && p.subject !== filterSubject) return false;
    if (filterClass !== "All" && p.classLevel !== filterClass) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 text-slate-100">
      {/* Top Header & Problem Selector Bar */}
      <div className="bg-[#07283e] border border-sky-800/60 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Active Pedagogical Engine
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              CBSE Class 11 &amp; 12
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            3-Step Pedagogical STEM Solver
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            1. Formulate Your Attempt &rarr; 2. Conceptual Hint &rarr; 3. Formula Reveal &amp; CBSE Marking Scheme
          </p>
        </div>

        {/* Action Buttons: Add Custom Problem & Scratchpad Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            id="btn-toggle-scratchpad"
            type="button"
            onClick={() => setShowScratchpad(!showScratchpad)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showScratchpad
                ? "bg-sky-700 text-white border-sky-500 shadow-md"
                : "bg-[#061d2f] text-slate-300 border-sky-800/60 hover:bg-sky-900/40"
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showScratchpad ? "Hide Scratchpad" : "Open Drawing Scratchpad"}</span>
          </button>

          <button
            id="btn-add-custom-problem"
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Solve Any Problem</span>
          </button>
        </div>
      </div>

      {/* Problem Quick Selector Tabs */}
      <div className="bg-[#061e31] border border-sky-800/50 rounded-xl p-3 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            Select CBSE Exemplar Problem:
          </span>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value as any)}
              className="bg-[#082F49] border border-sky-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
            >
              <option value="All">All Subjects</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
            </select>

            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value as any)}
              className="bg-[#082F49] border border-sky-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
            >
              <option value="All">Class 11 &amp; 12</option>
              <option value="Class 11">Class 11</option>
              <option value="Class 12">Class 12</option>
            </select>
          </div>
        </div>

        {/* Problems list horizontal pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {filteredProblems.map((p) => {
            const isActive = p.id === activeProblem.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectProblem(p.id)}
                className={`px-3 py-2 rounded-xl border text-left shrink-0 max-w-[280px] transition-all ${
                  isActive
                    ? "bg-[#0c3859] border-emerald-400 shadow-md ring-1 ring-emerald-400/40"
                    : "bg-[#08263c] border-sky-900 hover:bg-[#0b334f] text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <span
                    className={`font-semibold ${
                      p.subject === "Physics"
                        ? "text-sky-400"
                        : p.subject === "Chemistry"
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {p.subject} • {p.classLevel}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-[9px] font-bold">
                    {p.difficulty}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-100 truncate">{p.title}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{p.chapter}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Embedded Scratchpad Drawer (if open) */}
      {showScratchpad && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5" />
              Interactive Scratchpad — Draw Free-Body Diagrams, Molecular Bonds &amp; Equations
            </span>
            <span className="text-[11px] text-slate-400">
              Click &quot;Attach to Attempt&quot; inside the scratchpad to link your drawing!
            </span>
          </div>
          <Scratchpad
            onCaptureSnapshot={(dataUrl) => {
              setScratchpadSnapshot(dataUrl);
            }}
            attachedSnapshot={scratchpadSnapshot}
            initialHeight={380}
          />
        </div>
      )}

      {/* Main Problem Card */}
      <div className="bg-[#092d47] border border-sky-800/70 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
        {/* Problem Header */}
        <div className="border-b border-sky-800/60 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-950 text-sky-300 border border-sky-700">
                {activeProblem.subject}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-950 text-sky-300 border border-sky-700">
                {activeProblem.classLevel}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#072439] text-slate-300 border border-sky-800">
                {activeProblem.chapter}
              </span>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
              {activeProblem.difficulty}
            </span>
          </div>

          <h3 className="text-xl font-bold text-white tracking-tight">{activeProblem.title}</h3>

          <div className="mt-3 p-4 rounded-xl bg-[#061e31] border border-sky-800/70 text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
            {activeProblem.statement}
          </div>

          {activeProblem.diagramHint && (
            <div className="mt-2 text-xs text-slate-400 italic flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span>Diagram Suggestion: {activeProblem.diagramHint}</span>
            </div>
          )}

          {/* Given Knowns and Unknown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
            <div className="bg-[#072338] p-3 rounded-lg border border-sky-900">
              <span className="font-semibold text-slate-400 block mb-0.5">Given Quantities:</span>
              <span className="text-slate-200 font-mono">{activeProblem.givenVariables}</span>
            </div>
            <div className="bg-[#072338] p-3 rounded-lg border border-sky-900">
              <span className="font-semibold text-slate-400 block mb-0.5">Target Unknown:</span>
              <span className="text-emerald-300 font-mono">{activeProblem.targetUnknown}</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: YOUR ATTEMPT */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#072236] border border-sky-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
                1
              </span>
              <div>
                <h4 className="font-bold text-white text-base">Step 1: Your Attempt</h4>
                <p className="text-xs text-slate-400">
                  Write down your reasoning, known values, or formula guess before unlocking hints.
                </p>
              </div>
            </div>

            {attemptSubmitted && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Attempt Recorded
              </span>
            )}
          </div>

          <form onSubmit={handleSubmitAttempt} className="flex flex-col gap-3">
            <textarea
              id="input-student-attempt"
              rows={3}
              value={studentAttempt}
              onChange={(e) => setStudentAttempt(e.target.value)}
              placeholder="e.g., Let initial speed u = 28 m/s, launch angle θ = 30°. In vertical direction, at max height v_y = 0. So 0 = u_y^2 - 2g H..."
              className="w-full bg-[#051827] border border-sky-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 resize-y font-mono"
            />

            {/* Attached diagram preview if captured */}
            {scratchpadSnapshot && (
              <div className="flex items-center gap-3 p-2 bg-[#051827] border border-sky-800 rounded-xl">
                <img
                  src={scratchpadSnapshot}
                  alt="Student Diagram Snapshot"
                  className="w-24 h-14 object-cover rounded-lg border border-sky-700 bg-[#082F49]"
                />
                <div className="text-xs">
                  <span className="text-emerald-400 font-bold block">Scratchpad Snapshot Attached!</span>
                  <span className="text-slate-400 text-[11px]">Included in your submission and Revision Notebook</span>
                </div>
                <button
                  type="button"
                  onClick={() => setScratchpadSnapshot(undefined)}
                  className="text-xs text-rose-400 hover:text-rose-300 ml-auto mr-2"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowScratchpad(true)}
                  className="text-sky-400 hover:text-sky-300 underline underline-offset-2 flex items-center gap-1"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  Draw diagram on Scratchpad
                </button>
              </div>

              <button
                id="btn-submit-attempt"
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 self-end"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{attemptSubmitted ? "Update Attempt" : "Record My Attempt"}</span>
              </button>
            </div>
          </form>

          {attemptSubmitted && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-200">
              <p className="font-semibold flex items-center gap-1 text-emerald-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Pedagogical Metacognition Check:
              </p>
              <p className="text-slate-300 leading-relaxed">
                Excellent! By committing your reasoning first, you activate active recall. Now inspect the Level 1 Hint to see if your physical intuition aligns with CBSE exam standards!
              </p>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: LEVEL 1 HINT */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#072236] border border-sky-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full font-black flex items-center justify-center text-sm shadow-md transition-colors ${
                  hintUnlocked
                    ? "bg-yellow-500 text-slate-950"
                    : "bg-[#061a29] text-slate-400 border border-sky-800"
                }`}
              >
                2
              </span>
              <div>
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  Step 2: Level 1 Hint
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    Conceptual Nudge
                  </span>
                </h4>
                <p className="text-xs text-slate-400">
                  Provides the physical intuition or geometric direction without giving away the final formula.
                </p>
              </div>
            </div>
          </div>

          {!hintUnlocked ? (
            <div className="mt-4 p-5 rounded-xl bg-[#051827] border border-sky-900 text-center flex flex-col items-center gap-2">
              <Lightbulb className="w-8 h-8 text-yellow-400 animate-bounce" />
              <p className="text-sm font-semibold text-slate-200">Need a conceptual nudge?</p>
              <p className="text-xs text-slate-400 max-w-md">
                Try reasoning through your attempt first. If you feel stuck, unlock the Level 1 hint for a targeted prompt.
              </p>
              <button
                id="btn-unlock-hint"
                type="button"
                onClick={handleUnlockHint}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Unlock Level 1 Hint</span>
              </button>
            </div>
          ) : (
            <div className="mt-3 p-4 rounded-xl bg-[#051827] border border-yellow-500/40 text-slate-100 text-sm leading-relaxed animate-fade-in">
              <div className="flex items-center gap-2 text-yellow-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                <Lightbulb className="w-4 h-4" />
                <span>Level 1 Guiding Intuition:</span>
              </div>
              <p className="text-slate-200">{activeProblem.level1Hint}</p>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: FORMULA REVEAL & STEP-BY-STEP SOLUTION */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#072236] border border-sky-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full font-black flex items-center justify-center text-sm shadow-md transition-colors ${
                  formulaUnlocked
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-[#061a29] text-slate-400 border border-sky-800"
                }`}
              >
                3
              </span>
              <div>
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  Step 3: Formula Reveal &amp; CBSE Solution
                </h4>
                <p className="text-xs text-slate-400">
                  Reveals exact mathematical formulation, step-by-step resolution, and CBSE marking scheme criteria.
                </p>
              </div>
            </div>
          </div>

          {!formulaUnlocked ? (
            <div className="mt-4 p-5 rounded-xl bg-[#051827] border border-sky-900 text-center flex flex-col items-center gap-2">
              <BookOpen className="w-8 h-8 text-emerald-400" />
              <p className="text-sm font-semibold text-slate-200">Ready to verify the exact governing formulas?</p>
              <p className="text-xs text-slate-400 max-w-md">
                Make sure you have formulated an attempt or consulted the Level 1 hint before viewing the official solution.
              </p>
              <button
                id="btn-unlock-formula"
                type="button"
                onClick={handleUnlockFormula}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Reveal Formula &amp; Step-by-Step Solution</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-4 animate-fade-in">
              {/* Formula Reveal Box */}
              <div className="p-4 rounded-xl bg-[#051827] border border-emerald-500/50 shadow-inner">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Governing Law: {activeProblem.formulaReveal.governingLaw}
                  </span>
                  {onOpenFormulaLibrary && (
                    <button
                      type="button"
                      onClick={() => onOpenFormulaLibrary(activeProblem.subject)}
                      className="text-xs text-sky-400 hover:text-sky-300 underline"
                    >
                      View in Formula Library &rarr;
                    </button>
                  )}
                </div>

                <div className="py-2 flex flex-col items-center gap-2 bg-[#061d2f] rounded-lg border border-sky-900/80 p-3">
                  {activeProblem.formulaReveal.latexFormulas.map((f, idx) => (
                    <MathRenderer key={idx} latex={f} displayMode={true} className="text-lg" />
                  ))}
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {activeProblem.formulaReveal.conceptSummary}
                </p>
              </div>

              {/* Step-by-Step Solution */}
              <div className="p-4 rounded-xl bg-[#051827] border border-sky-800/80">
                <h5 className="font-bold text-slate-200 text-sm mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  CBSE Board Standard Step-by-Step Solution
                </h5>

                <div className="flex flex-col gap-3">
                  {activeProblem.solution.steps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-3 rounded-lg bg-[#061d2f] border border-sky-900 flex flex-col gap-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400">
                          Step {step.stepNumber}: {step.description}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">1 Mark Step</span>
                      </div>
                      {step.latexEquation && (
                        <div className="my-1.5 py-1 text-center bg-[#072439] rounded border border-sky-950">
                          <MathRenderer latex={step.latexEquation} displayMode={true} />
                        </div>
                      )}
                      <p className="text-slate-300 text-[11px]">{step.explanation}</p>
                    </div>
                  ))}
                </div>

                {/* Final Answer Banner */}
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border-2 border-emerald-500/60 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold block">
                      Final Verified Answer:
                    </span>
                    <span className="text-base font-bold text-white font-mono">
                      {activeProblem.solution.finalAnswer}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 font-extrabold text-xs">
                    Q.E.D.
                  </span>
                </div>
              </div>

              {/* CBSE Board Trap Alert */}
              <div className="p-4 rounded-xl bg-yellow-950/20 border border-yellow-500/40 text-xs">
                <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase tracking-wider mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>CBSE Exam Trap Alert (Common Mistake):</span>
                </div>
                <p className="text-slate-200 leading-relaxed font-medium">
                  {activeProblem.cbseTrapAlert}
                </p>
              </div>

              {/* Save to Notebook Section */}
              <div className="p-4 rounded-xl bg-[#061d2f] border border-sky-800/80 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <BookmarkPlus className="w-4 h-4 text-yellow-400" />
                    Add this problem to your CBSE Revision Notebook &amp; Mistake Diary:
                  </span>

                  {/* Status Selector */}
                  <div className="flex items-center gap-1.5 text-xs">
                    {(["Needs Revision", "CBSE High-Yield", "Mastered"] as ReviewStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setReviewStatus(st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          reviewStatus === st
                            ? st === "Mastered"
                              ? "bg-emerald-500 text-slate-950 border-emerald-400"
                              : st === "CBSE High-Yield"
                              ? "bg-yellow-500 text-slate-950 border-yellow-400"
                              : "bg-rose-500 text-white border-rose-400"
                            : "bg-[#08283f] text-slate-400 border-sky-900 hover:text-slate-200"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={personalMistakeNotes}
                  onChange={(e) => setPersonalMistakeNotes(e.target.value)}
                  placeholder="Optional mistake reflection (e.g. 'Always double check unit conversions from cm² to m²')..."
                  className="bg-[#051827] border border-sky-800 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Saved entries can be exported as printable PDF with full diagrams &amp; formulas!
                  </span>

                  <button
                    id="btn-save-to-notebook"
                    type="button"
                    onClick={handleSaveNotebook}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Saved to Notebook!</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span>Save to Revision Notebook</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SOLVE CUSTOM STEM / CBSE PROBLEM */}
      {/* ------------------------------------------------------------- */}
      {isCustomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#082F49] border border-sky-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-sky-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Solve Custom STEM / CBSE Problem
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Paste or type any STEM or CBSE Class 11/12 problem statement. Our pedagogical solver will structure it into the TRyOURSELF 3-step format (Attempt &rarr; Level 1 Hint &rarr; Formula Reveal &amp; CBSE Solution).
            </p>

            <form onSubmit={handleCreateCustomProblem} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Subject:</label>
                  <select
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value as Subject)}
                    className="w-full bg-[#061d2f] border border-sky-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Class Level:</label>
                  <select
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value as ClassLevel)}
                    className="w-full bg-[#061d2f] border border-sky-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Problem Statement:
                </label>
                <textarea
                  required
                  rows={4}
                  value={customProblemText}
                  onChange={(e) => setCustomProblemText(e.target.value)}
                  placeholder="e.g. A ball is projected horizontally from the top of a tower with velocity 15 m/s. It reaches the ground in 3 seconds. Find the height of the tower and the velocity with which it strikes the ground."
                  className="w-full bg-[#061d2f] border border-sky-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono resize-y"
                />
              </div>

              {customError && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs">
                  {customError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-sky-800/80">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-sky-900/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingCustom}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  {isGeneratingCustom ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Structuring Pedagogical Steps...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Formulate 3-Step Solver</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
