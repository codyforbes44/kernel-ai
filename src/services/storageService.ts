import { supabase } from '@/integrations/supabase/client';

export interface StorageFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  isFolder: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  createdAt: string;
}

export const storageService = {
  async listBuckets(): Promise<StorageBucket[]> {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    
    return data.map(bucket => ({
      id: bucket.id,
      name: bucket.name,
      public: bucket.public,
      createdAt: bucket.created_at,
    }));
  },

  async listFiles(bucket: string, prefix: string = ''): Promise<StorageFile[]> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(prefix, {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' },
      });
    
    if (error) throw error;
    
    return data.map(file => ({
      id: file.id || `${prefix}${file.name}`,
      name: file.name,
      path: prefix ? `${prefix}/${file.name}` : file.name,
      size: file.metadata?.size || 0,
      mimeType: file.metadata?.mimetype || 'application/octet-stream',
      isFolder: file.id === null,
      createdAt: file.created_at,
      updatedAt: file.updated_at,
    }));
  },

  async uploadFile(
    bucket: string, 
    path: string, 
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<StorageFile> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) throw error;
    
    // Simulate progress since Supabase doesn't support progress events
    onProgress?.(100);
    
    return {
      id: data.path,
      name: file.name,
      path: data.path,
      size: file.size,
      mimeType: file.type,
      isFolder: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
  },

  async deleteFiles(bucket: string, paths: string[]): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);
    
    if (error) throw error;
  },

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  async createFolder(bucket: string, path: string): Promise<void> {
    // Create an empty .keep file to represent the folder
    const { error } = await supabase.storage
      .from(bucket)
      .upload(`${path}/.keep`, new Blob(['']), {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) throw error;
  },

  async moveFile(bucket: string, fromPath: string, toPath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .move(fromPath, toPath);
    
    if (error) throw error;
  },

  async downloadFile(bucket: string, path: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);
    
    if (error) throw error;
    return data;
  },

  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  },

  isPdfFile(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  },

  isTextFile(mimeType: string): boolean {
    return mimeType.startsWith('text/') || 
           mimeType === 'application/json' ||
           mimeType === 'application/javascript';
  },

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  },
};
