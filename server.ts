import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini initialization with lazy check
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appName: "TRyOURSELF",
  });
});

// 3-Step Pedagogical Solver API endpoint
app.post("/api/pedagogy/solve-custom", async (req, res) => {
  try {
    const { problemText, subject, targetClass, studentAttempt } = req.body;

    if (!problemText || typeof problemText !== "string") {
      res.status(400).json({ error: "Please provide a problem statement." });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Offline / No API Key pedagogical generator
      res.json({
        source: "offline_engine",
        subject: subject || "STEM",
        chapter: "Core Application",
        coreConcepts: ["Dimensional Analysis", "First-Principles Formulation", "CBSE Marking Scheme"],
        givenVariables: "Extracted from your input problem statement",
        targetUnknown: "Target quantitative / conceptual solution",
        level1Hint: `Pedagogical Level 1 Hint: Identify the physical or mathematical invariants first. Write down all given quantities with proper SI units. Ask yourself: which fundamental conservation law, balance relation, or derivative rule bridges the knowns to your target?`,
        formulaReveal: `Fundamental Relation & Governing Equations: Check corresponding CBSE Class 11/12 chapter formulas in the Revision Library. Write out the governing differential, algebraic, or stoichiometric equations.`,
        stepByStepSolution: [
          `Step 1: Parse given parameters and convert to standard SI units.`,
          `Step 2: Apply the governing relation derived in the Formula Reveal.`,
          `Step 3: Substitute the numerical values carefully, preserving significant figures.`,
          `Step 4: Check dimensional consistency and physical limits (e.g. as t -> 0 or infinity).`
        ],
        attemptFeedback: studentAttempt
          ? `Analysis of your attempt: Great effort putting your reasoning into words! Verify your initial assumptions, sign conventions, and unit cancellations.`
          : `No student attempt submitted yet. In TRyOURSELF, writing your own initial attempt first strengthens long-term neural recall!`,
        cbseTrapAlert: "CBSE Marking Tip: Board examiners award step marks for stating the formula with notation and writing final numerical answers with explicit SI units.",
      });
      return;
    }

    const prompt = `You are the master STEM & CBSE pedagogical tutor for TRyOURSELF (Class 11 & 12 Physics, Chemistry, and Mathematics).
Analyze the following student problem and guide them with strict pedagogical discipline following the TRyOURSELF 3-Step philosophy:
1. "Your Attempt" evaluation: Review the student's thought process if provided, noting their intuition, what was right, and gentle correction.
2. "Level 1 Hint": A conceptual, intuition-building nudge or guiding question. DO NOT reveal the final formula or calculate the answer yet. Teach them HOW to think.
3. "Formula Reveal & Step-by-Step Solution": State the exact mathematical/scientific formulas, define all variables, and provide clear, stepwise CBSE board-standard solution with proper units.

Input Problem:
${problemText}

Subject specified: ${subject || "Auto-detect"}
Class: ${targetClass || "11 or 12"}
Student's initial attempt (if any):
${studentAttempt || "None provided by student yet."}

Return your answer strictly matching the required JSON schema. Keep explanations concise, rigorous, and inspiring.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: "Physics, Chemistry, or Mathematics" },
            chapter: { type: Type.STRING, description: "Specific CBSE Class 11/12 chapter" },
            coreConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 to 4 core principles involved",
            },
            givenVariables: { type: Type.STRING, description: "Known quantities formatted with units" },
            targetUnknown: { type: Type.STRING, description: "What needs to be computed or proven" },
            level1Hint: {
              type: Type.STRING,
              description: "Level 1 pedagogical nudge/intuition without revealing the final formula",
            },
            formulaReveal: {
              type: Type.STRING,
              description: "Exact formulas and governing laws needed to solve",
            },
            stepByStepSolution: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step resolution according to CBSE marking criteria",
            },
            attemptFeedback: {
              type: Type.STRING,
              description: "Constructive feedback on student's attempt",
            },
            cbseTrapAlert: {
              type: Type.STRING,
              description: "Common pitfall or exam trap to watch out for",
            },
          },
          required: [
            "subject",
            "chapter",
            "coreConcepts",
            "givenVariables",
            "targetUnknown",
            "level1Hint",
            "formulaReveal",
            "stepByStepSolution",
            "attemptFeedback",
            "cbseTrapAlert",
          ],
        },
      },
    });

    const jsonStr = response.text?.trim() || "{}";
    const parsedData = JSON.parse(jsonStr);
    res.json({ source: "gemini_ai", ...parsedData });
  } catch (error: any) {
    console.error("Error in /api/pedagogy/solve-custom:", error);
    res.status(500).json({
      error: "Failed to generate pedagogical guidance.",
      details: error?.message || "Unknown error",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TRyOURSELF server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
