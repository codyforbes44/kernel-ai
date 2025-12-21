import { useState, useRef } from 'react';
import { useStorageBrowser } from '@/hooks/useStorageBrowser';
import {
  StorageBucketSelector,
  StorageBreadcrumbs,
  StorageToolbar,
  StorageUploadZone,
  StorageFileGrid,
  StoragePreviewModal,
} from './storage-browser';
import { StorageFile } from '@/services/storageService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { HardDrive } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function StorageBrowser() {
  const uploadZoneRef = useRef<HTMLDivElement>(null);
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ path: string; name: string } | null>(null);
  
  const {
    currentBucket,
    currentPath,
    pathParts,
    selectedFiles,
    searchQuery,
    viewMode,
    buckets,
    files,
    isLoadingBuckets,
    isLoadingFiles,
    isUploading,
    isDeleting,
    setSearchQuery,
    setViewMode,
    changeBucket,
    navigateToFolder,
    navigateToPath,
    toggleFileSelection,
    clearSelection,
    getFileUrl,
    copyFileUrl,
    downloadFile,
    refetchFiles,
    uploadFiles,
    deleteSelectedFiles,
    deleteFile,
    createFolder,
  } = useStorageBrowser();

  const handleDeleteFile = async (path: string) => {
    const file = files.find(f => f.path === path);
    setDeleteConfirm({ path, name: file?.name || path });
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await deleteFile(deleteConfirm.path);
      setDeleteConfirm(null);
    }
  };

  const scrollToUpload = () => {
    uploadZoneRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-3 border-b border-border space-y-3">
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">File Storage</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <StorageBucketSelector
            buckets={buckets}
            currentBucket={currentBucket}
            onChange={changeBucket}
            isLoading={isLoadingBuckets}
          />
        </div>

        <StorageToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          selectedCount={selectedFiles.size}
          onUploadClick={scrollToUpload}
          onDeleteSelected={deleteSelectedFiles}
          onRefresh={refetchFiles}
          onCreateFolder={createFolder}
          isDeleting={isDeleting}
        />
      </div>

      {/* Breadcrumbs */}
      <div className="px-3 border-b border-border">
        <StorageBreadcrumbs
          currentBucket={currentBucket}
          pathParts={pathParts}
          onNavigateToPath={navigateToPath}
        />
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {isLoadingFiles ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3">
                  <Skeleton className="w-16 h-16 rounded" />
                  <Skeleton className="w-20 h-4" />
                </div>
              ))}
            </div>
          ) : (
            <StorageFileGrid
              files={files}
              viewMode={viewMode}
              selectedFiles={selectedFiles}
              onToggleSelect={toggleFileSelection}
              onNavigateToFolder={navigateToFolder}
              onPreview={setPreviewFile}
              onCopyUrl={copyFileUrl}
              onDownload={downloadFile}
              onDelete={handleDeleteFile}
              getFileUrl={getFileUrl}
            />
          )}

          {/* Upload Zone */}
          <div ref={uploadZoneRef}>
            <StorageUploadZone
              onUpload={uploadFiles}
              isUploading={isUploading}
            />
          </div>
        </div>
      </ScrollArea>

      {/* Preview Modal */}
      <StoragePreviewModal
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        getFileUrl={getFileUrl}
        onCopyUrl={copyFileUrl}
        onDownload={downloadFile}
        onDelete={handleDeleteFile}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
