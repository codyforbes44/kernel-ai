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
import { HardDrive, FolderOpen } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/dialogs/DeleteConfirmDialog';

export function StorageBrowser() {
  const uploadZoneRef = useRef<HTMLDivElement>(null);
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ path: string; name: string } | null>(null);
  
  const {
    state,
    selection,
    navigation,
    queries,
    mutations,
    actions,
  } = useStorageBrowser();

  const handleDeleteFile = async (path: string) => {
    const file = queries.files.find(f => f.path === path);
    setDeleteConfirm({ path, name: file?.name || path });
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      await mutations.deleteFile(deleteConfirm.path);
      setDeleteConfirm(null);
    }
  };

  const scrollToUpload = () => {
    uploadZoneRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasFiles = queries.files.length > 0;

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
            buckets={queries.buckets}
            currentBucket={state.currentBucket}
            onChange={navigation.changeBucket}
            isLoading={queries.isLoadingBuckets}
          />
        </div>

        <StorageToolbar
          searchQuery={state.searchQuery}
          onSearchChange={actions.setSearchQuery}
          viewMode={state.viewMode}
          onViewModeChange={actions.setViewMode}
          selectedCount={selection.count}
          onUploadClick={scrollToUpload}
          onDeleteSelected={mutations.deleteSelected}
          onRefresh={queries.refetch}
          onCreateFolder={mutations.createFolder}
          isDeleting={mutations.isDeleting}
        />
      </div>

      {/* Breadcrumbs */}
      <div className="px-3 border-b border-border">
        <StorageBreadcrumbs
          currentBucket={state.currentBucket}
          pathParts={navigation.pathParts}
          onNavigateToPath={navigation.navigateToPath}
        />
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {queries.isLoadingFiles ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3">
                  <Skeleton className="w-16 h-16 rounded" />
                  <Skeleton className="w-20 h-4" />
                </div>
              ))}
            </div>
          ) : !hasFiles && !state.currentPath ? (
            /* Empty bucket state */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="font-medium text-foreground mb-1">No files yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload files to get started with this bucket
              </p>
            </div>
          ) : (
            <StorageFileGrid
              files={queries.files}
              viewMode={state.viewMode}
              selectedFiles={selection.selectedFiles}
              onToggleSelect={selection.toggle}
              onNavigateToFolder={navigation.navigateToFolder}
              onPreview={setPreviewFile}
              onCopyUrl={actions.copyFileUrl}
              onDownload={actions.downloadFile}
              onDelete={handleDeleteFile}
              getFileUrl={actions.getFileUrl}
            />
          )}

          {/* Upload Zone */}
          <div ref={uploadZoneRef}>
            <StorageUploadZone
              onUpload={mutations.upload}
              isUploading={mutations.isUploading}
            />
          </div>
        </div>
      </ScrollArea>

      {/* Preview Modal */}
      <StoragePreviewModal
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        getFileUrl={actions.getFileUrl}
        onCopyUrl={actions.copyFileUrl}
        onDownload={actions.downloadFile}
        onDelete={handleDeleteFile}
      />

      {/* Delete Confirmation - Using reusable component */}
      <DeleteConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
        title="Delete file?"
        description={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        isLoading={mutations.isDeleting}
      />
    </div>
  );
}
