import React, { useState } from "react";
import {
  BookOpen,
  Printer,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Camera,
  Search,
  Plus,
  Edit3,
  Check,
  Download,
  Share2,
  FileText,
  GraduationCap,
} from "lucide-react";
import { NotebookEntry, Subject, ClassLevel, ReviewStatus } from "../types";
import { MathRenderer } from "./MathRenderer";

interface RevisionNotebookProps {
  entries: NotebookEntry[];
  onDeleteEntry: (id: string) => void;
  onUpdateStatus: (id: string, status: ReviewStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onNavigateToSolver?: (problemId?: string) => void;
}

export const RevisionNotebook: React.FC<RevisionNotebookProps> = ({
  entries,
  onDeleteEntry,
  onUpdateStatus,
  onUpdateNotes,
  onNavigateToSolver,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<"All" | Subject>("All");
  const [selectedClass, setSelectedClass] = useState<"All" | ClassLevel>("All");
  const [selectedStatus, setSelectedStatus] = useState<"All" | ReviewStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>("");

  // Printable PDF dossier custom metadata
  const [studentName, setStudentName] = useState<string>("CBSE Aspirant");
  const [targetExam, setTargetExam] = useState<string>("CBSE Board Class 12 (2026)");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const filteredEntries = entries.filter((e) => {
    if (selectedSubject !== "All" && e.subject !== selectedSubject) return false;
    if (selectedClass !== "All" && e.classLevel !== selectedClass) return false;
    if (selectedStatus !== "All" && e.status !== selectedStatus) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.problemTitle.toLowerCase().includes(q);
      const matchChapter = e.chapter.toLowerCase().includes(q);
      const matchStatement = e.statement.toLowerCase().includes(q);
      const matchNotes = e.mistakeNotes?.toLowerCase().includes(q);
      return matchTitle || matchChapter || matchStatement || !!matchNotes;
    }

    return true;
  });

  const handleStartEditNotes = (entry: NotebookEntry) => {
    setEditingNotesId(entry.id);
    setTempNotes(entry.mistakeNotes || "");
  };

  const handleSaveEditNotes = (id: string) => {
    onUpdateNotes(id, tempNotes);
    setEditingNotesId(null);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const statusStats = {
    total: entries.length,
    mastered: entries.filter((e) => e.status === "Mastered").length,
    needsRevision: entries.filter((e) => e.status === "Needs Revision").length,
    cbseHighYield: entries.filter((e) => e.status === "CBSE High-Yield").length,
  };

  return (
    <div className="flex flex-col gap-6 text-slate-100">
      {/* Header Banner (Hidden on Print) */}
      <div className="no-print bg-[#07283e] border border-sky-800/60 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Personalized Mistake Diary
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              Local Storage Synchronized
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1 text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            CBSE Revision Notebook &amp; Mistake Diary
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track your personal attempts, diagrams, mistake reflections, and export a print-ready CBSE revision PDF.
          </p>
        </div>

        {/* Print & PDF Export Button */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            id="btn-print-pdf"
            type="button"
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Export Notebook to PDF</span>
          </button>
        </div>
      </div>

      {/* Dossier Student Config Bar (Hidden on Print, used to personalize PDF) */}
      <div className="no-print bg-[#061e31] border border-sky-800/50 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Student Name:</span>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="bg-[#082F49] border border-sky-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Target Exam:</span>
            <input
              type="text"
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              className="bg-[#082F49] border border-sky-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-emerald-400 font-medium"
            />
          </div>
        </div>

        {/* Progress summary */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Mastered:</span>
            <span className="font-bold text-white">{statusStats.mastered}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-slate-400">Needs Revision:</span>
            <span className="font-bold text-white">{statusStats.needsRevision}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-slate-400">High-Yield:</span>
            <span className="font-bold text-white">{statusStats.cbseHighYield}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar (Hidden on Print) */}
      <div className="no-print bg-[#061e31] border border-sky-800/60 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved problems or notes..."
            className="w-full bg-[#082F49] border border-sky-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* Subject Filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {(["All", "Physics", "Chemistry", "Mathematics"] as const).map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                selectedSubject === sub
                  ? "bg-emerald-500 text-slate-950 border-emerald-400"
                  : "bg-[#08263c] text-slate-300 border-sky-900 hover:bg-sky-900/40"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 text-xs">
          {(["All", "Needs Revision", "CBSE High-Yield", "Mastered"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-2.5 py-1 rounded-lg border transition-colors ${
                selectedStatus === st
                  ? "bg-sky-700 text-white font-semibold border-sky-600"
                  : "bg-[#082F49] text-slate-400 border-sky-800 hover:text-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PRINT-ONLY DOSSIER COVER HEADER */}
      {/* ------------------------------------------------------------- */}
      <div className="only-print p-6 mb-6 border-b-2 border-slate-900 text-slate-950">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
              TRyOURSELF — CBSE High-Yield Revision Dossier
            </h1>
            <p className="text-sm text-slate-700 mt-1 font-medium">
              Interactive STEM Solver &amp; CBSE Class 11 &amp; 12 Mistake Notebook
            </p>
          </div>
          <div className="text-right text-xs text-slate-700">
            <p className="font-bold text-slate-900">Date Generated: {new Date().toLocaleDateString()}</p>
            <p>Student: <strong className="text-slate-900">{studentName}</strong></p>
            <p>Target: <strong className="text-slate-900">{targetExam}</strong></p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4 pt-3 border-t border-slate-300 text-xs">
          <div>
            <span className="text-slate-600">Total Problems:</span>
            <p className="font-bold text-base">{entries.length}</p>
          </div>
          <div>
            <span className="text-slate-600">Mastered:</span>
            <p className="font-bold text-base">{statusStats.mastered}</p>
          </div>
          <div>
            <span className="text-slate-600">Needs Revision:</span>
            <p className="font-bold text-base">{statusStats.needsRevision}</p>
          </div>
          <div>
            <span className="text-slate-600">CBSE High-Yield:</span>
            <p className="font-bold text-base">{statusStats.cbseHighYield}</p>
          </div>
        </div>
      </div>

      {/* Notebook Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="bg-[#072439] border border-sky-900 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <BookOpen className="w-12 h-12 text-slate-500" />
          <h4 className="text-base font-bold text-slate-200">
            {entries.length === 0
              ? "Your Revision Notebook is currently empty"
              : "No saved entries match your search filters"}
          </h4>
          <p className="text-xs text-slate-400 max-w-md">
            {entries.length === 0
              ? "As you work through problems in the 3-Step Pedagogical Solver, click 'Save to Revision Notebook' to compile your personal mistake diary!"
              : "Try changing your subject or status filter above."}
          </p>
          {entries.length === 0 && onNavigateToSolver && (
            <button
              type="button"
              onClick={() => onNavigateToSolver()}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-md hover:bg-emerald-400"
            >
              Start Solving CBSE Problems &rarr;
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {filteredEntries.map((entry, idx) => (
            <div
              key={entry.id}
              className="notebook-entry-card bg-[#092d47] border border-sky-800/70 rounded-2xl p-5 shadow-lg flex flex-col gap-4 transition-all"
            >
              {/* Entry Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-950 text-sky-400 font-bold text-xs flex items-center justify-center border border-sky-800">
                    {idx + 1}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      entry.subject === "Physics"
                        ? "bg-sky-950 text-sky-300 border border-sky-700"
                        : entry.subject === "Chemistry"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                        : "bg-amber-950 text-amber-300 border border-amber-700"
                    }`}
                  >
                    {entry.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#072439] text-slate-300 border border-sky-800">
                    {entry.classLevel}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">{entry.chapter}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status badge and switcher */}
                  <select
                    value={entry.status}
                    onChange={(e) => onUpdateStatus(entry.id, e.target.value as ReviewStatus)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${
                      entry.status === "Mastered"
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/50"
                        : entry.status === "CBSE High-Yield"
                        ? "bg-yellow-950/60 text-yellow-300 border-yellow-500/50"
                        : "bg-rose-950/60 text-rose-300 border-rose-500/50"
                    }`}
                  >
                    <option value="Needs Revision">Needs Revision</option>
                    <option value="CBSE High-Yield">CBSE High-Yield</option>
                    <option value="Mastered">Mastered</option>
                  </select>

                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                    {entry.dateAdded}
                  </span>

                  <button
                    type="button"
                    title="Delete Entry"
                    onClick={() => onDeleteEntry(entry.id)}
                    className="no-print p-1.5 rounded-lg bg-[#061d2f] text-rose-400 hover:bg-rose-900/40 transition-colors ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Statement */}
              <div>
                <h3 className="text-base font-bold text-white">{entry.problemTitle}</h3>
                <div className="mt-2 p-3 rounded-xl bg-[#061e31] border border-sky-800/80 text-slate-200 text-xs leading-relaxed whitespace-pre-line">
                  {entry.statement}
                </div>
              </div>

              {/* Student Attempt & Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#072236] border border-sky-800/70 text-xs">
                  <span className="font-bold text-emerald-400 block mb-1 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    Your Initial Attempt:
                  </span>
                  <p className="text-slate-300 font-mono text-xs whitespace-pre-line leading-relaxed">
                    {entry.studentAttempt}
                  </p>
                </div>

                {/* Scratchpad Diagram Snapshot */}
                {entry.scratchpadSnapshot && (
                  <div className="p-3.5 rounded-xl bg-[#072236] border border-sky-800/70 text-xs flex flex-col justify-between">
                    <span className="font-bold text-emerald-400 block mb-1.5 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      Scratchpad Diagram / Free-Body Working:
                    </span>
                    <div
                      className="cursor-pointer group relative overflow-hidden rounded-lg border border-sky-700 bg-[#082F49]"
                      onClick={() => setExpandedImage(entry.scratchpadSnapshot || null)}
                    >
                      <img
                        src={entry.scratchpadSnapshot}
                        alt="Diagram snapshot"
                        className="w-full h-28 object-contain transition-transform group-hover:scale-105"
                      />
                      <span className="no-print absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-[10px] text-slate-300 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to expand
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Formula & Final Solution */}
              <div className="p-3.5 rounded-xl bg-[#061d2f] border border-emerald-500/40 text-xs">
                {entry.formulaReveal && (
                  <div className="mb-2">
                    <span className="font-bold text-emerald-400 block text-[11px] uppercase tracking-wider">
                      Governing Formula:
                    </span>
                    <p className="text-slate-200 mt-0.5 font-medium">{entry.formulaReveal}</p>
                  </div>
                )}

                {entry.finalAnswer && (
                  <div className="flex items-center justify-between pt-2 border-t border-sky-800/80">
                    <span className="text-slate-400 font-semibold">Verified Solution:</span>
                    <span className="font-bold text-white font-mono text-xs bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      {entry.finalAnswer}
                    </span>
                  </div>
                )}
              </div>

              {/* Mistake Reflection & Personal Notes */}
              <div className="p-3.5 rounded-xl bg-yellow-950/20 border border-yellow-500/30 text-xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-yellow-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Mistake Reflection &amp; Examiner Tip (Why I lost marks / Key takeaway):
                  </span>
                  {editingNotesId !== entry.id && (
                    <button
                      type="button"
                      onClick={() => handleStartEditNotes(entry)}
                      className="no-print text-yellow-400 hover:text-yellow-300 text-[11px] underline"
                    >
                      Edit Note
                    </button>
                  )}
                </div>

                {editingNotesId === entry.id ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <textarea
                      rows={2}
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Write your personal reflection or board exam reminder..."
                      className="w-full bg-[#051827] border border-yellow-500/50 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingNotesId(null)}
                        className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEditNotes(entry.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-500 text-slate-950 font-bold text-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Note</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-200 leading-relaxed italic">
                    {entry.mistakeNotes || "No reflection added yet. Click 'Edit Note' to record why you struggled with this problem."}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expanded Diagram Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setExpandedImage(null)}
        >
          <div className="bg-[#082F49] p-4 rounded-2xl border border-sky-700 max-w-3xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-white">Attached Scratchpad Diagram</span>
              <span className="text-xs text-slate-400">Click anywhere to close</span>
            </div>
            <img
              src={expandedImage}
              alt="Expanded Diagram"
              className="w-full max-h-[75vh] object-contain rounded-xl border border-sky-800 bg-[#082F49]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
