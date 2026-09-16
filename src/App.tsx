import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  PenTool,
  BookOpen,
  FileText,
  Sparkles,
  Layers,
  Printer,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { NotebookEntry, Formula, Subject } from "./types";
import { PedagogicalSolver } from "./components/PedagogicalSolver";
import { Scratchpad } from "./components/Scratchpad";
import { FormulaRevisionLibrary } from "./components/FormulaRevisionLibrary";
import { RevisionNotebook } from "./components/RevisionNotebook";
import { CBSE_PROBLEMS } from "./data/cbseProblems";

type ActiveTab = "solver" | "scratchpad" | "formulas" | "notebook";

const INITIAL_SEEDED_ENTRIES: NotebookEntry[] = [
  {
    id: "seed-entry-1",
    problemId: "prob-phy-01",
    problemTitle: "Class 11: Projectile Maximum Height & Range",
    subject: "Physics",
    classLevel: "Class 11",
    chapter: "Motion in a Plane",
    statement:
      "A cricket ball is thrown with an initial speed of 28 m/s at an angle of 30° with the horizontal. Calculate: (a) maximum height, and (b) horizontal range. (g = 9.8 m/s²)",
    studentAttempt:
      "u = 28 m/s, θ = 30°. Vertical velocity component u_y = 28 * sin(30°) = 14 m/s. Peak vertical velocity is 0. Using 0 = 14^2 - 2(9.8)H gave H = 10m.",
    level1Hint:
      "Decompose the motion into two independent 1D motions: horizontal (constant velocity) and vertical (uniform acceleration -g).",
    formulaReveal:
      "H_max = (u² sin²θ)/(2g), Range R = (u² sin 2θ)/g",
    solutionSteps: [
      "u_y = 28 sin 30° = 14 m/s",
      "H_max = (14)² / (2 * 9.8) = 10.0 m",
      "R = 28² sin 60° / 9.8 = 40√3 ≈ 69.28 m",
    ],
    finalAnswer: "H_max = 10 m, Range R = 69.28 m",
    status: "CBSE High-Yield",
    mistakeNotes:
      "Remember in CBSE board numericals: range uses sin(2θ) with double angle, not sin²θ!",
    dateAdded: "2026-09-15",
  },
  {
    id: "seed-entry-2",
    problemId: "prob-chem-01",
    problemTitle: "Class 12: Nernst Equation & Cell Potential",
    subject: "Chemistry",
    classLevel: "Class 12",
    chapter: "Electrochemistry",
    statement:
      "Represent the galvanic cell and calculate the EMF at 298 K: Mg(s) | Mg²⁺(0.10 M) || Cu²⁺(1.0 × 10⁻³ M) | Cu(s). Given E°(Mg²⁺/Mg) = -2.37 V, E°(Cu²⁺/Cu) = +0.34 V.",
    studentAttempt:
      "E°_cell = +0.34 - (-2.37) = 2.71 V. Net reaction Mg + Cu²⁺ -> Mg²⁺ + Cu, so n = 2. Q = [Mg²⁺]/[Cu²⁺] = 0.1 / 1e-3 = 100.",
    level1Hint:
      "Recall Anode = Oxidation, Cathode = Reduction. Write net reaction to find number of electrons exchanged n.",
    formulaReveal:
      "Nernst Equation: E_cell = E°_cell - (0.0591/n) log10(Q)",
    solutionSteps: [
      "E°_cell = 0.34 - (-2.37) = +2.71 V",
      "Q = 0.10 / (1.0 × 10⁻³) = 100 => log(Q) = 2",
      "E_cell = 2.71 - (0.0591/2) * 2 = 2.651 V",
    ],
    finalAnswer: "E_cell = 2.651 V",
    status: "Mastered",
    mistakeNotes:
      "Always write the balanced stoichiometric equation so the powers of ions in Q are correct.",
    dateAdded: "2026-09-16",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("solver");
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

  // Local storage state for Revision Notebook
  const [notebookEntries, setNotebookEntries] = useState<NotebookEntry[]>(() => {
    try {
      const saved = localStorage.getItem("tryourself_revision_notebook");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_SEEDED_ENTRIES;
    } catch {
      return INITIAL_SEEDED_ENTRIES;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("tryourself_revision_notebook", JSON.stringify(notebookEntries));
    } catch {
      // ignore
    }
  }, [notebookEntries]);

  // Save new entry from Pedagogical Solver
  const handleSaveToNotebook = (newEntry: Omit<NotebookEntry, "id" | "dateAdded">) => {
    const entry: NotebookEntry = {
      ...newEntry,
      id: `entry-${Date.now()}`,
      dateAdded: new Date().toISOString().split("T")[0],
    };
    setNotebookEntries((prev) => [entry, ...prev]);
  };

  const handleDeleteNotebookEntry = (id: string) => {
    setNotebookEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleUpdateStatus = (id: string, status: NotebookEntry["status"]) => {
    setNotebookEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  const handleUpdateNotes = (id: string, mistakeNotes: string) => {
    setNotebookEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, mistakeNotes } : e))
    );
  };

  // Switch from Formula Library to Solver
  const handleSelectFormulaForSolver = (formula: Formula) => {
    // Find matching CBSE problem or set filter
    const matching = CBSE_PROBLEMS.find((p) => p.chapter === formula.chapter || p.subject === formula.subject);
    if (matching) {
      setSelectedProblemId(matching.id);
    }
    setActiveTab("solver");
  };

  return (
    <div className="min-h-screen bg-[#082F49] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* ----------------------------------------------------------------- */}
      {/* TOP NAVBAR (Hidden during Print / PDF generation) */}
      {/* ----------------------------------------------------------------- */}
      <header className="no-print sticky top-0 z-40 bg-[#062438]/95 backdrop-blur-md border-b border-sky-800/80 shadow-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/20">
              <span className="tracking-tighter">TY</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-0.5">
                  <span className="text-emerald-400">TRy</span>
                  <span className="text-white">OURSELF</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-yellow-500 text-slate-950 shadow-sm">
                  CBSE 11 &amp; 12
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Interactive STEM Solver &amp; CBSE Revision Notebook
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-[#051a28] p-1 rounded-xl border border-sky-800/70 w-full sm:w-auto overflow-x-auto">
            <button
              id="nav-tab-solver"
              type="button"
              onClick={() => setActiveTab("solver")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === "solver"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:bg-sky-900/40 hover:text-white"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>3-Step Solver</span>
            </button>

            <button
              id="nav-tab-scratchpad"
              type="button"
              onClick={() => setActiveTab("scratchpad")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === "scratchpad"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:bg-sky-900/40 hover:text-white"
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>STEM Scratchpad</span>
            </button>

            <button
              id="nav-tab-formulas"
              type="button"
              onClick={() => setActiveTab("formulas")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === "formulas"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:bg-sky-900/40 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Formula Library</span>
            </button>

            <button
              id="nav-tab-notebook"
              type="button"
              onClick={() => setActiveTab("notebook")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 relative ${
                activeTab === "notebook"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-300 hover:bg-sky-900/40 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Revision Notebook</span>
              {notebookEntries.length > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === "notebook"
                      ? "bg-slate-950 text-emerald-300"
                      : "bg-yellow-500 text-slate-950"
                  }`}
                >
                  {notebookEntries.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* MAIN VIEW CONTENT */}
      {/* ----------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === "solver" && (
          <PedagogicalSolver
            onSaveToNotebook={handleSaveToNotebook}
            onOpenFormulaLibrary={(subj) => {
              setActiveTab("formulas");
            }}
            selectedProblemId={selectedProblemId}
          />
        )}

        {activeTab === "scratchpad" && (
          <div className="flex flex-col gap-4">
            <div className="bg-[#07283e] border border-sky-800/60 rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <PenTool className="w-6 h-6 text-emerald-400" />
                  Interactive HTML5 Drawing Scratchpad
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-DPI canvas with STEM symbols, vector arrows, isometric &amp; graph grids for free-body diagrams, circuits, and geometry.
                </p>
              </div>
            </div>

            <Scratchpad initialHeight={560} />
          </div>
        )}

        {activeTab === "formulas" && (
          <FormulaRevisionLibrary
            onSelectFormulaForSolver={handleSelectFormulaForSolver}
          />
        )}

        {activeTab === "notebook" && (
          <RevisionNotebook
            entries={notebookEntries}
            onDeleteEntry={handleDeleteNotebookEntry}
            onUpdateStatus={handleUpdateStatus}
            onUpdateNotes={handleUpdateNotes}
            onNavigateToSolver={(id) => {
              if (id) setSelectedProblemId(id);
              setActiveTab("solver");
            }}
          />
        )}
      </main>

      {/* ----------------------------------------------------------------- */}
      {/* FOOTER (Hidden during Print) */}
      {/* ----------------------------------------------------------------- */}
      <footer className="no-print mt-auto border-t border-sky-800/60 bg-[#061e31] py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1.5">
            <span className="font-bold text-slate-200">TRyOURSELF</span>
            <span>— Pedagogical 3-Step Active Recall for CBSE Classes 11 &amp; 12</span>
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Dark Sky-Blue (#082F49)</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">Emerald Green (#10B981)</span>
            <span>•</span>
            <span className="text-yellow-400 font-semibold">Muted Yellow (#EAB308)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
