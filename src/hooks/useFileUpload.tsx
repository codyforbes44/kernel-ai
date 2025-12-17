import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
];

export function useFileUpload() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds 10MB limit`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type "${file.type}" is not supported`;
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return null;
    }

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      setUploadProgress(100);

      return {
        name: file.name,
        size: file.size,
        type: file.type,
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(`Failed to upload "${file.name}"`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFiles = async (files: File[]): Promise<UploadedFile[]> => {
    const results: UploadedFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      setUploadProgress(Math.round((i / files.length) * 100));
      const result = await uploadFile(files[i]);
      if (result) {
        results.push(result);
      }
    }
    
    setUploadProgress(100);
    return results;
  };

  const deleteFile = async (path: string): Promise<boolean> => {
    try {
      const { error } = await supabase.storage
        .from('chat-attachments')
        .remove([path]);
      
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      return false;
    }
  };

  return {
    uploadFile,
    uploadFiles,
    deleteFile,
    isUploading,
    uploadProgress,
    maxFileSize: MAX_FILE_SIZE,
    allowedTypes: ALLOWED_TYPES,
  };
}
