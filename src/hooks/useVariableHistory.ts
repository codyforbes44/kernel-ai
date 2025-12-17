import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'template-variable-history';
const MAX_HISTORY_PER_VARIABLE = 5;

interface VariableHistory {
  [variableName: string]: string[];
}

export function useVariableHistory() {
  const [history, setHistory] = useState<VariableHistory>({});

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load variable history:', e);
    }
  }, []);

  // Save to localStorage whenever history changes
  const saveHistory = useCallback((newHistory: VariableHistory) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (e) {
      console.error('Failed to save variable history:', e);
    }
  }, []);

  // Add a value to a variable's history
  const addToHistory = useCallback((variableName: string, value: string) => {
    if (!value.trim()) return;
    
    setHistory((prev) => {
      const normalizedName = variableName.toLowerCase();
      const existing = prev[normalizedName] || [];
      
      // Remove duplicate if exists, then add to front
      const filtered = existing.filter((v) => v !== value);
      const updated = [value, ...filtered].slice(0, MAX_HISTORY_PER_VARIABLE);
      
      const newHistory = { ...prev, [normalizedName]: updated };
      
      // Save async
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.error('Failed to save variable history:', e);
      }
      
      return newHistory;
    });
  }, []);

  // Add multiple variables at once
  const addMultipleToHistory = useCallback((variables: Record<string, string>) => {
    setHistory((prev) => {
      const newHistory = { ...prev };
      
      for (const [variableName, value] of Object.entries(variables)) {
        if (!value.trim()) continue;
        
        const normalizedName = variableName.toLowerCase();
        const existing = newHistory[normalizedName] || [];
        const filtered = existing.filter((v) => v !== value);
        newHistory[normalizedName] = [value, ...filtered].slice(0, MAX_HISTORY_PER_VARIABLE);
      }
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (e) {
        console.error('Failed to save variable history:', e);
      }
      
      return newHistory;
    });
  }, []);

  // Get suggestions for a variable
  const getSuggestions = useCallback((variableName: string): string[] => {
    const normalizedName = variableName.toLowerCase();
    return history[normalizedName] || [];
  }, [history]);

  // Clear all history
  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory({});
    } catch (e) {
      console.error('Failed to clear variable history:', e);
    }
  }, []);

  return {
    history,
    addToHistory,
    addMultipleToHistory,
    getSuggestions,
    clearHistory,
  };
}
