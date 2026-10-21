import { AnalysisResult, HistoryItem } from '../types/analyzer';

const HISTORY_KEY = 'sourcemetrics_history_v1';
const THEME_KEY = 'sourcemetrics_theme_v1';

export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Failed to read history from localStorage:', e);
    return [];
  }
}

export function saveToHistory(result: AnalysisResult): HistoryItem[] {
  try {
    const current = getHistory();
    const newItem: HistoryItem = {
      id: result.id,
      timestamp: result.timestamp,
      fileName: result.fileName,
      language: result.language,
      metricsSummary: {
        loc: result.metrics.size.codeLines,
        tokens: result.metrics.lexical.totalTokens,
        functions: result.metrics.structural.functionCount,
        cyclomaticComplexity: result.metrics.complexity.totalCyclomaticComplexity,
        maintainabilityIndex: result.metrics.quality.maintainabilityIndex,
        errorCount: result.issues.filter((i) => i.severity === 'error').length,
        warningCount: result.issues.filter((i) => i.severity === 'warning').length
      },
      fullResult: result
    };

    // Keep up to 25 items, prepend newest
    const updated = [newItem, ...current.filter((item) => item.id !== result.id)].slice(0, 25);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save to history:', e);
    return getHistory();
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  try {
    const current = getHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete history item:', e);
    return getHistory();
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}

export function getStoredTheme(): 'dark' | 'light' {
  try {
    const val = localStorage.getItem(THEME_KEY);
    return val === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function setStoredTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to store theme:', e);
  }
}
