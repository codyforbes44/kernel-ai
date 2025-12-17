import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface TemplateInjectionContextType {
  pendingTemplate: string | null;
  pendingVariables: string[];
  setPendingTemplate: (content: string | null, variables?: string[]) => void;
  consumeTemplate: () => string | null;
  clearPending: () => void;
}

const TemplateInjectionContext = createContext<TemplateInjectionContextType | undefined>(undefined);

export function TemplateInjectionProvider({ children }: { children: ReactNode }) {
  const [pendingTemplate, setPendingTemplateState] = useState<string | null>(null);
  const [pendingVariables, setPendingVariables] = useState<string[]>([]);

  const setPendingTemplate = useCallback((content: string | null, variables: string[] = []) => {
    setPendingTemplateState(content);
    setPendingVariables(variables);
  }, []);

  const consumeTemplate = useCallback(() => {
    const template = pendingTemplate;
    setPendingTemplateState(null);
    setPendingVariables([]);
    return template;
  }, [pendingTemplate]);

  const clearPending = useCallback(() => {
    setPendingTemplateState(null);
    setPendingVariables([]);
  }, []);

  return (
    <TemplateInjectionContext.Provider
      value={{
        pendingTemplate,
        pendingVariables,
        setPendingTemplate,
        consumeTemplate,
        clearPending,
      }}
    >
      {children}
    </TemplateInjectionContext.Provider>
  );
}

export function useTemplateInjection() {
  const context = useContext(TemplateInjectionContext);
  if (!context) {
    throw new Error('useTemplateInjection must be used within a TemplateInjectionProvider');
  }
  return context;
}
