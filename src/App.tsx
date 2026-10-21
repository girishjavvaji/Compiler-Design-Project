import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { Overview } from './pages/Overview';
import { Analyzer } from './pages/Analyzer';
import { Dashboard } from './pages/Dashboard';
import { IssuesPage } from './pages/Issues';
import { SymbolsPage } from './pages/Symbols';
import { HistoryPage } from './pages/History';
import { AboutPage } from './pages/About';
import { Language, AnalysisResult, HistoryItem } from './types/analyzer';
import { runAnalysis } from './analyzer';
import { SAMPLE_PROGRAMS } from './analyzer/samples';
import {
  getHistory,
  saveToHistory,
  deleteHistoryItem,
  clearAllHistory,
  getStoredTheme,
  setStoredTheme
} from './utils/storage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [language, setLanguage] = useState<Language>('cpp');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Default to sample 3 (multi-function student grades)
  const [code, setCode] = useState<string>(SAMPLE_PROGRAMS[2].code);
  const [fileName, setFileName] = useState<string>(SAMPLE_PROGRAMS[2].fileName);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load theme and history on start
  useEffect(() => {
    const stored = getStoredTheme();
    setTheme(stored);
    if (stored === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }

    setHistory(getHistory());
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  };

  const handleRunAnalysis = useCallback(async (customCode?: string, customFileName?: string) => {
    const codeToAnalyze = customCode !== undefined ? customCode : code;
    const fileToAnalyze = customFileName || fileName;

    setIsAnalyzing(true);
    try {
      const result = await runAnalysis(codeToAnalyze, fileToAnalyze, language);
      setAnalysisResult(result);
      const updatedHistory = saveToHistory(result);
      setHistory(updatedHistory);
    } catch (err) {
      console.error('Compiler analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [code, fileName, language]);

  // Initial analysis on load so user starts with live data
  useEffect(() => {
    handleRunAnalysis(SAMPLE_PROGRAMS[2].code, SAMPLE_PROGRAMS[2].fileName);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_PROGRAMS.find((s) => s.id === sampleId);
    if (sample) {
      setCode(sample.code);
      setFileName(sample.fileName);
      handleRunAnalysis(sample.code, sample.fileName);
      setCurrentTab('analyzer');
    }
  };

  const handleUploadFile = (file: File) => {
    setFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'c' || ext === 'h') {
      setLanguage('c');
    } else {
      setLanguage('cpp');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text !== undefined) {
        setCode(text);
        handleRunAnalysis(text, file.name);
        setCurrentTab('analyzer');
      }
    };
    reader.readAsText(file);
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    if (item.fullResult) {
      setAnalysisResult(item.fullResult);
      setCode(item.fullResult.sourceCode);
      setFileName(item.fileName);
      setLanguage(item.language);
      setCurrentTab('dashboard');
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearAllHistory = () => {
    clearAllHistory();
    setHistory([]);
  };

  const handleReopenInEditor = (source: string, name: string) => {
    setCode(source);
    setFileName(name);
    setCurrentTab('analyzer');
  };

  const issueCount = analysisResult ? analysisResult.issues.length : 0;
  const symbolCount = analysisResult ? analysisResult.symbols.length : 0;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onAnalyze={() => handleRunAnalysis()}
        isAnalyzing={isAnalyzing}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        analysisResult={analysisResult}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          issueCount={issueCount}
          symbolCount={symbolCount}
          historyCount={history.length}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-navy-950/95">
          {currentTab === 'overview' && (
            <Overview
              analysisResult={analysisResult}
              history={history}
              onAnalyze={() => handleRunAnalysis()}
              onNavigateToAnalyzer={() => setCurrentTab('analyzer')}
              onLoadSample={handleLoadSample}
              onUploadFile={handleUploadFile}
              onSelectHistoryItem={handleSelectHistoryItem}
            />
          )}

          {currentTab === 'analyzer' && (
            <Analyzer
              code={code}
              onCodeChange={setCode}
              fileName={fileName}
              onFileNameChange={setFileName}
              language={language}
              theme={theme}
              isAnalyzing={isAnalyzing}
              onAnalyze={() => handleRunAnalysis()}
              analysisResult={analysisResult}
              onNavigateToDashboard={() => setCurrentTab('dashboard')}
            />
          )}

          {currentTab === 'dashboard' && (
            <Dashboard
              analysisResult={analysisResult}
              history={history}
              onNavigateToAnalyzer={() => setCurrentTab('analyzer')}
            />
          )}

          {currentTab === 'issues' && (
            <IssuesPage
              analysisResult={analysisResult}
              onNavigateToAnalyzer={() => setCurrentTab('analyzer')}
            />
          )}

          {currentTab === 'symbols' && (
            <SymbolsPage
              analysisResult={analysisResult}
              onNavigateToAnalyzer={() => setCurrentTab('analyzer')}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage
              history={history}
              onSelectHistoryItem={handleSelectHistoryItem}
              onDeleteItem={handleDeleteHistoryItem}
              onClearAll={handleClearAllHistory}
              onReopenInEditor={handleReopenInEditor}
            />
          )}

          {currentTab === 'about' && <AboutPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
