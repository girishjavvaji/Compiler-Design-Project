# Source Code Metrics Analyzer (SourceMetrics)
### Compiler Design Academic Project — CS-CD-401

**Source Code Metrics Analyzer** is a modern, high-performance web application designed for academic demonstrations and production code inspection. It implements a client-side compiler front-end pipeline for **C and C++** source code that performs:
1. **Lexical Analysis (DFA Tokenizer):** Isolates keywords, identifiers, numeric literals, strings, chars, operators, preprocessors, and trivia/comments.
2. **Syntax Analysis (Recursive-Descent Parser):** Builds an Abstract Syntax Tree (AST), validates supported language grammar, tracks function spans and decision points, and detects syntax errors.
3. **Semantic Analysis (Scoped Symbol Table):** Manages a hierarchical scope tree (Global &rarr; Function &rarr; Block), tracks symbol types and references, and flags undeclared identifiers, duplicate declarations, and function call arity mismatches.
4. **Metrics Engine:** Calculates Physical/Logical LOC, Halstead Software Science metrics, McCabe Cyclomatic Complexity per function, and the normalized SEI Maintainability Index.
5. **Interactive Analytics Dashboard:** Interactive data visualizations powered by Recharts (Code Composition Donut, Token Distribution Bar, Per-Function Complexity Horizontal Bar with Risk Threshold, and Complexity Distribution Column).
6. **Diagnostics & Issues Viewer:** Filterable error/warning diagnostic panel with jump-to-location indicators and suggested corrections.
7. **Scoped Symbol Table Explorer:** Searchable, filterable, and sortable view of all symbols, their kinds, types, scopes, and reference counts.
8. **Analysis Run History:** Locally persisted analysis runs with side-by-side comparative diff modal.
9. **Multi-Format Export:** One-click export to JSON, CSV, standalone formatted HTML reports, and printable PDF.

---

## 🛠️ Technology Stack

- **Frontend Core:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS with Dark/Light theme switching
- **Code Editor:** Monaco Editor (`@monaco-editor/react`)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Analysis Engine:** Pure TypeScript DFA Tokenizer, Recursive-Descent Parser, and Metrics Engine
- **Storage:** Browser HTML5 Web Storage API (zero external data exfiltration)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open your browser to: **`http://localhost:3000`**

### 3. Build for Production
```bash
npm run build
```

### 4. Run Analyzer Engine Tests
```bash
npx tsx src/tests/testAnalyzer.ts
```

---

## 🔬 Compiler Pipeline Architecture

```text
Source Code
    │
    ▼
[Phase 1] Lexical Analysis (DFA Tokenizer)
    │  └─ Outputs Token stream (Keywords, Identifiers, Operators, Literals, Comments)
    ▼
[Phase 2] Syntax Analysis (Recursive-Descent Parser)
    │  └─ Constructs AST, parses statements, tracks function boundaries & decision points
    ▼
[Phase 3] Semantic Analysis (Scoped Symbol Table)
    │  └─ Validates scope bindings, undeclared/duplicate symbols, and call arities
    ▼
[Phase 4] Metrics Engine
    │  ├─ Size Metrics: PLOC, LLOC, blank lines, comment ratio
    │  ├─ Halstead Metrics: Vocabulary (n), Length (N), Volume (V), Difficulty (D), Effort (E), Bugs (B)
    │  ├─ McCabe Complexity: Calculated per function (1 + decision nodes: if, for, while, case, &&, ||, ?)
    │  └─ Maintainability Index (MI): SEI formula normalized to 0-100 scale
    ▼
[Phase 5] Report Generation & Visual Dashboard
       └─ Recharts SVG visualizations, diagnostics, and multi-format reports
```

---

## 📁 Project Structure

