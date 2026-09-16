import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Pen,
  Eraser,
  Minus,
  MoveRight,
  Square,
  Circle as CircleIcon,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Grid,
  Camera,
  Type,
  Check,
  Sparkles,
} from "lucide-react";
import { DrawingTool, CanvasGrid, StemSymbol } from "../types";
import { STEM_SYMBOLS } from "../data/stemSymbols";

interface ScratchpadProps {
  onCaptureSnapshot?: (dataUrl: string) => void;
  attachedSnapshot?: string;
  className?: string;
  initialHeight?: number;
}

const COLOR_PALETTE = [
  { name: "Emerald Green", hex: "#10B981" },
  { name: "Muted Yellow", hex: "#EAB308" },
  { name: "Electric Cyan", hex: "#38BDF8" },
  { name: "Chalk White", hex: "#F8FAFC" },
  { name: "Coral Rose", hex: "#FB7185" },
];

const STROKE_WIDTHS = [2, 4, 6, 12];

export const Scratchpad: React.FC<ScratchpadProps> = ({
  onCaptureSnapshot,
  attachedSnapshot,
  className = "",
  initialHeight = 420,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [tool, setTool] = useState<DrawingTool>("pen");
  const [color, setColor] = useState<string>("#10B981");
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [gridType, setGridType] = useState<CanvasGrid>("graph");
  const [selectedSymbol, setSelectedSymbol] = useState<StemSymbol | null>(null);
  const [activeCategory, setActiveCategory] = useState<"All" | "Math" | "Physics" | "Chemistry">("All");

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  // Undo/Redo history
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  // Draw background grid
  const drawBackgroundGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, type: CanvasGrid) => {
      ctx.save();
      // Background base fill: dark sky blue `#082F49`
      ctx.fillStyle = "#082F49";
      ctx.fillRect(0, 0, width, height);

      if (type === "blank") {
        ctx.restore();
        return;
      }

      ctx.strokeStyle = "rgba(56, 189, 248, 0.09)"; // subtle cyan
      ctx.fillStyle = "rgba(56, 189, 248, 0.22)";
      ctx.lineWidth = 1;

      if (type === "graph") {
        const step = 28;
        // Minor grid
        ctx.beginPath();
        for (let x = step; x < width; x += step) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = step; y < height; y += step) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Accent major grid lines
        ctx.strokeStyle = "rgba(56, 189, 248, 0.22)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = step * 5; x < width; x += step * 5) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = step * 5; y < height; y += step * 5) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      } else if (type === "dot") {
        const step = 24;
        for (let x = step; x < width; x += step) {
          for (let y = step; y < height; y += step) {
            ctx.beginPath();
            ctx.arc(x, y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (type === "isometric") {
        const spacing = 32;
        ctx.beginPath();
        const diag = Math.sqrt(3);
        for (let y = 0; y < height + width; y += spacing) {
          // Lines inclined at 30 deg
          ctx.moveTo(0, y);
          ctx.lineTo(y * diag, 0);
          ctx.moveTo(width, y);
          ctx.lineTo(width - y * diag, 0);
        }
        ctx.stroke();
      }

      ctx.restore();
    },
    []
  );

  // Initialize canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width || 800;
        const height = initialHeight;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(dpr, dpr);
          drawBackgroundGrid(ctx, width, height, gridType);
          const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          setHistory([initialData]);
          setHistoryIndex(0);
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [drawBackgroundGrid, initialHeight]); // only initial mount

  // Redraw when gridType changes
  const handleGridChange = (newGrid: CanvasGrid) => {
    setGridType(newGrid);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Save existing user drawing
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, 0);
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    drawBackgroundGrid(ctx, width, height, newGrid);
    ctx.drawImage(tempCanvas, 0, 0, width, height);
    ctx.restore();

    // Push state
    saveCanvasState();
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, imgData];
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    // If a STEM symbol is selected for stamping
    if (selectedSymbol) {
      ctx.save();
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.font = "bold 26px 'Fira Code', KaTeX_Main, sans-serif";
      ctx.fillStyle = color;
      ctx.fillText(selectedSymbol.symbol, x - 10, y + 10);
      ctx.restore();
      saveCanvasState();
      setSelectedSymbol(null);
      return;
    }

    setIsDrawing(true);
    setStartPos({ x, y });

    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === "pen") {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
    } else if (tool === "eraser") {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#082F49"; // canvas base color
      ctx.lineWidth = strokeWidth * 3.5;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !startPos) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    const dpr = window.devicePixelRatio || 1;

    if (tool === "pen" || tool === "eraser") {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      // Shape preview (line, arrow, rect, circle): restore previous snapshot
      if (historyIndex >= 0 && history[historyIndex]) {
        ctx.putImageData(history[historyIndex], 0, 0);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (tool === "line") {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === "arrow") {
        // Draw vector line
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(y - startPos.y, x - startPos.x);
        const headlen = 14 + strokeWidth;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 6), y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(x, y);
        ctx.lineTo(x - headlen * Math.cos(angle + Math.PI / 6), y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      } else if (tool === "rect") {
        ctx.beginPath();
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (tool === "circle") {
        const rx = Math.abs(x - startPos.x);
        const ry = Math.abs(y - startPos.y);
        const radius = Math.sqrt(rx * rx + ry * ry);
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const endDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
    setStartPos(null);
    saveCanvasState();
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.putImageData(history[newIndex], 0, 0);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.putImageData(history[newIndex], 0, 0);
    }
  };

  // Clear Canvas
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    drawBackgroundGrid(ctx, width, height, gridType);
    ctx.restore();

    saveCanvasState();
  };

  // Capture Snapshot for Problem Attempt / Revision Note
  const handleCaptureSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    if (onCaptureSnapshot) {
      onCaptureSnapshot(dataUrl);
      setSnapshotSuccess(true);
      setTimeout(() => setSnapshotSuccess(false), 2200);
    }
  };

  // Download canvas image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `TRyOURSELF-scratchpad-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Copy symbol to clipboard or set for stamping
  const handleSymbolClick = (sym: StemSymbol) => {
    navigator.clipboard.writeText(sym.symbol);
    setCopiedSymbol(sym.symbol);
    setSelectedSymbol(sym);
    setTimeout(() => setCopiedSymbol(null), 1800);
  };

  const filteredSymbols = STEM_SYMBOLS.filter((s) => {
    if (activeCategory === "All") return true;
    return s.category === activeCategory;
  });

  return (
    <div
      id="scratchpad-root"
      ref={containerRef}
      className={`rounded-2xl border border-sky-800/60 bg-[#07253b] p-4 shadow-xl text-slate-100 flex flex-col gap-3 ${className}`}
    >
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-800/50 pb-3">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1 bg-[#061d2f] p-1 rounded-xl border border-sky-900/60">
          <button
            id="tool-pen"
            type="button"
            title="Freehand Pen"
            onClick={() => {
              setTool("pen");
              setSelectedSymbol(null);
            }}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
              tool === "pen" && !selectedSymbol
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-300 hover:bg-sky-900/40 hover:text-white"
            }`}
          >
            <Pen className="w-4 h-4" />
            <span className="hidden sm:inline">Pen</span>
          </button>

          <button
            id="tool-arrow"
            type="button"
            title="Vector Arrow"
            onClick={() => {
              setTool("arrow");
              setSelectedSymbol(null);
            }}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
              tool === "arrow" && !selectedSymbol
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-300 hover:bg-sky-900/40 hover:text-white"
            }`}
          >
            <MoveRight className="w-4 h-4" />
            <span className="hidden sm:inline">Vector</span>
          </button>

          <button
            id="tool-line"
            type="button"
            title="Straight Line"
            onClick={() => {
              setTool("line");
              setSelectedSymbol(null);
            }}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
              tool === "line" && !selectedSymbol
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-300 hover:bg-sky-900/40 hover:text-white"
            }`}
          >
            <Minus className="w-4 h-4" />
            <span className="hidden sm:inline">Line</span>
          </button>

          <button
            id="tool-rect"
            type="button"
            title="Rectangle"
            onClick={() => {
              setTool("rect");
              setSelectedSymbol(null);
            }}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
              tool === "rect" && !selectedSymbol
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-300 hover:bg-sky-900/40 hover:text-white"
            }`}
          >
            <Square className="w-4 h-4" />
            <span className="hidden sm:inline">Rect</span>
          </button>

          <button
            id="tool-circle"
            type="button"
            title="Circle / Orbit"
            onClick={() => {
              setTool("circle");
              setSelectedSymbol(null);
            }}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
              tool === "circle" && !selectedSymbol
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "text-slate-300 hover:bg-sky-900/40 hover:text-white"
            }`}
          >
            <CircleIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Circle</span>
          </button>

          <button
            id="tool-eraser"
            type="button"
            title="Eraser"
            onClick={() => {
              setTool("eraser");
              setSelectedSymbol(null);
            }}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
              tool === "eraser"
                ? "bg-rose-500 text-slate-950 shadow-sm"
                : "text-slate-300 hover:bg-sky-900/40 hover:text-white"
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">Eraser</span>
          </button>
        </div>

        {/* Color Palette */}
        <div className="flex items-center gap-1.5 bg-[#061d2f] p-1.5 rounded-xl border border-sky-900/60">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c.hex}
              type="button"
              title={c.name}
              onClick={() => setColor(c.hex)}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${
                color === c.hex
                  ? "scale-110 border-white ring-2 ring-emerald-400"
                  : "border-transparent hover:scale-105 opacity-80 hover:opacity-100"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>

        {/* Stroke Width Selector */}
        <div className="flex items-center gap-1 bg-[#061d2f] p-1 rounded-xl border border-sky-900/60">
          {STROKE_WIDTHS.map((sw) => (
            <button
              key={sw}
              type="button"
              onClick={() => setStrokeWidth(sw)}
              className={`px-2.5 py-1 text-xs rounded-lg font-mono transition-colors ${
                strokeWidth === sw
                  ? "bg-sky-700 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {sw}px
            </button>
          ))}
        </div>

        {/* Grid Selector */}
        <div className="flex items-center gap-1 bg-[#061d2f] p-1 rounded-xl border border-sky-900/60">
          <Grid className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <button
            type="button"
            onClick={() => handleGridChange("graph")}
            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
              gridType === "graph" ? "bg-sky-700 text-white font-medium" : "text-slate-400"
            }`}
          >
            Graph
          </button>
          <button
            type="button"
            onClick={() => handleGridChange("dot")}
            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
              gridType === "dot" ? "bg-sky-700 text-white font-medium" : "text-slate-400"
            }`}
          >
            Dot
          </button>
          <button
            type="button"
            onClick={() => handleGridChange("isometric")}
            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
              gridType === "isometric" ? "bg-sky-700 text-white font-medium" : "text-slate-400"
            }`}
          >
            Iso
          </button>
          <button
            type="button"
            onClick={() => handleGridChange("blank")}
            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
              gridType === "blank" ? "bg-sky-700 text-white font-medium" : "text-slate-400"
            }`}
          >
            Blank
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Undo"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg bg-[#061d2f] hover:bg-sky-900/60 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Redo"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg bg-[#061d2f] hover:bg-sky-900/60 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Clear Scratchpad"
            onClick={handleClear}
            className="p-2 rounded-lg bg-[#061d2f] hover:bg-rose-900/40 text-rose-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Download Canvas PNG"
            onClick={handleDownload}
            className="p-2 rounded-lg bg-[#061d2f] hover:bg-sky-800/60 text-sky-300 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          {onCaptureSnapshot && (
            <button
              id="btn-attach-snapshot"
              type="button"
              onClick={handleCaptureSnapshot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 ml-1"
            >
              {snapshotSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Snapshot Attached!</span>
                </>
              ) : (
                <>
                  <Camera className="w-3.5 h-3.5" />
                  <span>Attach to Attempt</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* STEM Symbols Quick Palette Bar */}
      <div className="flex flex-col gap-1.5 bg-[#051826] p-2.5 rounded-xl border border-sky-900/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Type className="w-3.5 h-3.5 text-yellow-500" />
              STEM Symbols:
            </span>
            <span className="text-[11px] text-slate-400">
              {selectedSymbol
                ? `Click canvas to stamp "${selectedSymbol.symbol}"`
                : "Click to copy or stamp on canvas"}
            </span>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1 text-[11px]">
            {(["All", "Math", "Physics", "Chemistry"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  activeCategory === cat
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-medium"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Symbols scroll row */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
          {filteredSymbols.map((sym) => {
            const isSelected = selectedSymbol?.symbol === sym.symbol;
            return (
              <button
                key={sym.symbol}
                type="button"
                title={`${sym.name} (${sym.category}) - Click to stamp or copy`}
                onClick={() => handleSymbolClick(sym)}
                className={`px-2.5 py-1 text-sm font-mono rounded-lg border transition-all shrink-0 active:scale-95 ${
                  isSelected
                    ? "bg-yellow-500 text-slate-950 border-yellow-400 font-bold shadow-md ring-2 ring-yellow-400/40"
                    : "bg-[#092b45] text-slate-200 border-sky-800/80 hover:bg-sky-800/70 hover:border-emerald-400 hover:text-emerald-300"
                }`}
              >
                {sym.symbol}
              </button>
            );
          })}
        </div>

        {copiedSymbol && (
          <div className="text-center text-[11px] text-emerald-400 font-medium animate-fade-in">
            Copied "{copiedSymbol}" to clipboard! Click anywhere on canvas to stamp it.
          </div>
        )}
      </div>

      {/* Main Drawing Canvas */}
      <div className="relative w-full rounded-xl overflow-hidden border border-sky-800/80 shadow-inner bg-[#082F49]">
        <canvas
          id="interactive-scratchpad-canvas"
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="touch-none block cursor-crosshair"
        />

        {/* Stamping active banner */}
        {selectedSymbol && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500/90 text-slate-950 font-bold text-xs rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Stamp Mode: Click canvas to place {selectedSymbol.symbol}
          </div>
        )}
      </div>

      {/* Attached Snapshot indicator if present */}
      {attachedSnapshot && (
        <div className="flex items-center justify-between text-xs bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-emerald-300">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Diagram snapshot currently attached to your problem attempt!</span>
          </div>
          <span className="text-[10px] text-slate-400">Included in Revision Notebook &amp; PDF</span>
        </div>
      )}
    </div>
  );
};
