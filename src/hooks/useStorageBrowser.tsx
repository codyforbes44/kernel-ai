import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageService, StorageFile, StorageBucket } from '@/services/storageService';
import { toast } from 'sonner';

export function useStorageBrowser() {
  const queryClient = useQueryClient();
  const [currentBucket, setCurrentBucket] = useState<string>('chat-attachments');
  const [currentPath, setCurrentPath] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch buckets
  const { data: buckets = [], isLoading: isLoadingBuckets } = useQuery({
    queryKey: ['storage', 'buckets'],
    queryFn: () => storageService.listBuckets(),
  });

  // Fetch files
  const { data: files = [], isLoading: isLoadingFiles, refetch: refetchFiles } = useQuery({
    queryKey: ['storage', 'files', currentBucket, currentPath],
    queryFn: () => storageService.listFiles(currentBucket, currentPath),
  });

  // Filter files by search
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ files: uploadFiles }: { files: File[] }) => {
      const results: StorageFile[] = [];
      for (const file of uploadFiles) {
        const path = currentPath ? `${currentPath}/${file.name}` : file.name;
        const result = await storageService.uploadFile(currentBucket, path, file);
        results.push(result);
      }
      return results;
    },
    onSuccess: (uploaded) => {
      queryClient.invalidateQueries({ queryKey: ['storage', 'files', currentBucket, currentPath] });
      toast.success(`Uploaded ${uploaded.length} file${uploaded.length > 1 ? 's' : ''}`);
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (paths: string[]) => {
      await storageService.deleteFiles(currentBucket, paths);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage', 'files', currentBucket, currentPath] });
      setSelectedFiles(new Set());
      toast.success('Files deleted');
    },
    onError: (error: Error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (folderName: string) => {
      const path = currentPath ? `${currentPath}/${folderName}` : folderName;
      await storageService.createFolder(currentBucket, path);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage', 'files', currentBucket, currentPath] });
      toast.success('Folder created');
    },
    onError: (error: Error) => {
      toast.error(`Create folder failed: ${error.message}`);
    },
  });

  // Navigate to folder
  const navigateToFolder = useCallback((folderName: string) => {
    setCurrentPath(prev => prev ? `${prev}/${folderName}` : folderName);
    setSelectedFiles(new Set());
  }, []);

  // Navigate up
  const navigateUp = useCallback(() => {
    setCurrentPath(prev => {
      const parts = prev.split('/');
      parts.pop();
      return parts.join('/');
    });
    setSelectedFiles(new Set());
  }, []);

  // Navigate to specific path
  const navigateToPath = useCallback((path: string) => {
    setCurrentPath(path);
    setSelectedFiles(new Set());
  }, []);

  // Change bucket
  const changeBucket = useCallback((bucketId: string) => {
    setCurrentBucket(bucketId);
    setCurrentPath('');
    setSelectedFiles(new Set());
  }, []);

  // Toggle file selection
  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  }, []);

  // Select all files
  const selectAllFiles = useCallback(() => {
    setSelectedFiles(new Set(filteredFiles.filter(f => !f.isFolder).map(f => f.path)));
  }, [filteredFiles]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  // Get file public URL
  const getFileUrl = useCallback((path: string) => {
    return storageService.getPublicUrl(currentBucket, path);
  }, [currentBucket]);

  // Copy URL to clipboard
  const copyFileUrl = useCallback(async (path: string) => {
    const url = getFileUrl(path);
    await navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  }, [getFileUrl]);

  // Download file
  const downloadFile = useCallback(async (file: StorageFile) => {
    try {
      const blob = await storageService.downloadFile(currentBucket, file.path);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Download failed');
    }
  }, [currentBucket]);

  // Get path parts for breadcrumbs
  const pathParts = currentPath ? currentPath.split('/') : [];

  return {
    // State
    currentBucket,
    currentPath,
    pathParts,
    selectedFiles,
    searchQuery,
    viewMode,
    
    // Data
    buckets,
    files: filteredFiles,
    
    // Loading states
    isLoadingBuckets,
    isLoadingFiles,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Actions
    setSearchQuery,
    setViewMode,
    changeBucket,
    navigateToFolder,
    navigateUp,
    navigateToPath,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    getFileUrl,
    copyFileUrl,
    downloadFile,
    refetchFiles,
    
    // Mutations
    uploadFiles: (files: File[]) => uploadMutation.mutateAsync({ files }),
    deleteSelectedFiles: () => deleteMutation.mutateAsync(Array.from(selectedFiles)),
    deleteFile: (path: string) => deleteMutation.mutateAsync([path]),
    createFolder: (name: string) => createFolderMutation.mutateAsync(name),
  };
}
