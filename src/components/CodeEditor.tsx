import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Upload, Trash2, FileCode, Check, Copy } from 'lucide-react';
import { SAMPLE_PROGRAMS } from '../analyzer/samples';

interface Props {
  code: string;
  onChange: (value: string) => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
  language: string;
  theme?: 'dark' | 'light';
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
}

export const CodeEditor: React.FC<Props> = ({
  code,
  onChange,
  fileName,
  onFileNameChange,
  language,
  theme = 'dark'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = React.useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileNameChange(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content !== undefined) {
          onChange(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileNameChange(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content !== undefined) {
          onChange(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = code ? code.split(/\r?\n/).length : 0;
  const charCount = code.length;

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="bg-navy-900 border border-navy-700/60 rounded-xl overflow-hidden shadow-lg flex flex-col h-full"
    >
      {/* Editor Toolbar */}
      <div className="bg-navy-950 px-4 py-2.5 border-b border-navy-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-cyan-400" />
          <input
            type="text"
            value={fileName}
            onChange={(e) => onFileNameChange(e.target.value)}
            className="bg-navy-900 border border-navy-750 text-slate-200 text-xs px-2.5 py-1 rounded font-mono focus:outline-none focus:border-cyan-500 w-36 sm:w-44"
            placeholder="filename.cpp"
          />
          <span className="text-[10px] font-mono uppercase bg-navy-800 text-slate-400 px-2 py-0.5 rounded border border-navy-700">
            {language}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Sample Loader */}
          <select
            onChange={(e) => {
              const sample = SAMPLE_PROGRAMS.find((s) => s.id === e.target.value);
              if (sample) {
                onChange(sample.code);
                onFileNameChange(sample.fileName);
              }
            }}
            defaultValue=""
            className="bg-navy-900 border border-navy-700 text-slate-300 text-xs px-2 py-1 rounded focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="" disabled>
              Load Sample Code...
            </option>
            {SAMPLE_PROGRAMS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".c,.cpp,.h,.hpp,.cc"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-xs bg-navy-800 hover:bg-navy-700 text-slate-300 px-2.5 py-1 rounded border border-navy-700 transition-colors"
            title="Upload source file (.c, .cpp, .h, .hpp)"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-xs bg-navy-800 hover:bg-navy-700 text-slate-300 px-2 py-1 rounded border border-navy-700 transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* Clear Editor */}
          <button
            onClick={() => onChange('')}
            className="flex items-center gap-1 text-xs bg-navy-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 px-2 py-1 rounded border border-navy-700 hover:border-rose-500/30 transition-colors"
            title="Clear editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 min-h-[420px] relative">
        <Editor
          height="100%"
          language={language === 'c' ? 'c' : 'cpp'}
          value={code}
          onChange={(val) => onChange(val || '')}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: 'Fira Code, Consolas, Monaco, monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            bracketPairColorization: { enabled: true },
            wordWrap: 'on'
          }}
          loading={
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Loading Monaco Editor...
            </div>
          }
        />
      </div>

      {/* Footer Stats */}
      <div className="bg-navy-950 px-4 py-2 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span>{lineCount} lines</span>
          <span>{charCount} characters</span>
        </div>
        <span className="text-[11px] text-slate-500">Drag &amp; drop source file supported</span>
      </div>
    </div>
  );
};
