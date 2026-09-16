import { Problem } from "../types";

export const CBSE_PROBLEMS: Problem[] = [
  // ==========================================
  // PHYSICS PROBLEMS
  // ==========================================
  {
    id: "prob-phy-01",
    title: "Class 11: Projectile Maximum Height & Range",
    subject: "Physics",
    classLevel: "Class 11",
    chapter: "Motion in a Plane",
    difficulty: "High-Yield Board",
    statement:
      "A cricket ball is thrown with an initial speed of 28 m/s at an angle of 30° with the horizontal. Calculate: (a) the maximum height reached by the ball, and (b) the horizontal distance from the thrower to the point where the ball returns to the same level. (Take g = 9.8 m/s²)",
    diagramHint: "Draw the trajectory parabola showing initial vector u inclined at 30°, resolution into u_x = u cos(θ) and u_y = u sin(θ), and peak vertical velocity v_y = 0.",
    givenVariables: "Initial speed u = 28 m/s, Launch angle θ = 30°, Acceleration due to gravity g = 9.8 m/s²",
    targetUnknown: "(a) Maximum height H_max, (b) Horizontal range R",
    level1Hint:
      "Pedagogical Nudge: Decompose the motion into two independent 1D motions: horizontal (constant velocity, zero acceleration) and vertical (uniform downward acceleration -g). What is the vertical velocity component at the peak of the flight?",
    formulaReveal: {
      governingLaw: "Independence of Perpendicular Motions & Uniform Acceleration Kinematics",
      latexFormulas: [
        "H_{\\max} = \\frac{u^2 \\sin^2\\theta}{2g}",
        "R = \\frac{u^2 \\sin(2\\theta)}{g}",
      ],
      conceptSummary:
        "At the summit, vertical velocity v_y = 0, giving 0 = (u sin θ)² - 2g H_max. The time of flight T = 2u sin θ / g, and horizontal range R = u cos θ * T = u² sin(2θ) / g.",
    },
    solution: {
      steps: [
        {
          stepNumber: 1,
          description: "Compute vertical velocity component",
          latexEquation: "u_y = u \\sin 30^\\circ = 28 \\times \\frac{1}{2} = 14\\,\\text{m/s}",
          explanation: "At maximum height, the vertical velocity v_y drops instantaneously to 0 m/s.",
        },
        {
          stepNumber: 2,
          description: "Calculate maximum height (H_max)",
          latexEquation: "H_{\\max} = \\frac{(14)^2}{2 \\times 9.8} = \\frac{196}{19.6} = 10.0\\,\\text{m}",
          explanation: "Using v_y² = u_y² - 2g H_max gives H_max = 10 meters exactly.",
        },
        {
          stepNumber: 3,
          description: "Calculate horizontal range (R)",
          latexEquation: "R = \\frac{(28)^2 \\sin(2 \\times 30^\\circ)}{9.8} = \\frac{784 \\times \\sin 60^\\circ}{9.8} = 80 \\times \\frac{\\sqrt{3}}{2} = 40\\sqrt{3} \\approx 69.28\\,\\text{m}",
          explanation: "Substituting into R = u² sin(2θ) / g yields 40√3 meters.",
        },
      ],
      finalAnswer: "H_max = 10 m, Range R = 69.28 m (40√3 m)",
      unit: "meters",
    },
    cbseTrapAlert:
      "CBSE Exam Trap: Students frequently square 2θ or write sin²(2θ) instead of sin(2θ). For H_max, square the sine (sin²θ); for Range, take sine of double the angle (sin 2θ).",
  },
  {
    id: "prob-phy-02",
    title: "Class 12: Parallel Plate Capacitor with Dielectric Slab",
    subject: "Physics",
    classLevel: "Class 12",
    chapter: "Electrostatic Potential and Capacitance",
    difficulty: "High-Yield Board",
    statement:
      "A parallel plate capacitor has plate area A = 100 cm² and plate separation d = 1 mm. A dielectric slab of thickness t = 0.5 mm and dielectric constant K = 4 is inserted between the plates. Calculate the new capacitance. If a 100 V battery was connected before insertion and remains connected, what is the charge on the plates? (Take ε₀ = 8.854 × 10⁻¹² F/m)",
    diagramHint: "Sketch the two parallel plates with thickness d. Draw the dielectric slab of thickness t = 0.5 mm inside, leaving air space (d - t) = 0.5 mm.",
    givenVariables: "Area A = 100 cm² = 0.01 m², Separation d = 1 mm = 10⁻³ m, Slab thickness t = 0.5 mm = 0.5 × 10⁻³ m, Dielectric constant K = 4, Battery V = 100 V (remains connected)",
    targetUnknown: "New capacitance C', and final stored charge Q'",
    level1Hint:
      "Pedagogical Nudge: When a dielectric slab doesn't fill the entire gap, the electric field inside the slab is reduced by factor K (E = E₀/K), while the air gap retains E₀. Express the total potential difference as V = E₀(d - t) + (E₀/K)t. How does this modify the effective plate separation?",
    formulaReveal: {
      governingLaw: "Capacitance with Partial Dielectric & Charge-Voltage Relation",
      latexFormulas: [
        "C' = \\frac{\\varepsilon_0 A}{d - t + \\frac{t}{K}}",
        "Q' = C' V",
      ],
      conceptSummary:
        "The effective separation becomes d_eff = (d - t + t/K). Since the battery remains connected, voltage V is fixed at 100 V, so the charge drawn from the battery increases proportionally.",
    },
    solution: {
      steps: [
        {
          stepNumber: 1,
          description: "Calculate effective plate separation (d_eff)",
          latexEquation: "d_{\\text{eff}} = (1.0 - 0.5 + \\frac{0.5}{4})\\times 10^{-3} = (0.5 + 0.125)\\times 10^{-3} = 0.625 \\times 10^{-3}\\,\\text{m}",
          explanation: "The partial dielectric reduces the effective air-equivalent gap from 1.0 mm to 0.625 mm.",
        },
        {
          stepNumber: 2,
          description: "Compute new capacitance C'",
          latexEquation: "C' = \\frac{(8.854 \\times 10^{-12}) \\times 0.01}{0.625 \\times 10^{-3}} = \\frac{8.854 \\times 10^{-14}}{6.25 \\times 10^{-4}} = 1.417 \\times 10^{-10}\\,\\text{F} = 141.7\\,\\text{pF}",
          explanation: "Comparing to original air capacitance C₀ = 88.54 pF, the capacitance increased by 1.6×.",
        },
        {
          stepNumber: 3,
          description: "Calculate charge on plates with connected battery",
          latexEquation: "Q' = C' V = (1.417 \\times 10^{-10}\\,\\text{F}) \\times 100\\,\\text{V} = 1.417 \\times 10^{-8}\\,\\text{C} = 14.17\\,\\text{nC}",
          explanation: "Because battery remains connected, V is constant at 100 V.",
        },
      ],
      finalAnswer: "C' = 141.7 pF, Q' = 14.17 nC",
      unit: "pF and nC",
    },
    cbseTrapAlert:
      "CBSE Exam Trap: Do not convert cm² to m² by multiplying by 10⁻²! Remember 1 cm² = (10⁻² m)² = 10⁻⁴ m². An area of 100 cm² equals 100 × 10⁻⁴ = 0.01 m².",
  },

  // ==========================================
  // CHEMISTRY PROBLEMS
  // ==========================================
  {
    id: "prob-chem-01",
    title: "Class 12: Nernst Equation & Cell Potential",
    subject: "Chemistry",
    classLevel: "Class 12",
    chapter: "Electrochemistry",
    difficulty: "High-Yield Board",
    statement:
      "Represent the galvanic cell and calculate the EMF of the cell at 298 K:\nMg(s) | Mg²⁺(0.10 M) || Cu²⁺(1.0 × 10⁻³ M) | Cu(s)\nGiven: E°(Mg²⁺/Mg) = -2.37 V, E°(Cu²⁺/Cu) = +0.34 V.",
    diagramHint: "Draw the electrochemical cell with Mg anode on the left, Cu cathode on the right, connected via salt bridge. Note electrons flow from Mg to Cu in the external circuit.",
    givenVariables: "[Mg²⁺] = 0.10 M, [Cu²⁺] = 1.0 × 10⁻³ M, E°_cathode = +0.34 V, E°_anode = -2.37 V, T = 298 K",
    targetUnknown: "Standard cell potential E°_cell, and non-standard EMF E_cell",
    level1Hint:
      "Pedagogical Nudge: Recall: 'Anode = Oxidation (left)', 'Cathode = Reduction (right)'. Write the net ionic redox equation first to identify how many electrons n are transferred, and write the reaction quotient Q = [Products] / [Reactants] ignoring pure solids.",
    formulaReveal: {
      governingLaw: "Standard Potential Calculation & Nernst Equation at 298 K",
      latexFormulas: [
        "E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}}",
        "E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n} \\log_{10}\\left(\\frac{[\\text{Mg}^{2+}]}{[\\text{Cu}^{2+}]}\\right)",
      ],
      conceptSummary:
        "Net reaction: Mg(s) + Cu²⁺(aq) → Mg²⁺(aq) + Cu(s). The number of electrons exchanged is n = 2. As [Cu²⁺] drops below standard 1 M, EMF decreases.",
    },
    solution: {
      steps: [
        {
          stepNumber: 1,
          description: "Calculate standard cell EMF (E°_cell)",
          latexEquation: "E^\\circ_{\\text{cell}} = (+0.34) - (-2.37) = +2.71\\,\\text{V}",
          explanation: "Cathode is Cu (higher reduction potential), Anode is Mg.",
        },
        {
          stepNumber: 2,
          description: "Determine reaction quotient Q and log Q",
          latexEquation: "Q = \\frac{[\\text{Mg}^{2+}]}{[\\text{Cu}^{2+}]} = \\frac{0.10}{1.0 \\times 10^{-3}} = 100 = 10^2 \\implies \\log_{10}(Q) = 2",
          explanation: "The concentration of pure solids Mg(s) and Cu(s) is unity (1.0).",
        },
        {
          stepNumber: 3,
          description: "Apply Nernst Equation (n = 2)",
          latexEquation: "E_{\\text{cell}} = 2.71 - \\frac{0.0591}{2} \\times 2 = 2.71 - 0.0591 = 2.651\\,\\text{V}",
          explanation: "The factor of 2 in numerator and denominator cancels, leaving 2.71 - 0.0591 V.",
        },
      ],
      finalAnswer: "E_cell = 2.651 V (2.65 V)",
      unit: "Volts",
    },
    cbseTrapAlert:
      "CBSE Exam Trap: Always verify if reduction potentials are given! If oxidation potential is provided (e.g. E°(Mg/Mg²⁺) = +2.37 V), immediately reverse the sign to get the standard IUPAC reduction potential.",
  },
  {
    id: "prob-chem-02",
    title: "Class 12: Chemical Kinetics First-Order Decay",
    subject: "Chemistry",
    classLevel: "Class 12",
    chapter: "Chemical Kinetics",
    difficulty: "Moderate",
    statement:
      "A first-order reaction has a rate constant of 1.15 × 10⁻³ s⁻¹. How long will 5 g of this reactant take to reduce to 3 g? Also calculate the half-life of this reaction.",
    diagramHint: "Sketch the exponential decay curve of [A] versus time t, showing [A] decreasing from [A]₀ = 5 g to [A] = 3 g.",
    givenVariables: "Rate constant k = 1.15 × 10⁻³ s⁻¹, Initial reactant amount [A]₀ = 5 g, Remaining reactant amount [A] = 3 g",
    targetUnknown: "Time t to reduce to 3 g, and half-life t_1/2",
    level1Hint:
      "Pedagogical Nudge: In first-order kinetics, the ratio of initial to remaining concentration [A]₀/[A] determines the time elapsed, independent of initial volume or units (grams cancel!). Remember: log₁₀(5/3) = log₁₀(1.667) ≈ 0.2218.",
    formulaReveal: {
      governingLaw: "Integrated First-Order Rate Law & Half-Life Relation",
      latexFormulas: [
        "t = \\frac{2.303}{k} \\log_{10}\\left(\\frac{[A]_0}{[A]}\\right)",
        "t_{1/2} = \\frac{0.693}{k}",
      ],
      conceptSummary:
        "For a first order reaction, rate = -d[A]/dt = k[A]. Integrating gives ln([A]₀/[A]) = kt, or converting to base-10: t = (2.303/k) log([A]₀/[A]).",
    },
    solution: {
      steps: [
        {
          stepNumber: 1,
          description: "Calculate half-life t_1/2",
          latexEquation: "t_{1/2} = \\frac{0.693}{1.15 \\times 10^{-3}} \\approx 602.6\\,\\text{seconds} \\approx 10.04\\,\\text{minutes}",
          explanation: "The half-life depends only on k and is independent of initial concentration.",
        },
        {
          stepNumber: 2,
          description: "Compute log([A]₀ / [A])",
          latexEquation: "\\log_{10}\\left(\\frac{5}{3}\\right) = \\log_{10}(5) - \\log_{10}(3) = 0.6990 - 0.4771 = 0.2219",
          explanation: "Using standard logarithmic values.",
        },
        {
          stepNumber: 3,
          description: "Calculate time t",
          latexEquation: "t = \\frac{2.303}{1.15 \\times 10^{-3}} \\times 0.2219 = 2002.6 \\times 0.2219 = 444.4\\,\\text{s}",
          explanation: "Converting to minutes: 444.4 / 60 ≈ 7.41 minutes.",
        },
      ],
      finalAnswer: "t = 444.4 s (7.41 min), t_1/2 = 602.6 s (10.04 min)",
      unit: "seconds",
    },
    cbseTrapAlert:
      "CBSE Exam Trap: Students sometimes take [A] as the amount that *reacted* (5 - 3 = 2 g) instead of the amount *remaining* (3 g). In the formula, [A] is always the concentration REMAINING at time t.",
  },

  // ==========================================
  // MATHEMATICS PROBLEMS
  // ==========================================
  {
    id: "prob-math-01",
    title: "Class 12: Definite Integral using King's Property",
    subject: "Mathematics",
    classLevel: "Class 12",
    chapter: "Integrals",
    difficulty: "High-Yield Board",
    statement:
      "Evaluate the definite integral:\nI = \\int_{0}^{\\pi/2} \\frac{\\sqrt{\\sin x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}}\\,dx",
    diagramHint: "Visualize the symmetry of sin(x) and cos(x) on [0, π/2]: under reflection x ↦ (π/2 - x), sin becomes cos and cos becomes sin!",
    givenVariables: "Definite integral I with lower limit a = 0 and upper limit b = π/2",
    targetUnknown: "Exact numerical value of I",
    level1Hint:
      "Pedagogical Nudge: Do not attempt trigonometric substitution or integration by parts here! Recall the famous King's property: ∫_a^b f(x) dx = ∫_a^b f(a+b-x) dx. What happens to sin(π/2 - x) and cos(π/2 - x)? How do the two integrals look when added together?",
    formulaReveal: {
      governingLaw: "Definite Integral Symmetry Property (King's Property)",
      latexFormulas: [
        "\\int_{0}^{a} f(x)\\,dx = \\int_{0}^{a} f(a - x)\\,dx",
        "2I = \\int_{0}^{a} [f(x) + f(a - x)]\\,dx",
      ],
      conceptSummary:
        "Replacing x by (π/2 - x) transforms sin x into cos x and cos x into sin x. The denominator remains identically invariant, while the sum of the two numerators equals the denominator!",
    },
    solution: {
      steps: [
        {
          stepNumber: 1,
          description: "Apply King's Property to integral I",
          latexEquation: "I = \\int_{0}^{\\pi/2} \\frac{\\sqrt{\\sin(\\frac{\\pi}{2}-x)}}{\\sqrt{\\sin(\\frac{\\pi}{2}-x)} + \\sqrt{\\cos(\\frac{\\pi}{2}-x)}}\\,dx = \\int_{0}^{\\pi/2} \\frac{\\sqrt{\\cos x}}{\\sqrt{\\cos x} + \\sqrt{\\sin x}}\\,dx",
          explanation: "Since sin(π/2 - x) = cos x and cos(π/2 - x) = sin x.",
        },
        {
          stepNumber: 2,
          description: "Add the two equations (I + I)",
          latexEquation: "2I = \\int_{0}^{\\pi/2} \\left( \\frac{\\sqrt{\\sin x} + \\sqrt{\\cos x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}} \\right) dx = \\int_{0}^{\\pi/2} 1\\,dx",
          explanation: "The integrand reduces to exactly 1.",
        },
        {
          stepNumber: 3,
          description: "Evaluate the trivial integral and solve for I",
          latexEquation: "2I = [x]_{0}^{\\pi/2} = \\frac{\\pi}{2} - 0 = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}",
          explanation: "Dividing by 2 gives the final answer π/4.",
        },
      ],
      finalAnswer: "I = π / 4",
      unit: "exact scalar",
    },
    cbseTrapAlert:
      "CBSE Exam Trap: Forgetting to divide by 2 at the very end! Students often write I = π/2 because they evaluate ∫ 1 dx = π/2 without noticing the left side was 2I.",
  },
  {
    id: "prob-math-02",
    title: "Class 12: Shortest Distance Between Two Skew Lines in 3D",
    subject: "Mathematics",
    classLevel: "Class 12",
    chapter: "Three Dimensional Geometry",
    difficulty: "High-Yield Board",
    statement:
      "Find the shortest distance between the lines L₁ and L₂ whose vector equations are:\n\\vec{r} = (\\hat{i} + 2\\hat{j} + \\hat{k}) + \\lambda(\\hat{i} - \\hat{j} + \\hat{k})\n\\vec{r} = (2\\hat{i} - \\hat{j} - \\hat{k}) + \\mu(2\\hat{i} + \\hat{j} + 2\\hat{k})",
    diagramHint: "Draw two skew lines in space (non-parallel, non-intersecting). The shortest distance vector is perpendicular to both lines, so its direction is along (b₁ × b₂).",
    givenVariables: "a₁ = (1, 2, 1), b₁ = (1, -1, 1), a₂ = (2, -1, -1), b₂ = (2, 1, 2)",
    targetUnknown: "Shortest perpendicular distance d between L₁ and L₂",
    level1Hint:
      "Pedagogical Nudge: Skew lines lie in parallel planes. The normal vector to both lines is given by the cross product of their direction vectors (b₁ × b₂). The distance is the scalar projection of (a₂ - a₁) onto that normal vector!",
    formulaReveal: {
      governingLaw: "Scalar Triple Product & Cross Product in 3D Geometry",
      latexFormulas: [
        "d = \\left| \\frac{(\\vec{b}_1 \\times \\vec{b}_2) \\cdot (\\vec{a}_2 - \\vec{a}_1)}{|\\vec{b}_1 \\times \\vec{b}_2|} \\right|",
      ],
      conceptSummary:
        "Compute cross product b₁ × b₂ using determinant method. Find displacement vector a₂ - a₁. Take dot product and divide by magnitude of cross product.",
    },
    solution: {
      steps: [
        {
          stepNumber: 1,
          description: "Find displacement vector (a₂ - a₁)",
          latexEquation: "\\vec{a}_2 - \\vec{a}_1 = (2-1)\\hat{i} + (-1-2)\\hat{j} + (-1-1)\\hat{k} = \\hat{i} - 3\\hat{j} - 2\\hat{k}",
          explanation: "Point on L2 minus point on L1.",
        },
        {
          stepNumber: 2,
          description: "Compute cross product (b₁ × b₂)",
          latexEquation: "\\vec{b}_1 \\times \\vec{b}_2 = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ 1 & -1 & 1 \\\\ 2 & 1 & 2 \\end{vmatrix} = \\hat{i}(-2 - 1) - \\hat{j}(2 - 2) + \\hat{k}(1 - (-2)) = -3\\hat{i} + 0\\hat{j} + 3\\hat{k}",
          explanation: "Magnitude: |b₁ × b₂| = √((-3)² + 0² + 3²) = √(9 + 9) = √18 = 3√2.",
        },
        {
          stepNumber: 3,
          description: "Compute scalar numerator and distance d",
          latexEquation: "(\\vec{b}_1 \\times \\vec{b}_2) \\cdot (\\vec{a}_2 - \\vec{a}_1) = (-3)(1) + (0)(-3) + (3)(-2) = -3 + 0 - 6 = -9",
          explanation: "d = |-9| / (3√2) = 9 / (3√2) = 3 / √2 = (3√2) / 2 units.",
        },
      ],
      finalAnswer: "d = 3 / √2 = (3√2)/2 ≈ 2.12 units",
      unit: "units",
    },
    cbseTrapAlert:
      "CBSE Exam Trap: Remember distance is always positive! Always take the absolute value |...| of the dot product in the numerator. Never leave a negative sign in the final distance.",
  },
];