```text
src/
├── analyzer/
│   ├── index.ts             # Compiler pipeline coordinator
│   ├── lexer.ts             # Deterministic Finite Automata tokenizer
│   ├── parser.ts            # Recursive-descent AST parser
│   ├── symbolTable.ts       # Hierarchical scoped symbol table manager
│   ├── semanticAnalyzer.ts  # Semantic diagnostic rules
│   ├── metrics.ts           # Halstead, McCabe CC, and Maintainability Index engine
│   ├── samples.ts           # Built-in sample C/C++ test programs
│   └── reportGenerator.ts   # JSON, CSV, and HTML report exporters
├── components/
│   ├── Header.tsx           # Brand header, language selector, analyze trigger, theme toggle
│   ├── Sidebar.tsx          # 7-tab navigation sidebar
│   ├── MetricCard.tsx       # KPI cards with status badges and trends
│   ├── CodeEditor.tsx       # Monaco Editor with file upload and sample loader
│   ├── PipelineView.tsx     # Visual compiler pipeline stages indicator
│   ├── TokenTable.tsx       # Searchable and filterable token stream inspector
│   ├── IssuePanel.tsx       # Diagnostic findings and suggested corrections
│   ├── SymbolTable.tsx      # Scoped symbol table explorer
│   └── charts/
│       ├── CodeCompositionChart.tsx       # Donut chart (Code vs Comments vs Blanks)
│       ├── TokenDistributionChart.tsx     # Bar chart (Keywords, IDs, Operators, Literals)
│       ├── FunctionComplexityChart.tsx    # Horizontal bar chart with threshold line
│       ├── ComplexityDistributionChart.tsx# Column chart (Simple, Moderate, Complex, Untestable)
│       └── MetricComparisonChart.tsx      # Previous vs Current revision comparison
├── pages/
│   ├── Overview.tsx         # Landing hero, drag-drop upload, samples, quick metrics
│   ├── Analyzer.tsx         # Split-pane Monaco workspace + live metrics summary
│   ├── Dashboard.tsx        # Analytics dashboard with charts, KPI cards, Halstead card
│   ├── Issues.tsx           # Full diagnostic issues viewer
│   ├── Symbols.tsx          # Symbol table viewer
│   ├── History.tsx          # Persisted analysis runs with side-by-side comparison modal
│   └── About.tsx            # Academic documentation with editable student metadata
├── types/
│   └── analyzer.ts          # TypeScript type definitions for all compiler components
├── utils/
│   └── storage.ts           # LocalStorage wrapper for history and theme
├── tests/
│   └── testAnalyzer.ts      # Automated engine test suite
├── App.tsx                  # Root application component
├── main.tsx                 # Entry point
└── index.css                # Tailwind base styles and dark theme scrollbars
```

---

## 📊 Implemented Metric Formulations

### 1. McCabe Cyclomatic Complexity
$$CC = 1 + D$$
Where $D$ is the count of predicate decision points within each function (`if`, `for`, `while`, `do-while`, `case`, `&&`, `||`, `?`).

### 2. Halstead Software Science
- Distinct Operators: $n_1$
- Distinct Operands: $n_2$
- Total Operators: $N_1$
- Total Operands: $N_2$
- Program Vocabulary: $n = n_1 + n_2$
- Program Length: $N = N_1 + N_2$
- Program Volume: $V = N \cdot \log_2(n)$
- Difficulty: $D = \frac{n_1}{2} \cdot \frac{N_2}{n_2}$
- Effort: $E = D \cdot V$
- Estimated Bugs: $B = \frac{V}{3000}$

### 3. Maintainability Index (SEI / Microsoft standard)
$$MI = \max\left(0, \left(171 - 5.2 \cdot \ln(V) - 0.23 \cdot CC - 16.2 \cdot \ln(\text{LOC})\right) \cdot \frac{100}{171}\right)$$
- **$\ge 85$:** Excellent (Green)
- **$65 - 84$:** Good (Cyan/Blue)
- **$40 - 64$:** Moderate (Amber)
- **$< 40$:** Poor (Rose)
