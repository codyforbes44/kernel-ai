import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBuilderProject } from '@/hooks/useBuilderProject';
import { builderService } from '@/services/builderService';
import { toast } from 'sonner';
import type { BuilderProject } from '@/types/builder';

interface UseRemixProjectOptions {
  onSuccess?: (project: BuilderProject) => void;
  navigateOnSuccess?: boolean;
}

interface UseRemixProjectReturn {
  // Dialog state
  isDialogOpen: boolean;
  projectToRemix: BuilderProject | null;
  fileCount: number;
  isLoadingFileCount: boolean;
  isRemixing: boolean;
  
  // Actions
  openRemixDialog: (project: BuilderProject, e?: React.MouseEvent) => Promise<void>;
  closeRemixDialog: () => void;
  handleRemix: (newName: string, includeKnowledgeBase: boolean) => Promise<void>;
}

/**
 * Unified hook for remix project functionality.
 * Consolidates duplicate logic from Builder.tsx and PublicProjectsGallery.tsx
 */
export function useRemixProject(options: UseRemixProjectOptions = {}): UseRemixProjectReturn {
  const { navigateOnSuccess = true, onSuccess } = options;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { remixProject, isRemixing } = useBuilderProject();
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectToRemix, setProjectToRemix] = useState<BuilderProject | null>(null);
  const [fileCount, setFileCount] = useState(0);
  const [isLoadingFileCount, setIsLoadingFileCount] = useState(false);

  const openRemixDialog = useCallback(async (project: BuilderProject, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    if (!user) {
      toast.error('Please sign in to remix projects');
      navigate('/auth');
      return;
    }
    
    setProjectToRemix(project);
    setFileCount(0);
    setIsDialogOpen(true);
    
    // Fetch actual file count in background
    setIsLoadingFileCount(true);
    try {
      const files = await builderService.getFiles(project.id);
      setFileCount(files.length);
    } catch (error) {
      console.error('Failed to fetch file count:', error);
    } finally {
      setIsLoadingFileCount(false);
    }
  }, [user, navigate]);

  const closeRemixDialog = useCallback(() => {
    setIsDialogOpen(false);
    setProjectToRemix(null);
  }, []);

  const handleRemix = useCallback(async (newName: string, includeKnowledgeBase: boolean) => {
    if (!projectToRemix) return;
    
    try {
      const result = await remixProject({
        sourceProjectId: projectToRemix.id,
        newName,
        includeKnowledgeBase,
      });
      
      closeRemixDialog();
      
      if (result?.project) {
        onSuccess?.(result.project);
        if (navigateOnSuccess) {
          navigate(`/builder/${result.project.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to remix project:', error);
      toast.error('Failed to remix project');
    }
  }, [projectToRemix, remixProject, closeRemixDialog, navigate, navigateOnSuccess, onSuccess]);

  return {
    isDialogOpen,
    projectToRemix,
    fileCount,
    isLoadingFileCount,
    isRemixing,
    openRemixDialog,
    closeRemixDialog,
    handleRemix,
  };
}
