import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Cpu,
  Layers,
  Binary,
  BarChart3,
  CheckCircle2,
  Edit3,
  User,
  GraduationCap
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [studentName, setStudentName] = useState('[Student Name]');
  const [rollNumber, setRollNumber] = useState('[Roll / Register Number]');
  const [department, setDepartment] = useState('Department of Computer Science & Engineering');
  const [facultyGuide, setFacultyGuide] = useState('[Faculty Guide / Professor Name]');
  const [academicYear, setAcademicYear] = useState('2025 – 2026');
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Title & Header */}
      <div className="bg-navy-900 border border-navy-700/60 p-6 md:p-8 rounded-2xl shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-3">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Compiler Design Academic Project (CS-CD-401)</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100">
          Source Code Metrics Analyzer
        </h1>
        <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
          A client-side compiler front-end implementation designed to demonstrate formal lexical scanning, recursive-descent grammar parsing, scoped symbol-table bindings, and software complexity analytics for C and C++.
        </p>

        {/* Academic Project Metadata / Student Info (Editable Placeholders) */}
        <div className="mt-6 pt-6 border-t border-navy-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Project Submission Details
            </span>
            <button
              onClick={() => setIsEditingMetadata(!isEditingMetadata)}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditingMetadata ? 'Done Editing' : 'Edit Information'}</span>
            </button>
          </div>

          {isEditingMetadata ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-navy-950 p-4 rounded-xl border border-navy-800 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Student Name:</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 rounded px-2.5 py-1 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Roll / Register Number:</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 rounded px-2.5 py-1 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Faculty Guide / Mentor:</label>
                <input
                  type="text"
                  value={facultyGuide}
                  onChange={(e) => setFacultyGuide(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 rounded px-2.5 py-1 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Department / Institution:</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 rounded px-2.5 py-1 text-slate-200"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-navy-950/70 p-3.5 rounded-xl border border-navy-800/80">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Student</span>
                <span className="font-semibold text-slate-200">{studentName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Roll No.</span>
                <span className="font-mono text-cyan-400">{rollNumber}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Faculty Guide</span>
                <span className="text-slate-200">{facultyGuide}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Academic Session</span>
                <span className="text-slate-300 font-mono">{academicYear}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Abstract & Problem Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
        <div className="bg-navy-900 border border-navy-700/60 p-5 rounded-xl shadow-md">
          <h3 className="text-sm font-bold text-slate-100 mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            1. Abstract
          </h3>
          <p className="text-slate-300">
            Evaluating source code quality and maintainability requires rigorous syntactic and semantic decomposition. This project provides a full-fledged front-end compiler pipeline implemented in TypeScript that parses C and C++ source code directly in modern browsers. By implementing genuine deterministic finite automata (DFA) tokenization, recursive-descent syntax parsing, and scoped symbol tables, the application computes standard software engineering metrics including McCabe’s Cyclomatic Complexity, Halstead Software Science, and the SEI Maintainability Index.
          </p>
        </div>

        <div className="bg-navy-900 border border-navy-700/60 p-5 rounded-xl shadow-md">
          <h3 className="text-sm font-bold text-slate-100 mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            2. Problem Statement
          </h3>
          <p className="text-slate-300">
            Traditional compiler tools like GCC or Clang output low-level intermediate representations without directly exposing developer-centric software metrics. Conversely, simple script-based counters rely on regex approximations that misclassify operators inside comments or string literals. There is a pressing need for an accessible, educational developer workbench that connects each compiler phase directly to real-time visualizations and metric calculations.
          </p>
        </div>
      </div>

      {/* System Architecture & Compiler Phases */}
      <div className="bg-navy-900 border border-navy-700/60 p-6 rounded-xl shadow-md">
        <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          3. Compiler Front-End Architecture
        </h3>

        <div className="space-y-4 text-xs">
          {/* Phase 1 */}
          <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800">
            <div className="flex items-center justify-between font-semibold text-slate-200">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Phase 1: Lexical Analysis (DFA Tokenizer)
              </span>
              <span className="font-mono text-slate-400 text-[11px]">Regular Grammars</span>
            </div>
            <p className="text-slate-400 mt-1.5 leading-relaxed">
              Scans input stream character-by-character using state machines. Recognizes keywords, identifiers, decimal/hex numbers, strings, character literals, and single/multi-line comments. Preprocessor directives and comment blocks are isolated so operators inside strings or comments are not counted toward program complexity.
            </p>
          </div>

          {/* Phase 2 */}
          <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800">
            <div className="flex items-center justify-between font-semibold text-slate-200">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                Phase 2: Syntax Analysis (Recursive-Descent Parser)
              </span>
              <span className="font-mono text-slate-400 text-[11px]">LL(1) Subset Parser</span>
            </div>
            <p className="text-slate-400 mt-1.5 leading-relaxed">
              Constructs an Abstract Syntax Tree (AST) representing statements, variable declarations, arithmetic expressions, function definitions, control-flow branches (<code>if/else</code>, <code>switch</code>), and loops (<code>for</code>, <code>while</code>, <code>do-while</code>). Handles panic-mode recovery on missing semicolons or delimiter mismatches.
            </p>
          </div>

          {/* Phase 3 */}
          <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800">
            <div className="flex items-center justify-between font-semibold text-slate-200">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                Phase 3: Semantic Analysis (Scoped Symbol Table)
              </span>
              <span className="font-mono text-slate-400 text-[11px]">Symbol Binding</span>
            </div>
            <p className="text-slate-400 mt-1.5 leading-relaxed">
              Maintains an active scope tree (Global &rarr; Function &rarr; Block). Tracks identifier declarations, data types, parameter lists, and usage frequencies. Verifies semantic rules: detects undeclared identifiers, flags duplicate declarations in identical scopes, and asserts function call arity matches known signatures.
            </p>
          </div>

          {/* Phase 4 */}
          <div className="p-3.5 rounded-lg bg-navy-950 border border-navy-800">
            <div className="flex items-center justify-between font-semibold text-slate-200">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Phase 4: Metrics Engine &amp; Software Science
              </span>
              <span className="font-mono text-slate-400 text-[11px]">McCabe &amp; Halstead</span>
            </div>
            <p className="text-slate-400 mt-1.5 leading-relaxed">
              Traverses the AST and token lists to calculate physical/logical lines of code (PLOC/LLOC), comment density, Halstead metrics, and Cyclomatic Complexity computed per function starting at base 1 + decision points (<code>if</code>, <code>for</code>, <code>while</code>, <code>case</code>, <code>&amp;&amp;</code>, <code>||</code>, <code>?</code>).
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Formulations & Algorithms */}
      <div className="bg-navy-900 border border-navy-700/60 p-6 rounded-xl shadow-md text-xs">
        <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          4. Mathematical Metric Formulations Implemented
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-navy-950 p-4 rounded-xl border border-navy-800">
            <h4 className="font-semibold text-blue-400 text-xs mb-1">McCabe Cyclomatic Complexity</h4>
            <p className="text-slate-400 font-mono text-[11px] mb-2">
              CC = E - N + 2P &equiv; 1 + D
            </p>
            <p className="text-slate-300">
              Where <em>D</em> represents the count of predicate decision nodes (branching conditions) in each function's control-flow graph.
            </p>
          </div>

          <div className="bg-navy-950 p-4 rounded-xl border border-navy-800">
            <h4 className="font-semibold text-cyan-400 text-xs mb-1">Halstead Program Volume</h4>
            <p className="text-slate-400 font-mono text-[11px] mb-2">
              V = (N1 + N2) &times; log2(n1 + n2)
            </p>
            <p className="text-slate-300">
              Quantifies the minimum information volume required to represent the program in bits, based on unique operators (<em>n1</em>) and unique operands (<em>n2</em>).
            </p>
          </div>

          <div className="bg-navy-950 p-4 rounded-xl border border-navy-800">
            <h4 className="font-semibold text-amber-400 text-xs mb-1">Halstead Effort &amp; Bugs</h4>
            <p className="text-slate-400 font-mono text-[11px] mb-2">
              D = (n1/2) &times; (N2/n2) | E = D &times; V | B = V / 3000
            </p>
            <p className="text-slate-300">
              Measures mental effort required to implement code and statistically estimates delivered defect potential.
            </p>
          </div>

          <div className="bg-navy-950 p-4 rounded-xl border border-navy-800">
            <h4 className="font-semibold text-emerald-400 text-xs mb-1">SEI Maintainability Index (Normalized)</h4>
            <p className="text-slate-400 font-mono text-[11px] mb-2">
              MI = max(0, (171 - 5.2 ln(V) - 0.23 CC - 16.2 ln(LOC)) &times; 100 / 171)
            </p>
            <p className="text-slate-300">
              Standard composite index normalized to 0–100 scale evaluating long-term code maintainability.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack & Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="bg-navy-900 border border-navy-700/60 p-5 rounded-xl shadow-md">
          <h3 className="text-sm font-bold text-slate-100 mb-2">5. Technology Stack</h3>
          <ul className="space-y-1.5 text-slate-300">
            <li>&bull; <strong>Frontend Core:</strong> React 18, TypeScript, Vite</li>
            <li>&bull; <strong>Editor:</strong> Monaco Editor (@monaco-editor/react)</li>
            <li>&bull; <strong>Data Visualizations:</strong> Recharts SVG library</li>
            <li>&bull; <strong>Styling:</strong> Tailwind CSS (Dark Developer Theme)</li>
            <li>&bull; <strong>Icons:</strong> Lucide React</li>
            <li>&bull; <strong>Parser:</strong> Custom TypeScript Recursive-Descent Engine</li>
            <li>&bull; <strong>Storage:</strong> HTML5 Web Storage API</li>
          </ul>
        </div>

        <div className="bg-navy-900 border border-navy-700/60 p-5 rounded-xl shadow-md">
          <h3 className="text-sm font-bold text-slate-100 mb-2">6. Scope &amp; Future Work</h3>
          <p className="text-slate-300 leading-relaxed">
            The initial release is optimized for C and C++ procedural and object-oriented subsets. Planned enhancements include extending grammar definitions to Java and Python, adding data-flow taint analysis, and generating interactive control-flow graph (CFG) diagrams.
          </p>
        </div>
      </div>
    </div>
  );
};
