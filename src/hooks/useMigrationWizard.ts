import { useState, useCallback } from 'react';
import { MigrationPlatform, ImportMethod, detectPlatformFromFiles, quickDetectPlatform, DetectionResult, SupabaseDetection, detectSupabaseConfig } from '@/lib/migration-data';
import { isValidLovableUrl, extractProjectId } from '@/lib/lovable-url';
import { templateSharingService, SharedTemplate } from '@/services/templateSharingService';

export interface SupabaseCredentials {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}
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

export interface ShareCodeData {
  type: 'project' | 'template';
  projectId?: string;
  projectUrl?: string;
  template?: SharedTemplate;
}

export interface MigrationState {
  currentStep: MigrationStep;
  selectedPlatform: MigrationPlatform | null;
  selectedMethod: ImportMethod | null;
  files: File[];
  pastedCode: string;
  importUrl: string;
  shareCode: string;
  shareCodeData: ShareCodeData | null;
  shareCodeError: string | null;
  isLookingUpShareCode: boolean;
  projectName: string;
  projectDescription: string;
  workspaceId: string | null;
  createConversation: boolean;
  enableKnowledgeBase: boolean;
  detectedFramework: string | null;
  fileCount: number;
  isProcessing: boolean;
  createdProjectId: string | null;
  detectionResult: DetectionResult | null;
  isAnalyzing: boolean;
  // Supabase connection transfer
  supabaseDetection: SupabaseDetection | null;
  supabaseCredentials: SupabaseCredentials | null;
  supabaseConnectionTested: boolean;
  supabaseConnectionValid: boolean;
  skipSupabaseConnection: boolean;
  isTestingSupabaseConnection: boolean;
}

const initialState: MigrationState = {
  currentStep: 'platform',
  selectedPlatform: null,
  selectedMethod: null,
  files: [],
  pastedCode: '',
  importUrl: '',
  shareCode: '',
  shareCodeData: null,
  shareCodeError: null,
  isLookingUpShareCode: false,
  projectName: '',
  projectDescription: '',
  workspaceId: null,
  createConversation: true,
  enableKnowledgeBase: true,
  detectedFramework: null,
  fileCount: 0,
  isProcessing: false,
  createdProjectId: null,
  detectionResult: null,
  isAnalyzing: false,
  supabaseDetection: null,
  supabaseCredentials: null,
  supabaseConnectionTested: false,
  supabaseConnectionValid: false,
  skipSupabaseConnection: false,
  isTestingSupabaseConnection: false,
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

  const setFiles = useCallback(async (files: File[]) => {
    // Quick sync detection first
    const quickPlatform = quickDetectPlatform(files);
    const framework = detectFramework(files);
    
    setState(prev => ({
      ...prev,
      files,
      fileCount: files.length,
      detectedFramework: framework,
      selectedPlatform: quickPlatform || prev.selectedPlatform,
      projectName: prev.projectName || generateProjectName(files),
      isAnalyzing: true,
    }));

    // Then do deep async analysis including Supabase detection
    try {
      const [result, supabaseResult] = await Promise.all([
        detectPlatformFromFiles(files),
        detectSupabaseConfig(files),
      ]);
      
      setState(prev => ({
        ...prev,
        detectionResult: { ...result, supabaseDetection: supabaseResult },
        detectedFramework: result.detectedFramework || prev.detectedFramework,
        selectedPlatform: result.platform || prev.selectedPlatform,
        supabaseDetection: supabaseResult,
        isAnalyzing: false,
      }));
    } catch {
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, []);

  const setPastedCode = useCallback((code: string) => {
    setState(prev => ({ ...prev, pastedCode: code }));
  }, []);

  const setImportUrl = useCallback((url: string) => {
    setState(prev => ({ ...prev, importUrl: url }));
  }, []);

  const setShareCode = useCallback((code: string) => {
    setState(prev => ({ 
      ...prev, 
      shareCode: code,
      shareCodeError: null,
      shareCodeData: null,
    }));
  }, []);

  const lookupShareCode = useCallback(async (input: string) => {
    if (!input.trim()) return;
    
    setState(prev => ({ ...prev, isLookingUpShareCode: true, shareCodeError: null }));
    
    try {
      // Check if it's a Lovable URL
      if (isValidLovableUrl(input)) {
        const projectId = extractProjectId(input);
        if (projectId) {
          setState(prev => ({
            ...prev,
            isLookingUpShareCode: false,
            shareCodeData: {
              type: 'project',
              projectId,
              projectUrl: input,
            },
            projectName: `Imported Project`,
          }));
          return;
        }
      }
      
      // Otherwise treat as a template share code
      const { template, error } = await templateSharingService.getByShareCode(input.trim());
      
      if (error || !template) {
        setState(prev => ({
          ...prev,
          isLookingUpShareCode: false,
          shareCodeError: 'Invalid or expired share code',
          shareCodeData: null,
        }));
        return;
      }
      
      setState(prev => ({
        ...prev,
        isLookingUpShareCode: false,
        shareCodeData: {
          type: 'template',
          template,
        },
        projectName: template.template_name,
        projectDescription: template.template_description || '',
      }));
    } catch {
      setState(prev => ({
        ...prev,
        isLookingUpShareCode: false,
        shareCodeError: 'Failed to lookup share code',
        shareCodeData: null,
      }));
    }
  }, []);

  const setProjectDetails = useCallback((details: Partial<Pick<MigrationState, 'projectName' | 'projectDescription' | 'workspaceId' | 'createConversation' | 'enableKnowledgeBase'>>) => {
    setState(prev => ({ ...prev, ...details }));
  }, []);

  const setSupabaseCredentials = useCallback((credentials: SupabaseCredentials) => {
    setState(prev => ({
      ...prev,
      supabaseCredentials: credentials,
      supabaseConnectionTested: false,
      supabaseConnectionValid: false,
    }));
  }, []);

  const testSupabaseConnection = useCallback(async (): Promise<boolean> => {
    const { supabaseCredentials } = state;
    if (!supabaseCredentials?.url || !supabaseCredentials?.anonKey) {
      return false;
    }

    setState(prev => ({ ...prev, isTestingSupabaseConnection: true }));

    try {
      // Test connection by making a simple request to Supabase
      const response = await fetch(`${supabaseCredentials.url}/rest/v1/`, {
        headers: {
          'apikey': supabaseCredentials.anonKey,
          'Authorization': `Bearer ${supabaseCredentials.anonKey}`,
        },
      });

      const isValid = response.ok || response.status === 404; // 404 is OK for empty DB
      
      setState(prev => ({
        ...prev,
        isTestingSupabaseConnection: false,
        supabaseConnectionTested: true,
        supabaseConnectionValid: isValid,
      }));

      return isValid;
    } catch {
      setState(prev => ({
        ...prev,
        isTestingSupabaseConnection: false,
        supabaseConnectionTested: true,
        supabaseConnectionValid: false,
      }));
      return false;
    }
  }, [state.supabaseCredentials]);

  const setSkipSupabaseConnection = useCallback((skip: boolean) => {
    setState(prev => ({ ...prev, skipSupabaseConnection: skip }));
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
        if (state.selectedMethod === 'github') return true;
        if (state.selectedMethod === 'shareCode') return state.shareCodeData !== null;
        return false;
      case 'features':
        return true;
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
    setShareCode,
    lookupShareCode,
    setProjectDetails,
    setSupabaseCredentials,
    testSupabaseConnection,
    setSkipSupabaseConnection,
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
