import { useState, useCallback } from 'react';
import { MigrationPlatform, ImportMethod, detectPlatformFromFiles } from '@/lib/migration-data';

export type MigrationStep = 
  | 'platform'
  | 'method'
  | 'upload'
  | 'features'
  | 'setup'
  | 'success';

const STEP_ORDER: MigrationStep[] = [
  'platform',
  'method',
  'upload',
  'features',
  'setup',
  'success',
];

export interface MigrationState {
  currentStep: MigrationStep;
  selectedPlatform: MigrationPlatform | null;
  selectedMethod: ImportMethod | null;
  files: File[];
  pastedCode: string;
  importUrl: string;
  projectName: string;
  projectDescription: string;
  workspaceId: string | null;
  createConversation: boolean;
  enableKnowledgeBase: boolean;
  detectedFramework: string | null;
  fileCount: number;
  isProcessing: boolean;
  createdProjectId: string | null;
}

const initialState: MigrationState = {
  currentStep: 'platform',
  selectedPlatform: null,
  selectedMethod: null,
  files: [],
  pastedCode: '',
  importUrl: '',
  projectName: '',
  projectDescription: '',
  workspaceId: null,
  createConversation: true,
  enableKnowledgeBase: true,
  detectedFramework: null,
  fileCount: 0,
  isProcessing: false,
  createdProjectId: null,
};

export function useMigrationWizard() {
  const [state, setState] = useState<MigrationState>(initialState);

  const setStep = useCallback((step: MigrationStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const selectPlatform = useCallback((platform: MigrationPlatform) => {
    setState(prev => ({
      ...prev,
      selectedPlatform: platform,
      selectedMethod: platform.importMethods.length === 1 ? platform.importMethods[0] : null,
    }));
  }, []);

  const selectMethod = useCallback((method: ImportMethod) => {
    setState(prev => ({ ...prev, selectedMethod: method }));
  }, []);

  const setFiles = useCallback((files: File[]) => {
    const detectedPlatform = detectPlatformFromFiles(files);
    const framework = detectFramework(files);
    
    setState(prev => ({
      ...prev,
      files,
      fileCount: files.length,
      detectedFramework: framework,
      selectedPlatform: detectedPlatform || prev.selectedPlatform,
      projectName: prev.projectName || generateProjectName(files),
    }));
  }, []);

  const setPastedCode = useCallback((code: string) => {
    setState(prev => ({ ...prev, pastedCode: code }));
  }, []);

  const setImportUrl = useCallback((url: string) => {
    setState(prev => ({ ...prev, importUrl: url }));
  }, []);

  const setProjectDetails = useCallback((details: Partial<Pick<MigrationState, 'projectName' | 'projectDescription' | 'workspaceId' | 'createConversation' | 'enableKnowledgeBase'>>) => {
    setState(prev => ({ ...prev, ...details }));
  }, []);

  const setProcessing = useCallback((isProcessing: boolean) => {
    setState(prev => ({ ...prev, isProcessing }));
  }, []);

  const setCreatedProject = useCallback((projectId: string) => {
    setState(prev => ({ ...prev, createdProjectId: projectId }));
  }, []);

  const nextStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep);
    if (currentIndex < STEP_ORDER.length - 1) {
      setState(prev => ({ ...prev, currentStep: STEP_ORDER[currentIndex + 1] }));
    }
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep);
    if (currentIndex > 0) {
      setState(prev => ({ ...prev, currentStep: STEP_ORDER[currentIndex - 1] }));
    }
  }, [state.currentStep]);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const canProceed = useCallback(() => {
    switch (state.currentStep) {
      case 'platform':
        return state.selectedPlatform !== null;
      case 'method':
        return state.selectedMethod !== null;
      case 'upload':
        if (state.selectedMethod === 'zip') return state.files.length > 0;
        if (state.selectedMethod === 'paste') return state.pastedCode.trim().length > 0;
        if (state.selectedMethod === 'url') return state.importUrl.trim().length > 0;
        if (state.selectedMethod === 'github') return true; // GitHub auth flow handles this
        return false;
      case 'features':
        return true; // Always can proceed from features
      case 'setup':
        return state.projectName.trim().length > 0;
      case 'success':
        return true;
      default:
        return false;
    }
  }, [state]);

  const getProgress = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(state.currentStep);
    return ((currentIndex + 1) / STEP_ORDER.length) * 100;
  }, [state.currentStep]);

  return {
    state,
    setStep,
    selectPlatform,
    selectMethod,
    setFiles,
    setPastedCode,
    setImportUrl,
    setProjectDetails,
    setProcessing,
    setCreatedProject,
    nextStep,
    prevStep,
    reset,
    canProceed,
    getProgress,
    stepIndex: STEP_ORDER.indexOf(state.currentStep),
    totalSteps: STEP_ORDER.length,
  };
}

function detectFramework(files: File[]): string | null {
  const fileNames = files.map(f => f.name.toLowerCase());
  
  if (fileNames.some(n => n === 'next.config.js' || n === 'next.config.ts')) {
    return 'Next.js';
  }
  if (fileNames.some(n => n === 'vite.config.ts' || n === 'vite.config.js')) {
    return 'Vite + React';
  }
  if (fileNames.some(n => n === 'package.json')) {
    return 'React';
  }
  return null;
}

function generateProjectName(files: File[]): string {
  // Try to extract from package.json or directory name
  const paths = files.map(f => f.webkitRelativePath || f.name);
  if (paths.length > 0) {
    const firstPath = paths[0];
    const parts = firstPath.split('/');
    if (parts.length > 1) {
      return parts[0].replace(/[^a-zA-Z0-9\s-]/g, '').trim() || 'Imported Project';
    }
  }
  return 'Imported Project';
}
