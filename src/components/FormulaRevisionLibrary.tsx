import React, { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  Filter,
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  Copy,
  Check,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Formula, Subject, ClassLevel } from "../types";
import { CBSE_FORMULAS } from "../data/cbseFormulas";
import { MathRenderer } from "./MathRenderer";

interface FormulaRevisionLibraryProps {
  onSelectFormulaForSolver?: (formula: Formula) => void;
  defaultSubject?: Subject;
}

export const FormulaRevisionLibrary: React.FC<FormulaRevisionLibraryProps> = ({
  onSelectFormulaForSolver,
  defaultSubject,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<"All" | Subject>(
    defaultSubject || "All"
  );
  const [selectedClass, setSelectedClass] = useState<"All" | ClassLevel>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("tryourself_bookmarked_formulas");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState<boolean>(false);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("tryourself_bookmarked_formulas", JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const copyLatex = (latex: string, id: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredFormulas = useMemo(() => {
    return CBSE_FORMULAS.filter((f) => {
      if (selectedSubject !== "All" && f.subject !== selectedSubject) return false;
      if (selectedClass !== "All" && f.classLevel !== selectedClass) return false;
      if (showBookmarksOnly && !bookmarkedIds.includes(f.id)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = f.title.toLowerCase().includes(q);
        const matchChapter = f.chapter.toLowerCase().includes(q);
        const matchTags = f.tags.some((t) => t.toLowerCase().includes(q));
        const matchExplanation = f.explanation.toLowerCase().includes(q);
        return matchTitle || matchChapter || matchTags || matchExplanation;
      }

      return true;
    });
  }, [selectedSubject, selectedClass, searchQuery, showBookmarksOnly, bookmarkedIds]);

  const subjectStats = useMemo(() => {
    return {
      total: CBSE_FORMULAS.length,
      physics: CBSE_FORMULAS.filter((f) => f.subject === "Physics").length,
      chemistry: CBSE_FORMULAS.filter((f) => f.subject === "Chemistry").length,
      math: CBSE_FORMULAS.filter((f) => f.subject === "Mathematics").length,
      bookmarked: bookmarkedIds.length,
    };
  }, [bookmarkedIds]);

  return (
    <div className="flex flex-col gap-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-[#07283e] border border-sky-800/60 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              CBSE Class 11 &amp; 12 Board Syllabus
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              High-Yield Exam Tips
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            CBSE Formula Revision Library
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Class 11 &amp; 12 Physics, Chemistry, and Mathematics equations with variable units &amp; CBSE board examiner notes.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-[#061d2f] border border-sky-900 rounded-xl px-3 py-2 flex items-center gap-3">
            <div>
              <span className="text-slate-400 block text-[10px]">Formulas</span>
              <span className="font-bold text-white text-sm">{subjectStats.total}</span>
            </div>
            <div className="h-6 w-px bg-sky-900" />
            <div>
              <span className="text-slate-400 block text-[10px]">Saved</span>
              <span className="font-bold text-yellow-400 text-sm">{subjectStats.bookmarked}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#061e31] border border-sky-800/60 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search formulas, chapters, or tags..."
            className="w-full bg-[#082F49] border border-sky-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              &times;
            </button>
          )}
        </div>

        {/* Subject Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto text-xs">
          {(["All", "Physics", "Chemistry", "Mathematics"] as const).map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                selectedSubject === sub
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                  : "bg-[#08263c] text-slate-300 border-sky-900 hover:bg-sky-900/40"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Class Filter & Bookmarked Toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto text-xs">
          <div className="flex items-center gap-1 bg-[#082F49] p-1 rounded-lg border border-sky-800">
            {(["All", "Class 11", "Class 12"] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedClass(lvl)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedClass === lvl
                    ? "bg-sky-700 text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors ${
              showBookmarksOnly
                ? "bg-yellow-500 text-slate-950 border-yellow-400 font-bold"
                : "bg-[#082F49] text-yellow-400 border-sky-800 hover:bg-sky-900/50"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bookmarks</span>
          </button>
        </div>
      </div>

      {/* Formulas Grid */}
      {filteredFormulas.length === 0 ? (
        <div className="bg-[#072439] border border-sky-900 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <BookOpen className="w-12 h-12 text-slate-500" />
          <h4 className="text-base font-bold text-slate-200">No formulas match your filters</h4>
          <p className="text-xs text-slate-400">
            Try adjusting your search keyword or clearing the subject/class filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedSubject("All");
              setSelectedClass("All");
              setSearchQuery("");
              setShowBookmarksOnly(false);
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredFormulas.map((formula) => {
            const isBookmarked = bookmarkedIds.includes(formula.id);

            return (
              <div
                key={formula.id}
                className="bg-[#092d47] border border-sky-800/70 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-emerald-500/50 transition-all gap-4"
              >
                {/* Card Top */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          formula.subject === "Physics"
                            ? "bg-sky-950 text-sky-300 border border-sky-700"
                            : formula.subject === "Chemistry"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                            : "bg-amber-950 text-amber-300 border border-amber-700"
                        }`}
                      >
                        {formula.subject}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#072439] text-slate-300 border border-sky-800">
                        {formula.classLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        title={isBookmarked ? "Remove Bookmark" : "Add to Revision Bookmarks"}
                        onClick={() => toggleBookmark(formula.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isBookmarked
                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
                            : "bg-[#061d2f] text-slate-400 border-sky-900 hover:text-slate-200"
                        }`}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        title="Copy LaTeX formula code"
                        onClick={() => copyLatex(formula.latex, formula.id)}
                        className="p-1.5 rounded-lg bg-[#061d2f] text-slate-400 border border-sky-900 hover:text-slate-200"
                      >
                        {copiedId === formula.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white">{formula.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">{formula.chapter}</p>

                  {/* Rendered Equation Display */}
                  <div className="my-3 p-3 bg-[#061e31] rounded-xl border border-sky-800/80 shadow-inner flex items-center justify-center overflow-x-auto scrollbar-thin">
                    <MathRenderer latex={formula.latex} displayMode={true} className="text-base" />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {formula.explanation}
                  </p>

                  {/* Variables Breakdown */}
                  {formula.variables.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-[#061a2a] border border-sky-900/60 mb-3 text-xs">
                      <span className="font-semibold text-slate-400 block mb-1 text-[11px] uppercase tracking-wider">
                        Variables &amp; SI Units:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {formula.variables.map((v, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-mono text-emerald-400 font-bold">{v.symbol}</span>
                            <span className="text-slate-400">:</span>
                            <span className="text-slate-200 truncate">{v.name}</span>
                            <span className="text-slate-400 font-mono text-[10px]">
                              ({v.unit})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CBSE Exam Tip / Trap Alert Badge */}
                  <div className="p-3 rounded-xl bg-yellow-950/25 border border-yellow-500/40 text-xs text-yellow-200/90 leading-relaxed flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-yellow-300 block text-[11px] uppercase tracking-wider">
                        CBSE Exam Tip &amp; Trap Alert:
                      </span>
                      <span>{formula.cbseExamTip}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Tags & Solve in Pedagogical Solver */}
                <div className="pt-3 border-t border-sky-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1 flex-wrap">
                    {formula.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded bg-[#072439] text-slate-400 text-[10px] font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {onSelectFormulaForSolver && (
                    <button
                      type="button"
                      onClick={() => onSelectFormulaForSolver(formula)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-xs transition-colors"
                    >
                      <span>Try Problem in Solver</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
